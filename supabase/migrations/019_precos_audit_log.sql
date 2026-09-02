-- Mesmo padrão de log_product_changes/tr_log_product_changes (migration
-- 004): trigger de banco, loga automaticamente INSERT/UPDATE/DELETE em
-- audit_logs com before/after em JSON. Cobre "quem mudou, quando" sem
-- nenhum código extra nas Server Actions.

create or replace function public.log_precos_changes()
returns trigger
language plpgsql
security definer
as $$
begin
    insert into public.audit_logs (user_id, action, target_table, target_id, details)
    values (
        auth.uid(),
        tg_op,
        'precos',
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

create trigger tr_log_precos_changes
after insert or update or delete on public.precos
for each row
execute function public.log_precos_changes();

create or replace function public.log_precos_excecao_changes()
returns trigger
language plpgsql
security definer
as $$
begin
    insert into public.audit_logs (user_id, action, target_table, target_id, details)
    values (
        auth.uid(),
        tg_op,
        'precos_excecao',
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

create trigger tr_log_precos_excecao_changes
after insert or update or delete on public.precos_excecao
for each row
execute function public.log_precos_excecao_changes();
