-- WorkforceAI execution engine.
-- Assignments are queued and completed by a trusted worker, never by a browser.

alter table public.profiles
  add column if not exists cycle_started_on date not null default current_date;

alter table public.assignment_catalogue
  add column if not exists quality_target numeric not null default 85 check (quality_target between 1 and 100),
  add column if not exists estimated_execution_seconds int not null default 180 check (estimated_execution_seconds between 30 and 3600);

alter table public.assignment_instances
  add column if not exists request_key uuid,
  add column if not exists execution_job_id uuid,
  add column if not exists quality_target numeric,
  add column if not exists estimated_execution_seconds int;

-- Preserve existing user work while moving from the first MVP state model.
-- The legacy constraint does not recognize the new paused state, so remove it
-- before migrating existing rows. The revised constraint is installed below.
alter table public.assignment_instances
  drop constraint if exists assignment_instances_status_check;

update public.assignment_instances set status = 'paused' where status = 'specialist_required';
update public.assignment_instances set status = 'offered' where status = 'insufficient_credits';

alter table public.assignment_instances drop constraint if exists assignment_instances_status_check;
alter table public.assignment_instances add constraint assignment_instances_status_check
  check (status in ('offered', 'in_progress', 'paused', 'completed'));

-- The early prototype allowed multiple unfinished records per account. Retain
-- only the newest as actionable; older records remain visible as history.
with ranked_active_assignments as (
  select id, row_number() over (partition by user_id order by created_at desc, id desc) as rank
  from public.assignment_instances
  where status in ('offered', 'in_progress', 'paused')
)
update public.assignment_instances instance
set status = 'completed'
from ranked_active_assignments ranked
where instance.id = ranked.id and ranked.rank > 1;

create unique index if not exists assignment_instances_request_key_unique
  on public.assignment_instances(user_id, request_key) where request_key is not null;

create unique index if not exists assignment_instances_one_active_per_user
  on public.assignment_instances(user_id)
  where status in ('offered', 'in_progress', 'paused');

create table if not exists public.assignment_position_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  cycle_date date not null,
  cycle_position int not null check (cycle_position > 0),
  catalogue_id uuid not null references public.assignment_catalogue(id),
  active boolean not null default true,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, cycle_date, cycle_position)
);

create table if not exists public.execution_jobs (
  id uuid primary key default gen_random_uuid(),
  assignment_instance_id uuid not null unique references public.assignment_instances(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'paused', 'completed', 'retryable', 'failed')),
  idempotency_key uuid not null unique,
  attempt_count int not null default 0 check (attempt_count >= 0),
  max_attempts int not null default 3 check (max_attempts > 0),
  worker_id text,
  lease_expires_at timestamptz,
  quality_target numeric not null check (quality_target between 1 and 100),
  quality_score numeric,
  required_refill numeric not null default 0 check (required_refill >= 0),
  projected_reward numeric,
  pause_reason text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.execution_steps (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.execution_jobs(id) on delete cascade,
  employee_id uuid not null references public.ai_employees(id),
  sequence int not null check (sequence > 0),
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  input_summary text,
  output_text text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (job_id, sequence)
);

alter table public.assignment_instances
  drop constraint if exists assignment_instances_execution_job_id_fkey;
alter table public.assignment_instances
  add constraint assignment_instances_execution_job_id_fkey
  foreign key (execution_job_id) references public.execution_jobs(id) on delete set null;

create index if not exists execution_jobs_claim_index
  on public.execution_jobs(status, lease_expires_at, created_at);
create index if not exists execution_steps_job_index on public.execution_steps(job_id, sequence);
create index if not exists assignment_position_rules_lookup_index
  on public.assignment_position_rules(user_id, cycle_date, cycle_position) where active;

alter table public.assignment_position_rules enable row level security;
alter table public.execution_jobs enable row level security;
alter table public.execution_steps enable row level security;

create policy "assignment_position_rules_select_admin" on public.assignment_position_rules for select
  using (public.is_admin());
create policy "assignment_position_rules_manage_admin" on public.assignment_position_rules for all
  using (public.is_admin()) with check (public.is_admin());
