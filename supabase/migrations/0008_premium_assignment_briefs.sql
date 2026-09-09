-- Replaces generic micro-tasks with structured, client-style production briefs.
alter table public.assignment_catalogue
  add column if not exists brief_context jsonb not null default '{}'::jsonb;

create or replace function public.apply_premium_assignment_briefs()
returns void
language plpgsql
as $$
begin

update public.assignment_catalogue set
  title = 'Founder Narrative Launch Kit', category = 'brand launch',
  objective = 'Create the strategic narrative and launch communication kit for a venture-backed consumer brand entering a competitive new market.',
  audience = 'Early adopters and category-aware consumers, 25-40', tone = 'Decisive, modern, premium',
  deliverable_expected = 'Launch narrative, audience insight summary, three campaign angles and a publication-ready flagship message.',
  recommended_roles = array['Research Assistant','Strategy Analyst','Copywriter'], quality_target = 86, estimated_execution_seconds = 180,
  brief_context = jsonb_build_object('client','Confidential consumer brand','market_scope','New-market launch','success_criteria','Clear narrative, differentiated position and actionable campaign angles','delivery_format','Executive launch kit')
where title = 'Social Media Launch Post';

update public.assignment_catalogue set
  title = 'Market Entry Intelligence Dossier', category = 'market intelligence',
  objective = 'Prepare a decision-grade market entry dossier for a company assessing a new regional opportunity.',
  audience = 'Executive leadership and growth team', tone = 'Precise, evidence-led, strategic',
  deliverable_expected = 'Market landscape, competitor positioning, opportunity map, priority risks and recommended entry thesis.',
  recommended_roles = array['Research Assistant','Strategy Analyst'], quality_target = 88, estimated_execution_seconds = 180,
  brief_context = jsonb_build_object('client','Confidential growth company','market_scope','Regional expansion','success_criteria','Decision-ready analysis with a defensible entry recommendation','delivery_format','Executive intelligence dossier')
where title = 'Competitor Snapshot';

update public.assignment_catalogue set
  title = 'Customer Journey Conversion Blueprint', category = 'customer experience',
  objective = 'Design the core messaging journey that moves qualified product visitors from first interest to conversion.',
  audience = 'Qualified digital prospects', tone = 'Clear, persuasive, human',
  deliverable_expected = 'Journey map, conversion messages, friction-reduction copy and test-ready content variants.',
  recommended_roles = array['Research Assistant','Strategy Analyst','Copywriter'], quality_target = 87, estimated_execution_seconds = 180,
  brief_context = jsonb_build_object('client','Direct-to-consumer company','market_scope','Digital conversion journey','success_criteria','A coherent route from interest to action','delivery_format','Conversion blueprint')
where title = 'Welcome Email Sequence';

update public.assignment_catalogue set
  level_required = 2, title = 'Premium Brand Campaign System', category = 'integrated campaign',
  objective = 'Develop the creative system for a premium product campaign across launch assets and paid media.',
  audience = 'Design-conscious buyers and high-intent prospects', tone = 'Confident, refined, aspirational',
  deliverable_expected = 'Campaign platform, visual direction, core messages, channel system and production recommendations.',
  recommended_roles = array['Strategy Analyst','Brand Designer','Campaign Planner'], quality_target = 90, estimated_execution_seconds = 240,
  brief_context = jsonb_build_object('client','Premium consumer product','market_scope','Integrated launch campaign','success_criteria','One coherent creative system that can scale across channels','delivery_format','Campaign system')
where title = 'Ad Script — Short Form Video';

update public.assignment_catalogue set
  title = 'Category Leadership Positioning', category = 'brand strategy',
  objective = 'Define a category-leading positioning platform for a growing brand facing entrenched competitors.',
  audience = 'Leadership, sales and product teams', tone = 'Focused, intelligent, credible',
  deliverable_expected = 'Positioning architecture, value pillars, proof points, messaging hierarchy and activation guidance.',
  recommended_roles = array['Research Assistant','Strategy Analyst','Brand Designer'], quality_target = 90, estimated_execution_seconds = 240,
  brief_context = jsonb_build_object('client','Scaling technology company','market_scope','Competitive category repositioning','success_criteria','Distinct position that aligns product, sales and communications','delivery_format','Positioning platform')
where title = 'Brand Positioning Brief';

