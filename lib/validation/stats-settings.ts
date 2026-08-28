import { z } from "zod";

const homeStatSchema = z.object({
  value: z.coerce.number().int("Use um número inteiro").positive("Use um número maior que zero"),
  label: z.string().min(1, "Informe um rótulo"),
});

export const statsSettingsSchema = z.object({
  stats: z.tuple([homeStatSchema, homeStatSchema, homeStatSchema]),
});

export type StatsSettingsValues = z.infer<typeof statsSettingsSchema>;
