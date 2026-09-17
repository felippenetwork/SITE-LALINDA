import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type PedidoFilaRow = Pick<
  Database["public"]["Tables"]["pedidos"]["Row"],
  "id" | "valor_total" | "data_entrega_prevista" | "status" | "metodo_pagamento" | "created_at"
> & {
  clientes: { razao_social: string } | null;
  pedido_itens: { count: number }[] | null;
};

export interface PedidoFilaProducao {
  id: string;
  clienteNome: string;
  itensCount: number;
  valorTotal: number;
  dataEntregaPrevista: string;
  status: string;
  metodoPagamento: string;
  createdAt: string;
}

// Mesmo padrão de lib/data/leads.ts/clientes.ts — admin e operador, nunca
// vendedor/cliente comum.
async function requirePedidosAccess() {
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

// "Fila de produção": só o que já pode virar pão de verdade. PIX exige
// status_pagamento='confirmado' (dinheiro na mão antes de produzir —
// decisão do dono do projeto, 2026-09-16); boleto nunca teve confirmação
// automática, sempre seguiu fluxo manual, então aparece direto. Pedido
// PIX ainda 'pendente' fica de fora daqui, mas continua existindo no
// banco e na tela "Meus Pedidos" do cliente — só não entra no fluxo
// operacional até o webhook confirmar.
export async function getFilaProducao(): Promise<PedidoFilaProducao[]> {
  const supabase = await requirePedidosAccess();

  const { data, error } = await supabase
    .from("pedidos")
    .select(
      "id, valor_total, data_entrega_prevista, status, metodo_pagamento, created_at, clientes(razao_social), pedido_itens(count)",
    )
    .is("deleted_at", null)
    .or("metodo_pagamento.eq.boleto,status_pagamento.eq.confirmado")
    .order("data_entrega_prevista", { ascending: true })
    .returns<PedidoFilaRow[]>();
  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    clienteNome: p.clientes?.razao_social ?? "—",
    itensCount: p.pedido_itens?.[0]?.count ?? 0,
    valorTotal: p.valor_total,
    dataEntregaPrevista: p.data_entrega_prevista,
    status: p.status,
    metodoPagamento: p.metodo_pagamento,
    createdAt: p.created_at,
  }));
}
