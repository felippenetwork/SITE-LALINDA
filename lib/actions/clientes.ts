"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getClientes,
  getClienteById,
  getGruposPreco,
  getRegioesEntrega,
  getConvertedLeadIds,
} from "@/lib/data/clientes";
import { clienteSchema } from "@/lib/validation/cliente";

export async function getClientesAction() {
  return getClientes();
}

export async function getClienteByIdAction(id: string) {
  return getClienteById(id);
}

export async function getGruposPrecoAction() {
  return getGruposPreco();
}

export async function getRegioesEntregaAction() {
  return getRegioesEntrega();
}

export async function getConvertedLeadIdsAction() {
  return getConvertedLeadIds();
}

// Cadastrar/editar: Admin e Operador — aprovado no plano (item 5).
async function requireClientesWrite() {
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

  return { supabase, userId: user.id };
}

// Aprovar/Suspender: exclusivo de Admin — aprovação implica atribuir
// grupo_preco, e preço já é área admin-only desde a migration 017.
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

  return { supabase, userId: user.id };
}

function revalidateClientesPages() {
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/leads");
}

export async function saveCliente(input: unknown): Promise<{ success: true; id: string }> {
  const data = clienteSchema.parse(input);
  const { supabase, userId } = await requireClientesWrite();

  const payload = {
    origem_lead_id: data.origem_lead_id ?? null,
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
    grupo_preco_id: data.grupo_preco_id || null,
    regiao_entrega_id: data.regiao_entrega_id || null,
    boleto_liberado: data.boleto_liberado,
    boleto_prazos_dias: data.boleto_prazos_dias?.length ? data.boleto_prazos_dias : null,
  };

  let id = data.id;
  if (id) {
    // Buscado ANTES do update pra saber o que de fato mudou — auditoria
    // (Sprint 6) só entra pra grupo_preco_id/boleto_liberado/
    // boleto_prazos_dias, e só quando o valor realmente muda, nunca em
    // toda edição de cadastro (editar telefone não deveria logar
    // "alterou boleto").
    const { data: antes, error: fetchError } = await supabase
      .from("clientes")
      .select("grupo_preco_id, boleto_liberado, boleto_prazos_dias")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from("clientes")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;

    const camposAlterados: string[] = [];
    if (antes.grupo_preco_id !== payload.grupo_preco_id) camposAlterados.push("grupo_preco_id");
    if (antes.boleto_liberado !== payload.boleto_liberado) camposAlterados.push("boleto_liberado");
    if (JSON.stringify(antes.boleto_prazos_dias) !== JSON.stringify(payload.boleto_prazos_dias)) {
      camposAlterados.push("boleto_prazos_dias");
    }

    if (camposAlterados.length > 0) {
      // supabaseAdmin (não o client user-scoped) — mesmo padrão de
      // lib/actions/integracao-bradesco.ts/admins.ts. Só os NOMES dos
      // campos alterados, nunca o valor (CPF/CNPJ, endereço etc. nunca
      // entram aqui de propósito).
      const { error: auditError } = await supabaseAdmin.from("audit_logs").insert({
        user_id: userId,
        action: "UPDATE",
        target_table: "clientes",
        target_id: id,
        details: { fields: camposAlterados },
      });
      if (auditError) throw auditError;
    }
  } else {
    const { data: inserted, error } = await supabase
      .from("clientes")
      // status nunca vem do formulário — todo cliente novo nasce
      // pendente_aprovacao, sem exceção.
      .insert([{ ...payload, status: "pendente_aprovacao" }])
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") {
        throw new Error("Já existe um cliente cadastrado com este CPF/CNPJ.");
      }
      throw error;
    }
    id = inserted.id;
  }

  revalidateClientesPages();
  return { success: true, id };
}

export async function approveCliente(id: string) {
  const { supabase, userId } = await requireAdmin();

  const { data: cliente, error: fetchError } = await supabase
    .from("clientes")
    .select("grupo_preco_id")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;
  if (!cliente.grupo_preco_id) {
    throw new Error("Defina um grupo de preço para este cliente antes de aprovar.");
  }

  const { error } = await supabase
    .from("clientes")
    .update({
      status: "aprovado",
      aprovado_por: userId,
      aprovado_em: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;

  const { error: auditError } = await supabaseAdmin.from("audit_logs").insert({
    user_id: userId,
    action: "APPROVE",
    target_table: "clientes",
    target_id: id,
    details: { status: "aprovado" },
  });
  if (auditError) throw auditError;

  revalidateClientesPages();
  return { success: true };
}

export async function suspendCliente(id: string) {
  const { supabase, userId } = await requireAdmin();

  const { data: cliente, error: fetchError } = await supabase
    .from("clientes")
    .select("status")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;
  if (cliente.status !== "aprovado") {
    throw new Error("Só é possível suspender um cliente já aprovado.");
  }

  const { error } = await supabase
    .from("clientes")
    .update({ status: "suspenso", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  const { error: auditError } = await supabaseAdmin.from("audit_logs").insert({
    user_id: userId,
    action: "SUSPEND",
    target_table: "clientes",
    target_id: id,
    details: { status: "suspenso" },
  });
  if (auditError) throw auditError;

  revalidateClientesPages();
  return { success: true };
}
