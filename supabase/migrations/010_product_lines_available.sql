-- Lines gain the same available/paused toggle products already have.
alter table public.product_lines add column available boolean not null default true;
