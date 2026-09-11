import { z } from "zod";

// Client Secret e senha do certificado ficam vazios por padrão (nunca
// pré-preenchidos com o valor salvo, write-only) — string vazia aqui
// significa "não mudar", tratado explicitamente na Server Action, não
// neste schema (zod só valida forma, não essa semântica de negócio).
export const integracaoBradescoPixSchema = z.object({
  ativa: z.boolean(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  certificadoSenha: z.string().optional(),
});

export type IntegracaoBradescoPixValues = z.infer<typeof integracaoBradescoPixSchema>;
