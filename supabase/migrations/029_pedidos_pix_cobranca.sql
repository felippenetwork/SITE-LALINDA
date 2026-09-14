-- Sprint 4 — geração real de cobrança PIX (etapa 2 da integração
-- Bradesco, depois de autenticação mTLS já testada). Só os 3 campos que
-- guardam o resultado da cobrança — a chamada em si vive em
-- lib/bradesco/gerar-cobranca-pix.ts, fora do banco.

alter table public.pedidos add column pix_txid text;
alter table public.pedidos add column pix_qrcode text; -- BR Code / "copia e cola", nunca a imagem do QR
alter table public.pedidos add column pix_expiracao timestamptz;

-- Não força os 3 campos a existirem juntos pra metodo_pagamento='pix' —
-- só proíbe existirem se NÃO for pix. A geração da cobrança acontece
-- DEPOIS de criar_pedido() já ter commitado (chamada HTTP externa não
-- pode viver dentro da transação da RPC) e pode falhar independente do
-- pedido já ter sido criado com sucesso — nesse caso os 3 campos ficam
-- null e a tela mostra um aviso, sem desfazer o pedido.
alter table public.pedidos add constraint pedidos_pix_consistente check (
  metodo_pagamento = 'pix' or (pix_txid is null and pix_qrcode is null and pix_expiracao is null)
);
