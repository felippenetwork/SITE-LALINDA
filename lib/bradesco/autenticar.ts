import "server-only";
import https from "node:https";
import { getCredenciaisBradescoPix } from "@/lib/bradesco/get-credenciais";

// Bradesco não tem uma URL de sandbox pública, fixa e igual pra qualquer
// conta (diferente de APIs que publicam algo como "sandbox.provedor.com"
// aberto a todo mundo) — o acesso a homologação é por aplicação,
// negociado no portal deles. Este valor é um placeholder ÓBVIO de
// propósito, nunca uma URL real do Bradesco: configure
// BRADESCO_PIX_TOKEN_URL no .env/Vercel com o endpoint real (sandbox ou
// produção — decisão de quem for finalizar esta integração) antes de
// usar "Testar Conexão" de verdade. Enquanto não configurado, a função
// abaixo recusa antes de tentar qualquer chamada de rede.
const PLACEHOLDER_TOKEN_URL =
  "https://CONFIGURE-BRADESCO_PIX_TOKEN_URL-ANTES-DE-USAR.exemplo.com.br/oauth/token";

function getTokenUrl(): string | null {
  const url = process.env["BRADESCO_PIX_TOKEN_URL"];
  if (!url || url === PLACEHOLDER_TOKEN_URL) return null;
  return url;
}

// accessToken só deve circular entre módulos de servidor (aqui →
// gerar-cobranca-pix.ts) — nunca retornado por uma Server Action que
// devolve algo ao client (ver o strip explícito em
// testarConexaoBradescoPixAction, lib/actions/integracao-bradesco.ts).
export type AutenticarResultado =
  | { success: true; accessToken: string; expiraEmSegundos: number }
  | { success: false; error: string };

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

function isTokenResponse(value: unknown): value is TokenResponse {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v["access_token"] === "string" && typeof v["expires_in"] === "number";
}

interface HttpResponse {
  status: number;
  body: string;
}

// Autenticação OAuth2 client_credentials sobre mTLS — o Node precisa
// apresentar o certificado do cliente na própria conexão TLS, não é só
// um header de autorização, por isso https.request nativo com
// https.Agent(pfx/passphrase) em vez do fetch global: mais maduro e
// previsível pra esse cenário do que a integração fetch+dispatcher do
// undici, que tem menos histórico consolidado com certificado de
// cliente. Runtime Node é obrigatório (node:https/node:crypto não
// existem em Edge) — nenhuma rota deste projeto declara runtime "edge",
// então isso já vale por padrão.
//
// client_id/client_secret vão via HTTP Basic Auth (RFC 6749, forma
// preferida do client_credentials) — se a documentação real do Bradesco
// exigir os dois campos no corpo da requisição em vez do header, ajustar
// aqui é uma mudança pequena e isolada nesta função.
export async function autenticarBradescoPix(): Promise<AutenticarResultado> {
  const tokenUrl = getTokenUrl();
  if (!tokenUrl) {
    return {
      success: false,
      error:
        "BRADESCO_PIX_TOKEN_URL não configurado (ou ainda no valor de exemplo). Defina a URL real do endpoint de token do Bradesco antes de testar a conexão.",
    };
  }

  const credenciaisResult = await getCredenciaisBradescoPix();
  if (!credenciaisResult.success) {
    return { success: false, error: credenciaisResult.error };
  }
  const { clientId, clientSecret, certificado, certificadoSenha } = credenciaisResult.credenciais;

  let url: URL;
  try {
    url = new URL(tokenUrl);
  } catch {
    return { success: false, error: "BRADESCO_PIX_TOKEN_URL configurado não é uma URL válida." };
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString("base64");
  const body = new URLSearchParams({ grant_type: "client_credentials" }).toString();

  try {
    const response = await new Promise<HttpResponse>((resolve, reject) => {
      const agent = new https.Agent({ pfx: certificado, passphrase: certificadoSenha });
      const req = https.request(
        {
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname + url.search,
          method: "POST",
          agent,
          headers: {
            Authorization: `Basic ${basicAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(body),
          },
          timeout: 15000,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk: Buffer) => (data += chunk.toString("utf8")));
          res.on("end", () => resolve({ status: res.statusCode ?? 0, body: data }));
        },
      );
      req.on("timeout", () => req.destroy(new Error("Tempo esgotado ao conectar ao Bradesco")));
      req.on("error", reject);
      req.write(body);
      req.end();
    });

    if (response.status === 401 || response.status === 403) {
      return { success: false, error: "Client ID ou Client Secret inválidos." };
    }
    if (response.status >= 500) {
      return {
        success: false,
        error: "Bradesco retornou um erro no servidor deles. Tente novamente mais tarde.",
      };
    }
    if (response.status !== 200) {
      return {
        success: false,
        error: `Bradesco recusou a autenticação (status ${response.status}).`,
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(response.body);
    } catch {
      return { success: false, error: "Resposta inesperada do Bradesco (não é JSON válido)." };
    }
    if (!isTokenResponse(parsed)) {
      return {
        success: false,
        error: "Resposta do Bradesco não contém um token de acesso válido.",
      };
    }

    return { success: true, accessToken: parsed.access_token, expiraEmSegundos: parsed.expires_in };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Log só a descrição do erro de protocolo/rede — nunca as
    // credenciais (não estão nem no escopo desta função pra vazar).
    console.error("[bradesco-pix] falha ao autenticar:", message);

    if (/mac verify failure|bad decrypt|pkcs12|PKCS12/i.test(message)) {
      return { success: false, error: "Certificado ou senha do certificado inválidos." };
    }
    if (/certificate has expired/i.test(message)) {
      return {
        success: false,
        error: "Certificado expirado — gere um novo no portal do Bradesco.",
      };
    }
    if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|Tempo esgotado/i.test(message)) {
      return {
        success: false,
        error: "Não foi possível conectar ao Bradesco agora. Tente novamente em instantes.",
      };
    }
    return { success: false, error: "Erro inesperado ao tentar autenticar com o Bradesco." };
  }
}
