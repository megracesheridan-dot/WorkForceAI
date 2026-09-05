-- Renforce le roster d'AI Employees (icône par spécialité, lecture publique pour le
-- site vitrine) et ajoute deux tables de contenu gérables depuis l'espace de gestion :
-- site_settings (textes du site + contacts) et partner_logos (logos partenaires —
-- vide par défaut, la section vitrine ne s'affiche que si des lignes actives existent,
-- pour ne jamais afficher de faux partenariats).

-- ============================================================
-- AI Employees — icône + accès public en lecture
-- ============================================================

alter table public.ai_employees add column if not exists icon text not null default 'Bot';

update public.ai_employees set icon = 'Search' where name = 'Nova';
update public.ai_employees set icon = 'PenTool' where name = 'Reed';
update public.ai_employees set icon = 'Target' where name = 'Sable';
update public.ai_employees set icon = 'Palette' where name = 'Iris';
update public.ai_employees set icon = 'CalendarDays' where name = 'Cole';
update public.ai_employees set icon = 'BarChart3' where name = 'Dana';
update public.ai_employees set icon = 'ShoppingCart' where name = 'Milo';
update public.ai_employees set icon = 'Clapperboard' where name = 'Vera';
update public.ai_employees set icon = 'Workflow' where name = 'Theo';
update public.ai_employees set icon = 'Film' where name = 'Lior';

insert into public.ai_employees
  (name, role, specialty, level_required, execution_capacity, precision_rate, speed_index, synergy_bonus, icon)
values
  ('Kai', 'Community Manager', 'Animation communautaire et support client', 1, 71, 0.90, 1.0, 0.05, 'MessageCircle'),
  ('Priya', 'SEO Specialist', 'Référencement et stratégie de mots-clés', 1, 73, 0.91, 0.9, 0.05, 'Search'),
  ('Owen', 'Email Marketer', 'Séquences email et newsletters', 1, 70, 0.90, 1.0, 0.05, 'Mail'),
  ('Zara', 'Social Media Manager', 'Calendrier éditorial et publication multi-réseaux', 2, 77, 0.91, 1.1, 0.06, 'Share2'),
  ('Nadia', 'UX Writer', 'Microcopy et parcours utilisateur', 2, 75, 0.92, 1.0, 0.06, 'PenLine'),
  ('Felix', 'Growth Hacker', 'Tests A/B et acquisition', 3, 83, 0.90, 1.2, 0.08, 'TrendingUp'),
  ('Yuki', 'Motion Designer', 'Animations et vidéos courtes', 3, 81, 0.92, 0.9, 0.07, 'Sparkles'),
  ('Omar', 'Product Marketer', 'Positionnement produit et go-to-market', 4, 87, 0.93, 1.0, 0.09, 'Rocket'),
  ('Ines', 'PR Specialist', 'Relations presse et communiqués', 4, 86, 0.92, 0.9, 0.08, 'Megaphone'),
  ('Kenji', 'Chief Strategy Officer', 'Stratégie business globale et arbitrages', 5, 93, 0.96, 0.9, 0.11, 'Crown'),
  ('Selene', 'Enterprise Consultant', 'Missions complexes multi-équipes', 5, 91, 0.95, 1.0, 0.1, 'Building2'),
  ('Aria', 'Localization Expert', 'Adaptation multilingue et culturelle', 5, 89, 0.94, 1.0, 0.1, 'Globe')
on conflict do nothing;

drop policy if exists "employees_select_all" on public.ai_employees;
create policy "employees_select_all" on public.ai_employees for select using (true);
create policy "employees_admin_write" on public.ai_employees for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- Site Settings — textes du site vitrine + contacts, éditable par l'admin
-- ============================================================

create table if not exists public.site_settings (
  id boolean primary key default true check (id),
  hero_title text not null default 'Build your AI Workforce. Complete Assignments. Earn Rewards.',
  hero_subtitle text not null default 'Recrute des AI Employees, assigne-leur des missions business réelles et génère des Performance Rewards.',
  contact_email text,
  contact_phone text,
  contact_address text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (true) on conflict (id) do nothing;

alter table public.site_settings enable row level security;
create policy "site_settings_select_all" on public.site_settings for select using (true);
create policy "site_settings_admin_write" on public.site_settings for update
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- Partner Logos — vide par défaut, section vitrine masquée tant qu'aucune ligne
-- active n'existe (jamais de logo affiché sans vrai partenariat).
-- ============================================================

create table if not exists public.partner_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_path text not null,
  website_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.partner_logos enable row level security;
create policy "partner_logos_select_active_or_admin" on public.partner_logos for select
  using (active or public.is_admin());
create policy "partner_logos_admin_write" on public.partner_logos for all
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('partner-logos', 'partner-logos', true)
on conflict (id) do nothing;

drop policy if exists "partner_logos_storage_select_public" on storage.objects;
create policy "partner_logos_storage_select_public" on storage.objects for select
  using (bucket_id = 'partner-logos');

drop policy if exists "partner_logos_storage_admin_write" on storage.objects;
create policy "partner_logos_storage_admin_write" on storage.objects for all
  using (bucket_id = 'partner-logos' and public.is_admin())
  with check (bucket_id = 'partner-logos' and public.is_admin());
