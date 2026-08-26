import { z } from "zod";

export const pixelSettingsSchema = z.object({
  gtmId: z
    .string()
    .regex(/^GTM-[A-Z0-9]+$/, "Formato inválido — deve ser algo como GTM-XXXXXXX")
    .or(z.literal(""))
    .optional(),
  metaPixelId: z
    .string()
    .regex(/^\d{10,20}$/, "Formato inválido — deve conter só números")
    .or(z.literal(""))
    .optional(),
});

export type PixelSettingsValues = z.infer<typeof pixelSettingsSchema>;
