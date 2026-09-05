import "server-only";
import { createClient } from "@/lib/supabase/server";

export type PortalDestination =
  | "/portal/cadastro"
  | "/admin"
  | "/portal/completar-cadastro"
  | "/portal/aguardando-aprovacao"
  | "/portal/catalogo";

// Única fonte de verdade de "pra onde esse usuário deveria estar olhando
// agora" — cada página de /portal chama isso e só redireciona se o
// destino calculado for diferente da própria rota (evita loop de
// redirect que um layout único, sempre-redireciona, correria risco de
// causar).
export async function getPortalDestination(): Promise<PortalDestination> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/portal/cadastro";

  const [{ data: isAdmin }, { data: isOperador }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: user.id, _role: "operador" }),
  ]);
  if (isAdmin || isOperador) return "/admin";

  // RLS-protegido: só enxerga a própria linha ("Cliente le a propria
  // linha", migration 017).
  const { data: cliente } = await supabase
    .from("clientes")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cliente) return "/portal/completar-cadastro";
  if (cliente.status === "aprovado") return "/portal/catalogo";
  return "/portal/aguardando-aprovacao"; // pendente_aprovacao ou suspenso
}

// Usado só pela tela de aguardando-aprovacao pra escolher a mensagem
// certa (pendente vs suspenso) — getPortalDestination() já garante que só
// se chega aqui com uma linha existente e não aprovada.
export async function getMinhaClienteStatus(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("clientes")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.status ?? null;
}

export interface MinhaCliente {
  id: string;
  grupoPrecoId: string | null;
  regiaoEntregaId: string | null;
  boletoLiberado: boolean;
  boletoPrazosDias: number[] | null;
}

// Usado pelo catálogo (resolver preço) e pelo checkout (resolver preço +
// forma de pagamento + região) — getPortalDestination() já garante que
// só se chega aqui aprovado.
export async function getMinhaCliente(): Promise<MinhaCliente | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("clientes")
    .select("id, grupo_preco_id, regiao_entrega_id, boleto_liberado, boleto_prazos_dias")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    grupoPrecoId: data.grupo_preco_id,
    regiaoEntregaId: data.regiao_entrega_id,
    boletoLiberado: data.boleto_liberado,
    boletoPrazosDias: data.boleto_prazos_dias,
  };
}

export interface RegiaoEntrega {
  id: string;
  nome: string;
  diasSemanaEntrega: number[];
  horarioCorte: string;
}

// Não é dado sensível ("Autenticados leem regioes de entrega", migration
// 021) — qualquer authenticated lê, RLS não precisa restringir por dono.
export async function getRegiaoEntrega(id: string): Promise<RegiaoEntrega | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("regioes_entrega")
    .select("id, nome, dias_semana_entrega, horario_corte")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    nome: data.nome,
    diasSemanaEntrega: data.dias_semana_entrega,
    horarioCorte: data.horario_corte,
  };
}

// Preço resolvido pro cliente logado: precos_excecao (se existir pro
// produto) sobrescreve precos do grupo, senão usa o preço do grupo. Roda
// no client user-scoped (RLS) — nunca service role — porque a policy
// "Cliente le precos do proprio grupo"/"Cliente le a propria excecao"
// (migration 017) é o que garante, no próprio banco, que essa consulta
// nunca devolve preço de outro grupo ou de outro cliente. Os .eq()
// abaixo são defesa em profundidade sobre a RLS, não o mecanismo em si.
export async function getMeusPrecos(
  clienteId: string,
  grupoPrecoId: string | null,
): Promise<Map<string, number>> {
  const supabase = await createClient();

  const [{ data: precosGrupo }, { data: excecoes }] = await Promise.all([
    grupoPrecoId
      ? supabase.from("precos").select("produto_id, valor").eq("grupo_preco_id", grupoPrecoId)
      : Promise.resolve({ data: [] as { produto_id: string; valor: number }[] }),
    supabase.from("precos_excecao").select("produto_id, valor").eq("cliente_id", clienteId),
  ]);

  const precosPorProduto = new Map<string, number>();
  for (const p of precosGrupo ?? []) precosPorProduto.set(p.produto_id, p.valor);
  for (const e of excecoes ?? []) precosPorProduto.set(e.produto_id, e.valor);
  return precosPorProduto;
}
