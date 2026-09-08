-- Sprint 4 — vendedor externo (parte 2/2). Só pode rodar depois da
-- migration 024 (add value 'vendedor') estar confirmada aplicada.
--
-- Decisões já fechadas com o dono do projeto (não reabrir):
-- 1. Vendedor cria cliente avulso (mesmo shape do autocadastro do
--    portal) e lança pedido em nome de qualquer cliente, sem carteira
--    restrita — mesmo espírito da ausência de carteira já decidida
--    pra clientes em geral.
-- 2. Cliente sem grupo_preco_id ainda: pedido fica em rascunho
--    (pedidos_rascunho/pedido_rascunho_itens, tabela própria, sem
--    nenhuma coluna de preço) até o admin aprovar o cliente e
--    confirmar manualmente — nunca conversão automática.
-- 3. Rascunho é visível/gerenciável por qualquer vendedor (não só
--    quem criou) — mesma lógica de "sem carteira restrita" aplicada
--    aqui por analogia, confirmada explicitamente pro caso de
--    rascunho também.
-- 4. Vendedor NÃO ganha leitura de precos/precos_excecao via RLS —
--    isso exporia a tabela inteira pra sessão dele no navegador. O
--    preço que o vendedor vê ao montar um pedido vem de uma Server
--    Action com supabaseAdmin + checagem inline de has_role('vendedor'),
--    igual a qualquer leitura admin-gated do projeto (lib/data/vendas.ts,
--    fora desta migration) — nenhuma policy nova em precos/precos_excecao
--    é necessária nem desejada.

-- ============================================================
-- 1. Fix: gap encontrado revisando esta tarefa — regiao_entrega_id
--    (migration 021) nunca foi travado na policy de autocadastro
--    (migration 020, escrita ANTES da coluna existir). Sem isso, uma
--    inserção direta na API (fora do fluxo normal do app) permitiria
--    o próprio cliente se autoatribuir uma região de entrega.
-- ============================================================

alter policy "Cliente cria a propria linha"
on public.clientes
with check (
  auth.uid() = user_id
  and status = 'pendente_aprovacao'
  and grupo_preco_id is null
  and regiao_entrega_id is null
  and aprovado_por is null
  and aprovado_em is null
  and boleto_liberado = false
  and boleto_prazos_dias is null
);

-- ============================================================
-- 2. Vendedor cria cliente avulso — mesmo shape/trava da policy
--    acima, mas sem login (user_id is null, ao contrário do
--    autocadastro) e gated por has_role('vendedor') em vez de
--    auth.uid() = user_id.
-- ============================================================

create policy "Vendedor cria cliente avulso"
on public.clientes
for insert
to authenticated
with check (
  public.has_role(auth.uid(), 'vendedor')
  and user_id is null
  and status = 'pendente_aprovacao'
  and grupo_preco_id is null
  and regiao_entrega_id is null
  and aprovado_por is null
  and aprovado_em is null
  and boleto_liberado = false
  and boleto_prazos_dias is null
);

-- ============================================================
-- 3. pedidos_rascunho / pedido_rascunho_itens
--
-- Tabela própria, não um status a mais em pedidos: pedidos/pedido_itens
-- (migration 021) têm preco_unitario/subtotal/valor_total NOT NULL por
-- design — invariante já testada, e todo código futuro que ler pedidos
-- (histórico, relatório) pode confiar que preço sempre existe. Rascunho
-- não tem preço resolvível ainda (cliente sem grupo_preco_id), então
-- fica fora dessas tabelas por completo — mesmo formato do carrinho
-- (produto_id + quantidade, nada de preço/nome snapshot: isso só é
-- resolvido na conversão, com dado fresco na hora).
-- ============================================================

create table public.pedidos_rascunho (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id),
  criado_por uuid not null references auth.users(id),

  metodo_pagamento text not null check (metodo_pagamento in ('pix', 'cartao', 'boleto')),
  prazo_dias_escolhido integer,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint pedidos_rascunho_prazo_so_com_boleto check (
    (metodo_pagamento = 'boleto') = (prazo_dias_escolhido is not null)
  ),
  constraint pedidos_rascunho_prazo_positivo check (prazo_dias_escolhido is null or prazo_dias_escolhido > 0)
);

create index idx_pedidos_rascunho_cliente_id on public.pedidos_rascunho(cliente_id);

create table public.pedido_rascunho_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_rascunho_id uuid not null references public.pedidos_rascunho(id) on delete cascade,
  produto_id uuid not null references public.products(id),
  quantidade integer not null check (quantidade > 0)
);

create index idx_pedido_rascunho_itens_pedido_rascunho_id on public.pedido_rascunho_itens(pedido_rascunho_id);

alter table public.pedidos_rascunho enable row level security;
alter table public.pedido_rascunho_itens enable row level security;

grant select, insert, update, delete on public.pedidos_rascunho to authenticated;
grant select, insert, update, delete on public.pedido_rascunho_itens to authenticated;
grant all on public.pedidos_rascunho to service_role;
grant all on public.pedido_rascunho_itens to service_role;

-- Sem preço, sem dado de cliente sensível além do vínculo — mesmo nível
-- de acesso pra admin/operador/vendedor, sem distinção de carteira
-- (decisão 3 acima). A conversão pra pedido de verdade é uma ação
-- separada (confirmarRascunho, fora desta migration), admin-only —
-- não uma permissão de tabela.
create policy "Admin, operador e vendedor gerenciam rascunhos"
on public.pedidos_rascunho
for all
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'operador')
  or public.has_role(auth.uid(), 'vendedor')
)
with check (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'operador')
  or public.has_role(auth.uid(), 'vendedor')
);

create policy "Admin, operador e vendedor gerenciam itens de rascunho"
on public.pedido_rascunho_itens
for all
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'operador')
  or public.has_role(auth.uid(), 'vendedor')
)
with check (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'operador')
  or public.has_role(auth.uid(), 'vendedor')
);
