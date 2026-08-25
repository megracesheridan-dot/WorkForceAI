# AI Arena — MVP

Plateforme d'AI workforce : recrute des AI Employees, assigne des Assignments business,
génère des Performance Rewards. Coûts et rewards toujours affichés **avant** l'exécution —
aucun mécanisme de récompense retenue (voir `AI Arena Blueprint` pour le détail produit).

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

1. `supabase/migrations/0001_init.sql` — schéma complet (tables, RLS, fonctions).
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

### 5. Devenir admin (pour tester l'espace de gestion)

Dans le SQL Editor Supabase :

```sql
update public.profiles set is_admin = true where id = '<ton user id>';
```

Le lien "Espace de gestion" apparaît alors dans la sidebar (`/admin`).

## Boucle produit implémentée

- Auth (email/mot de passe) + création automatique de profil
- Dashboard (cycle, solde, niveau, notifications)
- **Assignment System** : Request Assignment → Capacity Check (coût + reward affichés
  avant tout engagement) → Assign My AI Employees → exécution réelle via OpenAI →
  Execution Report avec livrable téléchargeable → reward créditée
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
- Déploiement : Vercel (app) + Supabase (déjà hébergé) ; Render en option pour un futur
  worker si l'exécution IA doit sortir du cycle de requête HTTP (assignments longs, files d'attente)
