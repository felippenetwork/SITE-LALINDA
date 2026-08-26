import { z } from "zod";

export const createAdminSchema = z.object({
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  password: z.string().min(8, "Mínimo de 8 caracteres"),
});

export type CreateAdminValues = z.infer<typeof createAdminSchema>;
