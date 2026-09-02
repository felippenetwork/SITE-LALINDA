import { z } from "zod";

export const grupoPrecoSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1, "Informe o nome do grupo"),
  descricao: z.string().optional().nullable(),
});

export type GrupoPrecoInput = z.input<typeof grupoPrecoSchema>;
export type GrupoPrecoValues = z.infer<typeof grupoPrecoSchema>;

// null = célula vazia/limpa — quem chama interpreta como "apagar o preço",
// nunca como zero.
const valorSchema = z
  .number()
  .positive("O valor precisa ser maior que zero")
  .refine((v) => Number.isInteger(Math.round(v * 100)), "Use no máximo 2 casas decimais")
  .nullable();

export const precoSchema = z.object({
  produto_id: z.string().uuid(),
  grupo_preco_id: z.string().uuid(),
  valor: valorSchema,
});

export type PrecoValues = z.infer<typeof precoSchema>;

export const precoExcecaoSchema = z.object({
  cliente_id: z.string().uuid(),
  produto_id: z.string().uuid(),
  valor: valorSchema,
});

export type PrecoExcecaoValues = z.infer<typeof precoExcecaoSchema>;
