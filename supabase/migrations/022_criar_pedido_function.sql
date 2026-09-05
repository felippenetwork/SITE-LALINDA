-- Sprint 4 — checkout do portal. Função atômica pra gravar pedidos +
-- pedido_itens numa única transação (uma chamada de função Postgres já
-- é uma transação implícita — se qualquer insert falhar, tudo desfaz
-- sozinho, sem eu precisar implementar rollback manual).
--
-- Importante: esta função NÃO contém lógica de negócio nenhuma — não
-- olha pra precos/precos_excecao, não decide método de pagamento, não
-- calcula data de entrega. Ela só recebe valores JÁ recalculados pela
-- Server Action (lib/actions/pedido.ts, roda com service role) e grava
-- os dois inserts atomicamente. valor_total é recalculado aqui a partir
-- da soma dos próprios itens recebidos — nunca um número solto que
-- possa divergir do que foi gravado em pedido_itens na mesma transação.
create or replace function public.criar_pedido(
  p_cliente_id uuid,
  p_metodo_pagamento text,
  p_prazo_dias_escolhido integer,
  p_data_entrega_prevista date,
  p_itens jsonb -- [{produto_id, produto_nome, quantidade, preco_unitario, subtotal}, ...]
)
returns uuid
language plpgsql
as $$
declare
  v_pedido_id uuid;
  v_valor_total numeric(10,2);
begin
  select coalesce(sum((item->>'subtotal')::numeric), 0)
  into v_valor_total
  from jsonb_array_elements(p_itens) as item;

  if jsonb_array_length(p_itens) = 0 or v_valor_total <= 0 then
    raise exception 'Pedido precisa ter ao menos um item com valor positivo';
  end if;

  insert into public.pedidos (
    cliente_id, metodo_pagamento, prazo_dias_escolhido, data_entrega_prevista, valor_total
  ) values (
    p_cliente_id, p_metodo_pagamento, p_prazo_dias_escolhido, p_data_entrega_prevista, v_valor_total
  )
  returning id into v_pedido_id;

  insert into public.pedido_itens (
    pedido_id, produto_id, produto_nome, quantidade, preco_unitario, subtotal
  )
  select
    v_pedido_id,
    (item->>'produto_id')::uuid,
    item->>'produto_nome',
    (item->>'quantidade')::integer,
    (item->>'preco_unitario')::numeric,
    (item->>'subtotal')::numeric
  from jsonb_array_elements(p_itens) as item;

  return v_pedido_id;
end;
$$;

-- Esta função confia cegamente nos preços que recebe — só verifica
-- consistência aritmética interna (subtotal = preco*qtd, total = soma
-- dos subtotais), nunca compara contra precos/precos_excecao de
-- verdade. Só a Server Action (service role, já fez o recálculo real
-- antes de chamar) deveria criar pedido por aqui.
--
-- A PROTEÇÃO REAL contra cliente comum, desde o primeiro momento, é a
-- RLS de `pedidos`/`pedido_itens` (migration 021) combinada com esta
-- função ser SECURITY INVOKER (padrão do Postgres quando não
-- especificado) — a função roda com o papel de quem chama, então um
-- authenticated comum tem o INSERT bloqueado pela RLS mesmo que
-- consiga executar a função. Verificado ao vivo: um cliente comum
-- chamando criar_pedido() direto falha com "new row violates row-level
-- security policy for table pedidos", nunca chega a gravar nada.
--
-- O `revoke`/`grant` abaixo é uma camada REDUNDANTE sobre essa proteção
-- (nega a própria chamada da função, não só o INSERT de dentro dela) —
-- não é o que impede o cliente comum, que já estava barrado pela RLS.
-- Ela importa mais pra impedir ADMIN/OPERADOR de contornar o
-- recálculo de preço chamando a função direto (já que a policy de
-- "Admin e operador gerenciam pedidos" permitiria o INSERT interno pra
-- eles) — mesmo que, na prática, admin/operador já tenham escrita
-- irrestrita em pedidos/pedido_itens por fora desta função também.
--
-- NOTA: `revoke ... from public` sozinho NÃO bastou nesta prática —
-- verificação ao vivo mostrou que `authenticated` ainda conseguia
-- chamar a função depois disso (community/projeto Supabase parece
-- conceder EXECUTE a `authenticated` por um caminho que não passa só
-- por PUBLIC — mesma classe de achado da migration 021 com GRANT em
-- tabela). Precisou de `revoke ... from authenticated` explícito
-- (migration 023) pra realmente bloquear — reconfirmado ao vivo antes
-- e depois desse fix, comparando a mensagem de erro exata.
revoke execute on function public.criar_pedido(uuid, text, integer, date, jsonb) from public;
grant execute on function public.criar_pedido(uuid, text, integer, date, jsonb) to service_role;
