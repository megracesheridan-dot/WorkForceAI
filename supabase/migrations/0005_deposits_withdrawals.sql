-- Dépôts et retraits manuels avec approbation admin.
-- Début du produit : pas de passerelle de paiement réelle branchée, tout passe par une
-- demande côté utilisateur (avec preuve de paiement pour les dépôts) puis une revue
-- humaine côté admin. Comme pour le reste du projet, aucune écriture de solde n'est
-- possible depuis le client : tout passe par des fonctions SECURITY DEFINER.

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.deposit_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric not null check (amount > 0),
  method text not null,
  proof_path text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric not null check (amount > 0),
  destination text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_deposit_requests_user on public.deposit_requests(user_id);
create index if not exists idx_deposit_requests_status on public.deposit_requests(status);
create index if not exists idx_withdrawal_requests_user on public.withdrawal_requests(user_id);
create index if not exists idx_withdrawal_requests_status on public.withdrawal_requests(status);

alter table public.deposit_requests enable row level security;
alter table public.withdrawal_requests enable row level security;

-- Lecture uniquement pour l'utilisateur propriétaire ou un admin. Aucune policy
-- INSERT/UPDATE directe : tout passe par les fonctions ci-dessous.
create policy "deposit_requests_select_own" on public.deposit_requests for select
  using (auth.uid() = user_id);
create policy "deposit_requests_select_admin" on public.deposit_requests for select
  using (public.is_admin());

create policy "withdrawal_requests_select_own" on public.withdrawal_requests for select
  using (auth.uid() = user_id);
create policy "withdrawal_requests_select_admin" on public.withdrawal_requests for select
  using (public.is_admin());

-- ============================================================
-- Storage — preuves de dépôt (bucket privé)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('deposit-proofs', 'deposit-proofs', false)
on conflict (id) do nothing;

drop policy if exists "deposit_proofs_insert_own" on storage.objects;
create policy "deposit_proofs_insert_own" on storage.objects for insert
  with check (
    bucket_id = 'deposit-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "deposit_proofs_select_own_or_admin" on storage.objects;
create policy "deposit_proofs_select_own_or_admin" on storage.objects for select
  using (
    bucket_id = 'deposit-proofs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- ============================================================
-- 1) Request Deposit — enregistre la demande, aucun crédit accordé pour l'instant
-- ============================================================

create or replace function public.request_deposit(p_amount numeric, p_method text, p_proof_path text)
returns public.deposit_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.deposit_requests;
begin
  if p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  if p_proof_path is null or length(trim(p_proof_path)) = 0 then
    raise exception 'proof_required';
  end if;

  insert into public.deposit_requests (user_id, amount, method, proof_path)
  values (auth.uid(), p_amount, p_method, p_proof_path)
  returning * into v_request;

  return v_request;
end;
$$;

-- ============================================================
-- 2) Approve / Reject Deposit — admin uniquement
-- ============================================================

create or replace function public.approve_deposit(p_request_id uuid, p_note text default null)
returns public.deposit_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.deposit_requests;
  v_profile public.profiles;
  v_new_balance numeric;
begin
  if not public.is_admin() then
    raise exception 'not_authorized';
  end if;

  select * into v_request from public.deposit_requests
    where id = p_request_id and status = 'pending' for update;
  if v_request is null then
    raise exception 'request_not_found_or_processed';
  end if;

  select * into v_profile from public.profiles where id = v_request.user_id for update;

  v_new_balance := v_profile.credit_balance + v_request.amount;
  update public.profiles set credit_balance = v_new_balance where id = v_profile.id;

  insert into public.ledger_transactions (user_id, type, amount, balance_after, reference_id, note)
  values (v_profile.id, 'deposit', v_request.amount, v_new_balance, v_request.id,
    coalesce(p_note, 'Deposit approved'));

  update public.deposit_requests
    set status = 'approved', admin_note = p_note, reviewed_by = auth.uid(), reviewed_at = now()
    where id = p_request_id
    returning * into v_request;

  insert into public.notifications (user_id, type, title, body)
  values (v_profile.id, 'deposit_approved', 'Dépôt approuvé',
    '+' || v_request.amount || ' crédits ajoutés à ton solde.');

  return v_request;
end;
$$;