update public.assignment_catalogue set
  title = 'Retail Acquisition Architecture', category = 'growth architecture',
  objective = 'Redesign the acquisition path for an online retailer to increase qualified traffic conversion without weakening the brand.',
  audience = 'High-intent e-commerce shoppers', tone = 'Direct, analytical, commercially sharp',
  deliverable_expected = 'Acquisition funnel diagnosis, priority experiments, offer logic, landing-page guidance and measurement plan.',
  recommended_roles = array['Strategy Analyst','Campaign Planner','Data Analyst'], quality_target = 89, estimated_execution_seconds = 240,
  brief_context = jsonb_build_object('client','Online retail brand','market_scope','Acquisition and conversion','success_criteria','Prioritized interventions with measurable impact','delivery_format','Growth architecture')
where title = 'Sales Funnel Audit';

update public.assignment_catalogue set
  title = 'Cinematic Series Premiere Campaign', category = 'premium video campaign',
  objective = 'Plan a 45-second cinematic premiere campaign for a fictional streaming drama, designed for a premium first-release audience.',
  audience = 'Streaming viewers, 18-34, entertainment-first', tone = 'Cinematic, emotionally charged, contemporary',
  deliverable_expected = 'Campaign strategy, 45-second film concept, shot-by-shot storyboard, voiceover direction and launch cutdown plan.',
  recommended_roles = array['Strategy Analyst','Video Director','Copywriter'], quality_target = 93, estimated_execution_seconds = 300,
  brief_context = jsonb_build_object('client','Northline Studios','market_scope','Streaming series premiere','success_criteria','A film concept ready for creative production and launch distribution','delivery_format','Premium video production brief')
where title = 'Premium Product Launch Strategy';

update public.assignment_catalogue set
  title = 'Marketplace Conversion Sprint', category = 'e-commerce optimization',
  objective = 'Create a focused conversion improvement plan for a high-traffic marketplace product portfolio.',
  audience = 'Returning and comparison-stage shoppers', tone = 'Commercial, pragmatic, data-informed',
  deliverable_expected = 'Conversion diagnosis, page hierarchy, offer strategy, experimentation backlog and KPI framework.',
  recommended_roles = array['Data Analyst','Conversion Specialist','Strategy Analyst'], quality_target = 92, estimated_execution_seconds = 300,
  brief_context = jsonb_build_object('client','Marketplace operator','market_scope','Product-detail conversion','success_criteria','Prioritized test plan tied to commercial metrics','delivery_format','Conversion sprint report')
where title = 'E-commerce Conversion Optimization';

update public.assignment_catalogue set
  title = 'Creator-Led Premiere Rollout', category = 'audience activation',
  objective = 'Design a creator-led rollout that turns a premium entertainment launch into sustained audience conversation.',
  audience = 'Culture-led viewers and social discovery audiences', tone = 'Energetic, selective, culturally fluent',
  deliverable_expected = 'Creator strategy, activation narrative, content formats, publishing cadence and measurement scorecard.',
  recommended_roles = array['Campaign Planner','Video Director','Copywriter'], quality_target = 92, estimated_execution_seconds = 300,
  brief_context = jsonb_build_object('client','Independent entertainment studio','market_scope','Audience activation','success_criteria','Sustained discovery and creator participation','delivery_format','Rollout playbook')
where title = 'Streaming Campaign Concept';

update public.assignment_catalogue set
  title = 'Executive Brand Film Direction', category = 'executive creative direction',
  objective = 'Create the direction package for a flagship brand film that introduces a premium company to a global audience.',
  audience = 'Global decision makers and premium customers', tone = 'Elegant, authoritative, human',
  deliverable_expected = 'Film narrative, creative treatment, visual world, production approach and executive presentation outline.',
  recommended_roles = array['Strategy Analyst','Video Director','Senior Cinematic Specialist'], quality_target = 95, estimated_execution_seconds = 300,
  brief_context = jsonb_build_object('client','Global premium company','market_scope','Flagship brand film','success_criteria','A board-ready production direction with a distinctive visual idea','delivery_format','Executive film direction')
where title = 'VIP Promotional Campaign';

update public.assignment_catalogue set
  title = 'AI Operations Command Center', category = 'automation operations',
  objective = 'Map and design an AI-enabled operating workflow for a business team handling high-volume repetitive work.',
  audience = 'Operations leaders and implementation team', tone = 'Structured, practical, technical',
  deliverable_expected = 'Workflow map, agent responsibilities, implementation phases, exception handling and operating metrics.',
  recommended_roles = array['Strategy Analyst','Data Analyst','Automation Engineer'], quality_target = 94, estimated_execution_seconds = 300,
  brief_context = jsonb_build_object('client','Operations-intensive business','market_scope','AI workflow transformation','success_criteria','Implementation-ready automation design with measurable service outcomes','delivery_format','Operations command blueprint')
where title = 'AI Automation Workflow Design';

end;
$$;

select public.apply_premium_assignment_briefs();
