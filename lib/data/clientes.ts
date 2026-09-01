import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Cliente = Database["public"]["Tables"]["clientes"]["Row"];
export type GrupoPreco = Database["public"]["Tables"]["grupos_preco"]["Row"];

async function requireClientesAccess() {
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

export async function getClientes(): Promise<Cliente[]> {
  const supabase = await requireClientesAccess();

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getGruposPreco(): Promise<GrupoPreco[]> {
  const supabase = await requireClientesAccess();

  const { data, error } = await supabase.from("grupos_preco").select("*").order("nome");
  if (error) throw error;
  return data ?? [];
}

// Lookup for /admin/leads' "já é cliente" badge — every lead that already
// has a cliente pointing at it via origem_lead_id, regardless of status.
export async function getConvertedLeadIds(): Promise<string[]> {
  const supabase = await requireClientesAccess();

  const { data, error } = await supabase
    .from("clientes")
    .select("origem_lead_id")
    .not("origem_lead_id", "is", null);
  if (error) throw error;
  return (data ?? []).map((row) => row.origem_lead_id).filter((id): id is string => id !== null);
}
