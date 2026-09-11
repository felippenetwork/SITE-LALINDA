"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { encryptSecret } from "@/lib/crypto/encrypt-secret";
import {
  getIntegracaoBradescoPix,
  INTEGRACAO_BRADESCO_PIX_ID,
} from "@/lib/data/integracao-bradesco";
import { integracaoBradescoPixSchema } from "@/lib/validation/integracao-bradesco";
import type { Database } from "@/lib/supabase/types";

type IntegracaoBradescoPixUpdate =
  Database["public"]["Tables"]["integracao_bradesco_pix"]["Update"];

const BUCKET = "payment-certificates";
const MAX_CERT_BYTES = 1024 * 1024; // 1 MB — mesmo limite do bucket (migration 027)

export async function getIntegracaoBradescoPixAction() {
  return getIntegracaoBradescoPix();
}

// Preço e credencial de banco são as duas áreas do projeto que operador
// nunca acessa — mesmo padrão admin-only de lib/actions/precos.ts.
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

// FormData (não JSON) porque o certificado é um File — mesmo padrão de
// lib/actions/upload-image.ts. Campos de segredo (clientSecret,
// certificadoSenha) vazios = "não mudar", nunca "limpar" — write-only:
// a tela nunca pré-preenche esses campos com o valor salvo, então um
// campo vazio aqui significa que o admin não digitou nada, não que ele
// queira apagar a credencial já salva.
export async function saveIntegracaoBradescoPix(
  formData: FormData,
): Promise<{ success: true } | { success: false; error: string }> {
  const data = integracaoBradescoPixSchema.parse({
    ativa: formData.get("ativa") === "true",
    clientId: formData.get("clientId") ?? "",
    clientSecret: formData.get("clientSecret") ?? "",
    certificadoSenha: formData.get("certificadoSenha") ?? "",
  });
  const certificadoFile = formData.get("certificado");

  const { supabase, userId } = await requireAdmin();

  const camposAlterados: string[] = ["ativa", "clientId"];
  const update: IntegracaoBradescoPixUpdate = {
    ativa: data.ativa,
    client_id: data.clientId || null,
    updated_at: new Date().toISOString(),
    updated_por: userId,
  };

  if (data.clientSecret) {
    const { ciphertext, iv } = encryptSecret(Buffer.from(data.clientSecret, "utf8"));
    update.client_secret_cifrado = ciphertext;
    update.client_secret_iv = iv;
    camposAlterados.push("clientSecret");
  }

  if (data.certificadoSenha) {
    const { ciphertext, iv } = encryptSecret(Buffer.from(data.certificadoSenha, "utf8"));
    update.certificado_senha_cifrada = ciphertext;
    update.certificado_senha_iv = iv;
    camposAlterados.push("certificadoSenha");
  }

  let pathAnterior: string | null = null;

  if (certificadoFile instanceof File && certificadoFile.size > 0) {
    if (certificadoFile.size > MAX_CERT_BYTES) {
      return { success: false, error: "Certificado maior que 1MB." };
    }
    if (!/\.(pfx|p12)$/i.test(certificadoFile.name)) {
      return { success: false, error: "Envie um arquivo .pfx ou .p12." };
    }

    const { data: atual } = await supabase
      .from("integracao_bradesco_pix")
      .select("certificado_path")
      .eq("id", INTEGRACAO_BRADESCO_PIX_ID)
      .single();
    pathAnterior = atual?.certificado_path ?? null;

    const bytes = new Uint8Array(await certificadoFile.arrayBuffer());
    const { ciphertext, iv } = encryptSecret(Buffer.from(bytes));

    // Certificado cifrado antes de subir — o bucket é privado (só
    // service_role) E o conteúdo em si é ciphertext, defesa em
    // profundidade (migration 027). IV numa coluna própria, mesmo padrão
    // de client_secret_iv/certificado_senha_iv — o objeto no bucket
    // guarda só o ciphertext (bytes brutos, decodificado do base64 que
    // encryptSecret devolve).
    const path = `certificados/${randomUUID()}.enc`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, Buffer.from(ciphertext, "base64"), {
        contentType: "application/octet-stream",
        upsert: false,
      });
    if (uploadError) throw uploadError;

    update.certificado_path = path;
    update.certificado_iv = iv;
    update.certificado_nome_arquivo = certificadoFile.name;
    update.certificado_enviado_em = new Date().toISOString();
    camposAlterados.push("certificado");
  }

  const { error } = await supabase
    .from("integracao_bradesco_pix")
    .update(update)
    .eq("id", INTEGRACAO_BRADESCO_PIX_ID);
  if (error) throw error;

  // Só o arquivo novo já foi confirmado gravado no banco — agora é seguro
  // remover o anterior do bucket, sem risco de ficar sem nenhum se o
  // update acima tivesse falhado.
  if (pathAnterior) {
    await supabaseAdmin.storage.from(BUCKET).remove([pathAnterior]);
  }

  // Nunca loga o conteúdo, só os NOMES dos campos alterados — mesmo
  // ciphertext/IV não entram no audit_logs (ver migration 027).
  //
  // supabaseAdmin (service role) aqui, não o client user-scoped: achado
  // ao vivo durante o teste desta tarefa — audit_logs tem
  // `grant insert ... to authenticated` mas NENHUMA policy de RLS de
  // INSERT, então esse insert é bloqueado pra qualquer sessão comum
  // (inclusive admin). Isso é um problema pré-existente do projeto
  // (afeta site_settings.ts/precos.ts também, que nunca checam o erro
  // desse insert) — fora do escopo desta tarefa consertar os outros
  // arquivos, mas aqui o log de auditoria é sensível o bastante pra não
  // deixar falhar em silêncio, daí o service_role + throw explícito.
  const { error: auditError } = await supabaseAdmin.from("audit_logs").insert({
    user_id: userId,
    action: "UPDATE",
    target_table: "integracao_bradesco_pix",
    target_id: INTEGRACAO_BRADESCO_PIX_ID,
    details: { fields: camposAlterados },
  });
  if (auditError) throw auditError;

  revalidatePath("/admin/config");
  return { success: true };
}
