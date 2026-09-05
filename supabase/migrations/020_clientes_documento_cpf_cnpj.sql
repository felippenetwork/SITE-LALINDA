-- Sprint 4 — autocadastro do cliente (portal). Duas mudanças de schema:
-- 1. cnpj -> documento + tipo_documento ('cpf' | 'cnpj'), pra aceitar
--    pessoa física também. Backfill lossless: tudo que já existe vira
--    tipo_documento='cnpj' (0 linhas em produção no momento desta
--    migration, mas escrita pra não perder dado se isso mudar).
-- 2. RLS de INSERT pro próprio cliente criar sua linha em
--    completar-cadastro — hoje só admin/operador podem inserir.

-- ============================================================
-- 1. documento / tipo_documento
-- ============================================================

alter table public.clientes add column tipo_documento text;
alter table public.clientes add column documento text;

update public.clientes set tipo_documento = 'cnpj', documento = cnpj;

alter table public.clientes alter column tipo_documento set not null;
alter table public.clientes alter column documento set not null;

alter table public.clientes add constraint clientes_tipo_documento_check
  check (tipo_documento in ('cpf', 'cnpj'));

alter table public.clientes add constraint clientes_documento_format check (
  (tipo_documento = 'cpf' and documento ~ '^\d{11}$') or
  (tipo_documento = 'cnpj' and documento ~ '^\d{14}$')
);

alter table public.clientes add constraint clientes_documento_unique unique (documento);

alter table public.clientes drop constraint clientes_cnpj_format;
alter table public.clientes drop constraint clientes_cnpj_unique;
alter table public.clientes drop column cnpj;

-- ============================================================
-- 2. user_id único — sem isso, reenviar completar-cadastro (duplo
-- clique, retry) cria duas linhas pro mesmo usuário. NULL continua
-- permitindo várias linhas avulsas sem user_id (semântica padrão do
-- Postgres pra unique + NULL).
-- ============================================================

alter table public.clientes add constraint clientes_user_id_unique unique (user_id);

-- ============================================================
-- 3. RLS — autocadastro
-- ============================================================

-- Trancada na forma exata "linha pendente e inofensiva": nunca deixa o
-- próprio cliente se autoaprovar, se atribuir grupo de preço ou liberar
-- boleto na hora de criar a conta. Esse WITH CHECK é o único mecanismo
-- que impede um usuário comum de inserir uma linha já aprovada em si
-- mesmo — testado deliberadamente tentando burlar antes de aplicar.
create policy "Cliente cria a propria linha"
on public.clientes
for insert
to authenticated
with check (
  auth.uid() = user_id
  and status = 'pendente_aprovacao'
  and grupo_preco_id is null
  and aprovado_por is null
  and aprovado_em is null
  and boleto_liberado = false
  and boleto_prazos_dias is null
);
