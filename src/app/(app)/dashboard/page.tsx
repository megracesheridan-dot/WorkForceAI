import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Stat, Badge } from "@/components/ui";
import { formatCredits, formatDate } from "@/lib/format";
import type { AppNotification, Profile } from "@/lib/types";

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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          Dashboard
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold">
          Bon retour, {profile?.display_name || "AI Manager"}.
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <Stat label="Assignment Cycle" value={`${profile?.cycle_position ?? 0}/${profile?.cycle_total ?? 15}`} />
        </Card>
        <Card>
          <Stat label="Credit Balance" value={formatCredits(profile?.credit_balance)} />
        </Card>
        <Card>
          <Stat label="Workforce Level" value={String(profile?.level ?? 1)} />
        </Card>
        <Card>
          <Stat label="Assignments Completed" value={String(completedCount ?? 0)} />
        </Card>
      </div>

      <Card className="flex flex-col items-start gap-3">
        <p className="font-display text-lg font-semibold">Prêt pour la prochaine Assignment ?</p>
        <p className="text-sm text-ink-soft">
          Ton Workforce attend une mission. Coût et reward estimée seront affichés avant tout
          engagement de crédit.
        </p>
        <Link
          href="/assignments"
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
        >
          Request Assignment
        </Link>
      </Card>

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