create policy "execution_jobs_select_own" on public.execution_jobs for select using (auth.uid() = user_id);
create policy "execution_jobs_select_admin" on public.execution_jobs for select using (public.is_admin());
create policy "execution_steps_select_own" on public.execution_steps for select
  using (exists (select 1 from public.execution_jobs j where j.id = job_id and j.user_id = auth.uid()));
create policy "execution_steps_select_admin" on public.execution_steps for select using (public.is_admin());

-- A cycle is reset only after the previous calendar day and only when no execution is active.
create or replace function public.request_assignment(p_idempotency_key uuid)
returns public.assignment_instances
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_existing public.assignment_instances;
  v_catalogue public.assignment_catalogue;
  v_rule public.assignment_position_rules;
  v_position int;
  v_instance public.assignment_instances;
begin
  if p_idempotency_key is null then
    raise exception 'idempotency_key_required';
  end if;

  select * into v_existing from public.assignment_instances
    where user_id = auth.uid() and request_key = p_idempotency_key;
  if v_existing is not null then return v_existing; end if;

  select * into v_profile from public.profiles where id = auth.uid() for update;
  if v_profile is null then raise exception 'profile_not_found'; end if;

  select * into v_existing from public.assignment_instances
    where user_id = v_profile.id and status in ('offered', 'in_progress', 'paused')
    order by created_at desc limit 1;
  if v_existing is not null then raise exception 'active_assignment_exists'; end if;

  if v_profile.cycle_started_on < current_date then
    update public.profiles set cycle_position = 0, cycle_started_on = current_date where id = v_profile.id
      returning * into v_profile;
  end if;

  v_position := v_profile.cycle_position + 1;
  if v_position > v_profile.cycle_total then raise exception 'cycle_completed'; end if;

  select * into v_rule from public.assignment_position_rules
    where user_id = v_profile.id and cycle_date = v_profile.cycle_started_on
      and cycle_position = v_position and active
    for update;

  if v_rule is not null then
    select * into v_catalogue from public.assignment_catalogue
      where id = v_rule.catalogue_id and status = 'active';
  else
    select c.* into v_catalogue from public.assignment_catalogue c
      where c.status = 'active' and c.level_required <= v_profile.level
        and c.id not in (select catalogue_id from public.assignment_instances where user_id = v_profile.id)
      order by random() limit 1;
    if v_catalogue is null then
      select c.* into v_catalogue from public.assignment_catalogue c
        where c.status = 'active' and c.level_required <= v_profile.level
        order by random() limit 1;
    end if;
  end if;
  if v_catalogue is null then raise exception 'no_assignment_available'; end if;

  insert into public.assignment_instances (
    user_id, catalogue_id, cycle_position, status, credit_cost, reward_min, reward_max,
    request_key, quality_target, estimated_execution_seconds
  ) values (
    v_profile.id, v_catalogue.id, v_position, 'offered', v_catalogue.credit_cost,
    v_catalogue.reward_min, v_catalogue.reward_max, p_idempotency_key,
    v_catalogue.quality_target, v_catalogue.estimated_execution_seconds
  ) returning * into v_instance;

  if v_rule is not null then
    update public.assignment_position_rules set active = false, consumed_at = now() where id = v_rule.id;
  end if;
  return v_instance;
end;
$$;

-- User-facing start: atomically engages credits and creates exactly one durable job.
create or replace function public.enqueue_assignment_execution(p_instance_id uuid, p_idempotency_key uuid)
returns public.execution_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_instance public.assignment_instances;
  v_profile public.profiles;
  v_job public.execution_jobs;
  v_bonus_used numeric;
  v_balance_used numeric;
  v_new_balance numeric;
  v_new_bonus numeric;
