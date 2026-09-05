import { z } from "zod";

// Mod-11 CNPJ check-digit algorithm — rejects well-formed-but-fake numbers
// (e.g. 11111111111111) that a plain digit-count check would accept.
function isValidCnpjChecksum(digits: string): boolean {
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calcDigit = (base: string, weights: number[]) => {
    const sum = base.split("").reduce((acc, digit, i) => acc + Number(digit) * weights[i]!, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const first12 = digits.slice(0, 12);
  const d13 = calcDigit(first12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d14 = calcDigit(first12 + String(d13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return digits === first12 + String(d13) + String(d14);
}

// Mod-11 CPF check-digit algorithm, mesmo rigor do CNPJ acima — testado
// contra CPFs válidos (529.982.247-25, 111.444.777-35) e inválidos
// conhecidos (dígito repetido, dígito verificador errado) antes de usar.
function isValidCpfChecksum(digits: string): boolean {
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calcDigit = (base: string, factorStart: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) sum += Number(base[i]) * (factorStart - i);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const first9 = digits.slice(0, 9);
  const d10 = calcDigit(first9, 10);
  const d11 = calcDigit(first9 + String(d10), 11);
  return digits === first9 + String(d10) + String(d11);
}

const digitsOnly = (value: string) => value.replace(/\D/g, "");

export const tipoDocumentoSchema = z.enum(["cpf", "cnpj"]);
export type TipoDocumento = z.infer<typeof tipoDocumentoSchema>;

// Compartilhado entre o schema admin (abaixo) e
// lib/validation/completar-cadastro.ts — zod não deixa compor um schema
// com .transform() dentro de outro objeto facilmente, então a validação
// em si vira uma função pura reaproveitada nos dois lugares via
// superRefine, em vez de duplicar a lógica.
export function validateDocumento(tipo: TipoDocumento, digits: string): string | null {
  if (tipo === "cpf") {
    if (digits.length !== 11) return "CPF precisa ter 11 dígitos";
    if (!isValidCpfChecksum(digits)) return "CPF inválido";
  } else {
    if (digits.length !== 14) return "CNPJ precisa ter 14 dígitos";
    if (!isValidCnpjChecksum(digits)) return "CNPJ inválido";
  }
  return null;
}

export const boletoPrazoDiasSchema = z
  .number({ message: "Informe um número de dias" })
  .int("Use um número inteiro de dias")
  .positive("O prazo precisa ser maior que zero");

// status/aprovado_por/aprovado_em are never set through this schema — a
// cliente is always created as 'pendente_aprovacao' server-side, and only
// the separate approve/suspend actions ever change status.
export const clienteSchema = z
  .object({
    id: z.string().uuid().optional(),
    origem_lead_id: z.string().uuid().optional().nullable(),

    razao_social: z.string().min(1, "Informe a razão social"),

    tipo_documento: tipoDocumentoSchema,
    documento: z.string().min(1, "Informe o CPF/CNPJ").transform(digitsOnly),

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

    grupo_preco_id: z.string().uuid().optional().nullable(),

    boleto_liberado: z.boolean().default(false),
    boleto_prazos_dias: z.array(boletoPrazoDiasSchema).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const error = validateDocumento(data.tipo_documento, data.documento);
    if (error) {
      ctx.addIssue({ code: "custom", path: ["documento"], message: error });
    }
  });

export type ClienteInput = z.input<typeof clienteSchema>;
export type ClienteValues = z.infer<typeof clienteSchema>;
