import { createBrowserClient } from "@supabase/ssr";

// Typage: on garde les requêtes non génériques et on type les résultats via src/lib/types.ts
// (pas de génération automatique de types tant que le projet Supabase n'est pas branché en local).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