begin
  if p_idempotency_key is null then raise exception 'idempotency_key_required'; end if;
  select * into v_job from public.execution_jobs where idempotency_key = p_idempotency_key;
  if v_job is not null then return v_job; end if;

  select * into v_instance from public.assignment_instances
    where id = p_instance_id and user_id = auth.uid() for update;
  if v_instance is null then raise exception 'assignment_not_found'; end if;
  if v_instance.status <> 'offered' then raise exception 'assignment_not_startable'; end if;

  select * into v_profile from public.profiles where id = auth.uid() for update;
  if v_profile.credit_balance + v_profile.bonus_credits < v_instance.credit_cost then
    raise exception 'insufficient_credits';
  end if;

  v_bonus_used := least(v_profile.bonus_credits, v_instance.credit_cost);
  v_balance_used := v_instance.credit_cost - v_bonus_used;
  v_new_balance := v_profile.credit_balance - v_balance_used;
  v_new_bonus := v_profile.bonus_credits - v_bonus_used;
  update public.profiles set credit_balance = v_new_balance, bonus_credits = v_new_bonus where id = v_profile.id;
  insert into public.ledger_transactions (user_id, type, amount, balance_after, reference_id, note)
    values (v_profile.id, 'assignment_cost', -v_instance.credit_cost, v_new_balance, v_instance.id,
      case when v_bonus_used > 0 then v_bonus_used || ' bonus credits used' else null end);

  insert into public.execution_jobs (assignment_instance_id, user_id, idempotency_key, quality_target, projected_reward)
    values (v_instance.id, v_profile.id, p_idempotency_key, coalesce(v_instance.quality_target, 85), v_instance.reward_max)
    returning * into v_job;
  update public.assignment_instances set status = 'in_progress', execution_job_id = v_job.id, started_at = now()
    where id = v_instance.id;
  insert into public.execution_steps (job_id, employee_id, sequence)
    select v_job.id, e.id, row_number() over (order by e.level_required, e.name)::int
    from public.ai_employees e
    join public.assignment_catalogue c on c.id = v_instance.catalogue_id
    where e.active and e.level_required <= v_profile.level and e.role = any(c.recommended_roles);
  return v_job;
end;
$$;

-- Workers claim a job with a lease. SKIP LOCKED prevents two workers from processing it.
create or replace function public.claim_execution_job(p_worker_id text, p_lease_seconds int default 600)
returns public.execution_jobs
language plpgsql
security definer
set search_path = public
as $$
declare v_job public.execution_jobs;
begin
  if auth.role() <> 'service_role' then raise exception 'not_authorized'; end if;
  with candidate as (
    select id from public.execution_jobs
      where status in ('queued', 'retryable')
        or (status = 'running' and lease_expires_at < now())
      order by created_at
      for update skip locked
      limit 1
  )
  update public.execution_jobs j set
    status = 'running', worker_id = p_worker_id, lease_expires_at = now() + make_interval(secs => p_lease_seconds),
    attempt_count = j.attempt_count + 1, started_at = coalesce(j.started_at, now()), updated_at = now(), error_message = null
  from candidate where j.id = candidate.id returning j.* into v_job;
  return v_job;
end;
$$;

create or replace function public.complete_execution_job(p_job_id uuid, p_deliverable text, p_quality_score numeric)
returns public.execution_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.execution_jobs;
  v_instance public.assignment_instances;
  v_profile public.profiles;
  v_reward numeric;
  v_new_balance numeric;
  v_next_cost numeric;
  v_refill numeric := 0;
  v_missing_role text;
  v_team_bonus numeric := 0;
