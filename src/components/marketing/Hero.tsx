import Link from "next/link";
import { Button } from "@/components/ui";

export function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 pb-20 pt-20 sm:pt-28">
      <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">WorkGPT</p>
      <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
        Build your AI Workforce.
        <br />
        Complete Assignments. Earn Rewards.
      </h1>
      <p className="max-w-xl text-lg text-ink-soft">
        Recrute des AI Employees, assigne-leur des missions business réelles et génère des
        Performance Rewards.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/signup">
          <Button className="px-6 py-3 text-base">Créer mon Workforce</Button>
        </Link>
        <a href="#how-it-works">
          <Button variant="ghost" className="px-6 py-3 text-base">
            Comment ça marche
          </Button>
        </a>
      </div>
    </section>
  );
}
