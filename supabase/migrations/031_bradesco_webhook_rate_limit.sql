-- Sprint 6 bloco 3 — rate limit no webhook de confirmação PIX do
-- Bradesco (app/api/webhooks/bradesco-pix/[token]/route.ts). Proteção
-- ADICIONAL contra flood — a validação de origem de verdade (token na
-- URL + reverificação direto no Bradesco via consultarCobrancaPix,
-- nunca confiando no payload recebido) já existe e já foi testada;
-- isso aqui não substitui aquilo.
--
-- Mesmo padrão de leads_rate_limit (migration 015): tabela simples,
-- limpeza oportunista feita em código, RLS habilitada e SEM NENHUMA
-- policy — só service_role toca, então anon/authenticated têm zero
-- acesso por padrão. Chave é IP (via x-forwarded-for injetado pela
-- borda da Vercel), mesmo raciocínio de confiança já documentado em
-- lib/security/get-client-ip.ts.
--
-- Diferente de leads_rate_limit: aqui quem chama é servidor-a-servidor
-- (Bradesco), não navegador — não tenho documentação real do pool de
-- IPs deles, então o limite (20/min, aplicado em código) é deliberadamente
-- generoso pra nunca bloquear tráfego legítimo, só cortar um flood de
-- verdade vindo de um IP só.

create table public.bradesco_webhook_rate_limit (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  created_at timestamptz not null default now()
);

alter table public.bradesco_webhook_rate_limit enable row level security;

grant all on public.bradesco_webhook_rate_limit to service_role;

create index idx_bradesco_webhook_rate_limit_ip_created_at
  on public.bradesco_webhook_rate_limit(ip, created_at desc);
