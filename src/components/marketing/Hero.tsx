import Link from "next/link";
import { Button } from "@/components/ui";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { HeroMesh } from "@/components/marketing/HeroMesh";
import { Reveal } from "@/components/marketing/Reveal";
import { RotatingWord } from "@/components/marketing/RotatingWord";
import { TiltCard } from "@/components/marketing/TiltCard";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";
import { ShieldCheck, Sparkles } from "lucide-react";

const DEFAULT_TITLE = "Build your AI Workforce.\nComplete Assignments.\nEarn Rewards.";
const DEFAULT_SUBTITLE =
  "Recrute des AI Employees, assigne-leur des missions business réelles et génère des Performance Rewards.";

const SPECIALTIES = [
  "Recherche de marché",
  "Rédaction publicitaire",
  "Direction créative",
  "Production vidéo",
  "Stratégie business",
];

export async function Hero() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .single<SiteSettings>();

  const titleLines = (settings?.hero_title || DEFAULT_TITLE).split("\n").filter(Boolean);
  const subtitle = settings?.hero_subtitle || DEFAULT_SUBTITLE;

  return (
    <section className="relative overflow-hidden">
      <HeroMesh />
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-20 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <Reveal className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent-strong" />
            <span className="font-mono text-xs uppercase tracking-widest text-accent-strong">
              WorkGPT
            </span>
          </span>
          <h1 className="max-w-2xl font-display text-5xl font-extrabold leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl">
            {titleLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < titleLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </h1>
          <p className="max-w-lg text-lg text-ink-soft">{subtitle}</p>
          <p className="font-mono text-sm text-ink-faint">
            Spécialité du jour : <RotatingWord words={SPECIALTIES} />
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
          <TiltCard max={6} className="[transform-style:preserve-3d]">
            <HeroVisual />
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}
