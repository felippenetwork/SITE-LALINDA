import { z } from "zod";
import { tipoDocumentoSchema, validateDocumento } from "@/lib/validation/cliente";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

// Formulário de autocadastro do cliente (portal) — bem menor que
// lib/validation/cliente.ts (uso admin). Sem email (vem de
// auth.getUser() no server, nunca redigitado aqui) e sem nenhum campo
// admin-only (grupo_preco_id, boleto_*, status, origem_lead_id) — o
// cliente não vê nem envia nada disso.
export const completarCadastroSchema = z
  .object({
    tipo_documento: tipoDocumentoSchema,
    documento: z.string().min(1, "Informe o CPF/CNPJ").transform(digitsOnly),

    razao_social: z.string().min(1, "Informe o nome"),
    inscricao_estadual: z.string().optional().nullable(),
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

export type CompletarCadastroInput = z.input<typeof completarCadastroSchema>;
export type CompletarCadastroValues = z.infer<typeof completarCadastroSchema>;