begin
  if auth.role() <> 'service_role' then raise exception 'not_authorized'; end if;
  select * into v_job from public.execution_jobs where id = p_job_id for update;
  if v_job is null then raise exception 'job_not_found'; end if;
  if v_job.status = 'completed' then return v_job; end if;
  if v_job.status <> 'running' then raise exception 'job_not_running'; end if;
  select * into v_instance from public.assignment_instances where id = v_job.assignment_instance_id for update;
  select * into v_profile from public.profiles where id = v_job.user_id for update;

  if p_quality_score < v_job.quality_target then
    select e.role into v_missing_role from public.ai_employees e
      join public.assignment_catalogue c on c.id = v_instance.catalogue_id
      where e.role = any(c.recommended_roles) and e.level_required > v_profile.level
      order by e.level_required limit 1;
    select unlock_cost into v_next_cost from public.workforce_levels
      where level = v_profile.level + 1;
    -- The refill is the published upgrade cost needed to activate the next capacity tier.
    v_refill := coalesce(v_next_cost, 0);
    update public.execution_jobs set status = 'paused', quality_score = p_quality_score,
      required_refill = v_refill, pause_reason = coalesce(v_missing_role, 'Additional execution capacity is required'),
      lease_expires_at = null, updated_at = now() where id = v_job.id returning * into v_job;
    update public.assignment_instances set status = 'paused', missing_role = v_missing_role where id = v_instance.id;
    insert into public.notifications (user_id, type, title, body)
      values (v_profile.id, 'execution_paused', 'Execution Paused', 'Additional resources are required to reach the target quality level.');
    return v_job;
  end if;

  if v_profile.team_id is not null then
    select least(25, count(*)) into v_team_bonus
      from public.assignment_instances ai
      join public.profiles p on p.id = ai.user_id
      where p.team_id = v_profile.team_id and ai.status = 'completed'
        and ai.completed_at >= date_trunc('day', now());
  end if;
  v_reward := round(
    (v_instance.reward_min + (v_instance.reward_max - v_instance.reward_min)
      * least(1, greatest(0, p_quality_score / 100.0))) * (1 + v_team_bonus / 100.0),
    2
  );
  v_new_balance := v_profile.credit_balance + v_reward;
  update public.profiles set credit_balance = v_new_balance,
    withdrawable_balance = withdrawable_balance + v_reward,
    cycle_position = greatest(cycle_position, v_instance.cycle_position) where id = v_profile.id;
  insert into public.ledger_transactions (user_id, type, amount, balance_after, reference_id, note)
    values (v_profile.id, 'assignment_reward', v_reward, v_new_balance, v_instance.id, 'Reward calculated from verified quality score');
  update public.assignment_instances set status = 'completed', reward_granted = v_reward,
    deliverable = p_deliverable, completed_at = now() where id = v_instance.id;
  update public.execution_jobs set status = 'completed', quality_score = p_quality_score,
    completed_at = now(), lease_expires_at = null, updated_at = now() where id = v_job.id returning * into v_job;
  insert into public.notifications (user_id, type, title, body)
    values (v_profile.id, 'assignment_completed', 'Assignment Completed', 'Your AI Workforce delivered the assignment.');
  return v_job;
end;
$$;

create or replace function public.retry_execution_job(p_job_id uuid, p_error_message text)
returns public.execution_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.execution_jobs;
begin
  if auth.role() <> 'service_role' then raise exception 'not_authorized'; end if;
  select * into v_job from public.execution_jobs where id = p_job_id for update;
  if v_job is null then raise exception 'job_not_found'; end if;
  update public.execution_jobs set status = case when v_job.attempt_count >= v_job.max_attempts then 'paused' else 'retryable' end,
    error_message = left(coalesce(p_error_message, 'Execution retry required'), 1000), lease_expires_at = null, updated_at = now()
    where id = v_job.id returning * into v_job;
  if v_job.status = 'paused' then
    update public.assignment_instances set status = 'paused' where id = v_job.assignment_instance_id;
    insert into public.notifications (user_id, type, title, body)
      values (v_job.user_id, 'execution_paused', 'Execution Paused', 'The execution can be resumed when resources are available.');
  end if;
  return v_job;
end;
$$;

create or replace function public.resume_execution_job(p_job_id uuid)
returns public.execution_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.execution_jobs;
  v_profile public.profiles;
  v_instance public.assignment_instances;
begin
  select * into v_job from public.execution_jobs where id = p_job_id and user_id = auth.uid() for update;
  if v_job is null or v_job.status <> 'paused' then raise exception 'execution_not_resumable'; end if;
  select * into v_profile from public.profiles where id = auth.uid() for update;
  select * into v_instance from public.assignment_instances where id = v_job.assignment_instance_id for update;
  if v_instance.missing_role is not null and not exists (
    select 1 from public.ai_employees
      where role = v_instance.missing_role and active and level_required <= v_profile.level
  ) then
    raise exception 'required_specialist_not_active';
  end if;
  delete from public.execution_steps where job_id = v_job.id;
  insert into public.execution_steps (job_id, employee_id, sequence)
    select v_job.id, e.id, row_number() over (order by e.level_required, e.name)::int
    from public.ai_employees e
    join public.assignment_catalogue c on c.id = v_instance.catalogue_id
    where e.active and e.level_required <= v_profile.level and e.role = any(c.recommended_roles);
  update public.execution_jobs set status = 'queued', required_refill = 0, pause_reason = null,
    error_message = null, updated_at = now() where id = v_job.id returning * into v_job;
  update public.assignment_instances set status = 'in_progress' where id = v_job.assignment_instance_id;
  return v_job;
