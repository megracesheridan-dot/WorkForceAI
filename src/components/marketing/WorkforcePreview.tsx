import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui";
import { Reveal } from "@/components/marketing/Reveal";
import { CountUp } from "@/components/marketing/CountUp";
import { employeeIcon } from "@/lib/employee-icons";
import { tierFor } from "@/lib/tiers";
import type { AiEmployee } from "@/lib/types";

const RING_BY_LEVEL: Record<number, string> = {
  1: "from-ink-faint to-ink-soft",
  2: "from-cyan to-cyan",
  3: "from-accent to-accent-strong",
  4: "from-gold to-accent-strong",
  5: "from-gold to-accent-strong",
};

const ICON_TEXT_BY_LEVEL: Record<number, string> = {
  1: "text-white",
  2: "text-white",
  3: "text-black",
  4: "text-black",
  5: "text-black",
};

export async function WorkforcePreview() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("ai_employees")
    .select("*")
    .eq("active", true)
    .order("level_required", { ascending: true })
    .returns<AiEmployee[]>();

  const list = employees ?? [];
  if (!list.length) return null;

  return (
    <section id="workforce" className="mx-auto max-w-6xl px-6 py-20">
      <Reveal className="mb-10 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          AI Workforce
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold">
          <CountUp value={list.length} /> AI Employees spécialisés, par palier.
        </h2>
        <p className="mt-2 text-ink-soft">
          Rôles spécialisés par palier, débloqués selon ton niveau.
        </p>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((e, i) => {
          const tier = tierFor(e.level_required);
          const Icon = employeeIcon(e.icon);
          return (
            <Reveal key={e.id} delay={Math.min(i, 9) * 0.05}>
              <Card
                interactive
                className="flex h-full flex-col gap-3 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${RING_BY_LEVEL[e.level_required] ?? RING_BY_LEVEL[1]} ${ICON_TEXT_BY_LEVEL[e.level_required] ?? ICON_TEXT_BY_LEVEL[1]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <Badge tone={tier.tone}>{tier.label}</Badge>
                </div>
                <div>
                  <p className="font-display text-base font-semibold">{e.name}</p>
                  <p className="text-sm text-ink-soft">{e.role}</p>
                </div>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
