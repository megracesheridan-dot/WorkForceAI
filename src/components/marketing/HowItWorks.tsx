import { Card } from "@/components/ui";
import { Reveal } from "@/components/marketing/Reveal";
import { TiltCard } from "@/components/marketing/TiltCard";
import {
  RecruitAnimation,
  AssignmentAnimation,
  CapacityCheckAnimation,
  RewardAnimation,
} from "@/components/marketing/HowItWorksAnimations";

const STEPS = [
  {
    title: "Recrute ton Workforce",
    body: "Crée ton compte, reçois une Starter AI Workforce et 200 crédits de démarrage.",
    animation: <RecruitAnimation />,
    span: "lg:col-span-3",
  },
  {
    title: "Demande une Assignment",
    body: "Ton Workforce te propose une mission business adaptée à ton niveau.",
    animation: <AssignmentAnimation />,
    span: "lg:col-span-3",
  },
  {
    title: "Capacity Check",
    body: "Coût d'exécution et fourchette de reward affichés avant lancement.",
    animation: <CapacityCheckAnimation />,
    span: "lg:col-span-2",
  },
  {
    title: "Reward créditée instantanément",
    body: "L'Assignment complétée, la Performance Reward est ajoutée tout de suite, avec le livrable réel.",
    animation: <RewardAnimation />,
    span: "lg:col-span-4",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
      <Reveal className="mb-10 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          Comment ça marche
        </p>
        <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Le cycle d&apos;exécution.
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.1} className={step.span}>
            <TiltCard max={5}>
              <Card interactive className="flex h-full flex-col gap-3 hover:shadow-xl">
                {step.animation}
                <div>
                  <p className="font-display text-base font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
                </div>
              </Card>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
