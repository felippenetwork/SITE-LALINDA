"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getAlertasPagamento,
  getVendasPorCliente,
  getVendasPorProduto,
  getVendasPorPeriodo,
} from "@/lib/data/financeiro";
import { periodoSchema } from "@/lib/validation/financeiro";

export async function getAlertasPagamentoAction() {
  return getAlertasPagamento();
}

export async function getVendasPorClienteAction(input: unknown) {
  const { inicio, fim } = periodoSchema.parse(input);
  return getVendasPorCliente(inicio, fim);
}

export async function getVendasPorProdutoAction(input: unknown) {
  const { inicio, fim } = periodoSchema.parse(input);
  return getVendasPorProduto(inicio, fim);
}

export async function getVendasPorPeriodoAction(input: unknown) {
  const { inicio, fim } = periodoSchema.parse(input);
  return getVendasPorPeriodo(inicio, fim);
}

// Marcar boleto como pago é admin-only — mesmo raciocínio de
// approveCliente/suspendCliente (lib/actions/clientes.ts): confirma
// dinheiro na mão, não é rotina de catálogo/leads.
async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden: Admin role required");

  return { supabase };
}

export async function marcarBoletoPagoAction(
  pedidoId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const { supabase } = await requireAdmin();

  const { data: pedido, error: fetchError } = await supabase
    .from("pedidos")
    .select("metodo_pagamento, status_pagamento")
    .eq("id", pedidoId)
    .single();
  if (fetchError) throw fetchError;
  if (pedido.metodo_pagamento !== "boleto") {
    return { success: false, error: "Só é possível marcar boleto como pago." };
  }
  if (pedido.status_pagamento === "confirmado") {
    return { success: false, error: "Este pedido já está marcado como pago." };
  }

  // Sem insert explícito em audit_logs de propósito: pedidos já tem
  // tr_log_pedidos_changes (migration 021), trigger que loga TODO
  // insert/update/delete na tabela automaticamente, com before/after
  // completo — diferente de clientes (sem trigger próprio, por isso
  // approveCliente/suspendCliente fazem insert explícito ali). Duplicar
  // aqui geraria 2 linhas pro mesmo evento.
  const { error } = await supabase
    .from("pedidos")
    .update({ status_pagamento: "confirmado", updated_at: new Date().toISOString() })
    .eq("id", pedidoId);
  if (error) throw error;

  revalidatePath("/admin/financeiro");
  return { success: true };
}
