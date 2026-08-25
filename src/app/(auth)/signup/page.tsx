import Link from "next/link";
import { Button } from "@/components/ui";
import { signUp } from "../actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">AI Arena</p>
        <h1 className="mt-1 font-display text-2xl font-semibold">Créer mon Workforce</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Tu reçois automatiquement une Starter AI Workforce et 200 crédits de démarrage.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg bg-bad-tint px-3 py-2 text-sm text-bad">{error}</p>
      ) : null}

      <form action={signUp} className="flex flex-col gap-3">
        <input
          name="display_name"
          type="text"
          required
          placeholder="Nom affiché"
          className="input"
        />
        <input name="email" type="email" required placeholder="Email" className="input" />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Mot de passe (6 caractères min.)"
          className="input"
        />
        <Button type="submit" className="mt-1 w-full">
          Créer mon compte
        </Button>
      </form>

      <p className="text-sm text-ink-soft">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-accent-strong underline">
          Se connecter
        </Link>
      </p>
    </main>
  );
}
