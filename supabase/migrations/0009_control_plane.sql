-- WorkGPT control plane: accountable administration, user access controls,
-- payout details and public contact visibility.

alter table public.profiles
  add column if not exists account_status text not null default 'active'
    check (account_status in ('active', 'suspended')),
  add column if not exists payout_method text,
  add column if not exists payout_address text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.site_settings
  add column if not exists contact_telegram text,
  add column if not exists contact_whatsapp text,
  add column if not exists contact_live_chat text,
  add column if not exists show_email boolean not null default true,
  add column if not exists show_phone boolean not null default true,
  add column if not exists show_telegram boolean not null default false,
  add column if not exists show_whatsapp boolean not null default false,
  add column if not exists show_live_chat boolean not null default false;

alter table public.ledger_transactions
  drop constraint if exists ledger_transactions_type_check;
alter table public.ledger_transactions
  add constraint ledger_transactions_type_check check (type in (
    'assignment_cost', 'assignment_reward', 'deposit', 'withdrawal',
    'bonus_credit', 'level_upgrade', 'admin_adjustment'
  ));

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id),
  subject_user_id uuid references public.profiles(id),
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_logs_subject on public.admin_audit_logs(subject_user_id, created_at desc);
create index if not exists idx_admin_audit_logs_actor on public.admin_audit_logs(actor_id, created_at desc);

alter table public.admin_audit_logs enable row level security;
create policy "admin_audit_logs_select_admin" on public.admin_audit_logs for select using (public.is_admin());

create or replace function public.update_own_payout_details(p_method text, p_address text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare v_profile public.profiles;
begin
  if nullif(trim(coalesce(p_method, '')), '') is null or nullif(trim(coalesce(p_address, '')), '') is null then
    raise exception 'payout_method_and_address_required';
  end if;
  select * into v_profile from public.profiles where id = auth.uid() for update;
  if v_profile is null then raise exception 'profile_not_found'; end if;
  if v_profile.account_status <> 'active' then raise exception 'account_suspended'; end if;
  update public.profiles
    set payout_method = trim(p_method), payout_address = trim(p_address), updated_at = now()
    where id = auth.uid()
    returning * into v_profile;
  return v_profile;
end;
$$;

create or replace function public.admin_update_user_profile(
  p_user_id uuid,
  p_display_name text,
  p_level int,
  p_cycle_total int,
  p_account_status text,
  p_payout_method text,
  p_payout_address text,
  p_note text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare v_profile public.profiles;
begin
  if not public.is_admin() then raise exception 'not_authorized'; end if;
  if p_account_status not in ('active', 'suspended') then raise exception 'invalid_account_status'; end if;
  if p_cycle_total < 1 then raise exception 'invalid_cycle_total'; end if;
  if not exists (select 1 from public.workforce_levels where level = p_level) then raise exception 'invalid_workforce_level'; end if;

  update public.profiles
    set display_name = nullif(trim(p_display_name), ''), level = p_level, cycle_total = p_cycle_total,
        account_status = p_account_status, payout_method = nullif(trim(p_payout_method), ''),
        payout_address = nullif(trim(p_payout_address), ''), updated_at = now()
    where id = p_user_id
    returning * into v_profile;
  if v_profile is null then raise exception 'user_not_found'; end if;

  insert into public.admin_audit_logs (actor_id, subject_user_id, action, details)
  values (auth.uid(), p_user_id, 'user_profile_updated', jsonb_build_object(
    'level', p_level, 'cycle_total', p_cycle_total, 'account_status', p_account_status, 'note', p_note
  ));

  if p_account_status = 'suspended' then
    insert into public.notifications (user_id, type, title, body)
    values (p_user_id, 'account_status', 'Account access updated', 'Your account is currently unavailable. Contact support for assistance.');
  end if;
  return v_profile;
end;
$$;

create or replace function public.admin_adjust_balances(
  p_user_id uuid,
  p_credit_delta numeric,
  p_withdrawable_delta numeric,
  p_note text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare v_profile public.profiles;
begin
  if not public.is_admin() then raise exception 'not_authorized'; end if;
  if coalesce(p_credit_delta, 0) = 0 and coalesce(p_withdrawable_delta, 0) = 0 then raise exception 'empty_adjustment'; end if;
  if nullif(trim(coalesce(p_note, '')), '') is null then raise exception 'adjustment_note_required'; end if;

  select * into v_profile from public.profiles where id = p_user_id for update;
  if v_profile is null then raise exception 'user_not_found'; end if;
  if v_profile.credit_balance + p_credit_delta < 0 or v_profile.withdrawable_balance + p_withdrawable_delta < 0 then
    raise exception 'balance_cannot_be_negative';
  end if;

  update public.profiles
    set credit_balance = credit_balance + p_credit_delta,
        withdrawable_balance = withdrawable_balance + p_withdrawable_delta,
        updated_at = now()
    where id = p_user_id
    returning * into v_profile;

  insert into public.ledger_transactions (user_id, type, amount, balance_after, note)
  values (p_user_id, 'admin_adjustment', p_credit_delta, v_profile.credit_balance, p_note);
  insert into public.admin_audit_logs (actor_id, subject_user_id, action, details)
  values (auth.uid(), p_user_id, 'balance_adjusted', jsonb_build_object(
    'credit_delta', p_credit_delta, 'withdrawable_delta', p_withdrawable_delta, 'note', p_note
  ));
  insert into public.notifications (user_id, type, title, body)
  values (p_user_id, 'balance_adjustment', 'Balance updated', p_note);
  return v_profile;
end;
$$;

create or replace function public.block_suspended_assignment_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status in ('offered', 'in_progress') and exists (
    select 1 from public.profiles where id = new.user_id and account_status = 'suspended'
  ) then
    raise exception 'account_suspended';
  end if;
  return new;
end;
$$;

drop trigger if exists assignment_activity_requires_active_account on public.assignment_instances;
create trigger assignment_activity_requires_active_account
  before insert or update of status on public.assignment_instances
  for each row execute function public.block_suspended_assignment_activity();

revoke execute on function public.update_own_payout_details(text, text) from public;
revoke execute on function public.admin_update_user_profile(uuid, text, int, int, text, text, text, text) from public;
revoke execute on function public.admin_adjust_balances(uuid, numeric, numeric, text) from public;
grant execute on function public.update_own_payout_details(text, text) to authenticated;
grant execute on function public.admin_update_user_profile(uuid, text, int, int, text, text, text, text) to authenticated;
grant execute on function public.admin_adjust_balances(uuid, numeric, numeric, text) to authenticated;
