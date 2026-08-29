import { createClient } from "@/lib/supabase/server";
import { Card, Badge, Stat, Button } from "@/components/ui";
import { formatCredits } from "@/lib/format";
import type { AiEmployee, Profile, WorkforceLevel } from "@/lib/types";
import { levelUp } from "../assignments/actions";

type Tier = "Standard" | "Advanced" | "Expert" | "Elite";

function tierFor(level: number): { label: Tier; tone: "neutral" | "cyan" | "accent" | "gold" } {
  if (level >= 4) return { label: "Elite", tone: "gold" };
  if (level === 3) return { label: "Expert", tone: "accent" };
  if (level === 2) return { label: "Advanced", tone: "cyan" };
  return { label: "Standard", tone: "neutral" };
}

const TIER_BORDER: Record<Tier, string> = {
  Standard: "border-l-border",
  Advanced: "border-l-cyan",
  Expert: "border-l-accent",
  Elite: "border-l-gold",
};

export default async function WorkforcePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  const { data: employees } = await supabase
    .from("ai_employees")
    .select("*")
    .eq("active", true)
    .order("level_required", { ascending: true })
    .returns<AiEmployee[]>();

  const { data: levels } = await supabase
    .from("workforce_levels")
    .select("*")
    .order("level", { ascending: true })
    .returns<WorkforceLevel[]>();

  const currentLevel = levels?.find((l) => l.level === profile?.level);
  const nextLevel = levels?.find((l) => l.level === (profile?.level ?? 1) + 1);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          AI Workforce
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold">
          {currentLevel?.name ?? "Starter Operator"}
        </h1>
      </div>

      <Card accent className="flex flex-wrap items-center justify-between gap-6">
        <Stat label="Workforce Level" value={String(profile?.level ?? 1)} glow />
        <Stat label="Employés débloqués" value={String(currentLevel?.employees_count ?? "—")} />
        <Stat
          label="Assignments / jour"
          value={String(currentLevel?.assignments_per_day ?? "—")}
        />
        {nextLevel ? (
          <form action={levelUp} className="flex flex-col items-start gap-1">
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              Niveau suivant : {nextLevel.name}
            </p>
            <Button type="submit">
              Débloquer — {formatCredits(nextLevel.unlock_cost)} credits
            </Button>
          </form>
        ) : (
          <Badge tone="gold">Niveau maximum atteint</Badge>
        )}
      </Card>

      <div>
        <p className="mb-3 font-display text-lg font-semibold">Employés</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(employees ?? []).map((e) => {
            const unlocked = e.level_required <= (profile?.level ?? 1);
            const tier = tierFor(e.level_required);
            return (
              <Card
                key={e.id}
                className={`border-l-2 ${unlocked ? TIER_BORDER[tier.label] : "border-l-border"} ${
                  unlocked ? "" : "opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-base font-semibold">{e.name}</p>
                  <Badge tone={unlocked ? tier.tone : "neutral"}>
                    {unlocked ? tier.label : `Niveau ${e.level_required}+`}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-ink-soft">{e.role}</p>
                <p className="mt-1 text-xs text-ink-faint">{e.specialty}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-md bg-surface-2 px-2 py-1.5 text-center">
                    <p className="font-mono text-xs font-semibold tabular-nums">
                      {e.execution_capacity}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-wide text-ink-faint">
                      Capacity
                    </p>
                  </div>
                  <div className="rounded-md bg-surface-2 px-2 py-1.5 text-center">
                    <p className="font-mono text-xs font-semibold tabular-nums">
                      {(e.precision_rate * 100).toFixed(0)}%
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-wide text-ink-faint">
                      Precision
                    </p>
                  </div>
                  <div className="rounded-md bg-surface-2 px-2 py-1.5 text-center">
                    <p className="font-mono text-xs font-semibold tabular-nums">
                      {e.speed_index.toFixed(1)}x
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-wide text-ink-faint">
                      Speed
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
