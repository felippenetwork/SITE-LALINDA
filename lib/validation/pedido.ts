import { z } from "zod";

// Só o que o cliente decidiu — nunca preço, subtotal, total ou data de
// entrega. A Server Action recalcula tudo isso a partir do estado atual
// do servidor; o formato de entrada nem aceita esses campos, então não
// tem como "esquecer" de revalidar um valor vindo do client.
//
// clienteId é opcional e só tem efeito quando quem chama tem papel
// vendedor/admin/operador (checado em lib/actions/pedido.ts, nunca
// confiando neste campo sozinho) — usado pela área /vendas pra criar
// pedido em nome de um cliente já aprovado. Um cliente comum nunca tem
// esses papéis, então mandar este campo não muda nada pra ele.
export const confirmarPedidoSchema = z.object({
  clienteId: z.string().uuid().optional(),
  itens: z
    .array(
      z.object({
        produtoId: z.string().uuid(),
        quantidade: z.number().int().positive(),
      }),
    )
    .min(1, "O carrinho está vazio"),
  metodoPagamento: z.enum(["pix", "boleto"]),
  prazoDiasEscolhido: z.number().int().positive().optional().nullable(),
});

export type ConfirmarPedidoInput = z.infer<typeof confirmarPedidoSchema>;
