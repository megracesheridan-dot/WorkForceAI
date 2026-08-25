-- AI Arena — données de démarrage (niveaux, employés, catalogue d'Assignments)
-- À exécuter après 0001_init.sql. Idempotent (on nettoie puis on réinsère).

truncate table public.assignment_instances, public.ledger_transactions, public.notifications restart identity cascade;
delete from public.assignment_catalogue;
delete from public.ai_employees;
delete from public.workforce_levels;

-- ============================================================
-- Niveaux
-- ============================================================
insert into public.workforce_levels (level, name, employees_count, assignments_per_day, unlock_cost, description) values
  (1, 'Starter Operator', 6,  15, 0,    'Workforce de départ, Assignments standards.'),
  (2, 'Arena Builder',    9,  18, 400,  'Meilleure Team Synergy, employés supplémentaires.'),
  (3, 'Mission Pro',      12, 20, 900,  'Premières Assignments premium.'),
  (4, 'Workforce Elite',  15, 22, 1600, 'Employés seniors, rewards plus élevées.'),
  (5, 'Arena Partner',    18, 25, 2600, 'Assignments haute valeur, bonus Team.');

-- ============================================================
-- AI Employees
-- ============================================================
insert into public.ai_employees (name, role, specialty, level_required, execution_capacity, precision_rate, speed_index, synergy_bonus) values
  ('Nova',   'Research Assistant',   'Analyse de marché et audiences',        1, 70, 0.90, 1.0, 0.05),
  ('Reed',   'Copywriter',           'Rédaction publicitaire et scripts',      1, 72, 0.91, 1.1, 0.05),
  ('Sable',  'Strategy Analyst',     'Positionnement et alignement business',  1, 68, 0.89, 0.9, 0.06),
  ('Iris',   'Brand Designer',       'Direction visuelle et identité',         2, 76, 0.92, 1.0, 0.07),
  ('Cole',   'Campaign Planner',     'Plans de campagne multicanal',           2, 78, 0.90, 1.0, 0.06),
  ('Dana',   'Data Analyst',         'Reporting et indicateurs de performance',2, 80, 0.93, 0.9, 0.05),
  ('Milo',   'Conversion Specialist','Funnels et optimisation e-commerce',     3, 82, 0.91, 1.1, 0.08),
  ('Vera',   'Video Director',       'Concepts vidéo et storyboards',          3, 84, 0.90, 0.8, 0.07),
  ('Theo',   'Automation Engineer',  'Workflows et intégrations',              4, 88, 0.94, 1.0, 0.09),
  ('Lior',   'Senior Cinematic Specialist', 'Production vidéo premium',        4, 90, 0.95, 0.9, 0.10);

-- ============================================================
-- Catalogue d'Assignments (échantillon de démarrage — extensible depuis l'admin)
-- ============================================================
insert into public.assignment_catalogue
  (level_required, title, category, objective, audience, tone, deliverable_expected, recommended_roles, credit_cost, reward_min, reward_max) values

  (1, 'Social Media Launch Post', 'social media',
   'Rédiger 3 variantes d''un post de lancement produit pour Instagram/LinkedIn.',
   'Prospects B2C 25-40 ans', 'Énergique, direct',
   'Trois textes de post prêts à publier + suggestion de visuel.',
   array['Copywriter','Research Assistant'], 20, 5, 9),

  (1, 'Competitor Snapshot', 'market research',
   'Produire une synthèse comparative de 3 concurrents directs.',
   'Équipe fondatrice', 'Analytique, factuel',
   'Tableau comparatif + 5 recommandations.',
   array['Research Assistant','Strategy Analyst'], 25, 6, 11),

  (1, 'Welcome Email Sequence', 'email',
   'Rédiger une séquence de 3 emails de bienvenue pour nouveaux abonnés.',
   'Nouveaux inscrits newsletter', 'Chaleureux, professionnel',
   '3 emails complets avec objets.',
   array['Copywriter'], 22, 5, 10),

  (2, 'Ad Script — Short Form Video', 'ad script',
   'Écrire un script publicitaire de 30 secondes pour TikTok/Reels.',
   'Jeunes actifs urbains', 'Percutant, moderne',
   'Script scène par scène + accroche.',
   array['Copywriter','Video Director'], 40, 9, 16),

  (2, 'Brand Positioning Brief', 'branding',
   'Clarifier le positionnement de marque en une page.',
   'Direction marketing', 'Stratégique',
   'Document de positionnement (mission, différenciation, ton).',
   array['Strategy Analyst','Brand Designer'], 45, 10, 18),

  (2, 'Sales Funnel Audit', 'sales funnel',
   'Identifier les points de friction d''un tunnel de vente e-commerce.',
   'Responsable e-commerce', 'Analytique',
   'Rapport d''audit + 5 optimisations priorisées.',
   array['Conversion Specialist','Data Analyst'], 48, 11, 19),

  (3, 'Premium Product Launch Strategy', 'product launch',
   'Construire une stratégie de lancement pour un produit premium.',
   'Consommateurs premium 30-50 ans', 'Haut de gamme, confiant',
   'Plan de lancement (canaux, calendrier, messages clés).',
   array['Strategy Analyst','Campaign Planner','Research Assistant'], 65, 15, 24),

  (3, 'E-commerce Conversion Optimization', 'e-commerce',
   'Proposer un plan d''optimisation de la page produit.',
   'Visiteurs mobile', 'Orienté résultats',
   'Liste d''actions priorisées + estimation d''impact.',
   array['Conversion Specialist','Data Analyst'], 60, 14, 22),

  (3, 'Streaming Campaign Concept', 'video campaign',
   'Créer un concept de campagne promo 45 secondes pour un lancement streaming premium.',
   'Jeunes professionnels, abonnés premium', 'Cinématique, aspirationnel',
   'Concept créatif + script direction + accroche de conversion.',
   array['Video Director','Copywriter','Strategy Analyst'], 70, 16, 26),

  (4, 'VIP Promotional Campaign', 'vip campaign',
   'Concevoir une campagne promotionnelle VIP multicanal haut de gamme.',
   'Clients VIP existants', 'Exclusif, personnalisé',
   'Plan de campagne complet + assets créatifs premium.',
   array['Senior Cinematic Specialist','Campaign Planner','Brand Designer'], 95, 22, 34),

  (4, 'AI Automation Workflow Design', 'automation',
   'Concevoir un workflow d''automatisation marketing multi-outils.',
   'Équipe growth', 'Technique, précis',
   'Schéma de workflow + spécification des déclencheurs.',
   array['Automation Engineer','Data Analyst'], 90, 21, 32);
