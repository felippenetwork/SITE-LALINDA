-- 1. Create audit_logs table
create table public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    action text not null,
    target_table text,
    target_id uuid,
    details jsonb,
    created_at timestamptz default now()
);

-- 2. Grants for audit_logs
grant insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;

-- 3. Enable RLS on audit_logs
alter table public.audit_logs enable row level security;

-- 4. Policies for audit_logs
create policy "Admins can view audit logs"
on public.audit_logs
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- 5. Revise Lead Security: Admins should not insert leads (they are for customers), 
-- but we need to ensure customers can't read leads.
-- The existing policy "Allow public insert on leads" is correct for its purpose.

-- 6. Add storage policies (assuming 'product-images' bucket exists or will exist)
-- Note: Bucket creation is usually done via supabase--storage_create_bucket, but policies are SQL.
-- We'll just define them here as a reference for security.

/*
-- Policy for public read of product images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'product-images' );

-- Policy for admin upload of product images
create policy "Admins can upload images"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'product-images' 
    and (public.has_role(auth.uid(), 'admin'))
);
*/

-- 7. Add a check to prevent deletion of the last admin if possible (hard via RLS, better via trigger)
create or replace function public.check_last_admin()
returns trigger
language plpgsql
security definer
as $$
begin
    if (select count(*) from public.user_roles where role = 'admin') = 1 
       and old.role = 'admin' then
        raise exception 'Cannot delete the last admin user';
    end if;
    return old;
end;
$$;

create trigger tr_check_last_admin
before delete on public.user_roles
for each row
execute function public.check_last_admin();

-- 8. Add a trigger to log product changes
create or replace function public.log_product_changes()
returns trigger
language plpgsql
security definer
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

create trigger tr_log_product_changes
after insert or update or delete on public.products
for each row
execute function public.log_product_changes();
