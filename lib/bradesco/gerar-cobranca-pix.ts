import "server-only";
import https from "node:https";
import { getCredenciaisBradescoPix } from "@/lib/bradesco/get-credenciais";
import { autenticarBradescoPix } from "@/lib/bradesco/autenticar";

// Mesmo raciocínio do placeholder de BRADESCO_PIX_TOKEN_URL
// (lib/bradesco/autenticar.ts): não existe uma URL de sandbox pública e
// padronizada — configure o endpoint real antes de gerar cobrança de
// verdade.
const PLACEHOLDER_COB_URL =
  "https://CONFIGURE-BRADESCO_PIX_COB_URL-ANTES-DE-USAR.exemplo.com.br/cob";

function getCobUrl(): string | null {
  const url = process.env["BRADESCO_PIX_COB_URL"];
  if (!url || url === PLACEHOLDER_COB_URL) return null;
  return url;
}

// Chave PIX cadastrada no Bradesco — não é segredo (é um identificador
// público de recebimento, igual ao Client ID), por isso variável de
// ambiente comum, nunca passando pelo esquema de cifragem de
// lib/crypto/encrypt-secret.ts.
function getChavePix(): string | null {
  return process.env["BRADESCO_PIX_CHAVE"] || null;
}

export type GerarCobrancaResultado =
  { success: true; txid: string; qrcode: string } | { success: false; error: string };

interface CobResponse {
  txid?: string;
  pixCopiaECola?: string;
}

function isCobResponse(value: unknown): value is CobResponse {
  return typeof value === "object" && value !== null;
}

// Bacen exige txid de 26 a 35 caracteres alfanuméricos — UUID do pedido
// sem hífens dá exatamente 32. NÃO CONFIRMADO com a doc real do
// Bradesco se eles aceitam txid gerado por nós (PUT /cob/{txid}, usado
// aqui) ou exigem que o próprio banco gere (POST /cob sem txid no
// path) — decisão registrada e aprovada pelo dono do projeto como
// suposição a verificar quando a documentação real estiver disponível.
function gerarTxid(pedidoId: string): string {
  return pedidoId.replace(/-/g, "");
}

interface HttpResponse {
  status: number;
  body: string;
}

// Gera a cobrança PIX de um pedido já criado — reaproveita a MESMA
// conexão mTLS/autenticação já testada. valorTotal só pode vir do
// próprio pedido gravado no banco (nunca recalculado aqui, nunca de
// outra fonte) — quem chama esta função (montarESalvarPedido) já
// garante isso.
export async function gerarCobrancaPix(input: {
  pedidoId: string;
  valorTotal: number;
  expiracao: Date;
}): Promise<GerarCobrancaResultado> {
  const cobUrl = getCobUrl();
  if (!cobUrl) {
    return {
      success: false,
      error: "BRADESCO_PIX_COB_URL não configurado (ou ainda no valor de exemplo).",
    };
  }
  const chave = getChavePix();
  if (!chave) {
    return { success: false, error: "BRADESCO_PIX_CHAVE não configurada." };
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

  const txid = gerarTxid(input.pedidoId);
  const expiracaoSegundos = Math.max(
    60,
    Math.round((input.expiracao.getTime() - Date.now()) / 1000),
  );

  let url: URL;
  try {
    url = new URL(`${cobUrl.replace(/\/+$/, "")}/${txid}`);
  } catch {
    return { success: false, error: "BRADESCO_PIX_COB_URL configurado não é uma URL válida." };
  }

  const body = JSON.stringify({
    calendario: { expiracao: expiracaoSegundos },
    valor: { original: input.valorTotal.toFixed(2) },
    chave,
  });

  try {
    const response = await new Promise<HttpResponse>((resolve, reject) => {
      const agent = new https.Agent({ pfx: certificado, passphrase: certificadoSenha });
      const req = https.request(
        {
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname + url.search,
          method: "PUT",
          agent,
          headers: {
            Authorization: `Bearer ${authResult.accessToken}`,
            "Content-Type": "application/json",
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
      return { success: false, error: "Credenciais inválidas ao gerar cobrança PIX." };
    }
    if (response.status >= 500) {
      return {
        success: false,
        error: "Bradesco retornou um erro no servidor deles ao gerar a cobrança.",
      };
    }
    if (response.status !== 200 && response.status !== 201) {
      return {
        success: false,
        error: `Bradesco recusou a criação da cobrança (status ${response.status}).`,
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(response.body);
    } catch {
      return { success: false, error: "Resposta inesperada do Bradesco (não é JSON válido)." };
    }
    if (!isCobResponse(parsed) || !parsed.pixCopiaECola) {
      // NÃO CONFIRMADO: se o Bradesco não devolve pixCopiaECola direto
      // no corpo do /cob, a doc real pode exigir uma chamada adicional
      // a um endpoint de location/qrcode — não implementada aqui por
      // falta da documentação (sinalizado no plano apresentado ao
      // dono do projeto antes desta implementação).
      return {
        success: false,
        error: "Bradesco não retornou o código PIX na resposta.",
      };
    }

    return { success: true, txid: parsed.txid ?? txid, qrcode: parsed.pixCopiaECola };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[bradesco-pix] falha ao gerar cobrança:", message);

    if (/mac verify failure|bad decrypt|pkcs12|PKCS12/i.test(message)) {
      return { success: false, error: "Certificado ou senha do certificado inválidos." };
    }
    if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|Tempo esgotado/i.test(message)) {
      return {
        success: false,
        error: "Não foi possível conectar ao Bradesco agora. Tente novamente em instantes.",
      };
    }
    return { success: false, error: "Erro inesperado ao gerar a cobrança PIX." };
  }
}
