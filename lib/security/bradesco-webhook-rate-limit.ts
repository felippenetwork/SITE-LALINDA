import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Proteção ADICIONAL contra flood no webhook de confirmação PIX do
// Bradesco — a validação de origem de verdade (token na URL +
// reverificação direto no Bradesco, nunca confiando no payload recebido)
// já existe em app/api/webhooks/bradesco-pix/[token]/route.ts; isso aqui
// não substitui aquilo, só limita quantas vezes um IP consegue disparar
// o caminho caro (chamada de verdade à API do Bradesco) por minuto.
//
// Quem chama este webhook é servidor-a-servidor (Bradesco), não
// navegador — sem documentação real do pool de IPs deles, então o limite
// é deliberadamente generoso: nenhum volume legítimo plausível desta
// padaria B2B chega perto de 20/min, mas um flood de verdade é cortado.
const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_PER_WINDOW = 20;

// Mesmo contrato de checkLeadRateLimit: nunca lança, fecha aberto numa
// falha da própria checagem. Aqui a justificativa é ainda mais forte —
// a defesa principal (token + reverificação) continua de pé independente
// disso, e falhar FECHADO arriscaria rejeitar uma confirmação de
// pagamento de verdade por causa de um blip transitório no banco.
export async function checkBradescoWebhookRateLimit(ip: string): Promise<boolean> {
  try {
    const since = new Date(Date.now() - WINDOW_MS).toISOString();

    await supabaseAdmin.from("bradesco_webhook_rate_limit").delete().lt("created_at", since);

    const { count, error: countError } = await supabaseAdmin
      .from("bradesco_webhook_rate_limit")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", since);
    if (countError) throw countError;

    if ((count ?? 0) >= MAX_PER_WINDOW) return false;

    const { error: insertError } = await supabaseAdmin
      .from("bradesco_webhook_rate_limit")
      .insert([{ ip }]);
    if (insertError) throw insertError;

    return true;
  } catch (error) {
    console.error("[bradesco-webhook-rate-limit] failed, failing open:", error);
    return true;
  }
}
