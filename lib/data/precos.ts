import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Preco = Database["public"]["Tables"]["precos"]["Row"];
export type PrecoExcecao = Database["public"]["Tables"]["precos_excecao"]["Row"];

// Preço é admin-only, sem exceção — nem leitura pro Operador (dado
// comercialmente sensível, ao contrário de catálogo/leads).
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

export async function getPrecos(): Promise<Preco[]> {
  const supabase = await requireAdmin();

  const { data, error } = await supabase.from("precos").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function getPrecoExcecoes(clienteId: string): Promise<PrecoExcecao[]> {
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("precos_excecao")
    .select("*")
    .eq("cliente_id", clienteId);
  if (error) throw error;
  return data ?? [];
}
