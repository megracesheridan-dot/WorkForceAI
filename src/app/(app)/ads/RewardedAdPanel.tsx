"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, Badge, Button, StatusDot } from "@/components/ui";
import { formatCredits } from "@/lib/format";
import { claimRewardedAd } from "./actions";

const WATCH_SECONDS = 6;
const DAILY_LIMIT = 3;

type Phase = "idle" | "watching" | "ready" | "claimed";

export function RewardedAdPanel({
  claimedToday,
  bonusCredits,
}: {
  claimedToday: number;
  bonusCredits: number;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(WATCH_SECONDS);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [granted, setGranted] = useState<number | null>(null);

  const remaining = Math.max(0, DAILY_LIMIT - claimedToday);
  const limitReached = remaining <= 0;

  useEffect(() => {
    if (phase !== "watching") return;
    if (secondsLeft <= 0) {
      setPhase("ready");
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, secondsLeft]);

  function startWatching() {
    setError(null);
    setSecondsLeft(WATCH_SECONDS);
    setPhase("watching");
  }

  function claim() {
    setError(null);
    startTransition(async () => {
      try {
        const amount = await claimRewardedAd();
        setGranted(amount);
        setPhase("claimed");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Une erreur est survenue.");
        setPhase("idle");
      }
    });
  }

  if (phase === "claimed") {
    return (
      <Card accent className="flex flex-col items-start gap-3">
        <Badge tone="gold">Bonus réclamé</Badge>
        <p className="font-display text-3xl font-bold text-gold">
          +{formatCredits(granted)} bonus credits
        </p>
        <p className="text-sm text-ink-soft">
          Ajoutés à tes Bonus Credits — utilisables sur tes prochaines Assignments, non
          retirables.
        </p>
        <Button variant="ghost" onClick={() => setPhase("idle")}>
          Fermer
        </Button>
      </Card>
    );
  }

  if (phase === "watching" || phase === "ready") {
    return (
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold">Publicité en cours</p>
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-cyan">
            <StatusDot live={phase === "watching"} />
            {phase === "watching" ? `${secondsLeft}s` : "Terminé"}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-cyan transition-all duration-1000 ease-linear"
            style={{ width: `${((WATCH_SECONDS - secondsLeft) / WATCH_SECONDS) * 100}%` }}
          />
        </div>
        <p className="text-xs text-ink-faint">
          Simulation — regarde jusqu&apos;au bout pour débloquer la réclamation. (Aucun vrai
          réseau publicitaire n&apos;est encore branché.)
        </p>
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <Button onClick={claim} disabled={phase !== "ready" || pending}>
          {pending ? "…" : "Claim Bonus Credits"}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-start gap-3">
      <div className="flex w-full items-center justify-between">
        <p className="font-display text-lg font-semibold">Rewarded Ads</p>
        <Badge tone={limitReached ? "neutral" : "cyan"}>
          {claimedToday}/{DAILY_LIMIT} aujourd&apos;hui
        </Badge>
      </div>
      <p className="text-sm text-ink-soft">
        Regarde une publicité complète pour débloquer quelques Bonus Credits — utilisables sur
        tes prochaines Assignments, non retirables. Limité à {DAILY_LIMIT} par jour.
      </p>
      <p className="font-mono text-xs text-ink-faint">
        Solde actuel : {formatCredits(bonusCredits)} bonus credits
      </p>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      {limitReached ? (
        <Badge tone="neutral">Cycle du jour atteint — reviens demain</Badge>
      ) : (
        <Button onClick={startWatching}>Regarder une publicité</Button>
      )}
    </Card>
  );
}
