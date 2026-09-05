import { Card } from "@/components/ui";

const STEPS = [
  {
    title: "Recrute ton Workforce",
    body: "Crée ton compte, reçois une Starter AI Workforce et 200 crédits de démarrage.",
  },
  {
    title: "Demande une Assignment",
    body: "Ton Workforce te propose une mission business adaptée à ton niveau.",
  },
  {
    title: "Vois le coût avant d'engager quoi que ce soit",
    body: "Coût d'exécution et fourchette de reward affichés avant tout engagement de crédit — jamais après.",
  },
  {
    title: "Reward créditée instantanément",
    body: "L'Assignment complétée, la Performance Reward est ajoutée tout de suite, avec le livrable réel.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          Comment ça marche
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold">
          Aucune surprise, jamais.
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <Card key={step.title} className="flex flex-col gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-tint font-mono text-sm font-semibold text-accent-strong">
              {i + 1}
            </span>
            <p className="font-display text-base font-semibold">{step.title}</p>
            <p className="text-sm text-ink-soft">{step.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
