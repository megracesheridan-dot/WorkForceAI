import { createClient } from "@/lib/supabase/server";
import type { Profile, Team } from "@/lib/types";
import { TeamsPanel } from "./TeamsPanel";

export default async function TeamsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  let team: Team | null = null;
  let teammates: { id: string; display_name: string | null; level: number }[] = [];
  let completedToday = 0;

  if (profile?.team_id) {
    const { data: teamData } = await supabase
      .from("teams")
      .select("*")
      .eq("id", profile.team_id)
      .single<Team>();
    team = teamData;

    const { data: teammatesData } = await supabase
      .from("profiles")
      .select("id, display_name, level")
      .eq("team_id", profile.team_id)
      .returns<{ id: string; display_name: string | null; level: number }[]>();
    teammates = teammatesData ?? [];

    const { data: completedTodayData } = await supabase.rpc("team_completed_today", {
      p_team_id: profile.team_id,
    });
    completedToday = completedTodayData ?? 0;
  }

  const bonusPct = Math.min(25, completedToday);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">Teams</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">
          {team ? team.name : "Ton équipe"}
        </h1>
      </div>
      <TeamsPanel
        team={team}
        teammates={teammates}
        completedToday={completedToday}
        bonusPct={bonusPct}
      />
    </div>
  );
}
