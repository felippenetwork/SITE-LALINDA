"use server";

import { createClient } from "@/lib/supabase/server";
import { getMinhaCliente, getMeusPrecos } from "@/lib/data/portal";
import { getClienteParaVendedor, getPrecosParaVendedor } from "@/lib/data/vendas";
import { getMeuPedido } from "@/lib/data/pedido";
import {
  montarESalvarPedido,
  type ClienteParaPedido,
  type ConfirmarPedidoResult,
} from "@/lib/pedido/montar-e-salvar-pedido";
import { confirmarPedidoSchema } from "@/lib/validation/pedido";

export async function getMeuPedidoAction(id: string) {
  return getMeuPedido(id);
}

// O núcleo de segurança do checkout: o input só carrega o que foi
// decidido na tela (quais produtos, quantas unidades, qual forma de
// pagamento, e — só pra vendedor/admin/operador — em nome de qual
// cliente) — preço, subtotal, total e data de entrega são todos
// recalculados aqui, a partir do estado atual do servidor, nunca aceitos
// do client.
export async function confirmarPedido(input: unknown): Promise<ConfirmarPedidoResult> {
  const data = confirmarPedidoSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sessão expirada. Faça login novamente." };

  let cliente: ClienteParaPedido;
  let precos: Map<string, number>;

  if (data.clienteId) {
    // clienteId só tem efeito pra vendedor/admin/operador — checado aqui,
    // no servidor, nunca confiando no papel que o formulário alega. Um
    // cliente comum nunca tem nenhum destes papéis, então mandar este
    // campo simplesmente não muda nada pra ele (cai no "Forbidden" abaixo).
    const [{ data: isVendedor }, { data: isAdmin }, { data: isOperador }] = await Promise.all([
      supabase.rpc("has_role", { _user_id: user.id, _role: "vendedor" }),
      supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: user.id, _role: "operador" }),
    ]);
    if (!isVendedor && !isAdmin && !isOperador) {
      return { success: false, error: "Sem permissão para criar pedido em nome de outro cliente." };
    }

    const clienteVendedor = await getClienteParaVendedor(data.clienteId);
    if (!clienteVendedor) return { success: false, error: "Cliente não encontrado." };

    cliente = {
      id: clienteVendedor.id,
      grupoPrecoId: clienteVendedor.grupoPrecoId,
      regiaoEntregaId: clienteVendedor.regiaoEntregaId,
      boletoLiberado: clienteVendedor.boletoLiberado,
      boletoPrazosDias: clienteVendedor.boletoPrazosDias,
    };
    precos = clienteVendedor.grupoPrecoId
      ? await getPrecosParaVendedor(clienteVendedor.id, clienteVendedor.grupoPrecoId)
      : new Map();
  } else {
    const minhaCliente = await getMinhaCliente();
    if (!minhaCliente) return { success: false, error: "Cadastro de cliente não encontrado." };

    cliente = minhaCliente;
    precos = minhaCliente.grupoPrecoId
      ? await getMeusPrecos(minhaCliente.id, minhaCliente.grupoPrecoId)
      : new Map();
  }

  const produtoIds = data.itens.map((i) => i.produtoId);
  const { data: produtos, error: produtosError } = await supabase
    .from("products")
    .select("id, name, available")
    .in("id", produtoIds);
  if (produtosError) throw produtosError;

  return montarESalvarPedido({
    cliente,
    itens: data.itens,
    metodoPagamento: data.metodoPagamento,
    prazoDiasEscolhido: data.prazoDiasEscolhido,
    precos,
    produtos: produtos ?? [],
  });
}
