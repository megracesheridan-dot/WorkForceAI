import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Stat, Badge, Button, StatusDot } from "@/components/ui";
import { formatCredits, formatDate } from "@/lib/format";
import type { AppNotification, AssignmentCatalogueItem, AssignmentInstance, Profile, Team } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<AppNotification[]>();

  const { count: completedCount } = await supabase
    .from("assignment_instances")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .eq("status", "completed");

  const { data: latest } = await supabase
    .from("assignment_instances")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<AssignmentInstance>();

  const cyclePosition = profile?.cycle_position ?? 0;
  const cycleTotal = profile?.cycle_total ?? 15;
  const cycleDone = cyclePosition >= cycleTotal;
  const hasPendingAssignment = !cycleDone && latest && latest.status !== "completed";

  let pendingCatalogue: AssignmentCatalogueItem | null = null;
  if (hasPendingAssignment) {
    const { data } = await supabase
      .from("assignment_catalogue")
      .select("*")
      .eq("id", latest!.catalogue_id)
      .single<AssignmentCatalogueItem>();
    pendingCatalogue = data;
  }

  let team: Team | null = null;
  let teamBonusPct = 0;
  if (profile?.team_id) {
    const { data: teamData } = await supabase
      .from("teams")
      .select("*")
      .eq("id", profile.team_id)
      .single<Team>();
    team = teamData;
    const { data: completedTodayData } = await supabase.rpc("team_completed_today", {
      p_team_id: profile.team_id,
    });
    teamBonusPct = Math.min(25, completedTodayData ?? 0);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
              Dashboard
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold">
              Bon retour, {profile?.display_name || "AI Manager"}.
            </h1>
          </div>
          {team && teamBonusPct > 0 ? (
            <Badge tone="cyan">
              {team.name} · Bonus +{teamBonusPct}%
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${cycleDone ? 100 : Math.min(100, (cyclePosition / cycleTotal) * 100)}%` }}
            />
          </div>
          <p className="font-mono text-xs text-ink-faint">
            Assignment Cycle {cyclePosition}/{cycleTotal}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="flex flex-col justify-between gap-4">
          <Stat label="Credit Balance" value={formatCredits(profile?.credit_balance)} />
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
            <Stat label="Workforce Level" value={String(profile?.level ?? 1)} />
            <Stat label="Assignments Completed" value={String(completedCount ?? 0)} />
          </div>
        </Card>

        <Card className="flex flex-col items-start gap-3">
          {cycleDone ? (
            <>
              <p className="font-display text-lg font-semibold">Cycle du jour terminé</p>
              <p className="text-sm text-ink-soft">
                Ton Workforce a complété toutes les Assignments du jour. Reviens demain pour un
                nouveau cycle.
              </p>
            </>
          ) : hasPendingAssignment && pendingCatalogue ? (
            <>
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-cyan">
                <StatusDot live /> Mission en attente
              </span>
              <p className="font-display text-lg font-semibold">{pendingCatalogue.title}</p>
              <p className="text-sm text-ink-soft">
                Coût et reward estimée sont déjà affichés — aucun crédit engagé tant que tu ne
                lances pas l&apos;exécution.
              </p>
              <Link href="/assignments">
                <Button>Continuer</Button>
              </Link>
            </>
          ) : (
            <>
              <p className="font-display text-lg font-semibold">Prêt pour la prochaine Assignment ?</p>
              <p className="text-sm text-ink-soft">
                Ton Workforce attend une mission. Coût et reward estimée seront affichés avant
                tout engagement de crédit.
              </p>
              <Link href="/assignments">
                <Button>Request Assignment</Button>
              </Link>
            </>
          )}
        </Card>
      </div>

      <div>
        <p className="mb-3 font-display text-lg font-semibold">Notifications récentes</p>
        <div className="flex flex-col gap-2">
          {notifications && notifications.length > 0 ? (
            notifications.map((n) => (
              <Card key={n.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-ink-soft">{n.body}</p>
                </div>
                <Badge tone={n.read ? "neutral" : "accent"}>{formatDate(n.created_at)}</Badge>
              </Card>
            ))
          ) : (
            <p className="text-sm text-ink-faint">Aucune notification pour l&apos;instant.</p>
          )}
        </div>
      </div>
    </div>
  );
}
