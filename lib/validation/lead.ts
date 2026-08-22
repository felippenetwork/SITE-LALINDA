import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(1, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional().or(z.literal("")),
  interest: z.string().optional().or(z.literal("")),
  message: z.string().min(1, "Escreva uma mensagem"),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
