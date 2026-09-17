import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

// Fixed row id — tabela singleton, mesmo padrão de integracao_bradesco_pix.
export const INTEGRACAO_WHATSAPP_ID = "30000000-0000-0000-0000-000000000001";

export interface IntegracaoWhatsApp {
  conectado: boolean;
  telefoneConectado: string | null;
  temInstancia: boolean;
  updatedAt: string;
}

type Row = Database["public"]["Tables"]["integracao_whatsapp"]["Row"];

// Token de instância dá controle total sobre o WhatsApp da empresa —
// mesmo padrão admin-only de lib/data/integracao-bradesco.ts.
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

function mapRow(row: Row): IntegracaoWhatsApp {
  return {
    conectado: row.conectado,
    telefoneConectado: row.telefone_conectado,
    temInstancia: !!row.instance_id,
    updatedAt: row.updated_at,
  };
}

// Nunca retorna instance_token_cifrado/iv pro chamador — só o status
// (conectado, telefone) que a tela precisa pra decidir o que mostrar.
export async function getIntegracaoWhatsApp(): Promise<IntegracaoWhatsApp> {
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("integracao_whatsapp")
    .select("*")
    .eq("id", INTEGRACAO_WHATSAPP_ID)
    .single();
  if (error) throw error;

  return mapRow(data);
}
