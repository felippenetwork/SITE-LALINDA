import "server-only";
import { createClient } from "@/lib/supabase/server";

export type PortalDestination =
  | "/portal/cadastro"
  | "/admin"
  | "/portal/completar-cadastro"
  | "/portal/aguardando-aprovacao"
  | "/portal/catalogo";

// Única fonte de verdade de "pra onde esse usuário deveria estar olhando
// agora" — cada página de /portal chama isso e só redireciona se o
// destino calculado for diferente da própria rota (evita loop de
// redirect que um layout único, sempre-redireciona, correria risco de
// causar).
export async function getPortalDestination(): Promise<PortalDestination> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/portal/cadastro";

  const [{ data: isAdmin }, { data: isOperador }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: user.id, _role: "operador" }),
  ]);
  if (isAdmin || isOperador) return "/admin";

  // RLS-protegido: só enxerga a própria linha ("Cliente le a propria
  // linha", migration 017).
  const { data: cliente } = await supabase
    .from("clientes")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cliente) return "/portal/completar-cadastro";
  if (cliente.status === "aprovado") return "/portal/catalogo";
  return "/portal/aguardando-aprovacao"; // pendente_aprovacao ou suspenso
}

// Usado só pela tela de aguardando-aprovacao pra escolher a mensagem
// certa (pendente vs suspenso) — getPortalDestination() já garante que só
// se chega aqui com uma linha existente e não aprovada.
export async function getMinhaClienteStatus(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("clientes")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.status ?? null;
}
