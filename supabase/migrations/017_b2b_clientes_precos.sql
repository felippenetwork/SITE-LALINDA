-- Sprint 3 — schema do módulo B2B (clientes, grupos de preço, preços,
-- exceções). Primeira tabela do projeto com padrão "dono do registro"
-- (cliente vendo só os próprios dados) — RLS documentada linha a linha
-- porque vira o molde que pedidos/etc. vão copiar depois.
--
-- `clientes` nunca escreve em `leads` (imutável de propósito, ver
-- migration 006) — só referencia leads.id como origem opcional.
--
-- PENDÊNCIA DE CÓDIGO (não desta migration): app/admin/layout.tsx hoje
-- só verifica sessão, não has_role(admin/operador), antes de renderizar
-- a casca do admin. clientes.user_id abaixo é o que passa a tornar
-- possível uma conta autenticada sem papel nenhum existir de verdade —
-- esse gate precisa ser corrigido antes da primeira conta de cliente
-- ser criada (não bloqueia esta migration, que não cria contas).
--
-- Estrutura em duas passadas por causa de dependência circular:
-- clientes.grupo_preco_id referencia grupos_preco (FK), e a própria
-- policy de RLS de grupos_preco referencia clientes (pra checar o
-- grupo do cliente logado). Todas as tabelas são criadas primeiro,
-- sem nenhuma policy — só depois, com todo mundo já existindo, as
-- policies de RLS são adicionadas.

-- ============================================================
-- TABELAS (sem RLS/policy ainda)
-- ============================================================

create table public.grupos_preco (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  descricao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clientes (
  id uuid primary key default gen_random_uuid(),

  -- Vínculo de login: nulo até o cliente ganhar acesso ao portal
  -- (pode nunca ganhar, se sempre comprar por telefone/representante).
  user_id uuid references auth.users(id) on delete set null,

  -- Origem opcional — nunca escreve de volta em leads.
  origem_lead_id uuid references public.leads(id) on delete set null,

  razao_social text not null,
  cnpj text not null,
  inscricao_estadual text,
  email text not null,
  contato_nome text not null,
  telefone text not null,

  -- Endereço de entrega estruturado — regiões de entrega com horário
  -- de corte é escopo confirmado, não hipótese futura. numero/bairro
  -- nulos pra acomodar endereços rurais ("S/N") sem travar o cadastro.
  logradouro text not null,
  numero text,
  bairro text,
  cidade text not null,
  uf text not null check (char_length(uf) = 2),
  cep text not null check (cep ~ '^\d{8}$'),

  status text not null default 'pendente_aprovacao'
    check (status in ('pendente_aprovacao', 'aprovado', 'suspenso')),

  grupo_preco_id uuid references public.grupos_preco(id),

  aprovado_por uuid references auth.users(id),
  aprovado_em timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint clientes_cnpj_format check (cnpj ~ '^\d{14}$'),
  constraint clientes_cnpj_unique unique (cnpj),
  constraint clientes_aprovado_consistente
    check ((status = 'aprovado') = (aprovado_em is not null))
);

create table public.precos (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.products(id) on delete cascade,
  grupo_preco_id uuid not null references public.grupos_preco(id) on delete cascade,
  -- Preço por unidade de venda — cálculo de caixa é responsabilidade
  -- da camada de exibição, não armazenado aqui.
  valor numeric(10,2) not null check (valor >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (produto_id, grupo_preco_id)
);

create table public.precos_excecao (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  produto_id uuid not null references public.products(id) on delete cascade,
  valor numeric(10,2) not null check (valor >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cliente_id, produto_id)
);

-- Colunas novas em products — sem migrar dado existente. weight/
-- box_weight (texto) continuam existindo e em uso, sem backfill
-- nesta migration, conforme pedido.
alter table public.products add column weight_value numeric;
alter table public.products add column weight_unit text
  check (weight_unit in ('g', 'kg', 'un', 'ml', 'l'));

-- ============================================================
-- ÍNDICES
-- ============================================================

create index idx_clientes_user_id on public.clientes(user_id);
create index idx_clientes_grupo_preco_id on public.clientes(grupo_preco_id);
create index idx_clientes_origem_lead_id on public.clientes(origem_lead_id);
create index idx_clientes_status on public.clientes(status);
create index idx_precos_grupo_preco_id on public.precos(grupo_preco_id);
create index idx_precos_excecao_cliente_id on public.precos_excecao(cliente_id);

-- ============================================================
-- RLS — grupos_preco
-- ============================================================

alter table public.grupos_preco enable row level security;

grant select on public.grupos_preco to authenticated;
grant insert, update, delete on public.grupos_preco to authenticated;
grant all on public.grupos_preco to service_role;

-- Só admin gerencia — operador confirmadamente sem acesso a preço.
create policy "Admin gerencia grupos de preco"
on public.grupos_preco
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Cliente lê o nome/descrição só do próprio grupo, e só se aprovado.
create policy "Cliente le o proprio grupo de preco"
on public.grupos_preco
for select
to authenticated
using (
  exists (
    select 1 from public.clientes
    where clientes.user_id = auth.uid()
      and clientes.grupo_preco_id = grupos_preco.id
      and clientes.status = 'aprovado'
  )
);

-- ============================================================
-- RLS — clientes
-- ============================================================

alter table public.clientes enable row level security;

grant select on public.clientes to authenticated;
grant insert, update, delete on public.clientes to authenticated;
grant all on public.clientes to service_role;

-- admin/operador leem e escrevem tudo.
create policy "Admins e operadores gerenciam clientes"
on public.clientes
for all
to authenticated
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador'))
with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador'));

-- Cliente lê só a própria linha. Sem policy de UPDATE pro cliente —
-- read-only até o portal do cliente ser construído.
create policy "Cliente le a propria linha"
on public.clientes
for select
to authenticated
using (auth.uid() = user_id);

-- ============================================================
-- RLS — precos
-- ============================================================

alter table public.precos enable row level security;

grant select on public.precos to authenticated;
grant insert, update, delete on public.precos to authenticated;
grant all on public.precos to service_role;

create policy "Admin gerencia precos"
on public.precos
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Cliente le precos do proprio grupo"
on public.precos
for select
to authenticated
using (
  exists (
    select 1 from public.clientes
    where clientes.user_id = auth.uid()
      and clientes.grupo_preco_id = precos.grupo_preco_id
      and clientes.status = 'aprovado'
  )
);

-- ============================================================
-- RLS — precos_excecao
-- ============================================================

alter table public.precos_excecao enable row level security;

grant select on public.precos_excecao to authenticated;
grant insert, update, delete on public.precos_excecao to authenticated;
grant all on public.precos_excecao to service_role;

create policy "Admin gerencia excecoes de preco"
on public.precos_excecao
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Cliente le a propria excecao"
on public.precos_excecao
for select
to authenticated
using (
  exists (
    select 1 from public.clientes
    where clientes.id = precos_excecao.cliente_id
      and clientes.user_id = auth.uid()
      and clientes.status = 'aprovado'
  )
);
