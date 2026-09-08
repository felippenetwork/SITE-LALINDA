import { z } from "zod";
import { tipoDocumentoSchema, validateDocumento } from "@/lib/validation/cliente";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

// Cadastro rápido do vendedor (área /vendas) — mesmo formato de campos de
// lib/validation/completar-cadastro.ts (endereço + documento), mas com
// email (o vendedor digita, não tem auth.getUser() pra herdar como no
// autocadastro) e sem nenhum campo admin-only (grupo_preco_id, boleto_*,
// status) — o vendedor não define nada disso, a policy "Vendedor cria
// cliente avulso" (migration 025) nem deixaria.
export const criarClienteAvulsoSchema = z
  .object({
    tipo_documento: tipoDocumentoSchema,
    documento: z.string().min(1, "Informe o CPF/CNPJ").transform(digitsOnly),

    razao_social: z.string().min(1, "Informe o nome"),
    inscricao_estadual: z.string().optional().nullable(),
    email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
    contato_nome: z.string().min(1, "Informe o nome do contato"),
    telefone: z.string().min(1, "Informe o telefone"),

    logradouro: z.string().min(1, "Informe o logradouro"),
    numero: z.string().optional().nullable(),
    bairro: z.string().optional().nullable(),
    cidade: z.string().min(1, "Informe a cidade"),
    uf: z
      .string()
      .min(1, "Informe a UF")
      .transform((v) => v.toUpperCase())
      .refine((v) => /^[A-Z]{2}$/.test(v), "UF precisa ter 2 letras"),
    cep: z
      .string()
      .min(1, "Informe o CEP")
      .transform(digitsOnly)
      .refine((v) => /^\d{8}$/.test(v), "CEP precisa ter 8 dígitos"),
  })
  .superRefine((data, ctx) => {
    const error = validateDocumento(data.tipo_documento, data.documento);
    if (error) {
      ctx.addIssue({ code: "custom", path: ["documento"], message: error });
    }
  });

export type CriarClienteAvulsoInput = z.input<typeof criarClienteAvulsoSchema>;
export type CriarClienteAvulsoValues = z.infer<typeof criarClienteAvulsoSchema>;

// Rascunho: mesmo formato de item que o carrinho (produtoId + quantidade,
// nunca preço) — o preço só é calculado quando o admin converte o
// rascunho em pedido de verdade (confirmarRascunhoAction).
export const criarRascunhoSchema = z.object({
  clienteId: z.string().uuid(),
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

export type CriarRascunhoInput = z.infer<typeof criarRascunhoSchema>;
