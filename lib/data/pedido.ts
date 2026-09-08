import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface PedidoItem {
  id: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: string;
  status: string;
  metodoPagamento: string;
  prazoDiasEscolhido: number | null;
  statusPagamento: string;
  dataEntregaPrevista: string;
  valorTotal: number;
  createdAt: string;
  itens: PedidoItem[];
}

export interface PedidoResumo {
  id: string;
  status: string;
  valorTotal: number;
  dataEntregaPrevista: string;
  createdAt: string;
}

// Mesma RLS de getMeuPedido abaixo ("Cliente le os proprios pedidos") —
// já filtra deleted_at is null e o dono da linha, nenhuma policy nova.
// Pedido cancelado continua aparecendo aqui (status='cancelado' nunca
// aciona deleted_at, migration 021) — decisão deliberada, não esconder.
export async function getMeusPedidos(): Promise<PedidoResumo[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pedidos")
    .select("id, status, valor_total, data_entrega_prevista, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    status: p.status,
    valorTotal: p.valor_total,
    dataEntregaPrevista: p.data_entrega_prevista,
    createdAt: p.created_at,
  }));
}

// User-scoped (RLS) — "Cliente le os proprios pedidos" / "Cliente le os
// proprios itens de pedido" (migration 021) garantem que só devolve o
// pedido se ele pertencer ao usuário logado; nenhum service role aqui.
export async function getMeuPedido(id: string): Promise<Pedido | null> {
  const supabase = await createClient();

  const { data: pedido } = await supabase
    .from("pedidos")
    .select(
      "id, status, metodo_pagamento, prazo_dias_escolhido, status_pagamento, data_entrega_prevista, valor_total, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!pedido) return null;

  const { data: itens } = await supabase
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
