import { z } from "zod";

export const periodoSchema = z
  .object({
    inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inicial inválida"),
    fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data final inválida"),
  })
  .refine((data) => data.inicio <= data.fim, {
    message: "Data inicial não pode ser depois da data final",
    path: ["inicio"],
  });

export type PeriodoInput = z.infer<typeof periodoSchema>;
