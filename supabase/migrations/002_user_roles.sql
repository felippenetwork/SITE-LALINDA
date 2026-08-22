-- 1. Create User Roles Table
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    unique (user_id, role)
);

-- 2. Grants for user_roles
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

-- 3. Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- 4. Security Definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- 5. Revise existing RLS to be more secure

-- Products: Admins can do anything, public can read
drop policy if exists "Allow authenticated full access on products" on public.products;
create policy "Admins can manage products"
on public.products
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Timeline Events: Admins can do anything, public can read
alter table public.timeline_events enable row level security;
grant select on public.timeline_events to anon, authenticated;
grant all on public.timeline_events to service_role;
grant insert, update, delete on public.timeline_events to authenticated;

drop policy if exists "Allow public read on timeline_events" on public.timeline_events;
create policy "Allow public read on timeline_events" ON public.timeline_events FOR SELECT TO anon, authenticated USING (true);
create policy "Admins can manage timeline_events"
on public.timeline_events
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Leads: Admins can read/delete, public can insert
grant select, delete on public.leads to authenticated;

drop policy if exists "Allow public insert on leads" on public.leads;
create policy "Allow public insert on leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);

create policy "Admins can select leads"
on public.leads
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete leads"
on public.leads
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- 6. Add Indexes for performance
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_available on public.products(available);
create index if not exists idx_leads_created_at on public.leads(created_at desc);
create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
