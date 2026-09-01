-- Two changes to clientes, same migration since both touch this one
-- table in this same task.

-- 1. Fix clientes_aprovado_consistente (bug from migration 017): the
-- original constraint only allowed aprovado_em to be set while
-- status = 'aprovado', which would block "Suspender" (status ->
-- 'suspenso') without erasing the aprovado_por/aprovado_em audit
-- trail. Inverted: aprovado_em is null only while pending — both
-- 'aprovado' and 'suspenso' (which was necessarily approved once)
-- keep their approval record.
alter table public.clientes drop constraint clientes_aprovado_consistente;
alter table public.clientes add constraint clientes_aprovado_consistente
  check ((status = 'pendente_aprovacao') = (aprovado_em is null));

-- 2. Payment methods. PIX and cartão are universal — every client can
-- use them, no column needed. Boleto is opt-in per client, with a
-- free-form (not a fixed list) set of payment-term day-counts, e.g.
-- {14, 28, 42} — the checkout shows one button per value, in array
-- order. boleto_liberado = true with an empty/null boleto_prazos_dias
-- is treated as NOT liberado by application logic (no usable term to
-- offer) — intentionally not a DB constraint, since this is a display
-- rule, not a data-integrity rule.
alter table public.clientes add column boleto_liberado boolean not null default false;
alter table public.clientes add column boleto_prazos_dias integer[];

-- CHECK constraints can't contain subqueries — unnest()-in-a-subquery
-- doesn't work here. `0 < all(array)` is the subquery-free, standard
-- SQL array-quantified-comparison form: true when every element is
-- positive (vacuously true for an empty array, which is a valid state
-- here, not an error).
alter table public.clientes add constraint clientes_boleto_prazos_positivos
  check (boleto_prazos_dias is null or 0 < all(boleto_prazos_dias));
