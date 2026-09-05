"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getMinhaCliente, getMeusPrecos, getRegiaoEntrega } from "@/lib/data/portal";
import { getMeuPedido } from "@/lib/data/pedido";
import { calcularProximaDataEntrega } from "@/lib/delivery/calcular-proxima-data-entrega";
import { confirmarPedidoSchema } from "@/lib/validation/pedido";

export async function getMeuPedidoAction(id: string) {
  return getMeuPedido(id);
}

type ConfirmarPedidoResult =
  | { success: true; pedidoId: string; dataEntregaPrevista: string }
  | { success: false; error: string };

// O núcleo de segurança do checkout: o input só carrega o que o cliente
// decidiu (quais produtos, quantas unidades, qual forma de pagamento) —
// preço, subtotal, total e data de entrega são todos recalculados aqui,
// a partir do estado atual do servidor, nunca aceitos do client. Leituras
// usam o client user-scoped (RLS já protege — mesmo padrão de sempre);
// só a escrita final (supabaseAdmin.rpc) precisa de service role, porque
// é o único ponto que a RLS não consegue mais ajudar (ver migration 022).
export async function confirmarPedido(input: unknown): Promise<ConfirmarPedidoResult> {
  const data = confirmarPedidoSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sessão expirada. Faça login novamente." };

  const cliente = await getMinhaCliente();
  if (!cliente) {
    return { success: false, error: "Cadastro de cliente não encontrado." };
  }
  if (!cliente.grupoPrecoId) {
    return { success: false, error: "Seu cadastro ainda não tem uma tabela de preços associada." };
  }
  if (!cliente.regiaoEntregaId) {
    return { success: false, error: "Seu cadastro ainda não tem uma região de entrega associada." };
  }

  // Nunca confia na forma de pagamento escolhida na tela sem reconferir
  // — um client malicioso podia mandar "boleto" mesmo sem ter liberado.
  if (data.metodoPagamento === "boleto") {
    if (!cliente.boletoLiberado) {
      return { success: false, error: "Boleto não está liberado para o seu cadastro." };
    }
    const prazosValidos = cliente.boletoPrazosDias ?? [];
    if (!data.prazoDiasEscolhido || !prazosValidos.includes(data.prazoDiasEscolhido)) {
      return { success: false, error: "Prazo de boleto inválido para o seu cadastro." };
    }
  }

  // Repreça cada item agora — nunca usa nenhum preço vindo do carrinho.
  const precos = await getMeusPrecos(cliente.id, cliente.grupoPrecoId);
  const produtoIds = data.itens.map((i) => i.produtoId);
  const { data: produtos, error: produtosError } = await supabase
    .from("products")
    .select("id, name, available")
    .in("id", produtoIds);
  if (produtosError) throw produtosError;

  const produtoPorId = new Map((produtos ?? []).map((p) => [p.id, p]));
  const itensParaGravar: {
    produto_id: string;
    produto_nome: string;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
  }[] = [];

  for (const item of data.itens) {
    const produto = produtoPorId.get(item.produtoId);
    if (!produto || !produto.available) {
      return { success: false, error: `Um dos produtos do carrinho não está mais disponível.` };
    }
    const valor = precos.get(item.produtoId);
    if (valor === undefined) {
      return {
        success: false,
        error: `"${produto.name}" ainda não tem preço definido para o seu cadastro — remova este item para continuar.`,
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

  // Data de entrega recalculada aqui — a que apareceu na tela de
  // checkout era só uma prévia, pode ter ficado desatualizada entre
  // abrir a tela e confirmar.
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
    p_metodo_pagamento: data.metodoPagamento,
    p_prazo_dias_escolhido:
      data.metodoPagamento === "boleto" ? (data.prazoDiasEscolhido ?? null) : null,
    p_data_entrega_prevista: dataEntregaPrevista,
    p_itens: itensParaGravar,
  });
  if (rpcError) throw rpcError;

  return { success: true, pedidoId: pedidoId as string, dataEntregaPrevista };
}