end;
$$;

create or replace function public.admin_schedule_assignment(
  p_user_id uuid,
  p_catalogue_id uuid,
  p_cycle_date date,
  p_cycle_position int
)
returns public.assignment_position_rules
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_catalogue public.assignment_catalogue;
  v_rule public.assignment_position_rules;
begin
  if not public.is_admin() then raise exception 'not_authorized'; end if;
  if p_cycle_date is null or p_cycle_position < 1 then raise exception 'invalid_cycle_position'; end if;
  select * into v_profile from public.profiles where id = p_user_id for update;
  if v_profile is null then raise exception 'user_not_found'; end if;
  if p_cycle_position > v_profile.cycle_total then raise exception 'cycle_position_exceeds_user_limit'; end if;
  select * into v_catalogue from public.assignment_catalogue where id = p_catalogue_id and status = 'active';
  if v_catalogue is null then raise exception 'assignment_not_available'; end if;
  if v_catalogue.level_required > v_profile.level then raise exception 'assignment_level_exceeds_user_level'; end if;
  insert into public.assignment_position_rules (user_id, catalogue_id, cycle_date, cycle_position, active, consumed_at)
    values (p_user_id, p_catalogue_id, p_cycle_date, p_cycle_position, true, null)
  on conflict (user_id, cycle_date, cycle_position) do update set
    catalogue_id = excluded.catalogue_id, active = true, consumed_at = null
  returning * into v_rule;
  return v_rule;
end;
$$;

revoke execute on function public.complete_assignment(uuid, text) from public, anon, authenticated;
revoke execute on function public.start_assignment(uuid) from public, anon, authenticated;
revoke execute on function public.request_assignment() from public, anon, authenticated;
revoke execute on function public.request_assignment(uuid) from public;
revoke execute on function public.enqueue_assignment_execution(uuid, uuid) from public;
revoke execute on function public.claim_execution_job(text, int) from public;
revoke execute on function public.complete_execution_job(uuid, text, numeric) from public;
revoke execute on function public.retry_execution_job(uuid, text) from public;
revoke execute on function public.resume_execution_job(uuid) from public;
revoke execute on function public.admin_schedule_assignment(uuid, uuid, date, int) from public;
grant execute on function public.request_assignment(uuid) to authenticated;
grant execute on function public.enqueue_assignment_execution(uuid, uuid) to authenticated;
grant execute on function public.claim_execution_job(text, int) to service_role;
grant execute on function public.complete_execution_job(uuid, text, numeric) to service_role;
grant execute on function public.retry_execution_job(uuid, text) to service_role;
grant execute on function public.resume_execution_job(uuid) to authenticated;
grant execute on function public.admin_schedule_assignment(uuid, uuid, date, int) to authenticated;

-- Realtime only publishes committed database state. The frontend refreshes from this source.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then alter publication supabase_realtime add table public.profiles; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'assignment_instances'
  ) then alter publication supabase_realtime add table public.assignment_instances; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'execution_jobs'
  ) then alter publication supabase_realtime add table public.execution_jobs; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'execution_steps'
  ) then alter publication supabase_realtime add table public.execution_steps; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then alter publication supabase_realtime add table public.notifications; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ledger_transactions'
  ) then alter publication supabase_realtime add table public.ledger_transactions; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'deposit_requests'
  ) then alter publication supabase_realtime add table public.deposit_requests; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'withdrawal_requests'
  ) then alter publication supabase_realtime add table public.withdrawal_requests; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'assignment_position_rules'
  ) then alter publication supabase_realtime add table public.assignment_position_rules; end if;
end;
$$;
