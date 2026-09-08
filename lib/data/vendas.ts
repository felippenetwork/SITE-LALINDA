import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Vendedor NÃO ganha nenhuma policy de RLS pra ler clientes/precos fora
// da própria linha — exporia a tabela inteira pra sessão dele no
// navegador. Em vez disso, toda leitura daqui usa supabaseAdmin (service
// role) atrás desta checagem inline, igual a qualquer leitura
// admin-gated do projeto (CLAUDE.md) — só que com um terceiro papel
// aceito. Admin/operador também passam por aqui porque a conversão de
// rascunho (admin-only, lib/actions/vendas.ts) precisa dos mesmos dados.
async function requireVendasAccess(): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [{ data: isVendedor }, { data: isAdmin }, { data: isOperador }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: user.id, _role: "vendedor" }),
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: user.id, _role: "operador" }),
  ]);
  if (!isVendedor && !isAdmin && !isOperador) {
    throw new Error("Forbidden: Vendedor, Admin ou Operador role required");
  }

  return user.id;
}

export interface ClienteParaVendedor {
  id: string;
  razaoSocial: string;
  tipoDocumento: string;
  documento: string;
  status: string;
  grupoPrecoId: string | null;
  regiaoEntregaId: string | null;
  boletoLiberado: boolean;
  boletoPrazosDias: number[] | null;
}

const CLIENTE_SELECT =
  "id, razao_social, tipo_documento, documento, status, grupo_preco_id, regiao_entrega_id, boleto_liberado, boleto_prazos_dias";

interface ClienteSelectRow {
  id: string;
  razao_social: string;
  tipo_documento: string;
  documento: string;
  status: string;
  grupo_preco_id: string | null;
  regiao_entrega_id: string | null;
  boleto_liberado: boolean;
  boleto_prazos_dias: number[] | null;
}

function mapCliente(row: ClienteSelectRow): ClienteParaVendedor {
  return {
    id: row.id,
    razaoSocial: row.razao_social,
    tipoDocumento: row.tipo_documento,
    documento: row.documento,
    status: row.status,
    grupoPrecoId: row.grupo_preco_id,
    regiaoEntregaId: row.regiao_entrega_id,
    boletoLiberado: row.boleto_liberado,
    boletoPrazosDias: row.boleto_prazos_dias,
  };
}

// Busca por nome ou documento — nunca lista tudo de uma vez. Limite de 20
// é intencional: reduz o que uma sessão de vendedor consegue puxar de uma
// tacada só, mesmo já sendo um caminho gated (defesa em profundidade).
export async function buscarClientesParaVendedor(query: string): Promise<ClienteParaVendedor[]> {
  await requireVendasAccess();

  const termo = query.trim();
  if (!termo) return [];

  const { data, error } = await supabaseAdmin
    .from("clientes")
    .select(CLIENTE_SELECT)
    .or(`razao_social.ilike.%${termo}%,documento.ilike.%${termo}%`)
    .order("razao_social")
    .limit(20);
  if (error) throw error;
  return (data ?? []).map(mapCliente);
}

