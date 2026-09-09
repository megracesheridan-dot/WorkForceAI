"use client";

import { Badge, Card, StatusDot } from "@/components/ui";
import type { ExecutionStep } from "@/lib/types";

const ROLE_ACTION: Record<string, string> = {
  "Research Assistant": "Mapping the market and audience signals",
  Copywriter: "Developing the narrative and message system",
  "Strategy Analyst": "Testing strategic direction and positioning",
  "Brand Designer": "Defining the creative and visual direction",
  "Campaign Planner": "Sequencing campaign moments and channels",
  "Data Analyst": "Validating measurement and performance logic",
  "Conversion Specialist": "Prioritizing conversion opportunities",
  "Video Director": "Building the cinematic production approach",
  "Automation Engineer": "Designing the operating workflow",
  "Senior Cinematic Specialist": "Refining the premium production treatment",
};

function executionWindow(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `Approx. ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export function ExecutionSequence({ title, steps, qualityTarget, estimatedSeconds }: { title: string; steps: ExecutionStep[]; qualityTarget: number; estimatedSeconds: number }) {
  const completed = steps.filter((step) => step.status === "completed").length;
  const active = steps.find((step) => step.status === "running");
  const progress = steps.length > 0 ? (completed / steps.length) * 100 : 0;
  const activeEmployee = active?.ai_employees;

  return (
    <Card accent className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><StatusDot live /><p className="font-mono text-[11px] uppercase tracking-wide text-cyan">Live execution</p></div>
          <h2 className="mt-2 font-display text-2xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-ink-soft">Your AI Workforce is building the requested delivery in coordinated specialist steps.</p>
        </div>
        <Badge tone="cyan">{completed}/{steps.length || "-"} steps delivered</Badge>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-wide text-ink-faint"><span>Execution progress</span><span>{Math.round(progress)}%</span></div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-cyan transition-all duration-700 ease-out" style={{ width: `${progress}%` }} /></div>
      </div>

      <div className="grid gap-4 border-y border-border py-4 sm:grid-cols-3">
        <div><p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Quality target</p><p className="mt-1 font-mono text-lg font-semibold">{qualityTarget.toFixed(0)}/100</p></div>
        <div><p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Execution window</p><p className="mt-1 text-sm font-medium">{executionWindow(estimatedSeconds)}</p></div>
        <div><p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Current workforce focus</p><p className="mt-1 text-sm font-medium">{activeEmployee?.role ?? "Preparing specialist handoffs"}</p></div>
      </div>

      <div className="flex flex-col divide-y divide-border border-y border-border">
        {steps.length === 0 ? <div className="py-4 text-sm text-ink-soft">Preparing the workforce execution plan.</div> : steps.map((step) => {
          const employee = step.ai_employees ?? { id: step.employee_id, name: "AI Employee", role: "Specialist" };
          const state = step.status === "completed" ? "completed" : step.status === "running" ? "running" : "queued";
          const label = state === "completed" ? "Contribution delivered" : state === "running" ? (ROLE_ACTION[employee.role] ?? "Producing specialist contribution") : "Queued for coordinated handoff";
          return <div key={step.id} className={`flex items-center gap-3 py-3 ${state === "queued" ? "opacity-50" : ""}`}>
            {state === "completed" ? <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-good text-[10px] font-bold text-white">OK</span> : <StatusDot live={state === "running"} />}
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{employee.name} <span className="text-ink-faint">/ {employee.role}</span></p><p className="mt-0.5 text-xs text-ink-soft">{label}</p></div>
            <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">{state}</span>
          </div>;
        })}
      </div>

      <p className="text-xs text-ink-soft">Execution continues while you navigate the workspace. This view updates when each workforce step is recorded.</p>
    </Card>
  );
}
