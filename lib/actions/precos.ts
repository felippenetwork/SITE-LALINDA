"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPrecos, getPrecoExcecoes } from "@/lib/data/precos";
import { precoSchema, precoExcecaoSchema } from "@/lib/validation/preco";

export async function getPrecosAction() {
  return getPrecos();
}

export async function getPrecoExcecoesAction(clienteId: string) {
  return getPrecoExcecoes(clienteId);
}

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

  return supabase;
}

// valor null = célula limpa pelo admin — apaga a linha (volta a "sem preço
// definido"), nunca grava zero.
export async function savePreco(input: unknown) {
  const data = precoSchema.parse(input);
  const supabase = await requireAdmin();

  if (data.valor === null) {
    const { error } = await supabase
      .from("precos")
      .delete()
      .eq("produto_id", data.produto_id)
      .eq("grupo_preco_id", data.grupo_preco_id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("precos").upsert(
      {
        produto_id: data.produto_id,
        grupo_preco_id: data.grupo_preco_id,
        valor: data.valor,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "produto_id,grupo_preco_id" },
    );
    if (error) throw error;
  }

  revalidatePath("/admin/precos");
  return { success: true };
}

// valor null = admin limpou a exceção — apaga só a linha de
// precos_excecao, nunca mexe em precos (o produto volta a herdar o preço
// do grupo do cliente automaticamente).
export async function savePrecoExcecao(input: unknown) {
  const data = precoExcecaoSchema.parse(input);
  const supabase = await requireAdmin();

  if (data.valor === null) {
    const { error } = await supabase
      .from("precos_excecao")
      .delete()
      .eq("cliente_id", data.cliente_id)
      .eq("produto_id", data.produto_id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("precos_excecao").upsert(
      {
        cliente_id: data.cliente_id,
        produto_id: data.produto_id,
        valor: data.valor,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "cliente_id,produto_id" },
    );
    if (error) throw error;
  }

  revalidatePath(`/admin/precos/clientes/${data.cliente_id}`);
  return { success: true };
}
