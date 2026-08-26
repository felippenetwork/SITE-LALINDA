import { z } from "zod";

export const siteSettingsSchema = z.object({
  contactEmail: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  contactPhone: z.string().min(8, "Informe um telefone válido"),
  instagramUrl: z.string().url("Informe uma URL válida").or(z.literal("")).optional(),
  facebookUrl: z.string().url("Informe uma URL válida").or(z.literal("")).optional(),
});

export type SiteSettingsValues = z.infer<typeof siteSettingsSchema>;
