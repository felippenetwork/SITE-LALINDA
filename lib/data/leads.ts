import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Lead = Database["public"]["Tables"]["leads"]["Row"];

async function requireLeadsAccess() {
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

// User-scoped (RLS applies) — requires an authenticated session with the
// `admin` or `operador` role, checked via the `has_role` SECURITY DEFINER RPC.
export async function getLeads(): Promise<Lead[]> {
  const supabase = await requireLeadsAccess();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Used only to pre-fill the "Converter em cliente" form on /admin/clientes.
export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = await requireLeadsAccess();

  const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
