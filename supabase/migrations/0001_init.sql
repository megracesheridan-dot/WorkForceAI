-- AI Arena — schéma initial
-- Toute la logique financière et d'exécution vit dans des fonctions SECURITY DEFINER
-- (une seule transaction par opération sensible), jamais côté client.

create extension if not exists pgcrypto;

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.workforce_levels (
  level int primary key,
  name text not null,
  employees_count int not null,
  assignments_per_day int not null,
  unlock_cost numeric not null default 0, -- coût publié pour débloquer ce niveau depuis le précédent
  description text
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_admin boolean not null default false,
  level int not null default 1 references public.workforce_levels(level),
  credit_balance numeric not null default 200 check (credit_balance >= 0),
  withdrawable_balance numeric not null default 0 check (withdrawable_balance >= 0),
  bonus_credits numeric not null default 0 check (bonus_credits >= 0),
  cycle_position int not null default 0,
  cycle_total int not null default 15,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  specialty text not null,
  level_required int not null default 1 references public.workforce_levels(level),
  execution_capacity int not null default 70,
  precision_rate numeric not null default 0.90,
  speed_index numeric not null default 1.0,
  synergy_bonus numeric not null default 0,
  active boolean not null default true
);

create table if not exists public.assignment_catalogue (
  id uuid primary key default gen_random_uuid(),
  level_required int not null default 1 references public.workforce_levels(level),
  title text not null,
  category text not null,
  objective text not null,
  audience text,
  tone text,
  deliverable_expected text not null,
  recommended_roles text[] not null default '{}',
  credit_cost numeric not null check (credit_cost > 0),
  reward_min numeric not null check (reward_min >= 0),
  reward_max numeric not null check (reward_max >= reward_min),
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.assignment_instances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  catalogue_id uuid not null references public.assignment_catalogue(id),
  cycle_position int not null,
  status text not null default 'offered'
    check (status in ('offered','specialist_required','insufficient_credits','in_progress','completed')),
  credit_cost numeric not null,
  reward_min numeric not null,
  reward_max numeric not null,
  reward_granted numeric,
  missing_role text,
  deliverable text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.ledger_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in (
    'assignment_cost','assignment_reward','deposit','withdrawal','bonus_credit','level_upgrade'
  )),
  amount numeric not null,
  balance_after numeric not null,
  reference_id uuid,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_assignment_instances_user on public.assignment_instances(user_id);
create index if not exists idx_ledger_user on public.ledger_transactions(user_id);
create index if not exists idx_notifications_user on public.notifications(user_id);

-- ============================================================
-- RLS
-- ============================================================

alter table public.profiles enable row level security;
alter table public.ai_employees enable row level security;
alter table public.workforce_levels enable row level security;
alter table public.assignment_catalogue enable row level security;
alter table public.assignment_instances enable row level security;
alter table public.ledger_transactions enable row level security;
alter table public.notifications enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own_display_name" on public.profiles for update using (auth.uid() = id);

create policy "levels_select_all" on public.workforce_levels for select using (auth.role() = 'authenticated');
create policy "employees_select_all" on public.ai_employees for select using (auth.role() = 'authenticated');
create policy "catalogue_select_all" on public.assignment_catalogue for select using (auth.role() = 'authenticated');

create policy "assignment_instances_select_own" on public.assignment_instances for select using (auth.uid() = user_id);
create policy "ledger_select_own" on public.ledger_transactions for select using (auth.uid() = user_id);
create policy "notifications_select_own" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications for update using (auth.uid() = user_id);

-- Lecture élargie pour les administrateurs (espace de gestion), toujours en lecture seule.
create policy "profiles_select_admin" on public.profiles for select
  using (exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin));
create policy "assignment_instances_select_admin" on public.assignment_instances for select
  using (exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin));
create policy "ledger_select_admin" on public.ledger_transactions for select
  using (exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin));

-- Gestion du catalogue d'Assignments depuis l'espace de gestion (admin uniquement).
create policy "catalogue_admin_write" on public.assignment_catalogue for all
  using (exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin))
  with check (exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin));

