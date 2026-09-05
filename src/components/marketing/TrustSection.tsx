import { Card } from "@/components/ui";
import { Reveal } from "@/components/marketing/Reveal";
import { Eye, PackageCheck, ShieldOff, Users, type LucideIcon } from "lucide-react";

const POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Eye,
    title: "Capacity Check",
    body: "Coût d'exécution et fourchette de reward affichés avant chaque Assignment.",
  },
  {
    icon: PackageCheck,
    title: "Livrables réels",
    body: "Chaque Assignment produit un document, brief, script ou asset exploitable.",
  },
  {
    icon: ShieldOff,
    title: "Continuité d'exécution",
    body: "Spécialiste manquant ou solde insuffisant : signalé à la demande, avant lancement.",
  },
  {
    icon: Users,
    title: "Bonus d'équipe",
    body: "Calculé en temps réel sur les Assignments complétées par la Team.",
  },
];

export function TrustSection() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-6 py-20">
      <Reveal className="mb-10 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          Pourquoi WorkGPT
        </p>
        <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Fonctionnalités clés.
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {POINTS.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08}>
            <Card
              interactive
              className="flex h-full gap-4 hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-tint text-accent-strong">
                <p.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-lg font-semibold">{p.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{p.body}</p>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
