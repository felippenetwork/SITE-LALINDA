-- Sprint 4 — regiões de entrega e pedidos. Schema só (sem tela ainda).
--
-- Decisões de regra de negócio (skill regras-de-negocio, entrevista
-- estruturada em 2026-09-05):
-- 1. Corte de horário: se HOJE já é dia de entrega da região e o pedido
--    é feito antes do horario_corte, HOJE conta como data de entrega
--    válida (não força pular pro próximo dia). Lógica em
--    lib/, ver calcularProximaDataEntrega — testada contra 2 casos do
--    enunciado + edge cases antes de escrever este arquivo.
-- 2. status='cancelado' e deleted_at são dois conceitos INDEPENDENTES.
--    Cancelamento de pedido (fluxo normal, futuro) seta só
--    status='cancelado' — o pedido continua visível pro cliente, com
--    badge. deleted_at fica reservado só para remoção administrativa
--    por erro/duplicidade, nunca acionado pelo cancelamento comum.
--
-- Decisão de arquitetura (não é regra de negócio, é segurança): ao
-- contrário de clientes/completar-cadastro, pedidos/pedido_itens NÃO
-- ganham policy de INSERT para authenticated. valor_total e
-- preco_unitario dependem do estado de outras tabelas (precos/
-- precos_excecao) no momento da compra — isso não é expressável como
-- CHECK/RLS estático (CHECK não permite subquery, RLS não recalcula
-- preço). A criação do pedido (próxima tarefa) roda via Server Action
-- com supabaseAdmin, recalculando cada preço a partir das tabelas de
-- preço no momento exato da compra — nunca confia em valor vindo do
-- carrinho do cliente. GRANT de insert/update/delete pra `authenticated`
-- fica de fora de propósito, camada extra além da RLS.

-- ============================================================
-- 1. regioes_entrega
-- ============================================================

create table public.regioes_entrega (
  id uuid primary key default gen_random_uuid(),
  nome text not null,

  -- ISO 1=segunda..7=domingo — mesma convenção de EXTRACT(isodow FROM ...)
  -- do Postgres, elimina risco de off-by-one entre banco e a função de
  -- cálculo de data em TypeScript (que usa a mesma numeração).
  dias_semana_entrega smallint[] not null,

  horario_corte time not null,
  ativa boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint regioes_entrega_dias_nao_vazio check (cardinality(dias_semana_entrega) > 0),
  constraint regioes_entrega_dias_validos check (
    1 <= all(dias_semana_entrega) and 7 >= all(dias_semana_entrega)
  )
);

alter table public.regioes_entrega enable row level security;

grant select on public.regioes_entrega to authenticated;
grant insert, update, delete on public.regioes_entrega to authenticated;
grant all on public.regioes_entrega to service_role;

-- Não é dado sensível (ao contrário de preço) — qualquer autenticado lê.
create policy "Autenticados leem regioes de entrega"
on public.regioes_entrega
for select
to authenticated
using (true);

-- Logística operacional, não preço — admin e operador gerenciam.
create policy "Admin e operador gerenciam regioes de entrega"
on public.regioes_entrega
for all
to authenticated
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador'))
with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador'));

-- ============================================================
-- 2. clientes.regiao_entrega_id
-- ============================================================

alter table public.clientes add column regiao_entrega_id uuid references public.regioes_entrega(id);
create index idx_clientes_regiao_entrega_id on public.clientes(regiao_entrega_id);

-- ============================================================
-- 3. pedidos
-- ============================================================

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id),

  status text not null default 'recebido'
    check (status in ('recebido', 'aprovado', 'em_producao', 'em_rota', 'entregue', 'cancelado')),

  metodo_pagamento text not null check (metodo_pagamento in ('pix', 'cartao', 'boleto')),

  -- Só relevante (e só permitido) quando metodo_pagamento='boleto'.
  prazo_dias_escolhido integer,

  -- Preparado para a integração Efí Bank (ainda não existe) — todo
  -- pedido nasce 'pendente', nada atualiza esta coluna por ora.
  status_pagamento text not null default 'pendente'
    check (status_pagamento in ('pendente', 'confirmado', 'recusado')),

  -- Calculada uma vez, na criação do pedido (região + horario_corte do
  -- cliente naquele momento) — snapshot, nunca recalculada depois.
  data_entrega_prevista date not null,

  -- Snapshot da soma dos itens no momento da compra — nunca uma soma
  -- dinâmica recalculada a partir de pedido_itens depois.
  valor_total numeric(10,2) not null check (valor_total >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Reservado para remoção administrativa por erro/duplicidade — nunca
  -- acionado pelo cancelamento normal de pedido (esse usa só status
  -- acima). Pedido nunca é hard-deletado (DELETE físico).
  deleted_at timestamptz,

  constraint pedidos_prazo_so_com_boleto check (
    (metodo_pagamento = 'boleto') = (prazo_dias_escolhido is not null)
  ),
  constraint pedidos_prazo_positivo check (prazo_dias_escolhido is null or prazo_dias_escolhido > 0)
);

