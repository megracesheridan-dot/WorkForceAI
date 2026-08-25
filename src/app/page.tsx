import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-6 px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">AI Arena</p>
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">
        Build your AI Workforce.
        <br />
        Complete Assignments. Earn Rewards.
      </h1>
      <p className="max-w-xl text-lg text-ink-soft">
        Recrutez des AI Employees, assignez-leur des missions business réelles et générez des
        Performance Rewards — coûts et récompenses toujours affichés avant l&apos;exécution.
      </p>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent-strong"
        >
          Créer mon Workforce
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-border px-5 py-3 text-sm font-medium hover:bg-surface-2"
        >
          Se connecter
        </Link>
      </div>
    </main>
  );
}
