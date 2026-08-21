-- Fix security linter warnings for new functions

-- 1. Set search_path for triggers and revoking execution
create or replace function public.check_last_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if (select count(*) from public.user_roles where role = 'admin') = 1 
       and old.role = 'admin' then
        raise exception 'Cannot delete the last admin user';
    end if;
    return old;
end;
$$;

create or replace function public.log_product_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.audit_logs (user_id, action, target_table, target_id, details)
    values (
        auth.uid(), 
        tg_op, 
        'products', 
        case when tg_op = 'DELETE' then old.id else new.id end,
        case 
            when tg_op = 'INSERT' then jsonb_build_object('new', to_jsonb(new))
            when tg_op = 'UPDATE' then jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
            else jsonb_build_object('old', to_jsonb(old))
        end
    );
    return null;
end;
$$;

-- 2. Revoke public/authenticated execution of security definer functions
revoke execute on function public.check_last_admin() from public;
revoke execute on function public.check_last_admin() from authenticated;
revoke execute on function public.check_last_admin() from anon;

revoke execute on function public.log_product_changes() from public;
revoke execute on function public.log_product_changes() from authenticated;
revoke execute on function public.log_product_changes() from anon;

grant execute on function public.check_last_admin() to service_role;
grant execute on function public.log_product_changes() to service_role;
