-- 1. Create product_lines table — replaces the fixed product_category enum
-- so lines become admin-manageable entities (name, slug, description, photo).
create table public.product_lines (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    description text,
    image_url text,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.product_lines enable row level security;

grant select on public.product_lines to anon, authenticated;
grant all on public.product_lines to service_role;
grant select, insert, update, delete on public.product_lines to authenticated;

create policy "Allow public read on product_lines"
on public.product_lines for select
to anon, authenticated
using (true);

create policy "Allow admin insert on product_lines"
on public.product_lines for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Allow admin update on product_lines"
on public.product_lines for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Allow admin delete on product_lines"
on public.product_lines for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- 2. Seed the lines that already existed as enum values, plus Pão de Queijo
-- (previously a UI-only subdivision of "Salgados"). Description/image are a
-- first draft placeholder — editable from the admin Linhas screen.
insert into public.product_lines (name, slug, description, image_url, sort_order) values
('Tradicionais', 'tradicionais',
 'Os clássicos que abrem toda padaria: pão francês, pão de forma, broa. Receita que não muda porque não precisa — fermentação lenta e o ponto exato em cada fornada, todos os dias.',
 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=1600', 1),
('Linha Extra', 'linha-extra',
 'Para quando o dia pede um pouco mais. Multigrãos, integrais e receitas especiais que somam textura e sabor ao cardápio sem perder a alma artesanal.',
 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?q=80&w=1600', 2),
('Linha Premium', 'linha-premium',
 'Ingredientes selecionados, técnica apurada e acabamento que não passa despercebido. A linha para quem busca destaque em mesas e vitrines exigentes.',
 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?q=80&w=1600', 3),
('Confeitaria', 'confeitaria',
 'Doçura com o mesmo cuidado que dedicamos ao pão. Bolos, tortas e sobremesas que fecham a experiência La Linda com a mesma exigência do início ao fim.',
 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=1600', 4),
('Salgados', 'salgados',
 'Praticidade sem abrir mão do sabor artesanal. Salgados assados e fritos prontos para lanches, eventos e o dia a dia do seu ponto de venda.',
 'https://images.unsplash.com/photo-1608039755401-742074f0548d?q=80&w=1600', 5),
('Pão de Queijo', 'pao-de-queijo',
 'O clássico mineiro na versão La Linda: casquinha crocante, miolo que puxa fio, aquele queijo que a gente sente antes de morder.',
 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1600', 6);

-- 3. Point products at product_lines instead of the enum, then drop the enum.
alter table public.products add column category_id uuid references public.product_lines(id);

update public.products p
set category_id = pl.id
from public.product_lines pl
where pl.name = p.category::text;

alter table public.products alter column category_id set not null;
alter table public.products drop column category;
drop type public.product_category;

create index idx_products_category_id on public.products(category_id);
