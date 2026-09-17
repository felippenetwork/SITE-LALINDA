import "server-only";
import https from "node:https";
import { getCredenciaisBradescoPix } from "@/lib/bradesco/get-credenciais";
import { autenticarBradescoPix } from "@/lib/bradesco/autenticar";

// Mesmo placeholder de BRADESCO_PIX_COB_URL (lib/bradesco/gerar-cobranca-pix.ts).
const PLACEHOLDER_COB_URL =
  "https://CONFIGURE-BRADESCO_PIX_COB_URL-ANTES-DE-USAR.exemplo.com.br/cob";

function getCobUrl(): string | null {
  const url = process.env["BRADESCO_PIX_COB_URL"];
  if (!url || url === PLACEHOLDER_COB_URL) return null;
  return url;
}

export type ConsultarCobrancaResultado =
  { success: true; pago: boolean; valorPago: number | null } | { success: false; error: string };

// NÃO CONFIRMADO com a doc real do Bradesco: formato exato da resposta de
// GET /cob/{txid}. Suposição "nível Bacen" (mesma confiança já usada em
// gerar-cobranca-pix.ts): `status` no enum ATIVA/CONCLUIDA/
// REMOVIDA_PELO_USUARIO_RECEBEDOR/REMOVIDA_PELO_PSP, `pix` é um array
// preenchido só depois de pago, com o valor de fato recebido em cada
// entrada — soma-se as entradas em vez de confiar só em `valor.original`
// (que é o valor COBRADO, não necessariamente o PAGO, em caso de PIX
// parcial — cenário que o Bacen permite dependendo de configuração da
// cobrança). Sinalizado ao dono do projeto antes desta implementação.
interface CobConsultaResponse {
  status?: string;
  valor?: { original?: string };
  pix?: { valor?: string }[];
}

function isCobConsultaResponse(value: unknown): value is CobConsultaResponse {
  return typeof value === "object" && value !== null;
}

interface HttpResponse {
  status: number;
  body: string;
}

// Reconsulta a cobrança DIRETO no Bradesco, com credenciais próprias —
// nunca confia no payload de um webhook recebido pra decidir se um
// pagamento foi confirmado. Mesma infra mTLS/autenticação já usada em
// gerar-cobranca-pix.ts.
export async function consultarCobrancaPix(txid: string): Promise<ConsultarCobrancaResultado> {
  const cobUrl = getCobUrl();
  if (!cobUrl) {
    return {
      success: false,
      error: "BRADESCO_PIX_COB_URL não configurado (ou ainda no valor de exemplo).",
    };
  }

  const authResult = await autenticarBradescoPix();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  const credenciaisResult = await getCredenciaisBradescoPix();
  if (!credenciaisResult.success) {
    return { success: false, error: credenciaisResult.error };
  }
  const { certificado, certificadoSenha } = credenciaisResult.credenciais;

  let url: URL;
  try {
    url = new URL(`${cobUrl.replace(/\/+$/, "")}/${txid}`);
  } catch {
    return { success: false, error: "BRADESCO_PIX_COB_URL configurado não é uma URL válida." };
  }

  try {
    const response = await new Promise<HttpResponse>((resolve, reject) => {
      const agent = new https.Agent({ pfx: certificado, passphrase: certificadoSenha });
      const req = https.request(
        {
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname + url.search,
          method: "GET",
          agent,
          headers: { Authorization: `Bearer ${authResult.accessToken}` },
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
      req.end();
    });

    if (response.status === 404) {
      return { success: false, error: "Cobrança não encontrada no Bradesco." };
    }
    if (response.status === 401 || response.status === 403) {
      return { success: false, error: "Credenciais inválidas ao consultar cobrança PIX." };
    }
    if (response.status >= 500) {
      return {
        success: false,
        error: "Bradesco retornou um erro no servidor deles ao consultar a cobrança.",
      };
    }
    if (response.status !== 200) {
      return {
        success: false,
        error: `Bradesco recusou a consulta da cobrança (status ${response.status}).`,
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(response.body);
    } catch {
      return { success: false, error: "Resposta inesperada do Bradesco (não é JSON válido)." };
    }
    if (!isCobConsultaResponse(parsed)) {
      return { success: false, error: "Resposta inesperada do Bradesco ao consultar cobrança." };
    }

    const pago = parsed.status === "CONCLUIDA";
    const valorPago = pago
      ? (parsed.pix ?? []).reduce((soma, p) => soma + Number(p.valor ?? 0), 0)
      : null;

    return { success: true, pago, valorPago };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[bradesco-pix] falha ao consultar cobrança:", message);

    if (/mac verify failure|bad decrypt|pkcs12|PKCS12/i.test(message)) {
      return { success: false, error: "Certificado ou senha do certificado inválidos." };
    }
    if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|Tempo esgotado/i.test(message)) {
      return {
        success: false,
        error: "Não foi possível conectar ao Bradesco agora. Tente novamente em instantes.",
      };
    }
    return { success: false, error: "Erro inesperado ao consultar a cobrança PIX." };
  }
}
