import { Card } from "@/components/ui";
import { Reveal } from "@/components/marketing/Reveal";
import { Eye, PackageCheck, ShieldOff, Users, type LucideIcon } from "lucide-react";

const POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Eye,
    title: "Capacity Check transparent",
    body: "Coût et reward toujours affichés avant l'exécution — jamais un montant retenu après coup.",
  },
  {
    icon: PackageCheck,
    title: "Livrables réels",
    body: "Chaque Assignment produit un vrai livrable exploitable, pas juste un chiffre qui augmente.",
  },
  {
    icon: ShieldOff,
    title: "Jamais de mission qui échoue",
    body: "Une Assignment lancée aboutit toujours. Les limites (spécialiste manquant, solde insuffisant) sont signalées avant, jamais après.",
  },
  {
    icon: Users,
    title: "Teams avec bonus réel",
    body: "Le bonus d'équipe est recalculé à partir des Assignments réellement complétées — jamais un chiffre décoratif.",
  },
];

export function TrustSection() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-6 py-20">
      <Reveal className="mb-10 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          Pourquoi WorkGPT
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold">Construit pour la confiance.</h2>
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
