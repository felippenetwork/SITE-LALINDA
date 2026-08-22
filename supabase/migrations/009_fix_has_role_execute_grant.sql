-- Migration 003 revoked EXECUTE on has_role() from `authenticated` to silence
-- a security-linter warning, but every admin-gated server action (and every
-- RLS policy that references has_role, including product_lines/storage
-- writes and the user_roles/audit_logs SELECT policies) calls this function
-- from the user-scoped client — i.e. as `authenticated`, not `service_role`.
-- That revoke made every one of those checks fail with "permission denied"
-- for real logged-in admins. has_role() only ever returns a boolean and every
-- call site passes auth.uid() as _user_id, so there's no meaningful exposure
-- in letting authenticated users call it — restore the grant.
grant execute on function public.has_role(uuid, app_role) to authenticated;
