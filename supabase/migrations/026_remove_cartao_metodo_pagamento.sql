-- Sprint 4 — decisão de negócio: remover "cartão" como forma de
-- pagamento em todo o sistema. Só pix e boleto continuam existindo.
-- Boleto não muda (boleto_liberado + boleto_prazos_dias por cliente,
-- inalterado). PIX continua disponível pra todo cliente, sem
-- confirmação automática por enquanto (aguarda integração bancária
-- futura, fora de escopo aqui).
--
-- Sem nenhum dado a reconciliar: confirmado ao vivo antes desta
-- migration que tanto `pedidos` quanto `pedidos_rascunho` estão com 0
-- linhas em produção — não existe (e nunca existiu) um pedido ou
-- rascunho gravado com metodo_pagamento='cartao'.
--
-- Os dois CHECKs abaixo foram criados sem nome explícito, dentro do
-- CREATE TABLE original (migrations 021 e 025) — o nome usado aqui
-- segue a convenção padrão do Postgres pra CHECK anônimo
-- (`{tabela}_{coluna}_check`). Se o nome estiver errado, o DROP falha
-- alto e claro (nada quebra silenciosamente) — nesse caso, achar o
-- nome real via `\d pedidos` / `\d pedidos_rascunho` no SQL Editor e
-- ajustar numa migration de correção, mesmo padrão já usado antes
-- neste projeto (018 corrigindo 017, 023 corrigindo 022).

alter table public.pedidos
  drop constraint pedidos_metodo_pagamento_check,
  add constraint pedidos_metodo_pagamento_check check (metodo_pagamento in ('pix', 'boleto'));

alter table public.pedidos_rascunho
  drop constraint pedidos_rascunho_metodo_pagamento_check,
  add constraint pedidos_rascunho_metodo_pagamento_check check (metodo_pagamento in ('pix', 'boleto'));
