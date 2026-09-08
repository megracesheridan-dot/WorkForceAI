# WorkGPT — MVP

Plateforme d'AI workforce : recrute des AI Employees, assigne des Assignments business,
génère des Performance Rewards. Coûts et rewards toujours affichés **avant** l'exécution —
aucun mécanisme de récompense retenue (voir `WorkGPT Blueprint` pour le détail produit).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Supabase** — Postgres, Auth, Row Level Security, fonctions SQL transactionnelles
- **OpenAI** — moteur d'exécution des AI Employees (adaptateur interchangeable, voir `src/lib/ai/`)

## Démarrage local

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer Supabase

Le projet Supabase existe déjà : `https://zjrsuqzwkspijmryuhiq.supabase.co`.

Dans le **SQL Editor** du dashboard Supabase, exécute dans l'ordre :

1. Exécute les migrations dans l'ordre, de `0001_init.sql` à `0009_control_plane.sql`.
2. `supabase/seed.sql` — niveaux, AI Employees et catalogue d'Assignments de démarrage.

### 3. Variables d'environnement

Copie `.env.local.example` en `.env.local` et remplis :

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API → `anon` `public`
- `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API → `service_role` (à garder secret, jamais commité — utile pour des scripts d'admin futurs, pas utilisé par l'app aujourd'hui)
- `OPENAI_API_KEY` — clé créée sur platform.openai.com (nécessaire pour que les Assignments produisent de vrais livrables)

### 4. Lancer en local

```bash
npm run dev
```

Ouvre http://localhost:3000. Crée un compte depuis `/signup` — un profil est créé
automatiquement avec 200 crédits de démarrage et le niveau 1 (Starter Operator).

Dans un second terminal, lance le worker durable :

```bash
npm run worker
```

En production, ce processus doit tourner comme un service Worker Railway distinct avec les mêmes
variables Supabase et OpenAI que l'application. Le worker est le seul processus autorisé à
exécuter une Assignment et à la finaliser.

### 4.1 Déployer le Worker sur Railway

1. Dans Railway, crée un projet puis un service depuis ce dépôt GitHub.
2. Le fichier `railway.toml` configure automatiquement ce service pour exécuter `npm run worker`.
   Il ne faut pas lui attribuer de domaine public : c'est un processus de file d'exécution, pas une application web.
3. Dans l'onglet **Variables** du service, ajoute les valeurs suivantes :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (facultatif, `gpt-4.1-mini` est utilisé par défaut)
   - `WORKER_POLL_INTERVAL_MS=3000`
   - `WORKER_ID=railway-execution-worker`
4. Déploie le service. Les logs doivent afficher `started`; chaque Assignment terminée y apparaîtra ensuite.

Ne définis jamais `SUPABASE_SERVICE_ROLE_KEY` ou `OPENAI_API_KEY` dans les variables publiques de l'application web.

### 5. Devenir admin (pour tester l'espace de gestion)

Dans le SQL Editor Supabase :

```sql
update public.profiles set is_admin = true where id = '<ton user id>';
```

Le lien "Espace de gestion" apparaît alors dans la sidebar (`/admin`).

## Boucle produit implémentée

- Auth (email/mot de passe) + création automatique de profil
- Dashboard (cycle, solde, niveau, notifications)
- **Assignment System** : Request Assignment → Assign My AI Employees → job persistant →
  orchestration séquentielle des AI Employees par worker → rapport d'exécution → finalisation
  transactionnelle par le worker
- AI Workforce (employés débloqués par niveau, déblocage de niveau à coût publié)
- Assets (solde en direct, historique des transactions, dépôt = stub en attendant le paiement réel)
- Espace de gestion : vue d'ensemble, utilisateurs (+ crédit manuel pour les tests),
  catalogue d'Assignments (création, activation/désactivation)

Toute la logique financière (coût, reward, niveau, crédit admin) vit dans des fonctions
Postgres `SECURITY DEFINER` (`supabase/migrations/0001_init.sql`) — une seule transaction
atomique par opération, rien n'est calculé côté navigateur.

## Prochaines étapes (hors MVP)

- Paiement réel (Stripe ou équivalent) pour Deposit / Buy Credits
- Teams (bonus collectif, classement)
- Rewarded ads
- Déploiement : application web + Supabase (déjà hébergé) + Railway Worker pour les Assignments longues et la file d'exécution.
