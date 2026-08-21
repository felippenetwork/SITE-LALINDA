-- Fix security linter warnings

-- 1. Revoke public/authenticated execution of has_role (security definer)
revoke execute on function public.has_role(uuid, app_role) from public;
revoke execute on function public.has_role(uuid, app_role) from authenticated;
revoke execute on function public.has_role(uuid, app_role) from anon;

-- Grant to service_role (just in case)
grant execute on function public.has_role(uuid, app_role) to service_role;

-- 2. Identify and fix RLS Enabled No Policy (user_roles table needs a policy for admins to see other roles if needed, or just their own)
-- Since it's read by the has_role function which is security definer, it doesn't STRICTLY need a policy for the function to work,
-- but having one prevents the linter warning and allows admin debugging.
create policy "Admins can view all roles"
on public.user_roles
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));
