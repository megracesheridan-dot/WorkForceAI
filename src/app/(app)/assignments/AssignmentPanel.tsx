"use client";

import { useState, useTransition } from "react";
import { Card, Badge, Button } from "@/components/ui";
import { formatCredits } from "@/lib/format";
import type { AssignmentInstance, AssignmentCatalogueItem, AiEmployee } from "@/lib/types";
import { requestAssignment, assignAndExecute, levelUp } from "./actions";
import { ExecutionSequence } from "./ExecutionSequence";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function AssignmentPanel({
  instance,
  catalogue,
  creditBalance,
  bonusCredits,
  cycleDone,
  missingRoleLevel,
  employees,
}: {
  instance: AssignmentInstance | null;
  catalogue: AssignmentCatalogueItem | null;
  creditBalance: number;
  bonusCredits: number;
  cycleDone: boolean;
  nextLevelHint?: number;
  missingRoleLevel?: number | null;
  employees: AiEmployee[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Une erreur est survenue.");
      }
    });
  }

  function runExecution(instanceId: string) {
    setError(null);
    setExecuting(true);
    startTransition(async () => {
      try {
        // Le calcul réel (coût, livrable, reward) est déjà fait et vérifié côté
        // serveur avant que cette promesse ne résolve — le délai minimum ici ne
        // fait que ne jamais révéler le résultat plus vite que la séquence
        // visuelle, il ne modifie ni ne retarde artificiellement le résultat lui-même.
        await Promise.all([assignAndExecute(instanceId), wait(2200)]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Une erreur est survenue.");
      } finally {
        setExecuting(false);
      }
    });
  }

  if (cycleDone) {
    return (
      <Card>
        <p className="font-display text-lg font-semibold">Daily Assignment Cycle Completed</p>
        <p className="mt-1 text-sm text-ink-soft">
          Ton Workforce a complété toutes les Assignments du jour. Reviens demain pour un nouveau
          cycle.
        </p>
      </Card>
    );
  }

  if (!instance) {
    return (
      <Card className="flex flex-col items-start gap-3">
        <p className="font-display text-lg font-semibold">Aucune Assignment active</p>
        <p className="text-sm text-ink-soft">
          Demande une nouvelle Assignment. Le coût et la fourchette de reward seront affichés
          avant tout engagement de crédit.
        </p>
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <Button onClick={() => run(requestAssignment)} disabled={pending}>
          {pending ? "…" : "Request Assignment"}
        </Button>
      </Card>
    );
  }

  if (!catalogue) return null;

  if (executing) {
    return <ExecutionSequence title={catalogue.title} employees={employees} />;
  }

  if (instance.status === "completed") {
    return (
      <Card accent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold">Execution Report</p>
          <Badge tone="good">Completed</Badge>
        </div>
        <p className="text-sm text-ink-soft">{catalogue.title}</p>
        <div className="rounded-lg border border-gold/30 bg-gold-tint p-4">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            Performance Reward
          </p>
          <p
            className="mt-1 font-display text-3xl font-bold tabular-nums text-gold"
            style={{ textShadow: "0 0 24px var(--gold-glow)" }}
          >
            +{formatCredits(instance.reward_granted)} credits
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface-2 p-4">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            Livrable
          </p>
          <pre className="whitespace-pre-wrap font-sans text-sm text-ink">
            {instance.deliverable}
          </pre>
        </div>
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <Button onClick={() => run(requestAssignment)} disabled={pending}>
          {pending ? "…" : "Request Next Assignment"}
        </Button>
      </Card>
    );
  }

  if (instance.status === "specialist_required") {
    return (
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold">{catalogue.title}</p>
          <Badge tone="neutral">Specialist Required</Badge>
        </div>
        <p className="text-sm text-ink-soft">
          Cette Assignment nécessite un employé <strong>{instance.missing_role}</strong> (niveau
          {" "}
          {missingRoleLevel ?? catalogue.level_required}+). Ta Workforce actuelle ne l&apos;inclut
          pas encore. Aucun crédit n&apos;a été engagé.
        </p>
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => run(requestAssignment)} disabled={pending}>
            Passer à l&apos;Assignment suivante
          </Button>
          <Button onClick={() => run(levelUp)} disabled={pending}>
            {pending ? "…" : "Débloquer le niveau suivant"}
          </Button>
        </div>
      </Card>
    );
  }

  if (instance.status === "insufficient_credits") {
    return (
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold">{catalogue.title}</p>
          <Badge tone="bad">Insufficient Credits</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              Coût requis
            </p>
            <p className="font-mono text-lg font-semibold">
              {formatCredits(instance.credit_cost)}
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              Solde actuel {bonusCredits > 0 ? "(+ bonus)" : ""}
            </p>
            <p className="font-mono text-lg font-semibold text-bad">
              {formatCredits(creditBalance + bonusCredits)}
            </p>
          </div>
        </div>
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => run(requestAssignment)} disabled={pending}>
            Passer à l&apos;Assignment suivante
          </Button>
          <a href="/assets">
            <Button disabled={pending}>Ajouter des crédits</Button>
          </a>
        </div>
      </Card>
    );
  }

  // status === "offered" | "in_progress"
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-semibold">{catalogue.title}</p>
        <Badge tone="accent">{catalogue.category}</Badge>
      </div>
      <p className="text-sm text-ink-soft">{catalogue.objective}</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Audience</p>
          <p className="text-sm">{catalogue.audience || "—"}</p>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Livrable</p>
          <p className="text-sm">{catalogue.deliverable_expected}</p>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            Coût d&apos;exécution
          </p>
          <p className="font-mono text-sm font-semibold">{formatCredits(instance.credit_cost)}</p>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            Reward estimée
          </p>
          <p className="font-mono text-sm font-semibold text-good">
            {formatCredits(instance.reward_min)}–{formatCredits(instance.reward_max)}
          </p>
        </div>
      </div>

      {error ? <p className="text-sm text-bad">{error}</p> : null}

      <Button onClick={() => runExecution(instance.id)} disabled={pending}>
        Assign My AI Employees
      </Button>
    </Card>
  );
}