-- Toutes les écritures (profiles.credit_balance, assignment_instances, ledger…) passent
-- exclusivement par les fonctions SECURITY DEFINER ci-dessous : aucune policy INSERT/UPDATE
-- directe n'est ouverte aux utilisateurs sur ces colonnes sensibles.

-- ============================================================
-- Auto-création du profil à l'inscription
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 1) Request Assignment — attribue la prochaine Assignment du cycle
-- ============================================================

create or replace function public.request_assignment()
returns public.assignment_instances
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_next_position int;
  v_catalogue public.assignment_catalogue;
  v_missing_role text;
  v_status text;
  v_instance public.assignment_instances;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if v_profile is null then
    raise exception 'profile_not_found';
  end if;

  v_next_position := v_profile.cycle_position + 1;
  if v_next_position > v_profile.cycle_total then
    raise exception 'cycle_completed';
  end if;

  -- Pas de répétition tant que le catalogue du niveau n'est pas épuisé
  select c.* into v_catalogue
  from public.assignment_catalogue c
  where c.status = 'active'
    and c.level_required <= v_profile.level
    and c.id not in (
      select ai.catalogue_id from public.assignment_instances ai where ai.user_id = v_profile.id
    )
  order by random()
  limit 1;

  if v_catalogue is null then
    -- catalogue épuisé pour ce niveau : on autorise la répétition
    select c.* into v_catalogue
    from public.assignment_catalogue c
    where c.status = 'active' and c.level_required <= v_profile.level
    order by random()
    limit 1;
  end if;

  if v_catalogue is null then
    raise exception 'no_assignment_available';
  end if;

  -- Vérifie si un rôle recommandé n'est couvert par aucun AI Employee débloqué au niveau du user
  select r into v_missing_role
  from unnest(v_catalogue.recommended_roles) as r
  where not exists (
    select 1 from public.ai_employees e
    where e.active and e.level_required <= v_profile.level and e.role = r
  )
  limit 1;

  if v_missing_role is not null then
    v_status := 'specialist_required';
  elsif v_profile.credit_balance < v_catalogue.credit_cost then
    v_status := 'insufficient_credits';
  else
    v_status := 'offered';
  end if;

  insert into public.assignment_instances (
    user_id, catalogue_id, cycle_position, status,
    credit_cost, reward_min, reward_max, missing_role
  ) values (
    v_profile.id, v_catalogue.id, v_next_position, v_status,
    v_catalogue.credit_cost, v_catalogue.reward_min, v_catalogue.reward_max, v_missing_role
  )
  returning * into v_instance;

  return v_instance;
end;
$$;

-- ============================================================
-- 2) Start Assignment — déduit le coût et lance l'exécution
-- ============================================================

create or replace function public.start_assignment(p_instance_id uuid)
returns public.assignment_instances
language plpgsql
security definer
set search_path = public
as $$
declare
  v_instance public.assignment_instances;
  v_profile public.profiles;
  v_new_balance numeric;
begin
  select * into v_instance from public.assignment_instances
    where id = p_instance_id and user_id = auth.uid()
    for update;
  if v_instance is null then
    raise exception 'assignment_not_found';
  end if;
  if v_instance.status not in ('offered') then
    raise exception 'assignment_not_startable';
  end if;

  select * into v_profile from public.profiles where id = auth.uid() for update;

  if v_profile.credit_balance < v_instance.credit_cost then
    update public.assignment_instances set status = 'insufficient_credits'
      where id = v_instance.id returning * into v_instance;
    return v_instance;
  end if;

  v_new_balance := v_profile.credit_balance - v_instance.credit_cost;
  update public.profiles set credit_balance = v_new_balance where id = v_profile.id;

  insert into public.ledger_transactions (user_id, type, amount, balance_after, reference_id)
  values (v_profile.id, 'assignment_cost', -v_instance.credit_cost, v_new_balance, v_instance.id);

  update public.assignment_instances
    set status = 'in_progress', started_at = now()
    where id = v_instance.id
    returning * into v_instance;

  return v_instance;
end;
$$;

-- ============================================================
-- 3) Complete Assignment — reward + ledger + cycle + notification, en une transaction
-- ============================================================

