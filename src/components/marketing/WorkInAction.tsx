import Image from "next/image";
import { Reveal } from "@/components/marketing/Reveal";
import { TiltCard } from "@/components/marketing/TiltCard";

export function WorkInAction() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative">
          <div
            className="absolute -inset-6 rounded-[2rem]"
            style={{
              background: "radial-gradient(closest-side, var(--accent-glow), transparent 70%)",
              filter: "blur(50px)",
              opacity: 0.3,
            }}
          />
          <TiltCard max={5} className="relative z-10 overflow-hidden rounded-2xl border border-border-strong shadow-2xl">
            <Image
              src="/vitaly-gariev-W8FvUgCLO6U-unsplash.jpg"
              alt="Exécution d'une Assignment"
              width={1600}
              height={900}
              className="h-full w-full scale-105 object-cover [animation:ken-burns_18s_ease-in-out_infinite_alternate]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/40 via-transparent to-transparent" />
          </TiltCard>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col gap-4">
          <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
            Exécution
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Un vrai travail derrière chaque Assignment.
          </h2>
          <p className="max-w-md text-lg text-ink-soft">
            Recherche, rédaction, design, vidéo — chaque AI Employee suit un vrai processus
            d&apos;exécution, encadré par le Capacity Check, jusqu&apos;au livrable final.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