create index idx_pedidos_cliente_id on public.pedidos(cliente_id);
create index idx_pedidos_status on public.pedidos(status);

alter table public.pedidos enable row level security;

-- Sem grant de insert/update/delete pra authenticated — ver nota de
-- arquitetura no topo do arquivo.
grant select on public.pedidos to authenticated;
grant all on public.pedidos to service_role;

create policy "Admin e operador gerenciam pedidos"
on public.pedidos
for all
to authenticated
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador'))
with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador'));

create policy "Cliente le os proprios pedidos"
on public.pedidos
for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1 from public.clientes
    where clientes.id = pedidos.cliente_id
      and clientes.user_id = auth.uid()
  )
);

-- Mesmo padrão de log_precos_changes/tr_log_precos_changes (migration
-- 019): trigger de banco, loga automaticamente INSERT/UPDATE/DELETE em
-- audit_logs com before/after em JSON. Mudança de status de pedido é
-- exatamente o tipo de coisa que vale rastro de quem/quando.
create or replace function public.log_pedidos_changes()
returns trigger
language plpgsql
security definer
as $$
begin
    insert into public.audit_logs (user_id, action, target_table, target_id, details)
    values (
        auth.uid(),
        tg_op,
        'pedidos',
        case when tg_op = 'DELETE' then old.id else new.id end,
        case
            when tg_op = 'INSERT' then jsonb_build_object('new', to_jsonb(new))
            when tg_op = 'UPDATE' then jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
            else jsonb_build_object('old', to_jsonb(old))
        end
    );
    return null;
end;
$$;

create trigger tr_log_pedidos_changes
after insert or update or delete on public.pedidos
for each row
execute function public.log_pedidos_changes();

-- ============================================================
-- 4. pedido_itens
-- ============================================================

create table public.pedido_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id),
  produto_id uuid not null references public.products(id),

  -- Snapshot do nome do produto no momento do pedido — mesmo raciocínio
  -- de preco_unitario abaixo: renomear ou excluir o produto depois não
  -- pode mudar a aparência de um pedido antigo.
  produto_nome text not null,

  quantidade integer not null check (quantidade > 0),

  -- Snapshot do preço resolvido (grupo + exceção) no momento do pedido
  -- — nunca referencia precos/precos_excecao depois. Se o preço mudar
  -- amanhã, pedidos antigos mantêm o valor de quando foram feitos.
  preco_unitario numeric(10,2) not null check (preco_unitario >= 0),
  subtotal numeric(10,2) not null check (subtotal >= 0),

  created_at timestamptz not null default now(),

  constraint pedido_itens_subtotal_consistente check (subtotal = preco_unitario * quantidade)
);

create index idx_pedido_itens_pedido_id on public.pedido_itens(pedido_id);
create index idx_pedido_itens_produto_id on public.pedido_itens(produto_id);

alter table public.pedido_itens enable row level security;

grant select on public.pedido_itens to authenticated;
grant all on public.pedido_itens to service_role;

create policy "Admin e operador gerenciam itens de pedido"
on public.pedido_itens
for all
to authenticated
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador'))
with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador'));

create policy "Cliente le os proprios itens de pedido"
on public.pedido_itens
for select
to authenticated
using (
  exists (
    select 1 from public.pedidos
    join public.clientes on clientes.id = pedidos.cliente_id
    where pedidos.id = pedido_itens.pedido_id
      and clientes.user_id = auth.uid()
      and pedidos.deleted_at is null
  )
);
