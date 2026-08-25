-- Fix : "infinite recursion detected in policy for relation profiles" (Postgres 42P17).
-- Les policies admin faisaient `select ... from public.profiles` depuis une policy
-- définie sur profiles (ou référençant profiles) : cela redéclenche l'évaluation RLS
-- sur la même policy, en boucle infinie. Une fonction SECURITY DEFINER contourne le
-- déclenchement RLS pour cette vérification interne et casse la récursion.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles for select
  using (public.is_admin());

drop policy if exists "assignment_instances_select_admin" on public.assignment_instances;
create policy "assignment_instances_select_admin" on public.assignment_instances for select
  using (public.is_admin());

drop policy if exists "ledger_select_admin" on public.ledger_transactions;
create policy "ledger_select_admin" on public.ledger_transactions for select
  using (public.is_admin());

drop policy if exists "catalogue_admin_write" on public.assignment_catalogue;
create policy "catalogue_admin_write" on public.assignment_catalogue for all
  using (public.is_admin())
  with check (public.is_admin());
