import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { confirmarPagamentoPix } from "@/lib/pedido/confirmar-pagamento-pix";
import { enviarNotificacaoPagamentoConfirmado } from "@/lib/whatsapp/send-pedido-confirmado";
import { checkBradescoWebhookRateLimit } from "@/lib/security/bradesco-webhook-rate-limit";
import { getClientIp } from "@/lib/security/get-client-ip";

// Primeira camada de defesa: token aleatório na própria URL, configurado
// no cadastro do webhook no painel do Bradesco (quando essa opção
// existir) — não depende de nenhum mecanismo específico deles (mTLS de
// entrada, assinatura) que eu não tenho como confirmar sem a doc real.
// comparação em tempo constante (nunca ===) evita timing attack.
function tokenValido(tokenRecebido: string): boolean {
  const esperado = process.env["BRADESCO_PIX_WEBHOOK_SECRET"];
  if (!esperado) return false;

  const bufRecebido = Buffer.from(tokenRecebido);
  const bufEsperado = Buffer.from(esperado);
  if (bufRecebido.length !== bufEsperado.length) return false;
  return timingSafeEqual(bufRecebido, bufEsperado);
}

// NÃO CONFIRMADO com a doc real do Bradesco: formato exato do payload
// do webhook de confirmação PIX. Suposição "nível Bacen" (mesmo
// patamar já usado em gerar-cobranca-pix.ts/consultar-cobranca-pix.ts):
// o padrão regulatório de webhook PIX manda um array `pix`, cada
// entrada com pelo menos um `txid`. Usado só pra saber QUAL cobrança
// checar — o valor/status de fato vêm sempre de consultarCobrancaPix,
// nunca deste payload (ver confirmar-pagamento-pix.ts).
interface BacenPixWebhookPayload {
  pix?: { txid?: string }[];
}

function isBacenPixWebhookPayload(value: unknown): value is BacenPixWebhookPayload {
  return typeof value === "object" && value !== null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!tokenValido(token)) {
    console.error("[webhook/bradesco-pix] token invalido recebido");
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Só depois do token validar — um flood de token ERRADO não deveria
  // consumir cota nenhuma (a checagem de token já é praticamente grátis
  // sozinha), e assim um atacante sem o token nunca esgota a cota de
  // quem tem o token de verdade.
  const ip = await getClientIp();
  const dentroDoLimite = await checkBradescoWebhookRateLimit(ip);
  if (!dentroDoLimite) {
    console.error("[webhook/bradesco-pix] rate limit excedido:", ip);
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "payload invalido" }, { status: 400 });
  }

  if (!isBacenPixWebhookPayload(body) || !Array.isArray(body.pix)) {
    console.error("[webhook/bradesco-pix] payload em formato inesperado");
    return NextResponse.json({ ok: true, ignorado: "formato inesperado" });
  }

  const txids = body.pix.map((p) => p.txid).filter((t): t is string => Boolean(t));
  if (txids.length === 0) {
    return NextResponse.json({ ok: true, ignorado: "sem txid no payload" });
  }

  // Falha transitória (rede/Bradesco fora do ar) faz o webhook inteiro
  // responder erro, pro Bradesco reenviar depois — mismatch de valor ou
  // txid não encontrado nunca faz isso (reenviar não muda o resultado).
  let algumaFalhaTransitoria = false;

  for (const txid of txids) {
    try {
      const resultado = await confirmarPagamentoPix(txid);

      if (resultado.outcome === "confirmado") {
        // send-pedido-confirmado.ts nunca lança — efeito colateral,
        // nunca deve derrubar a confirmação do pagamento (já gravada).
        await enviarNotificacaoPagamentoConfirmado(resultado.pedido);
      } else if (resultado.outcome === "nao_confirmado") {
        console.error("[webhook/bradesco-pix] txid nao confirmado:", txid, resultado.motivo);
        if (resultado.transitorio) algumaFalhaTransitoria = true;
      } else if (resultado.outcome === "nao_encontrado") {
        console.error("[webhook/bradesco-pix] txid nao encontrado:", txid);
      }
      // "ja_confirmado" é o caminho normal de reenvio duplicado — silencioso.
    } catch (err) {
      console.error("[webhook/bradesco-pix] erro inesperado processando txid", txid, err);
      algumaFalhaTransitoria = true;
    }
  }

  if (algumaFalhaTransitoria) {
    return NextResponse.json({ error: "falha temporaria" }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