export async function getClienteParaVendedor(id: string): Promise<ClienteParaVendedor | null> {
  await requireVendasAccess();

  const { data, error } = await supabaseAdmin
    .from("clientes")
    .select(CLIENTE_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCliente(data) : null;
}

// Mesma lógica de resolução de lib/data/portal.ts#getMeusPrecos (grupo +
// exceção do cliente) — só que via service role, porque o vendedor não
// tem (e não deve ter) RLS própria em precos/precos_excecao.
export async function getPrecosParaVendedor(
  clienteId: string,
  grupoPrecoId: string | null,
): Promise<Map<string, number>> {
  await requireVendasAccess();

  const [{ data: precosGrupo }, { data: excecoes }] = await Promise.all([
    grupoPrecoId
      ? supabaseAdmin.from("precos").select("produto_id, valor").eq("grupo_preco_id", grupoPrecoId)
      : Promise.resolve({ data: [] as { produto_id: string; valor: number }[] }),
    supabaseAdmin.from("precos_excecao").select("produto_id, valor").eq("cliente_id", clienteId),
  ]);

  const precosPorProduto = new Map<string, number>();
  for (const p of precosGrupo ?? []) precosPorProduto.set(p.produto_id, p.valor);
  for (const e of excecoes ?? []) precosPorProduto.set(e.produto_id, e.valor);
  return precosPorProduto;
}

export interface PedidoParaVendedor {
  id: string;
  status: string;
  metodoPagamento: string;
  prazoDiasEscolhido: number | null;
  statusPagamento: string;
  dataEntregaPrevista: string;
  valorTotal: number;
  createdAt: string;
  itens: {
    id: string;
    produtoNome: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
  }[];
}

// Mesmo formato de lib/data/pedido.ts#getMeuPedido, mas via service role
// (gated) — a RLS "Cliente le os proprios pedidos" nunca autorizaria a
// sessão do vendedor a ler o pedido de outro cliente.
export async function getPedidoParaVendedor(id: string): Promise<PedidoParaVendedor | null> {
  await requireVendasAccess();

  const { data: pedido } = await supabaseAdmin
    .from("pedidos")
    .select(
      "id, status, metodo_pagamento, prazo_dias_escolhido, status_pagamento, data_entrega_prevista, valor_total, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!pedido) return null;

  const { data: itens } = await supabaseAdmin
    .from("pedido_itens")
    .select("id, produto_nome, quantidade, preco_unitario, subtotal")
    .eq("pedido_id", id);

  return {
    id: pedido.id,
    status: pedido.status,
    metodoPagamento: pedido.metodo_pagamento,
    prazoDiasEscolhido: pedido.prazo_dias_escolhido,
    statusPagamento: pedido.status_pagamento,
    dataEntregaPrevista: pedido.data_entrega_prevista,
    valorTotal: pedido.valor_total,
    createdAt: pedido.created_at,
    itens: (itens ?? []).map((i) => ({
      id: i.id,
      produtoNome: i.produto_nome,
      quantidade: i.quantidade,
      precoUnitario: i.preco_unitario,
      subtotal: i.subtotal,
    })),
  };
}

export interface RascunhoItem {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
}

export interface Rascunho {
  id: string;
  clienteId: string;
  clienteRazaoSocial: string;
  metodoPagamento: string;
  prazoDiasEscolhido: number | null;
  createdAt: string;
  itens: RascunhoItem[];
}

interface RascunhoRow {
  id: string;
  cliente_id: string;
  metodo_pagamento: string;
  prazo_dias_escolhido: number | null;
  created_at: string;
  clientes: { razao_social: string } | null;
  pedido_rascunho_itens: {
    produto_id: string;
    quantidade: number;
    products: { name: string } | null;
  }[];
}

function mapRascunho(row: RascunhoRow): Rascunho {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    clienteRazaoSocial: row.clientes?.razao_social ?? "—",
    metodoPagamento: row.metodo_pagamento,
    prazoDiasEscolhido: row.prazo_dias_escolhido,
    createdAt: row.created_at,
    itens: row.pedido_rascunho_itens.map((i) => ({
      produtoId: i.produto_id,
      produtoNome: i.products?.name ?? "Produto removido",
      quantidade: i.quantidade,
    })),
  };
}

const RASCUNHO_SELECT =
  "id, cliente_id, metodo_pagamento, prazo_dias_escolhido, created_at, clientes(razao_social), pedido_rascunho_itens(produto_id, quantidade, products(name))";

// Todos os rascunhos, de qualquer vendedor — "sem carteira restrita"
// (decisão explícita) também vale aqui. Usado pela tela de
// /admin/clientes pra mostrar o botão "Confirmar Pedido em Rascunho".
export async function getRascunhosAdmin(): Promise<Rascunho[]> {
  await requireVendasAccess();

  const { data, error } = await supabaseAdmin
    .from("pedidos_rascunho")
    .select(RASCUNHO_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as RascunhoRow[]).map(mapRascunho);
}

export async function getRascunho(id: string): Promise<Rascunho | null> {
  await requireVendasAccess();

  const { data, error } = await supabaseAdmin
    .from("pedidos_rascunho")
    .select(RASCUNHO_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRascunho(data as unknown as RascunhoRow) : null;
}
