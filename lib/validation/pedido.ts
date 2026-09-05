import { z } from "zod";

// Só o que o cliente decidiu — nunca preço, subtotal, total ou data de
// entrega. A Server Action recalcula tudo isso a partir do estado atual
// do servidor; o formato de entrada nem aceita esses campos, então não
// tem como "esquecer" de revalidar um valor vindo do client.
export const confirmarPedidoSchema = z.object({
  itens: z
    .array(
      z.object({
        produtoId: z.string().uuid(),
        quantidade: z.number().int().positive(),
      }),
    )
    .min(1, "O carrinho está vazio"),
  metodoPagamento: z.enum(["pix", "cartao", "boleto"]),
  prazoDiasEscolhido: z.number().int().positive().optional().nullable(),
});

export type ConfirmarPedidoInput = z.infer<typeof confirmarPedidoSchema>;
