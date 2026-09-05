"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { completarCadastroSchema } from "@/lib/validation/completar-cadastro";

// Roda no contexto do próprio usuário autenticado — sem service role. Quem
// autoriza esse INSERT é a policy de RLS "Cliente cria a propria linha"
// (migration 020), não este código; o schema/validação aqui é só a
// primeira camada (UX), não a de segurança.
export async function completarCadastro(
  input: unknown,
): Promise<{ success: true } | { success: false; error: string }> {
  const data = completarCadastroSchema.parse(input);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sessão expirada. Faça login novamente." };

  const { error } = await supabase.from("clientes").insert({
    user_id: user.id,
    email: user.email ?? "",
    razao_social: data.razao_social,
    tipo_documento: data.tipo_documento,
    documento: data.documento,
    inscricao_estadual: data.inscricao_estadual || null,
    contato_nome: data.contato_nome,
    telefone: data.telefone,
    logradouro: data.logradouro,
    numero: data.numero || null,
    bairro: data.bairro || null,
    cidade: data.cidade,
    uf: data.uf,
    cep: data.cep,
    // status/grupo_preco_id/aprovado_*/boleto_* nunca vêm daqui — a
    // policy de RLS já trava esses valores no formato "pendente e
    // inofensivo", isso aqui só documenta a intenção no código.
  });

  if (error) {
    if (error.code === "23505") {
      if (error.message.includes("clientes_user_id_unique")) {
        return { success: false, error: "Você já completou seu cadastro." };
      }
      return {
        success: false,
        error:
          "Este CPF/CNPJ já está cadastrado. Se você acredita que isso é um erro, entre em contato com o suporte.",
      };
    }
    throw error;
  }

  revalidatePath("/portal");
  return { success: true };
}
