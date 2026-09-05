import Link from "next/link";
import { Card, Button } from "@/components/ui";
import { Reveal } from "@/components/marketing/Reveal";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <Card
          accent
          className="relative z-10 flex flex-col items-center gap-4 overflow-hidden py-16 text-center"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(600px 300px at 50% 0%, var(--accent-glow), transparent 70%)",
              opacity: 0.25,
            }}
          />
          <h2 className="relative z-10 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Prêt à déployer ton Workforce ?
          </h2>
          <p className="relative z-10 max-w-md text-ink-soft">
            200 crédits de démarrage, aucune carte bancaire requise.
          </p>
          <Link href="/signup" className="relative z-10">
            <Button className="px-7 py-3.5 text-base">Créer mon Workforce</Button>
          </Link>
        </Card>
      </Reveal>
    </section>
  );
}
