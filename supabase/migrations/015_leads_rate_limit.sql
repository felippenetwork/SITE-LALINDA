-- Tracks accepted lead-form submission attempts per IP so `submitLead` can
-- enforce a 3-per-hour cap. Only rows for attempts that already passed the
-- honeypot + timing checks are inserted (see lib/actions/leads.ts) — a
-- rejected/rate-limited attempt never gets its own row, so a blocked IP
-- can't extend its own block by retrying.
--
-- RLS enabled with NO policies at all: this table is only ever touched via
-- `supabaseAdmin` (service role, same client already used for the `leads`
-- insert itself), so anon/authenticated have zero access by default —
-- nothing to grant.

create table public.leads_rate_limit (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  created_at timestamptz not null default now()
);

alter table public.leads_rate_limit enable row level security;

grant all on public.leads_rate_limit to service_role;

create index idx_leads_rate_limit_ip_created_at on public.leads_rate_limit(ip, created_at desc);
