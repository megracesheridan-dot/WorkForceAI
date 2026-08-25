"use client";

import { useState, useTransition } from "react";
import { Card, Badge, Button } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { Team } from "@/lib/types";
import { createTeam, joinTeam, leaveTeam } from "./actions";

interface Teammate {
  id: string;
  display_name: string | null;
  level: number;
}

export function TeamsPanel({
  team,
  teammates,
  completedToday,
  bonusPct,
}: {
  team: Team | null;
  teammates: Teammate[];
  completedToday: number;
  bonusPct: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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

  if (!team) {
    return (
      <div className="flex flex-col gap-4">
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <Card className="flex flex-col gap-3">
          <p className="font-display text-lg font-semibold">Créer une équipe</p>
          <p className="text-sm text-ink-soft">
            Ton équipe débloque un bonus de performance calculé sur les Assignments
            réellement complétées par ses membres — pas un chiffre décoratif.
          </p>
          <form
            action={(fd) => run(() => createTeam(fd))}
            className="flex flex-wrap items-center gap-3"
          >
            <input
              name="name"
              placeholder="Nom de l'équipe"
              required
              className="w-56 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            />
            <Button type="submit" disabled={pending}>
              {pending ? "…" : "Créer"}
            </Button>
          </form>
        </Card>

        <Card className="flex flex-col gap-3">
          <p className="font-display text-lg font-semibold">Rejoindre une équipe</p>
          <p className="text-sm text-ink-soft">
            Demande le code d&apos;invitation à un membre de l&apos;équipe.
          </p>
          <form
            action={(fd) => run(() => joinTeam(fd))}
            className="flex flex-wrap items-center gap-3"
          >
            <input
              name="invite_code"
              placeholder="Code d'invitation"
              required
              className="w-56 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-mono uppercase"
            />
            <Button type="submit" disabled={pending}>
              {pending ? "…" : "Rejoindre"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-bad">{error}</p> : null}

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold">{team.name}</p>
          <Badge tone={bonusPct > 0 ? "good" : "neutral"}>
            {bonusPct > 0 ? `Bonus d'équipe actif : +${bonusPct}%` : "Bonus d'équipe : 0%"}
          </Badge>
        </div>
        <p className="text-sm text-ink-soft">
          {bonusPct > 0
            ? `Ton équipe a complété ${completedToday} Assignment${completedToday > 1 ? "s" : ""} aujourd'hui — chaque Performance Reward de l'équipe est majorée de ${bonusPct}% tant que ce rythme continue.`
            : "Complète des Assignments avec ton équipe aujourd'hui pour activer le bonus — +1% par Assignment complétée par l'équipe, jusqu'à +25%."}
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              Code d&apos;invitation
            </p>
            <p className="font-mono text-lg font-semibold">{team.invite_code}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              Membres
            </p>
            <p className="font-mono text-lg font-semibold">{teammates.length}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              Assignments aujourd&apos;hui
            </p>
            <p className="font-mono text-lg font-semibold">{completedToday}</p>
          </div>
        </div>
        <p className="text-xs text-ink-faint">Créée le {formatDate(team.created_at)}</p>
        <div>
          <Button variant="ghost" onClick={() => run(leaveTeam)} disabled={pending}>
            {pending ? "…" : "Quitter l'équipe"}
          </Button>
        </div>
      </Card>

      <div>
        <p className="mb-3 font-display text-lg font-semibold">Membres</p>
        <div className="flex flex-col gap-2">
          {teammates.map((m) => (
            <Card key={m.id} className="flex items-center justify-between py-3">
              <p className="text-sm font-medium">{m.display_name || "AI Manager"}</p>
              <Badge tone="neutral">Niveau {m.level}</Badge>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
