"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  buscarClientesParaVendedor,
  getClienteParaVendedor,
  getPrecosParaVendedor,
  getPedidoParaVendedor,
  getRascunhosAdmin,
  getRascunho,
} from "@/lib/data/vendas";
import { montarESalvarPedido, type ClienteParaPedido } from "@/lib/pedido/montar-e-salvar-pedido";
import { criarClienteAvulsoSchema, criarRascunhoSchema } from "@/lib/validation/vendas";

export async function buscarClientesParaVendedorAction(query: string) {
  return buscarClientesParaVendedor(query);
}

export async function getClienteParaVendedorAction(id: string) {
  return getClienteParaVendedor(id);
}

export async function getPrecosParaVendedorAction(clienteId: string, grupoPrecoId: string | null) {
  const precos = await getPrecosParaVendedor(clienteId, grupoPrecoId);
  return Object.fromEntries(precos);
}

export async function getPedidoParaVendedorAction(id: string) {
  return getPedidoParaVendedor(id);
}

export async function getRascunhosAdminAction() {
  return getRascunhosAdmin();
}

async function requireVendedor() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: isVendedor } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "vendedor",
  });
  if (!isVendedor) throw new Error("Forbidden: Vendedor role required");

  return { supabase, userId: user.id };
}

// Excluir rascunho: vendedor, admin ou operador — mesmo grupo que a RLS
// de pedidos_rascunho já autoriza igualmente (migration 025).
async function requireVendasWrite() {
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

  return { supabase, userId: user.id };
}

// Confirmar rascunho e excluir rascunho ficam restritos a admin — decisão
// explícita do dono do projeto: a conversão pra pedido de verdade é uma
// ação manual do admin, nunca automática, pra manter controle exato do
// momento em que o pedido fecha.
async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (!isAdmin) throw new Error("Forbidden: Admin role required");

  return { supabase, userId: user.id };
}

// Cliente avulso criado pelo vendedor — mesmo formato seguro travado pela
// policy "Vendedor cria cliente avulso" (migration 025): sem user_id, sem
// grupo/região/aprovação/boleto. O INSERT roda no client user-scoped (RLS
// é o portão de verdade, não uma cortesia) — sem .select() encadeado
// porque a sessão do vendedor não tem policy de SELECT que cubra a linha
// de um cliente sem user_id (achado durante a verificação desta
// migration); o id é gerado aqui e devolvido direto, sem precisar ler de
// volta.
export async function criarClienteAvulsoAction(
  input: unknown,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const data = criarClienteAvulsoSchema.parse(input);
  const { supabase } = await requireVendedor();

  const id = randomUUID();
  const { error } = await supabase.from("clientes").insert({
    id,
    user_id: null,
    razao_social: data.razao_social,
    tipo_documento: data.tipo_documento,
    documento: data.documento,
    inscricao_estadual: data.inscricao_estadual || null,
    email: data.email,
    contato_nome: data.contato_nome,
    telefone: data.telefone,
    logradouro: data.logradouro,
    numero: data.numero || null,
    bairro: data.bairro || null,
    cidade: data.cidade,
    uf: data.uf,
    cep: data.cep,
    status: "pendente_aprovacao",
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Já existe um cliente cadastrado com este CPF/CNPJ." };
    }
    return { success: false, error: error.message };
  }

  return { success: true, id };
}

