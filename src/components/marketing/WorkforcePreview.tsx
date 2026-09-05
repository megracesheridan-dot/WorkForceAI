import { Card, Badge } from "@/components/ui";

const EMPLOYEES: {
  name: string;
  role: string;
  tier: "neutral" | "cyan" | "accent" | "gold";
  tierLabel: string;
}[] = [
  { name: "Nova", role: "Research Assistant", tier: "neutral", tierLabel: "Standard" },
  { name: "Reed", role: "Copywriter", tier: "neutral", tierLabel: "Standard" },
  { name: "Iris", role: "Brand Designer", tier: "cyan", tierLabel: "Advanced" },
  { name: "Milo", role: "Conversion Specialist", tier: "accent", tierLabel: "Expert" },
  { name: "Lior", role: "Senior Cinematic Specialist", tier: "gold", tierLabel: "Elite" },
];

export function WorkforcePreview() {
  return (
    <section id="workforce" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          AI Workforce
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold">
          Des AI Employees spécialisés, par palier.
        </h2>
        <p className="mt-2 text-ink-soft">
          Chaque employé a un rôle réel. Les paliers se débloquent avec ton niveau — jamais au
          hasard.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {EMPLOYEES.map((e) => (
          <Card key={e.name} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="font-display text-base font-semibold">{e.name}</p>
              <Badge tone={e.tier}>{e.tierLabel}</Badge>
            </div>
            <p className="text-sm text-ink-soft">{e.role}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
