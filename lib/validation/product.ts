import { z } from "zod";

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Informe o nome do produto"),
  weight: z.string().min(1, "Informe o peso unitário"),
  boxWeight: z.string().optional().nullable(),
  image_url: z.string().url("Informe uma URL de imagem válida"),
  category: z.enum(["Tradicionais", "Linha Extra", "Linha Premium", "Confeitaria", "Salgados"]),
  description: z.string().optional().nullable(),
  available: z.boolean().default(true),
});

// Input: what the form fields hold before Zod applies `.default()` (`available` optional).
// Output: what `handleSubmit` hands to `onSubmit` after defaults are applied (`available` required).
export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
