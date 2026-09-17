import "server-only";
import { getTokenWhatsApp } from "@/lib/whatsapp/get-token";
import { sendText } from "@/lib/whatsapp/uazapi";
import { formatBRL } from "@/lib/format";
import type { PedidoParaNotificacao } from "@/lib/pedido/confirmar-pagamento-pix";

function formatarDataExibicao(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split("-").map(Number);
  return new Date(ano!, mes! - 1, dia!).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function montarMensagem(pedido: PedidoParaNotificacao): string {
  const itensTexto = pedido.itens
    .map((i) => `${i.quantidade}x ${i.produtoNome} — ${formatBRL(i.subtotal)}`)
    .join("\n");

  return [
    `Olá, ${pedido.cliente.contatoNome}! Recebemos a confirmação do pagamento do seu pedido.`,
    "",
    "*Itens:*",
    itensTexto,
    "",
    `*Total: ${formatBRL(pedido.valorTotal)}*`,
    "",
    `Entrega prevista: ${formatarDataExibicao(pedido.dataEntregaPrevista)}`,
    "",
    "Aguarde, em breve seu pedido estará a caminho! — La Linda",
  ].join("\n");
}

// Best-effort side effect, mesmo contrato de send-lead-notification.ts:
// chamado logo depois do webhook já ter confirmado status_pagamento no
// banco — falha aqui NUNCA desfaz nem reflete na confirmação do
// pagamento (já gravada antes desta função ser chamada). Todo caminho de
// falha (sem token configurado, erro da uazapi, exceção inesperada) só
// loga e retorna — nunca lança.
export async function enviarNotificacaoPagamentoConfirmado(
  pedido: PedidoParaNotificacao,
): Promise<void> {
  try {
    const tokenResult = await getTokenWhatsApp();
    if (!tokenResult.success) {
      console.error(
        "[whatsapp] notificação de pagamento não enviada:",
        pedido.id,
        tokenResult.error,
      );
      return;
    }

    await sendText(tokenResult.token, pedido.cliente.telefone, montarMensagem(pedido));
  } catch (error) {
    console.error(
      "[whatsapp] falha inesperada ao notificar pagamento confirmado:",
      pedido.id,
      error,
    );
  }
}
