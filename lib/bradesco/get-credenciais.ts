import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decryptSecret } from "@/lib/crypto/encrypt-secret";
import { INTEGRACAO_BRADESCO_PIX_ID } from "@/lib/data/integracao-bradesco";

const BUCKET = "payment-certificates";

export interface CredenciaisBradescoPix {
  clientId: string;
  clientSecret: string;
  certificado: Buffer;
  certificadoSenha: string;
}

type Resultado =
  { success: true; credenciais: CredenciaisBradescoPix } | { success: false; error: string };

// Nunca exportado por nenhuma Server Action que devolve algo ao client —
// só lib/bradesco/autenticar.ts e lib/bradesco/gerar-cobranca-pix.ts
// importam isto. Tudo decifrado aqui vive só no escopo desta chamada:
// nada é cacheado, logado, ou atribuído a uma variável de módulo que
// sobreviva além desta invocação.
//
// Sem checagem de has_role(admin) na SESSÃO ATUAL de propósito — ao
// contrário de toda leitura admin-gated do projeto. Esta função é uma
// operação de SISTEMA (o servidor autenticando com o Bradesco), chamada
// tanto a partir de uma sessão de admin (botão "Testar Conexão") quanto
// a partir da sessão de um CLIENTE COMUM finalizando uma compra PIX
// (confirmarPedido → montarESalvarPedido → gerarCobrancaPix) — um
// cliente comum nunca tem has_role(admin), então essa checagem aqui
// dentro sempre falharia com "Forbidden" nesse segundo caso (achado ao
// vivo testando esta tarefa). A autorização de verdade já aconteceu
// antes desta função ser chamada, em cada ponto de entrada
// (testarConexaoBradescoPixAction faz seu próprio requireAdmin();
// confirmarPedido só chega aqui depois de validar o pedido do próprio
// cliente) — repetir uma checagem de identidade aqui dentro não
// protege nada a mais, só quebra o caso de uso do cliente comum.
export async function getCredenciaisBradescoPix(): Promise<Resultado> {
  const { data: row, error } = await supabaseAdmin
    .from("integracao_bradesco_pix")
    .select("*")
    .eq("id", INTEGRACAO_BRADESCO_PIX_ID)
    .single();
  if (error) return { success: false, error: "Erro ao ler configuração da integração." };

  if (!row.ativa) {
    return {
      success: false,
      error: "Integração desativada — ative em Configurações antes de testar.",
    };
  }
  if (!row.client_id || !row.client_secret_cifrado || !row.client_secret_iv) {
    return { success: false, error: "Client ID ou Client Secret não configurados." };
  }
  if (
    !row.certificado_path ||
    !row.certificado_iv ||
    !row.certificado_senha_cifrada ||
    !row.certificado_senha_iv
  ) {
    return { success: false, error: "Certificado ou senha do certificado não configurados." };
  }

  let clientSecret: string;
  let certificadoSenha: string;
  try {
    clientSecret = decryptSecret(row.client_secret_cifrado, row.client_secret_iv).toString("utf8");
    certificadoSenha = decryptSecret(
      row.certificado_senha_cifrada,
      row.certificado_senha_iv,
    ).toString("utf8");
  } catch {
    return {
      success: false,
      error: "Erro interno ao carregar credenciais — contate o suporte técnico.",
    };
  }

  const { data: certFile, error: downloadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(row.certificado_path);
  if (downloadError || !certFile) {
    return { success: false, error: "Erro ao carregar o certificado do armazenamento." };
  }

  let certificado: Buffer;
  try {
    const certBytes = Buffer.from(await certFile.arrayBuffer());
    certificado = decryptSecret(certBytes.toString("base64"), row.certificado_iv);
  } catch {
    return {
      success: false,
      error: "Erro interno ao carregar o certificado — contate o suporte técnico.",
    };
  }

  return {
    success: true,
    credenciais: { clientId: row.client_id, clientSecret, certificado, certificadoSenha },
  };
}
