import { z } from "zod";

export const productLineSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Informe o nome da linha"),
  slug: z
    .string()
    .min(1, "Informe o slug")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens"),
  description: z.string().optional().nullable(),
  image_url: z
    .string()
    .url("Informe uma URL de imagem válida")
    .or(z.literal(""))
    .optional()
    .nullable(),
});

export type ProductLineInput = z.input<typeof productLineSchema>;
export type ProductLineValues = z.infer<typeof productLineSchema>;
