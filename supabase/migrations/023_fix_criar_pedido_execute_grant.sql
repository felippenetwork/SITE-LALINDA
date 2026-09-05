-- Fix da migration 022: "revoke execute ... from public" não bastou.
-- Verificação ao vivo mostrou que `authenticated` ainda conseguia chamar
-- criar_pedido() direto (mesmo achado da migration 021: este projeto tem
-- algum privilégio padrão de schema concedendo acesso a `authenticated`
-- além do que cada migration concede explicitamente — aqui isso também
-- vale pra funções, não só tabelas). Revoga explicitamente do papel
-- `authenticated`, não só de `public`.
revoke execute on function public.criar_pedido(uuid, text, integer, date, jsonb) from authenticated;
