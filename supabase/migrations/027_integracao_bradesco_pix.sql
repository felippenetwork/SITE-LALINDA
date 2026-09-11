-- Sprint 4 — armazenamento seguro das credenciais da integração PIX do
-- Bradesco. SÓ armazenamento nesta tarefa — a chamada real à API do
-- Bradesco, webhook de confirmação e validação de que as credenciais
-- funcionam ficam para tarefas futuras.
--
-- Client Secret e senha do certificado NUNCA são gravados em claro aqui
-- — são cifrados em aplicação (AES-256-GCM, chave só em variável de
-- ambiente, nunca no banco) antes do insert/update chegar até esta
-- tabela; o banco só vê ciphertext + IV. Client ID não é segredo (é só
-- um identificador OAuth2), gravado em texto normal.
--
-- Tabela dedicada, não reaproveita site_settings de propósito: essa
-- tabela já tem "grant select ... to anon, authenticated" e uma policy
-- de leitura pública (using (true)) — estruturalmente errada pra
-- guardar segredo, mesmo que só uma coluna nova fosse sensível.
--
-- Sem trigger de auditoria automática (ao contrário de precos/pedidos)
-- — um trigger que loga to_jsonb(new) colocaria ciphertext+IV no
-- audit_logs. O registro de auditoria é feito explicitamente pela
-- Server Action (lib/actions/integracao-bradesco.ts), só com os NOMES
-- dos campos alterados, nunca o conteúdo.

create table public.integracao_bradesco_pix (
  id uuid primary key default gen_random_uuid(),
  ativa boolean not null default false,

  client_id text,

  client_secret_cifrado text,
  client_secret_iv text,

  certificado_path text,
  certificado_iv text,
  certificado_nome_arquivo text,
  certificado_enviado_em timestamptz,

  certificado_senha_cifrada text,
  certificado_senha_iv text,

  updated_at timestamptz not null default now(),
  updated_por uuid references auth.users(id)
);

-- Linha única, id fixo conhecido — mesmo padrão singleton de
-- site_settings (migration 011): o app sempre lê/escreve por este id,
-- nunca faz select antes pra descobrir qual linha existe.
insert into public.integracao_bradesco_pix (id) values ('10000000-0000-0000-0000-000000000001');

alter table public.integracao_bradesco_pix enable row level security;

grant select, update on public.integracao_bradesco_pix to authenticated;
grant all on public.integracao_bradesco_pix to service_role;

-- Admin-only, sem exceção pra operador — mesmo padrão de
-- precos/grupos_preco (migration 017): preço e credencial de banco são
-- as duas áreas do projeto que operador nunca acessa.
create policy "Admin gerencia integracao bradesco pix"
on public.integracao_bradesco_pix
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Bucket privado pro certificado .pfx (cifrado antes de subir — ver
-- comentário no topo). De propósito, SEM NENHUMA policy de storage pra
-- anon/authenticated: RLS do Storage nega tudo por padrão sem policy
-- correspondente, então só service_role (que ignora RLS) toca este
-- bucket. O upload sempre passa por supabaseAdmin numa Server Action
-- admin-gated (lib/actions/integracao-bradesco.ts) — o client do
-- navegador nunca fala com este bucket diretamente, então não existe
-- policy de INSERT/SELECT pra escrever aqui, ao contrário do bucket
-- product-images (migration 008), que precisa de policy porque o
-- upload de foto roda no client user-scoped.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-certificates', 'payment-certificates', false, 1048576, null);
