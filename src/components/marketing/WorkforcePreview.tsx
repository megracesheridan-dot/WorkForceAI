import { Card, Badge } from "@/components/ui";
import { Reveal } from "@/components/marketing/Reveal";

const EMPLOYEES: {
  name: string;
  role: string;
  tier: "neutral" | "cyan" | "accent" | "gold";
  tierLabel: string;
  ring: string;
  text: string;
}[] = [
  {
    name: "Nova",
    role: "Research Assistant",
    tier: "neutral",
    tierLabel: "Standard",
    ring: "from-ink-faint to-ink-soft",
    text: "text-white",
  },
  {
    name: "Reed",
    role: "Copywriter",
    tier: "neutral",
    tierLabel: "Standard",
    ring: "from-ink-faint to-ink-soft",
    text: "text-white",
  },
  {
    name: "Iris",
    role: "Brand Designer",
    tier: "cyan",
    tierLabel: "Advanced",
    ring: "from-cyan to-cyan",
    text: "text-white",
  },
  {
    name: "Milo",
    role: "Conversion Specialist",
    tier: "accent",
    tierLabel: "Expert",
    ring: "from-accent to-accent-strong",
    text: "text-black",
  },
  {
    name: "Lior",
    role: "Senior Cinematic Specialist",
    tier: "gold",
    tierLabel: "Elite",
    ring: "from-gold to-accent-strong",
    text: "text-black",
  },
];

export function WorkforcePreview() {
  return (
    <section id="workforce" className="mx-auto max-w-6xl px-6 py-20">
      <Reveal className="mb-10 max-w-xl">
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
      </Reveal>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {EMPLOYEES.map((e, i) => (
          <Reveal key={e.name} delay={i * 0.08}>
            <Card
              interactive
              className="flex h-full flex-col gap-3 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br font-display text-sm font-bold ${e.ring} ${e.text}`}
                >
                  {e.name.slice(0, 2).toUpperCase()}
                </span>
                <Badge tone={e.tier}>{e.tierLabel}</Badge>
              </div>
              <div>
                <p className="font-display text-base font-semibold">{e.name}</p>
                <p className="text-sm text-ink-soft">{e.role}</p>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
