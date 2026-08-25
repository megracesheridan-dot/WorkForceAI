-- AI Arena — Teams : équipes, bonus collectif réel appliqué aux rewards.
-- Suit le même principe que le reste du schéma : toute écriture sensible passe par une
-- fonction SECURITY DEFINER, jamais de policy INSERT/UPDATE ouverte côté client.

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists team_id uuid references public.teams(id);

alter table public.teams enable row level security;

-- ============================================================
-- Helper SECURITY DEFINER — évite toute policy qui referait un
-- `select ... from profiles` (source de la récursion RLS corrigée en 0002).
-- ============================================================

create or replace function public.my_team_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select team_id from public.profiles where id = auth.uid();
$$;

create policy "teams_select_own" on public.teams for select
  using (id = public.my_team_id());

create policy "profiles_select_teammates" on public.profiles for select
  using (team_id is not null and team_id = public.my_team_id());

-- Nombre d'Assignments complétées aujourd'hui par l'équipe (pour l'affichage du bonus
-- côté frontend). SECURITY DEFINER : pas de policy exposant les assignment_instances
-- des coéquipiers, seul ce compte agrégé est accessible.
create or replace function public.team_completed_today(p_team_id uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int
  from public.assignment_instances ai
  join public.profiles p on p.id = ai.user_id
  where p.team_id = p_team_id
    and ai.status = 'completed'
    and ai.completed_at >= date_trunc('day', now());
$$;

-- ============================================================
-- 1) Create Team
-- ============================================================

create or replace function public.create_team(p_name text)
returns public.teams
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_team public.teams;
  v_code text;
begin
  select * into v_profile from public.profiles where id = auth.uid() for update;
  if v_profile.team_id is not null then
    raise exception 'already_in_team';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'invalid_name';
  end if;

  loop
    v_code := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from public.teams where invite_code = v_code);
  end loop;

  insert into public.teams (name, invite_code, created_by)
  values (trim(p_name), v_code, v_profile.id)
  returning * into v_team;

  update public.profiles set team_id = v_team.id where id = v_profile.id;

  return v_team;
end;
$$;

-- ============================================================
-- 2) Join Team
-- ============================================================

create or replace function public.join_team(p_invite_code text)
returns public.teams
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_team public.teams;
begin
  select * into v_profile from public.profiles where id = auth.uid() for update;
  if v_profile.team_id is not null then
    raise exception 'already_in_team';
  end if;

  select * into v_team from public.teams where invite_code = upper(trim(p_invite_code));
  if v_team is null then
    raise exception 'invalid_invite_code';
  end if;

  update public.profiles set team_id = v_team.id where id = v_profile.id;

  return v_team;
end;
$$;

-- ============================================================
-- 3) Leave Team
-- ============================================================

create or replace function public.leave_team()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set team_id = null where id = auth.uid();
end;
$$;

-- ============================================================
-- 4) Bonus d'équipe dans complete_assignment : +1% par Assignment complétée
--    aujourd'hui par l'équipe (soi-même inclus), plafonné à 25%.
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
  v_bonus_pct numeric := 0;
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

  if v_profile.team_id is not null then
    select least(25, count(*)) into v_bonus_pct
    from public.assignment_instances ai
    join public.profiles p on p.id = ai.user_id
    where p.team_id = v_profile.team_id
      and ai.status = 'completed'
      and ai.completed_at >= date_trunc('day', now());
    v_reward := round(v_reward * (1 + v_bonus_pct / 100.0), 2);
  end if;

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
