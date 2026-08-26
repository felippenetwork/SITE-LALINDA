-- Manual ordering for products within a line (product_lines already had
-- sort_order; products never exposed one). No RLS/grant changes needed —
-- the existing "Admins can manage products" policy (002_user_roles.sql)
-- already covers this column.

alter table public.products add column sort_order integer not null default 0;

-- Seed a stable initial order per line from current creation order.
update public.products p
set sort_order = sub.rn
from (
  select id, row_number() over (partition by category_id order by created_at) as rn
  from public.products
) sub
where p.id = sub.id;

create index if not exists idx_products_sort_order on public.products(category_id, sort_order);
