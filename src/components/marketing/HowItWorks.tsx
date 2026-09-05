import { Card } from "@/components/ui";
import { Reveal } from "@/components/marketing/Reveal";
import { UserPlus, ClipboardList, Eye, Wallet, type LucideIcon } from "lucide-react";

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: UserPlus,
    title: "Recrute ton Workforce",
    body: "Crée ton compte, reçois une Starter AI Workforce et 200 crédits de démarrage.",
  },
  {
    icon: ClipboardList,
    title: "Demande une Assignment",
    body: "Ton Workforce te propose une mission business adaptée à ton niveau.",
  },
  {
    icon: Eye,
    title: "Vois le coût avant d'engager quoi que ce soit",
    body: "Coût d'exécution et fourchette de reward affichés avant tout engagement de crédit — jamais après.",
  },
  {
    icon: Wallet,
    title: "Reward créditée instantanément",
    body: "L'Assignment complétée, la Performance Reward est ajoutée tout de suite, avec le livrable réel.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
      <Reveal className="mb-10 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          Comment ça marche
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold">Aucune surprise, jamais.</h2>
      </Reveal>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.1}>
            <Card
              interactive
              className="flex h-full flex-col gap-3 hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-tint text-accent-strong">
                <step.icon className="h-5 w-5" />
              </span>
              <p className="font-display text-base font-semibold">{step.title}</p>
              <p className="text-sm text-ink-soft">{step.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
