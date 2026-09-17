import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decryptSecret } from "@/lib/crypto/encrypt-secret";
import { INTEGRACAO_WHATSAPP_ID } from "@/lib/data/integracao-whatsapp";

type Resultado = { success: true; token: string } | { success: false; error: string };

// Mesmo raciocínio de lib/bradesco/get-credenciais.ts (achado ao vivo
// naquela tarefa): SEM checagem de has_role(admin) na sessão atual de
// propósito. Esta função é chamada tanto pelas Server Actions
// admin-gated (lib/actions/integracao-whatsapp.ts, que já fazem seu
// próprio requireAdmin()) quanto pelo webhook do Bradesco
// (send-pedido-confirmado.ts, disparado sem NENHUMA sessão de usuário —
// não é nem "sessão sem admin", é ausência total de sessão). Uma
// checagem de admin aqui dentro quebraria sempre o segundo caso.
export async function getTokenWhatsApp(): Promise<Resultado> {
  const { data: row, error } = await supabaseAdmin
    .from("integracao_whatsapp")
    .select("instance_token_cifrado, instance_token_iv")
    .eq("id", INTEGRACAO_WHATSAPP_ID)
    .single();
  if (error) return { success: false, error: "Erro ao ler configuração da integração." };

  if (!row.instance_token_cifrado || !row.instance_token_iv) {
    return { success: false, error: "WhatsApp ainda não conectado." };
  }

  try {
    const token = decryptSecret(row.instance_token_cifrado, row.instance_token_iv).toString("utf8");
    return { success: true, token };
  } catch {
    return { success: false, error: "Erro interno ao carregar token do WhatsApp." };
  }
}
