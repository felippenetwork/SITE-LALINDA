-- Sprint 4 — armazenamento da conexão UAZAPI (WhatsApp) usada pra
-- notificar cliente quando um pagamento PIX é confirmado (parte 4 da
-- integração de pagamento). Mesmo padrão de integracao_bradesco_pix
-- (migration 027): tabela singleton dedicada, token cifrado em
-- aplicação (AES-256-GCM, chave só em variável de ambiente), nunca em
-- claro no banco.
--
-- instance_token dá controle total sobre o número de WhatsApp da
-- empresa (enviar mensagem como a empresa, ler conversas) — mesmo
-- patamar de sensibilidade de client_secret do Bradesco, mesmo
-- tratamento: cifrado, admin-only, nunca reexibido por completo.
--
-- QR Code de pareamento NUNCA é persistido aqui de propósito — é
-- efêmero (existe só durante a janela de conexão) e sensível (quem
-- escaneia assume o número). Ele trafega só na resposta da Server
-- Action de conectar/status, nunca grava em nenhuma tabela, nunca
-- entra em audit_logs.
--
-- Sem trigger de auditoria automática, mesmo raciocínio da migration
-- 027: um trigger que loga to_jsonb(new) colocaria ciphertext+IV no
-- audit_logs. Registro de auditoria é explícito na Server Action, só
-- com o nome da ação (conectou/desconectou), nunca o token.

create table public.integracao_whatsapp (
  id uuid primary key default gen_random_uuid(),

  instance_id text,
  instance_token_cifrado text,
  instance_token_iv text,

  -- Cache do último status conhecido — evita bater na uazapi só pra
  -- mostrar a tela; atualizado a cada chamada de conectar/status.
  conectado boolean not null default false,
  telefone_conectado text,

  updated_at timestamptz not null default now(),
  updated_por uuid references auth.users(id)
);

-- Linha única, id fixo conhecido — mesmo padrão singleton de
-- site_settings/integracao_bradesco_pix.
insert into public.integracao_whatsapp (id) values ('30000000-0000-0000-0000-000000000001');

alter table public.integracao_whatsapp enable row level security;

grant select, update on public.integracao_whatsapp to authenticated;
grant all on public.integracao_whatsapp to service_role;

-- Admin-only, sem exceção pra operador — mesmo padrão de
-- integracao_bradesco_pix/precos: credencial de serviço externo com
-- controle total sobre comunicação com cliente é área que operador
-- nunca acessa.
create policy "Admin gerencia integracao whatsapp"
on public.integracao_whatsapp
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));