create or replace function public.complete_assignment(p_instance_id uuid, p_deliverable text)
returns public.assignment_instances
language plpgsql
security definer
set search_path = public
as $$
declare
  v_instance public.assignment_instances;
  v_profile public.profiles;
  v_reward numeric;
  v_new_balance numeric;
begin
  select * into v_instance from public.assignment_instances
    where id = p_instance_id and user_id = auth.uid()
    for update;
  if v_instance is null or v_instance.status <> 'in_progress' then
    raise exception 'assignment_not_in_progress';
  end if;

  select * into v_profile from public.profiles where id = auth.uid() for update;

  v_reward := round((v_instance.reward_min + random() * (v_instance.reward_max - v_instance.reward_min))::numeric, 2);
  v_new_balance := v_profile.credit_balance + v_reward;

  update public.profiles
    set credit_balance = v_new_balance,
        withdrawable_balance = withdrawable_balance + v_reward,
        cycle_position = greatest(cycle_position, v_instance.cycle_position)
    where id = v_profile.id;

  insert into public.ledger_transactions (user_id, type, amount, balance_after, reference_id)
  values (v_profile.id, 'assignment_reward', v_reward, v_new_balance, v_instance.id);

  update public.assignment_instances
    set status = 'completed', reward_granted = v_reward, deliverable = p_deliverable, completed_at = now()
    where id = v_instance.id
    returning * into v_instance;

  insert into public.notifications (user_id, type, title, body)
  values (v_profile.id, 'assignment_completed', 'Assignment Completed',
    'Your AI Workforce delivered the assignment. Performance reward: ' || v_reward || ' credits.');

  if v_instance.cycle_position >= v_profile.cycle_total then
    insert into public.notifications (user_id, type, title, body)
    values (v_profile.id, 'cycle_completed', 'Daily Assignment Cycle Completed',
      'Come back tomorrow for a new cycle.');
  end if;

  return v_instance;
end;
$$;

-- ============================================================
-- 4) Level Up — coût publié, jamais lié à une reward en attente
-- ============================================================

create or replace function public.level_up()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_next public.workforce_levels;
  v_new_balance numeric;
begin
  select * into v_profile from public.profiles where id = auth.uid() for update;
  select * into v_next from public.workforce_levels where level = v_profile.level + 1;
  if v_next is null then
    raise exception 'max_level_reached';
  end if;
  if v_profile.credit_balance < v_next.unlock_cost then
    raise exception 'insufficient_credits';
  end if;

  v_new_balance := v_profile.credit_balance - v_next.unlock_cost;

  update public.profiles
    set credit_balance = v_new_balance, level = v_next.level, cycle_total = v_next.assignments_per_day
    where id = v_profile.id
    returning * into v_profile;

  insert into public.ledger_transactions (user_id, type, amount, balance_after, note)
  values (v_profile.id, 'level_upgrade', -v_next.unlock_cost, v_new_balance, 'Unlocked level ' || v_next.level);

  insert into public.notifications (user_id, type, title, body)
  values (v_profile.id, 'level_up', 'Workforce Level Up', 'You reached ' || v_next.name || '.');

  return v_profile;
end;
$$;

-- ============================================================
-- 5) Admin — crédit manuel (outil support/tests, tant qu'il n'y a pas de paiement réel)
-- ============================================================

create or replace function public.admin_grant_credits(p_user_id uuid, p_amount numeric, p_note text default null)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean;
  v_profile public.profiles;
  v_new_balance numeric;
begin
  select is_admin into v_is_admin from public.profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then
    raise exception 'not_authorized';
  end if;
  if p_amount = 0 then
    raise exception 'invalid_amount';
  end if;

  select * into v_profile from public.profiles where id = p_user_id for update;
  if v_profile is null then
    raise exception 'user_not_found';
  end if;

  v_new_balance := v_profile.credit_balance + p_amount;
  update public.profiles set credit_balance = v_new_balance where id = p_user_id
    returning * into v_profile;

  insert into public.ledger_transactions (user_id, type, amount, balance_after, note)
  values (p_user_id, 'deposit', p_amount, v_new_balance, coalesce(p_note, 'Admin manual credit'));

  return v_profile;
end;
$$;
