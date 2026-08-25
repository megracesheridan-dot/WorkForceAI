import Link from "next/link";
import { Button } from "@/components/ui";
import { signIn } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">AI Arena</p>
        <h1 className="mt-1 font-display text-2xl font-semibold">Se connecter</h1>
      </div>

      {error ? (
        <p className="rounded-lg bg-bad-tint px-3 py-2 text-sm text-bad">{error}</p>
      ) : null}

      <form action={signIn} className="flex flex-col gap-3">
        <input name="email" type="email" required placeholder="Email" className="input" />
        <input
          name="password"
          type="password"
          required
          placeholder="Mot de passe"
          className="input"
        />
        <Button type="submit" className="mt-1 w-full">
          Se connecter
        </Button>
      </form>

      <p className="text-sm text-ink-soft">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="text-accent-strong underline">
          Créer un Workforce
        </Link>
      </p>
    </main>
  );
}
