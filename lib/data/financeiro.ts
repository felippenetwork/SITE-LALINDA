import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import {
  calcularVencimento,
  hojeSP,
  periodoParaUtc,
  granularidadeParaPeriodo,
  chaveBucket,
  type Granularidade,
} from "@/lib/financeiro/datas";

// Mesmo padrão de lib/data/pedido-admin.ts/leads.ts — admin e operador,
// nunca vendedor/cliente comum. Relatório agrega dado que essas duas
// roles já enxergam linha a linha via RLS de pedidos/pedido_itens/
// clientes (ao contrário de precos/grupos_preco, bloqueados pra
// operador) — não abre acesso novo, só apresenta de forma útil.
async function requireFinanceiroAccess() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [{ data: isAdmin }, { data: isOperador }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: user.id, _role: "operador" }),
  ]);
  if (!isAdmin && !isOperador) throw new Error("Forbidden: Admin or Operador role required");

  return supabase;
}

export interface BoletoVencido {
  id: string;
  clienteNome: string;
  valorTotal: number;
  dataPedido: string;
  prazoDiasEscolhido: number;
  vencimento: string;
}

export interface PixNaoPago {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  valorTotal: number;
  pixExpiracao: string;
}

export interface AlertasPagamento {
  boletosVencidos: BoletoVencido[];
  pixNaoPagos: PixNaoPago[];
}

type BoletoRow = Pick<
  Database["public"]["Tables"]["pedidos"]["Row"],
  "id" | "valor_total" | "created_at" | "prazo_dias_escolhido"
> & {
  clientes: { razao_social: string } | null;
};

type PixRow = Pick<
  Database["public"]["Tables"]["pedidos"]["Row"],
  "id" | "valor_total" | "pix_expiracao"
> & {
  clientes: { razao_social: string; telefone: string } | null;
};

// Duas categorias, mesma natureza de problema (dinheiro que deveria ter
// entrado e não entrou): boleto vencido (prazo passado, ainda não
// confirmado) e PIX que chegou a gerar QR mas expirou sem pagar —
// oportunidade de contato manual, sem ação nenhuma associada (não existe
// "marcar PIX como pago" fora do webhook).
export async function getAlertasPagamento(): Promise<AlertasPagamento> {
  const supabase = await requireFinanceiroAccess();
  const hoje = hojeSP();

  const { data: boletos, error: e1 } = await supabase
    .from("pedidos")
    .select("id, valor_total, created_at, prazo_dias_escolhido, clientes(razao_social)")
    .eq("metodo_pagamento", "boleto")
    .neq("status_pagamento", "confirmado")
    .is("deleted_at", null)
    .returns<BoletoRow[]>();
  if (e1) throw e1;

  const boletosVencidos = (boletos ?? [])
    .filter((p) => p.prazo_dias_escolhido !== null)
    .map((p) => ({
      id: p.id,
      clienteNome: p.clientes?.razao_social ?? "—",
      valorTotal: p.valor_total,
      dataPedido: p.created_at,
      prazoDiasEscolhido: p.prazo_dias_escolhido!,
      vencimento: calcularVencimento(p.created_at, p.prazo_dias_escolhido!),
    }))
    .filter((p) => p.vencimento < hoje)
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento));

  const { data: pix, error: e2 } = await supabase
    .from("pedidos")
    .select("id, valor_total, pix_expiracao, clientes(razao_social, telefone)")
    .eq("metodo_pagamento", "pix")
    .eq("status_pagamento", "pendente")
    .not("pix_qrcode", "is", null)
    .lt("pix_expiracao", new Date().toISOString())
    .is("deleted_at", null)
    .returns<PixRow[]>();
  if (e2) throw e2;

  const pixNaoPagos = (pix ?? [])
    .map((p) => ({
      id: p.id,
      clienteNome: p.clientes?.razao_social ?? "—",
      clienteTelefone: p.clientes?.telefone ?? "—",
      valorTotal: p.valor_total,
      pixExpiracao: p.pix_expiracao!,
    }))
    .sort((a, b) => b.pixExpiracao.localeCompare(a.pixExpiracao));

  return { boletosVencidos, pixNaoPagos };
}

export interface VendaPorCliente {
  clienteId: string;
  clienteNome: string;
  totalVendido: number;
  qtdPedidos: number;
  ticketMedio: number;
}

type PedidoConfirmadoRow = Pick<
  Database["public"]["Tables"]["pedidos"]["Row"],
  "id" | "cliente_id" | "valor_total" | "created_at"
