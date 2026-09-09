"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { Badge, Button, Card } from "@/components/ui";
import { formatCredits } from "@/lib/format";
import type { AssignmentInstance, AssignmentCatalogueItem, ExecutionJob, ExecutionStep } from "@/lib/types";
import { requestAssignment, assignAndExecute, levelUp, resumeExecution } from "./actions";
import { ExecutionSequence } from "./ExecutionSequence";

function executionWindow(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `Approx. ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function Detail({ label, value, className = "" }: { label: string; value: ReactNode; className?: string }) {
  return <div className={className}><p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">{label}</p><div className="mt-1 text-sm leading-6 text-ink">{value}</div></div>;
}

export function AssignmentPanel({ instance, catalogue, creditBalance, cycleDone, missingRoleLevel, executionJob, executionSteps }: {
  instance: AssignmentInstance | null;
  catalogue: AssignmentCatalogueItem | null;
  creditBalance: number;
  bonusCredits: number;
  cycleDone: boolean;
  nextLevelHint?: number;
  missingRoleLevel?: number | null;
  executionJob: ExecutionJob | null;
  executionSteps: ExecutionStep[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try { await action(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Something interrupted this request."); }
    });
  }

  function runExecution(instanceId: string) {
    setError(null);
    setExecuting(true);
    startTransition(async () => {
      try { await assignAndExecute(instanceId); } catch (reason) { setError(reason instanceof Error ? reason.message : "Something interrupted this request."); } finally { setExecuting(false); }
    });
  }

  if (cycleDone) return <Card accent><Badge tone="good">Daily cycle complete</Badge><h2 className="mt-4 font-display text-2xl font-semibold">Your AI Workforce has completed today&apos;s assignment cycle.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">A fresh assignment cycle will be available tomorrow.</p></Card>;

  if (!instance) return <Card accent className="max-w-3xl"><p className="font-mono text-[11px] uppercase tracking-wide text-accent-strong">AI Workforce desk</p><h2 className="mt-2 font-display text-2xl font-semibold">Your next client assignment is ready to be requested.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">WorkGPT will match your current Workforce capacity with the next available business brief.</p>{error ? <p className="mt-4 text-sm text-bad">{error}</p> : null}<Button className="mt-5" onClick={() => run(requestAssignment)} disabled={pending}>{pending ? "Requesting..." : "Request Assignment"}</Button></Card>;

  if (!catalogue) return null;

  if (executing || instance.status === "in_progress") return <ExecutionSequence title={catalogue.title} steps={executionSteps} qualityTarget={executionJob?.quality_target ?? instance.quality_target ?? catalogue.quality_target} estimatedSeconds={instance.estimated_execution_seconds ?? catalogue.estimated_execution_seconds} />;

  if (instance.status === "completed") {
    const score = executionJob?.quality_score;
    return <Card accent className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><Badge tone="good">Completed</Badge><h2 className="mt-3 font-display text-2xl font-semibold">Execution Report</h2><p className="mt-1 text-sm text-ink-soft">{catalogue.title}</p></div><div className="text-right"><p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Performance reward</p><p className="mt-1 font-display text-2xl font-bold tabular-nums text-gold">+{formatCredits(instance.reward_granted ?? 0)} credits</p></div></div>
      <div className="grid gap-4 border-y border-border py-4 sm:grid-cols-3"><Detail label="Quality achieved" value={<span className="font-mono text-lg font-semibold">{score?.toFixed(0) ?? "-"}/{executionJob?.quality_target?.toFixed(0) ?? catalogue.quality_target.toFixed(0)}</span>} /><Detail label="Workforce steps" value={<span className="font-mono text-lg font-semibold">{executionSteps.filter((step) => step.status === "completed").length}/{executionSteps.length}</span>} /><Detail label="Delivery status" value={<span className="font-medium text-good">Ready for review</span>} /></div>
      <section><p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Delivered output</p><pre className="mt-3 max-h-[32rem] overflow-auto whitespace-pre-wrap border-l-2 border-accent pl-4 font-sans text-sm leading-6 text-ink">{instance.deliverable}</pre></section>
      {error ? <p className="text-sm text-bad">{error}</p> : null}<Button className="self-start" onClick={() => run(requestAssignment)} disabled={pending}>{pending ? "Requesting..." : "Request Next Assignment"}</Button>
    </Card>;
  }

  if (instance.status === "paused") {
    const target = executionJob?.quality_target ?? instance.quality_target ?? catalogue.quality_target;
    return <Card accent className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><Badge tone="gold">Execution paused</Badge><h2 className="mt-3 font-display text-2xl font-semibold">Additional workforce capacity is required.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">This assignment can continue once the required specialist capacity is available. Its increased target protects the quality of the final delivery.</p></div><p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">{catalogue.title}</p></div>
      <div className="grid gap-x-6 gap-y-5 border-y border-border py-5 sm:grid-cols-2 lg:grid-cols-3"><Detail label="Current quality" value={<span className="font-mono text-lg font-semibold">{executionJob?.quality_score?.toFixed(0) ?? "-"}/100</span>} /><Detail label="Required target" value={<span className="font-mono text-lg font-semibold">{target.toFixed(0)}/100</span>} /><Detail label="Active workforce" value={`${executionSteps.filter((step) => step.status === "completed").length} specialist contributions`} /><Detail label="Required specialist employee" value={instance.missing_role ? `${instance.missing_role}${missingRoleLevel ? ` / Level ${missingRoleLevel}+` : ""}` : "Additional specialist capacity"} /><Detail label="Credit engaged" value={<span className="font-mono">{formatCredits(instance.credit_cost)} credits</span>} /><Detail label="Projected reward" value={<span className="font-mono font-semibold text-good">{formatCredits(executionJob?.projected_reward ?? instance.reward_max)} credits</span>} /></div>
      {error ? <p className="text-sm text-bad">{error}</p> : null}<div className="flex flex-wrap gap-3"><Button onClick={() => run(levelUp)} disabled={pending}>{pending ? "Updating..." : "Unlock Workforce Capacity"}</Button>{executionJob ? <Button variant="ghost" onClick={() => run(() => resumeExecution(executionJob.id))} disabled={pending}>Resume Execution</Button> : null}<Link className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-border-strong hover:bg-surface-2" href="/assets">View Assets</Link></div>
    </Card>;
  }

  const context = catalogue.brief_context ?? {};
  return <Card accent className="flex flex-col gap-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-[11px] uppercase tracking-wide text-accent-strong">Client assignment</p><h2 className="mt-2 font-display text-2xl font-semibold">{catalogue.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">{catalogue.objective}</p></div><Badge tone="accent">{catalogue.category}</Badge></div>
    <div className="grid gap-x-6 gap-y-5 border-y border-border py-5 md:grid-cols-2"><Detail label="Client" value={context.client ?? "Confidential client brief"} /><Detail label="Business need" value={context.business_need ?? context.market_scope ?? catalogue.objective} /><Detail label="Success criteria" value={context.success_criteria ?? "A focused, directly usable business delivery."} /><Detail label="Expected delivery" value={catalogue.deliverable_expected} /><Detail label="Audience" value={catalogue.audience ?? "Defined in the client brief"} /><Detail label="Tone" value={catalogue.tone ?? "Defined in the client brief"} /></div>
    <div className="grid gap-4 sm:grid-cols-3"><Detail label="Quality target" value={<span className="font-mono text-lg font-semibold">{catalogue.quality_target.toFixed(0)}/100</span>} /><Detail label="Execution window" value={<span className="font-medium">{executionWindow(catalogue.estimated_execution_seconds)}</span>} /><Detail label="Credit engaged" value={<span className="font-mono font-semibold">{formatCredits(instance.credit_cost)} credits</span>} /></div>
    <section className="border-t border-border pt-5"><p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">AI Workforce required</p><div className="mt-3 flex flex-wrap gap-2">{catalogue.recommended_roles.map((role) => <Badge key={role} tone="neutral">{role}</Badge>)}</div></section>
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5"><p className="text-xs text-ink-soft">Available credits: <span className="font-mono text-ink">{formatCredits(creditBalance)}</span>. The completed delivery is evaluated against the stated quality target.</p><Button onClick={() => runExecution(instance.id)} disabled={pending}>{pending ? "Deploying..." : "Deploy My AI Workforce"}</Button></div>
    {error ? <p className="text-sm text-bad">{error}</p> : null}
  </Card>;
}
