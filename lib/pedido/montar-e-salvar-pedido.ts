import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getRegiaoEntrega } from "@/lib/data/portal";
import { calcularProximaDataEntrega } from "@/lib/delivery/calcular-proxima-data-entrega";

export type ConfirmarPedidoResult =
  | { success: true; pedidoId: string; dataEntregaPrevista: string }
  | { success: false; error: string };

export interface ClienteParaPedido {
  id: string;
  grupoPrecoId: string | null;
  regiaoEntregaId: string | null;
  boletoLiberado: boolean;
  boletoPrazosDias: number[] | null;
}

interface ProdutoDisponivel {
  id: string;
  name: string;
  available: boolean | null;
}

// Núcleo de precificação/gravação — reaproveitado tanto pelo checkout do
// portal (confirmarPedido, lib/actions/pedido.ts) quanto pela conversão
// de rascunho pelo admin (confirmarRascunhoAction, lib/actions/vendas.ts).
// As duas chamadoras já resolveram QUEM é o cliente e com que
// autorização — esta função só repreça, revalida boleto/data de entrega
// e grava, exatamente como o checkout já fazia antes de existir vendedor.
//
// Fora de qualquer arquivo "use server" de propósito: recebe um Map como
// argumento, e o Next.js valida serializabilidade dos argumentos de toda
// função exportada por um módulo "use server" (mesmo quando ela só é
// chamada de outro módulo servidor, nunca do client) — sem essa separação
// o build arriscaria rejeitar Map como tipo de parâmetro.
export async function montarESalvarPedido(input: {
  cliente: ClienteParaPedido;
  itens: { produtoId: string; quantidade: number }[];
  metodoPagamento: "pix" | "boleto";
  prazoDiasEscolhido: number | null | undefined;
  precos: Map<string, number>;
  produtos: ProdutoDisponivel[];
}): Promise<ConfirmarPedidoResult> {
  const { cliente, itens, metodoPagamento, prazoDiasEscolhido, precos, produtos } = input;

  if (!cliente.grupoPrecoId) {
    return { success: false, error: "Cliente ainda não tem uma tabela de preços associada." };
  }
  if (!cliente.regiaoEntregaId) {
    return { success: false, error: "Cliente ainda não tem uma região de entrega associada." };
  }

  // Nunca confia na forma de pagamento escolhida na tela sem reconferir
  // — um client malicioso podia mandar "boleto" mesmo sem ter liberado.
  if (metodoPagamento === "boleto") {
    if (!cliente.boletoLiberado) {
      return { success: false, error: "Boleto não está liberado para este cliente." };
    }
    const prazosValidos = cliente.boletoPrazosDias ?? [];
    if (!prazoDiasEscolhido || !prazosValidos.includes(prazoDiasEscolhido)) {
      return { success: false, error: "Prazo de boleto inválido para este cliente." };
    }
  }

  const produtoPorId = new Map(produtos.map((p) => [p.id, p]));
  const itensParaGravar: {
    produto_id: string;
    produto_nome: string;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
  }[] = [];

  for (const item of itens) {
    const produto = produtoPorId.get(item.produtoId);
    if (!produto || !produto.available) {
      return { success: false, error: `Um dos produtos do pedido não está mais disponível.` };
    }
    const valor = precos.get(item.produtoId);
    if (valor === undefined) {
      return {
        success: false,
        error: `"${produto.name}" ainda não tem preço definido para este cliente — remova este item para continuar.`,
      };
    }
    itensParaGravar.push({
      produto_id: item.produtoId,
      produto_nome: produto.name,
      quantidade: item.quantidade,
      preco_unitario: valor,
      subtotal: Math.round(valor * item.quantidade * 100) / 100,
    });
  }

  // Data de entrega recalculada aqui — a que apareceu na tela era só uma
  // prévia, pode ter ficado desatualizada entre montar o pedido e confirmar.
  const regiao = await getRegiaoEntrega(cliente.regiaoEntregaId);
  if (!regiao) {
    return { success: false, error: "Região de entrega não encontrada." };
  }
  const dataEntregaPrevista = calcularProximaDataEntrega(
    new Date(),
    regiao.diasSemanaEntrega,
    regiao.horarioCorte,
  );

  const { data: pedidoId, error: rpcError } = await supabaseAdmin.rpc("criar_pedido", {
    p_cliente_id: cliente.id,
    p_metodo_pagamento: metodoPagamento,
    p_prazo_dias_escolhido: metodoPagamento === "boleto" ? (prazoDiasEscolhido ?? null) : null,
    p_data_entrega_prevista: dataEntregaPrevista,
    p_itens: itensParaGravar,
  });
  if (rpcError) throw rpcError;

  return { success: true, pedidoId: pedidoId as string, dataEntregaPrevista };
}
