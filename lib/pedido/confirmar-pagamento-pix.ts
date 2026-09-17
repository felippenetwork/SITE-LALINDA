import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { consultarCobrancaPix } from "@/lib/bradesco/consultar-cobranca-pix";

export interface PedidoParaNotificacao {
  id: string;
  valorTotal: number;
  dataEntregaPrevista: string;
  cliente: { telefone: string; contatoNome: string };
  itens: { produtoNome: string; quantidade: number; subtotal: number }[];
}

export type ConfirmarPagamentoPixResultado =
  | { outcome: "confirmado"; pedido: PedidoParaNotificacao }
  | { outcome: "ja_confirmado" }
  | { outcome: "nao_encontrado" }
  // transitorio=true (rede/Bradesco fora do ar): vale a pena o Bradesco
  // reenviar depois. transitorio=false (mismatch de valor, cobrança
  // ainda não paga segundo a própria consulta): reenviar não muda nada.
  | { outcome: "nao_confirmado"; motivo: string; transitorio: boolean };

interface PedidoRow {
  id: string;
  valor_total: number;
  data_entrega_prevista: string;
  status_pagamento: string;
  clientes: { telefone: string; contato_nome: string } | null;
  pedido_itens: { produto_nome: string; quantidade: number; subtotal: number }[] | null;
}

// Núcleo chamado pelo webhook (app/api/webhooks/bradesco-pix/[token]/route.ts)
// pra cada txid recebido. NUNCA confia no valor que veio no payload do
// webhook — só usa o txid pra achar o pedido, e reconsulta a cobrança
// direto no Bradesco (consultarCobrancaPix, credenciais próprias) antes
// de confirmar qualquer coisa. Idempotente pela própria condição do
// UPDATE (status_pagamento='pendente'): reenvio do Bradesco pro mesmo
// txid já confirmado cai em "ja_confirmado" sem tocar o banco de novo.
export async function confirmarPagamentoPix(txid: string): Promise<ConfirmarPagamentoPixResultado> {
  const { data: pedido, error } = await supabaseAdmin
    .from("pedidos")
    .select(
      "id, valor_total, data_entrega_prevista, status_pagamento, clientes(telefone, contato_nome), pedido_itens(produto_nome, quantidade, subtotal)",
    )
    .eq("pix_txid", txid)
    .is("deleted_at", null)
    .maybeSingle<PedidoRow>();
  if (error) throw error;
  if (!pedido) return { outcome: "nao_encontrado" };
  if (pedido.status_pagamento === "confirmado") return { outcome: "ja_confirmado" };

  const consulta = await consultarCobrancaPix(txid);
  if (!consulta.success) {
    return { outcome: "nao_confirmado", motivo: consulta.error, transitorio: true };
  }
  if (!consulta.pago) {
    return {
      outcome: "nao_confirmado",
      motivo: "Bradesco ainda não confirma esta cobrança como paga.",
      transitorio: false,
    };
  }
  if (consulta.valorPago === null || Math.abs(consulta.valorPago - pedido.valor_total) > 0.01) {
    return {
      outcome: "nao_confirmado",
      motivo: `Valor pago (${consulta.valorPago}) não bate com valor_total do pedido (${pedido.valor_total}).`,
      transitorio: false,
    };
  }

  // Condição status_pagamento='pendente' no WHERE é a própria garantia de
  // idempotência — corrida entre dois webhooks pro mesmo txid só deixa
  // um deles afetar alguma linha.
  const { data: atualizados, error: updateError } = await supabaseAdmin
    .from("pedidos")
    .update({ status_pagamento: "confirmado" })
    .eq("id", pedido.id)
    .eq("status_pagamento", "pendente")
    .select("id");
  if (updateError) throw updateError;
  if (!atualizados || atualizados.length === 0) return { outcome: "ja_confirmado" };

  // pedidos.cliente_id é not null (FK, migration 021) — chegar aqui sem
  // clientes carregado é inconsistência de dado, não um caminho
  // esperado; o pagamento já foi confirmado acima, só a notificação (que
  // é efeito colateral, nunca crítico) não tem pra quem mandar.
  if (!pedido.clientes) throw new Error(`Pedido ${pedido.id} confirmado sem cliente associado`);

  return {
    outcome: "confirmado",
    pedido: {
      id: pedido.id,
      valorTotal: pedido.valor_total,
      dataEntregaPrevista: pedido.data_entrega_prevista,
      cliente: {
        telefone: pedido.clientes.telefone,
        contatoNome: pedido.clientes.contato_nome,
      },
      itens: (pedido.pedido_itens ?? []).map((i) => ({
        produtoNome: i.produto_nome,
        quantidade: i.quantidade,
        subtotal: i.subtotal,
      })),
    },
  };
}