> & {
  clientes: { razao_social: string } | null;
};

async function getPedidosConfirmadosNoPeriodo(
  supabase: Awaited<ReturnType<typeof requireFinanceiroAccess>>,
  inicio: string,
  fim: string,
): Promise<PedidoConfirmadoRow[]> {
  const { inicioUtc, fimUtc } = periodoParaUtc(inicio, fim);
  const { data, error } = await supabase
    .from("pedidos")
    .select("id, cliente_id, valor_total, created_at, clientes(razao_social)")
    .eq("status_pagamento", "confirmado")
    .is("deleted_at", null)
    .gte("created_at", inicioUtc)
    .lte("created_at", fimUtc)
    .returns<PedidoConfirmadoRow[]>();
  if (error) throw error;
  return data ?? [];
}

// Só status_pagamento='confirmado' conta como venda — pedido pendente
// (boleto não vencido, PIX aguardando pagamento) nunca entra nos totais.
export async function getVendasPorCliente(inicio: string, fim: string): Promise<VendaPorCliente[]> {
  const supabase = await requireFinanceiroAccess();
  const pedidos = await getPedidosConfirmadosNoPeriodo(supabase, inicio, fim);

  const porCliente = new Map<string, { nome: string; total: number; qtd: number }>();
  for (const p of pedidos) {
    const atual = porCliente.get(p.cliente_id) ?? {
      nome: p.clientes?.razao_social ?? "—",
      total: 0,
      qtd: 0,
    };
    atual.total += p.valor_total;
    atual.qtd += 1;
    porCliente.set(p.cliente_id, atual);
  }

  return [...porCliente.entries()]
    .map(([clienteId, v]) => ({
      clienteId,
      clienteNome: v.nome,
      totalVendido: v.total,
      qtdPedidos: v.qtd,
      ticketMedio: v.total / v.qtd,
    }))
    .sort((a, b) => b.totalVendido - a.totalVendido);
}

export interface VendaPorProduto {
  produtoId: string;
  produtoNome: string;
  quantidadeVendida: number;
  valorTotal: number;
}

export async function getVendasPorProduto(inicio: string, fim: string): Promise<VendaPorProduto[]> {
  const supabase = await requireFinanceiroAccess();
  const pedidos = await getPedidosConfirmadosNoPeriodo(supabase, inicio, fim);
  if (pedidos.length === 0) return [];

  // Volume atual do projeto é pequeno o bastante pra um .in() só
  // resolver — se crescer muito, isso vira candidato a agregação no
  // banco (RPC), não antes.
  const { data: itens, error } = await supabase
    .from("pedido_itens")
    .select("produto_id, produto_nome, quantidade, subtotal")
    .in(
      "pedido_id",
      pedidos.map((p) => p.id),
    );
  if (error) throw error;

  const porProduto = new Map<string, { nome: string; qtd: number; total: number }>();
  for (const item of itens ?? []) {
    const atual = porProduto.get(item.produto_id) ?? { nome: item.produto_nome, qtd: 0, total: 0 };
    atual.qtd += item.quantidade;
    atual.total += item.subtotal;
    porProduto.set(item.produto_id, atual);
  }

  return [...porProduto.entries()]
    .map(([produtoId, v]) => ({
      produtoId,
      produtoNome: v.nome,
      quantidadeVendida: v.qtd,
      valorTotal: v.total,
    }))
    .sort((a, b) => b.valorTotal - a.valorTotal);
}

export interface VendaPorPeriodoBucket {
  periodo: string;
  totalVendido: number;
  qtdPedidos: number;
}

export interface VendasPorPeriodo {
  granularidade: Granularidade;
  buckets: VendaPorPeriodoBucket[];
}

export async function getVendasPorPeriodo(inicio: string, fim: string): Promise<VendasPorPeriodo> {
  const supabase = await requireFinanceiroAccess();
  const pedidos = await getPedidosConfirmadosNoPeriodo(supabase, inicio, fim);
  const granularidade = granularidadeParaPeriodo(inicio, fim);

  const buckets = new Map<string, { total: number; qtd: number }>();
  for (const p of pedidos) {
    const chave = chaveBucket(p.created_at, granularidade);
    const atual = buckets.get(chave) ?? { total: 0, qtd: 0 };
    atual.total += p.valor_total;
    atual.qtd += 1;
    buckets.set(chave, atual);
  }

  const resultado = [...buckets.entries()]
    .map(([periodo, v]) => ({ periodo, totalVendido: v.total, qtdPedidos: v.qtd }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));

  return { granularidade, buckets: resultado };
}
