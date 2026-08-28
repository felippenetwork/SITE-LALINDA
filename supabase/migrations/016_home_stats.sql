-- Moves the home page's "Mãos Artesãs / Frota Dedicada / Clientes
-- Atendidos" counters out of hardcoded JSX (StatsSection.tsx) into
-- site_settings, editable from /admin/config without a deploy. Values
-- and labels below match exactly what was already hardcoded — this
-- migration only relocates them, it does not change any number or label.
-- NOT NULL + DEFAULT backfills the existing singleton row atomically,
-- same pattern as 010_product_lines_available.sql.

alter table public.site_settings add column stat_1_value integer not null default 500;
alter table public.site_settings add column stat_1_label text not null default 'Mãos Artesãs';
alter table public.site_settings add column stat_2_value integer not null default 120;
alter table public.site_settings add column stat_2_label text not null default 'Frota Dedicada';
alter table public.site_settings add column stat_3_value integer not null default 2000;
alter table public.site_settings add column stat_3_label text not null default 'Clientes Atendidos';
