"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { grupoPrecoSchema } from "@/lib/validation/preco";

// Preço (grupos, matriz, exceções) é admin-only, sem exceção — decisão
// confirmada ao planejar esta tela, mesmo motivo de aprovar/suspender
// cliente em lib/actions/clientes.ts.
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

export async function saveGrupoPreco(input: unknown): Promise<{ success: true; id: string }> {
  const data = grupoPrecoSchema.parse(input);
  const supabase = await requireAdmin();

  let id = data.id;
  if (id) {
    const { error } = await supabase
      .from("grupos_preco")
      .update({
        nome: data.nome,
        descricao: data.descricao || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  } else {
    const { data: inserted, error } = await supabase
      .from("grupos_preco")
      .insert([{ nome: data.nome, descricao: data.descricao || null }])
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") {
        throw new Error("Já existe um grupo de preço com este nome.");
      }
      throw error;
    }
    id = inserted.id;
  }

  revalidatePath("/admin/precos");
  return { success: true, id };
}

export async function deleteGrupoPreco(id: string) {
  const supabase = await requireAdmin();

  const [{ count: clientesCount }, { count: precosCount }] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }).eq("grupo_preco_id", id),
    supabase.from("precos").select("*", { count: "exact", head: true }).eq("grupo_preco_id", id),
  ]);

  if ((clientesCount ?? 0) > 0 || (precosCount ?? 0) > 0) {
    const partes = [];
    if (clientesCount) partes.push(`${clientesCount} cliente(s)`);
    if (precosCount) partes.push(`${precosCount} preço(s)`);
    throw new Error(`Não é possível excluir: há ${partes.join(" e ")} vinculados a este grupo.`);
  }

  const { error } = await supabase.from("grupos_preco").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/precos");
  return { success: true };
}
