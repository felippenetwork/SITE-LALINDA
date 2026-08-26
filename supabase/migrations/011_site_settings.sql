-- Singleton table for editable public-facing site info (contact
-- email/phone, social links) so admins can update it from /admin/config
-- without a code deploy. RLS enabled in this same migration, per policy:
-- never ship a table without RLS in the migration that creates it.

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  contact_email text not null,
  contact_phone text not null,
  instagram_url text,
  facebook_url text,
  updated_at timestamptz not null default now()
);

-- Fixed, well-known row id — there is exactly one row, and app code
-- reads/writes it by this constant instead of looking it up first.
insert into public.site_settings (id, contact_email, contact_phone)
values ('00000000-0000-0000-0000-000000000001', 'contato@lalinda.com.br', '+55 (11) 9999-9999');

alter table public.site_settings enable row level security;

grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;

create policy "Allow public read on site_settings"
on public.site_settings for select
to anon, authenticated
using (true);

create policy "Admins can update site_settings"
on public.site_settings for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));
