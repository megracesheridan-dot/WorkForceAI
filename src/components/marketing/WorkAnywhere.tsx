import Image from "next/image";
import { Reveal } from "@/components/marketing/Reveal";

export function WorkAnywhere() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="order-2 flex flex-col gap-4 lg:order-1">
          <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">Accès</p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Pilote ton Workforce depuis n&apos;importe où.
          </h2>
          <p className="max-w-md text-lg text-ink-soft">
            Le dashboard tourne dans le navigateur — lance des Assignments, suis
            l&apos;exécution en direct et récupère tes rewards, sans installation.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="relative order-1 lg:order-2">
          <div
            className="absolute -inset-6 -z-10 rounded-[2rem]"
            style={{
              background: "radial-gradient(closest-side, var(--cyan-glow), transparent 70%)",
              filter: "blur(50px)",
              opacity: 0.3,
            }}
          />
          <div className="relative overflow-hidden rounded-2xl border border-border-strong shadow-2xl">
            <Image
              src="/vitaly-gariev-pP_g_3qea0E-unsplash.jpg"
              alt="Workforce piloté depuis le navigateur"
              width={1600}
              height={900}
              className="h-full w-full scale-105 object-cover [animation:ken-burns_20s_ease-in-out_infinite_alternate]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/40 via-transparent to-transparent" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