// Rascunho: dois inserts (pedidos_rascunho + itens), não um RPC atômico
// como criar_pedido — decisão consciente, ver migration 025: rascunho não
// tem preço/dinheiro envolvido, então uma falha a meio caminho não deixa
// nenhum estado financeiro inconsistente, só um rascunho vazio (por isso
// o cleanup abaixo, não por exigência de integridade transacional).
export async function criarRascunhoAction(
  input: unknown,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const data = criarRascunhoSchema.parse(input);
  const { supabase, userId } = await requireVendedor();

  const rascunhoId = randomUUID();
  const { error: rascunhoError } = await supabase.from("pedidos_rascunho").insert({
    id: rascunhoId,
    cliente_id: data.clienteId,
    criado_por: userId,
    metodo_pagamento: data.metodoPagamento,
    prazo_dias_escolhido:
      data.metodoPagamento === "boleto" ? (data.prazoDiasEscolhido ?? null) : null,
  });
  if (rascunhoError) return { success: false, error: rascunhoError.message };

  const { error: itensError } = await supabase.from("pedido_rascunho_itens").insert(
    data.itens.map((item) => ({
      pedido_rascunho_id: rascunhoId,
      produto_id: item.produtoId,
      quantidade: item.quantidade,
    })),
  );
  if (itensError) {
    await supabase.from("pedidos_rascunho").delete().eq("id", rascunhoId);
    return { success: false, error: itensError.message };
  }

  revalidatePath("/admin/clientes");
  return { success: true, id: rascunhoId };
}

// Excluir rascunho — vendedor, admin ou operador (RLS já permite os três
// igualmente, "sem carteira restrita" também vale pra limpar rascunho
// próprio ou alheio).
export async function excluirRascunhoAction(rascunhoId: string) {
  const { supabase } = await requireVendasWrite();

  await supabase.from("pedido_rascunho_itens").delete().eq("pedido_rascunho_id", rascunhoId);
  const { error } = await supabase.from("pedidos_rascunho").delete().eq("id", rascunhoId);
  if (error) throw error;

  revalidatePath("/admin/clientes");
  return { success: true };
}

// A conversão de rascunho em pedido de verdade — ação manual do admin,
// nunca automática. Reaproveita o MESMO montarESalvarPedido do checkout
// do portal: repreça, revalida boleto/data de entrega e grava via
// criar_pedido(). Se o cliente ainda não tiver grupo/região (admin
// esqueceu de definir antes de clicar), a função devolve o erro
// apropriado e o rascunho continua intacto, esperando.
export async function confirmarRascunhoAction(
  rascunhoId: string,
): Promise<{ success: true; pedidoId: string } | { success: false; error: string }> {
  await requireAdmin();

  const rascunho = await getRascunho(rascunhoId);
  if (!rascunho) return { success: false, error: "Rascunho não encontrado." };

  const cliente = await getClienteParaVendedor(rascunho.clienteId);
  if (!cliente) return { success: false, error: "Cliente do rascunho não encontrado." };

  const clienteParaPedido: ClienteParaPedido = {
    id: cliente.id,
    grupoPrecoId: cliente.grupoPrecoId,
    regiaoEntregaId: cliente.regiaoEntregaId,
    boletoLiberado: cliente.boletoLiberado,
    boletoPrazosDias: cliente.boletoPrazosDias,
  };

  const precos = cliente.grupoPrecoId
    ? await getPrecosParaVendedor(cliente.id, cliente.grupoPrecoId)
    : new Map<string, number>();

  const produtoIds = rascunho.itens.map((i) => i.produtoId);
  const { data: produtos, error: produtosError } = await supabaseAdmin
    .from("products")
    .select("id, name, available")
    .in("id", produtoIds);
  if (produtosError) throw produtosError;

  const resultado = await montarESalvarPedido({
    cliente: clienteParaPedido,
    itens: rascunho.itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
    metodoPagamento: rascunho.metodoPagamento as "pix" | "boleto",
    prazoDiasEscolhido: rascunho.prazoDiasEscolhido,
    precos,
    produtos: produtos ?? [],
  });

  if (!resultado.success) return resultado;

  // Convertido com sucesso — o rascunho não existe mais como rascunho.
  await supabaseAdmin.from("pedido_rascunho_itens").delete().eq("pedido_rascunho_id", rascunhoId);
  await supabaseAdmin.from("pedidos_rascunho").delete().eq("id", rascunhoId);

  revalidatePath("/admin/clientes");
  return { success: true, pedidoId: resultado.pedidoId };
}
