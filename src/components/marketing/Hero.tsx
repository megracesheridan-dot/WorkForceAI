import Link from "next/link";
import { Button } from "@/components/ui";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { Reveal } from "@/components/marketing/Reveal";
import { ShieldCheck, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 60% at 30% 0%, black 40%, transparent 100%)",
        }}
      />
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-20 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <Reveal className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent-strong" />
            <span className="font-mono text-xs uppercase tracking-widest text-accent-strong">
              WorkGPT
            </span>
          </span>
          <h1 className="max-w-xl font-display text-4xl font-extrabold leading-[1.1] sm:text-5xl">
            Build your AI Workforce.
            <br />
            Complete Assignments.
            <br />
            Earn Rewards.
          </h1>
          <p className="max-w-lg text-lg text-ink-soft">
            Recrute des AI Employees, assigne-leur des missions business réelles et génère des
            Performance Rewards — avec le coût et la reward toujours visibles avant tout
            engagement.
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
          <div className="flex items-center gap-2 pt-2 text-sm text-ink-faint">
            <ShieldCheck className="h-4 w-4 text-good" />
            200 crédits de démarrage offerts · Aucune carte bancaire requise
          </div>
        </Reveal>

        <Reveal delay={0.15} className="flex justify-center lg:justify-end">
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  );
}
