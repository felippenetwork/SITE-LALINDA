import "server-only";
import { createClient } from "@/lib/supabase/server";
import { decryptSecret } from "@/lib/crypto/encrypt-secret";
import type { Database } from "@/lib/supabase/types";

// Fixed row id — tabela singleton, mesmo padrão de site_settings.
export const INTEGRACAO_BRADESCO_PIX_ID = "10000000-0000-0000-0000-000000000001";

export interface IntegracaoBradescoPix {
  ativa: boolean;
  clientId: string | null;
  clientSecretUltimos4: string | null;
  temCertificado: boolean;
  certificadoNomeArquivo: string | null;
  certificadoEnviadoEm: string | null;
  certificadoSenhaUltimos4: string | null;
  updatedAt: string;
}

type Row = Database["public"]["Tables"]["integracao_bradesco_pix"]["Row"];

// Preço e credencial de banco são as duas áreas do projeto que operador
// nunca acessa — mesmo padrão admin-only de lib/data/precos.ts.
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

// Últimos 4 caracteres de um segredo cifrado — decifra em memória só o
// suficiente pra extrair o fragmento, nunca retorna (nem loga) o valor
// completo. ciphertext/iv ausentes (nunca salvo ainda) devolve null.
function ultimos4(ciphertext: string | null, iv: string | null): string | null {
  if (!ciphertext || !iv) return null;
  const plaintext = decryptSecret(ciphertext, iv).toString("utf8");
  return plaintext.slice(-4);
}

function mapRow(row: Row): IntegracaoBradescoPix {
  return {
    ativa: row.ativa,
    clientId: row.client_id,
    clientSecretUltimos4: ultimos4(row.client_secret_cifrado, row.client_secret_iv),
    temCertificado: !!row.certificado_path,
    certificadoNomeArquivo: row.certificado_nome_arquivo,
    certificadoEnviadoEm: row.certificado_enviado_em,
    certificadoSenhaUltimos4: ultimos4(row.certificado_senha_cifrada, row.certificado_senha_iv),
    updatedAt: row.updated_at,
  };
}

// Nunca retorna client_secret_cifrado/iv nem certificado_senha_cifrada/iv
// pro chamador — só os últimos 4 caracteres, já decididos aqui dentro.
// O ciphertext/IV completos nunca saem desta função.
export async function getIntegracaoBradescoPix(): Promise<IntegracaoBradescoPix> {
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("integracao_bradesco_pix")
    .select("*")
    .eq("id", INTEGRACAO_BRADESCO_PIX_ID)
    .single();
  if (error) throw error;

  return mapRow(data);
}
