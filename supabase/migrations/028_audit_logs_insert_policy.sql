-- Sprint 4 — corrige gap encontrado na tarefa anterior (integração PIX
-- Bradesco): audit_logs tem `grant insert` pra authenticated desde a
-- migration 004, mas NUNCA teve uma policy de RLS de INSERT — só a de
-- SELECT ("Admins can view audit logs") existe. Sem policy de INSERT,
-- RLS nega por padrão pra qualquer role que não seja o dono da tabela,
-- então todo insert de auditoria feito pelo client user-scoped
-- (lib/actions/site-settings.ts) falhava silenciosamente, porque nenhum
-- desses pontos conferia o erro do insert.
--
-- Triggers de auditoria (tr_log_product_changes, tr_log_precos_changes,
-- tr_log_precos_excecao_changes, tr_log_pedidos_changes) NUNCA foram
-- afetados por este gap — são SECURITY DEFINER (mesma razão de
-- has_role() ser SECURITY DEFINER), rodam com privilégio elevado e
-- ignoram RLS da tabela de destino por completo. Esta migration não
-- muda nada pra eles.
--
-- Sem restrição por papel de propósito: quem pode ou não chegar até um
-- insert de audit_logs já é decidido pelo requireAdmin()/
-- requireCatalogAccess() de cada Server Action (mesmo padrão de defesa
-- em profundidade do resto do projeto) — duplicar a checagem de papel
-- aqui não bloquearia nada de novo, só criaria mais um lugar pra manter
-- sincronizado. O único coisa que esta policy garante é que ninguém
-- consegue gravar um log em nome de OUTRO usuário.
create policy "Authenticated loga a propria acao"
on public.audit_logs
for insert
to authenticated
with check (user_id = auth.uid());
