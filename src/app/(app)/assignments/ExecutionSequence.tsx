"use client";

import { useEffect, useState } from "react";
import { Card, StatusDot } from "@/components/ui";

const ROLE_ACTION: Record<string, string> = {
  "Research Assistant": "Analyse de l'audience",
  Copywriter: "Rédaction en cours",
  "Strategy Analyst": "Alignement stratégique",
  "Brand Designer": "Direction visuelle",
  "Campaign Planner": "Plan de campagne",
  "Data Analyst": "Analyse des indicateurs",
  "Conversion Specialist": "Optimisation du funnel",
  "Video Director": "Direction vidéo",
  "Automation Engineer": "Configuration du workflow",
  "Senior Cinematic Specialist": "Production premium",
};

interface WorkforceMember {
  id: string;
  name: string;
  role: string;
}

export function ExecutionSequence({
  title,
  employees,
}: {
  title: string;
  employees: WorkforceMember[];
}) {
  const list = employees.length > 0 ? employees : [{ id: "generic", name: "Workforce", role: "Generalist" }];
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= list.length - 1) return;
    const timer = setTimeout(() => setStep((s) => s + 1), 1100);
    return () => clearTimeout(timer);
  }, [step, list.length]);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-semibold">{title}</p>
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-cyan">
          <StatusDot live /> Exécution en cours
        </span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-cyan transition-all duration-700 ease-out"
          style={{ width: `${((step + 1) / list.length) * 100}%` }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {list.map((employee, i) => {
          const state = i < step ? "done" : i === step ? "active" : "queued";
          return (
            <div
              key={employee.id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-300 ${
                state === "active"
                  ? "border-cyan/30 bg-cyan-tint"
                  : state === "done"
                    ? "border-border bg-surface-2"
                    : "border-border/50 opacity-50"
              }`}
            >
              {state === "done" ? (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-good text-[10px] text-white">
                  ✓
                </span>
              ) : (
                <StatusDot live={state === "active"} />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {employee.name} <span className="text-ink-faint">· {employee.role}</span>
                </p>
                <p className="text-xs text-ink-soft">
                  {state === "done" ? "Terminé" : ROLE_ACTION[employee.role] ?? "Traitement en cours"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
