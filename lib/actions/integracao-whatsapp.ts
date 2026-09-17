"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { encryptSecret } from "@/lib/crypto/encrypt-secret";
import { getIntegracaoWhatsApp, INTEGRACAO_WHATSAPP_ID } from "@/lib/data/integracao-whatsapp";
import { getTokenWhatsApp } from "@/lib/whatsapp/get-token";
import {
  createInstance,
  deleteInstance,
  connectInstance,
  getInstanceStatus,
} from "@/lib/whatsapp/uazapi";

const INSTANCE_NAME = "la-linda-pedidos";

export async function getIntegracaoWhatsAppAction() {
  return getIntegracaoWhatsApp();
}

type ConectarResultado =
  | { success: true; status: string; qr: string | null; phone: string | null }
  | { success: false; error: string };

// Controle total sobre o WhatsApp da empresa — mesmo padrão admin-only
// de lib/actions/integracao-bradesco.ts.
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

async function registrarAuditoria(userId: string, acao: string) {
  // Mesmo motivo de usar supabaseAdmin aqui (não o client user-scoped)
  // documentado em lib/actions/integracao-bradesco.ts — audit_logs tem
  // grant insert sem policy de RLS pra authenticated.
  const { error } = await supabaseAdmin.from("audit_logs").insert({
    user_id: userId,
    action: "UPDATE",
    target_table: "integracao_whatsapp",
    target_id: INTEGRACAO_WHATSAPP_ID,
    details: { acao },
  });
  if (error) throw error;
}

// Cria a instância (se não existir uma conectada) e devolve o QR pra
// escanear. Nunca recria uma sessão já conectada — recriar uma sessão
// boa é destrutivo (mesmo raciocínio documentado no projeto irmão que
// usa esta mesma uazapi: reconexão pode bater rate limit e perder uma
// sessão que já funcionava). QR NUNCA é gravado em nenhuma tabela —
// trafega só nesta resposta, direto pro componente que mostra a tela.
export async function conectarWhatsAppAction(): Promise<ConectarResultado> {
  const { userId } = await requireAdmin();

  const { data: row, error } = await supabaseAdmin
    .from("integracao_whatsapp")
    .select("instance_token_cifrado, instance_token_iv")
    .eq("id", INTEGRACAO_WHATSAPP_ID)
    .single();
  if (error) return { success: false, error: "Erro ao ler configuração da integração." };

  let tokenAtual: string | null = null;
  if (row.instance_token_cifrado && row.instance_token_iv) {
    const tokenResult = await getTokenWhatsApp();
    if (tokenResult.success) {
      tokenAtual = tokenResult.token;
      const statusAtual = await getInstanceStatus(tokenAtual);
      if (statusAtual.status === "connected") {
        await supabaseAdmin
          .from("integracao_whatsapp")
          .update({ conectado: true, telefone_conectado: statusAtual.phone, updated_por: userId })
          .eq("id", INTEGRACAO_WHATSAPP_ID);
        return {
          success: true,
          status: statusAtual.status,
          qr: null,
          phone: statusAtual.phone,
        };
      }
      await deleteInstance(tokenAtual).catch((err) =>
        console.error("[whatsapp/conectar] deleteInstance falhou:", err),
      );
    }
  }

  let criada: { id: string; token: string };
  try {
    criada = await createInstance(INSTANCE_NAME);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar instância";
    console.error("[whatsapp/conectar] createInstance falhou:", message);
    return { success: false, error: message };
  }

  const { ciphertext, iv } = encryptSecret(Buffer.from(criada.token, "utf8"));
  const { error: saveError } = await supabaseAdmin
    .from("integracao_whatsapp")
    .update({
      instance_id: criada.id,
      instance_token_cifrado: ciphertext,
      instance_token_iv: iv,
      conectado: false,
      telefone_conectado: null,
      updated_por: userId,
    })
    .eq("id", INTEGRACAO_WHATSAPP_ID);
  if (saveError) throw saveError;

  await registrarAuditoria(userId, "conectar");

  const info = await connectInstance(criada.token);
  revalidatePath("/admin/config");
  return { success: true, status: info.status, qr: info.qr, phone: info.phone };
}

type StatusResultado =
  | { success: true; status: string; qr: string | null; phone: string | null }
  | { success: false; error: string };

// Checagem "leve" pro polling da tela — nunca dispara reconexão (isso é
// só o botão "Conectar"). QR só vem preenchido enquanto o status for
// qr_ready; uma vez "connected", a própria uazapi para de devolver QR,
// então não tem como esta ação reexibir um QR de uma conexão já feita.
export async function statusWhatsAppAction(): Promise<StatusResultado> {
  const { userId } = await requireAdmin();

  const tokenResult = await getTokenWhatsApp();
  if (!tokenResult.success) return { success: false, error: tokenResult.error };

  const info = await getInstanceStatus(tokenResult.token);
  await supabaseAdmin
    .from("integracao_whatsapp")
    .update({
      conectado: info.status === "connected",
      telefone_conectado: info.phone,
      updated_por: userId,
    })
    .eq("id", INTEGRACAO_WHATSAPP_ID);

  return { success: true, status: info.status, qr: info.qr, phone: info.phone };
}

export async function desconectarWhatsAppAction(): Promise<
  { success: true } | { success: false; error: string }
> {
  const { userId } = await requireAdmin();

  const tokenResult = await getTokenWhatsApp();
  if (tokenResult.success) {
    await deleteInstance(tokenResult.token).catch((err) =>
      console.error("[whatsapp/desconectar] deleteInstance falhou:", err),
    );
  }

  const { error } = await supabaseAdmin
    .from("integracao_whatsapp")
    .update({
      instance_id: null,
      instance_token_cifrado: null,
      instance_token_iv: null,
      conectado: false,
      telefone_conectado: null,
      updated_por: userId,
    })
    .eq("id", INTEGRACAO_WHATSAPP_ID);
  if (error) throw error;

  await registrarAuditoria(userId, "desconectar");
  revalidatePath("/admin/config");
  return { success: true };
}
