-- AI Arena — Rewarded Ads : petit filet de relance quotidien, encadré.
-- Rend aussi les Bonus Credits réellement dépensables sur les Assignments —
-- jusqu'ici ils existaient sur le profil mais aucune fonction ne les
-- utilisait, ce qui en faisait un chiffre décoratif plutôt qu'une vraie
-- monnaie secondaire (voir blueprint : "Bonus Credits utilisables pour
-- lancer des Assignments, non retirables directement").

-- ============================================================
-- 0) Combien de claims Rewarded Ads aujourd'hui — réutilisé par la
--    fonction de claim (limite) et par le frontend (affichage du quota).
-- ============================================================

create or replace function public.rewarded_ads_claimed_today()
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int
  from public.ledger_transactions
  where user_id = auth.uid()
    and type = 'bonus_credit'
    and note = 'rewarded_ad'
    and created_at >= date_trunc('day', now());
$$;

-- ============================================================
-- 1) Claim Rewarded Ad — 3 par jour max, jamais retirable
--    (crédité sur bonus_credits, pas credit_balance ni withdrawable_balance).
-- ============================================================

drop function if exists public.claim_rewarded_ad();

create function public.claim_rewarded_ad()
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_claimed_today int;
  v_amount numeric;
  v_new_bonus numeric;
begin
  select public.rewarded_ads_claimed_today() into v_claimed_today;
  if v_claimed_today >= 3 then
    raise exception 'daily_limit_reached';
  end if;

  select * into v_profile from public.profiles where id = auth.uid() for update;

  v_amount := round((2 + random() * 3)::numeric, 2);
  v_new_bonus := v_profile.bonus_credits + v_amount;

  update public.profiles set bonus_credits = v_new_bonus where id = v_profile.id;

  insert into public.ledger_transactions (user_id, type, amount, balance_after, note)
  values (v_profile.id, 'bonus_credit', v_amount, v_new_bonus, 'rewarded_ad');

  return v_amount;
end;
$$;

-- ============================================================
-- 2) request_assignment / start_assignment — le coût peut désormais être
--    couvert par credit_balance + bonus_credits combinés (bonus_credits
--    dépensé en priorité, puisque c'est la monnaie "à utiliser vite").
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
    select c.* into v_catalogue
    from public.assignment_catalogue c
    where c.status = 'active' and c.level_required <= v_profile.level
    order by random()
    limit 1;
  end if;

  if v_catalogue is null then
    raise exception 'no_assignment_available';
  end if;

  select r into v_missing_role
  from unnest(v_catalogue.recommended_roles) as r
  where not exists (
    select 1 from public.ai_employees e
    where e.active and e.level_required <= v_profile.level and e.role = r
  )
  limit 1;

  if v_missing_role is not null then
    v_status := 'specialist_required';
  elsif (v_profile.credit_balance + v_profile.bonus_credits) < v_catalogue.credit_cost then
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

create or replace function public.start_assignment(p_instance_id uuid)
returns public.assignment_instances
language plpgsql
security definer
set search_path = public
as $$
declare
  v_instance public.assignment_instances;
  v_profile public.profiles;
  v_total_available numeric;
  v_bonus_used numeric;
  v_balance_used numeric;
  v_new_balance numeric;
  v_new_bonus numeric;
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

  v_total_available := v_profile.credit_balance + v_profile.bonus_credits;
  if v_total_available < v_instance.credit_cost then
    update public.assignment_instances set status = 'insufficient_credits'
      where id = v_instance.id returning * into v_instance;
    return v_instance;
  end if;

  v_bonus_used := least(v_profile.bonus_credits, v_instance.credit_cost);
  v_balance_used := v_instance.credit_cost - v_bonus_used;
  v_new_balance := v_profile.credit_balance - v_balance_used;
  v_new_bonus := v_profile.bonus_credits - v_bonus_used;

  update public.profiles
    set credit_balance = v_new_balance, bonus_credits = v_new_bonus
    where id = v_profile.id;

  insert into public.ledger_transactions (user_id, type, amount, balance_after, reference_id, note)
  values (
    v_profile.id, 'assignment_cost', -v_instance.credit_cost, v_new_balance, v_instance.id,
    case when v_bonus_used > 0 then v_bonus_used || ' bonus credits inclus' else null end
  );

  update public.assignment_instances
    set status = 'in_progress', started_at = now()
    where id = v_instance.id
    returning * into v_instance;

  return v_instance;
end;
$$;