create or replace function public.reject_deposit(p_request_id uuid, p_note text default null)
returns public.deposit_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.deposit_requests;
begin
  if not public.is_admin() then
    raise exception 'not_authorized';
  end if;

  update public.deposit_requests
    set status = 'rejected', admin_note = p_note, reviewed_by = auth.uid(), reviewed_at = now()
    where id = p_request_id and status = 'pending'
    returning * into v_request;
  if v_request is null then
    raise exception 'request_not_found_or_processed';
  end if;

  insert into public.notifications (user_id, type, title, body)
  values (v_request.user_id, 'deposit_rejected', 'Dépôt refusé',
    coalesce(p_note, 'Ta preuve de paiement n''a pas pu être validée.'));

  return v_request;
end;
$$;

-- ============================================================
-- 3) Request Withdrawal — fonds retenus immédiatement (comme un vrai retrait en attente)
-- ============================================================

create or replace function public.request_withdrawal(p_amount numeric, p_destination text)
returns public.withdrawal_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_new_balance numeric;
  v_new_withdrawable numeric;
  v_request public.withdrawal_requests;
begin
  if p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  if p_destination is null or length(trim(p_destination)) = 0 then
    raise exception 'destination_required';
  end if;

  select * into v_profile from public.profiles where id = auth.uid() for update;
  if v_profile.withdrawable_balance < p_amount then
    raise exception 'insufficient_withdrawable_balance';
  end if;

  insert into public.withdrawal_requests (user_id, amount, destination)
  values (v_profile.id, p_amount, p_destination)
  returning * into v_request;

  v_new_balance := v_profile.credit_balance - p_amount;
  v_new_withdrawable := v_profile.withdrawable_balance - p_amount;
  update public.profiles
    set credit_balance = v_new_balance, withdrawable_balance = v_new_withdrawable
    where id = v_profile.id;

  insert into public.ledger_transactions (user_id, type, amount, balance_after, reference_id, note)
  values (v_profile.id, 'withdrawal', -p_amount, v_new_balance, v_request.id,
    'Withdrawal requested — held pending review');

  return v_request;
end;
$$;

-- ============================================================
-- 4) Approve / Reject Withdrawal — admin uniquement
-- ============================================================

create or replace function public.approve_withdrawal(p_request_id uuid, p_note text default null)
returns public.withdrawal_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.withdrawal_requests;
begin
  if not public.is_admin() then
    raise exception 'not_authorized';
  end if;

  -- Les fonds ont déjà été retenus à la demande : approuver signifie que le virement
  -- réel a été effectué manuellement par le staff, aucune écriture de solde ici.
  update public.withdrawal_requests
    set status = 'approved', admin_note = p_note, reviewed_by = auth.uid(), reviewed_at = now()
    where id = p_request_id and status = 'pending'
    returning * into v_request;
  if v_request is null then
    raise exception 'request_not_found_or_processed';
  end if;

  insert into public.notifications (user_id, type, title, body)
  values (v_request.user_id, 'withdrawal_approved', 'Retrait approuvé',
    'Ton retrait de ' || v_request.amount || ' crédits a été traité.');

  return v_request;
end;
$$;

create or replace function public.reject_withdrawal(p_request_id uuid, p_note text default null)
returns public.withdrawal_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.withdrawal_requests;
  v_profile public.profiles;
  v_new_balance numeric;
begin
  if not public.is_admin() then
    raise exception 'not_authorized';
  end if;

  select * into v_request from public.withdrawal_requests
    where id = p_request_id and status = 'pending' for update;
  if v_request is null then
    raise exception 'request_not_found_or_processed';
  end if;

  select * into v_profile from public.profiles where id = v_request.user_id for update;

  v_new_balance := v_profile.credit_balance + v_request.amount;
  update public.profiles
    set credit_balance = v_new_balance,
        withdrawable_balance = withdrawable_balance + v_request.amount
    where id = v_profile.id;

  insert into public.ledger_transactions (user_id, type, amount, balance_after, reference_id, note)
  values (v_profile.id, 'deposit', v_request.amount, v_new_balance, v_request.id,
    'Withdrawal rejected — refunded');

  update public.withdrawal_requests
    set status = 'rejected', admin_note = p_note, reviewed_by = auth.uid(), reviewed_at = now()
    where id = p_request_id
    returning * into v_request;

  insert into public.notifications (user_id, type, title, body)
  values (v_profile.id, 'withdrawal_rejected', 'Retrait refusé',
    coalesce(p_note, 'Ton retrait a été refusé et remboursé sur ton solde.'));

  return v_request;
end;
$$;
