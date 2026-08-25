import { createClient } from "@/lib/supabase/server";
import type { AssignmentInstance, AssignmentCatalogueItem, Profile } from "@/lib/types";
import { AssignmentPanel } from "./AssignmentPanel";

export default async function AssignmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  const { data: latest } = await supabase
    .from("assignment_instances")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<AssignmentInstance>();

  let catalogue: AssignmentCatalogueItem | null = null;
  if (latest) {
    const { data } = await supabase
      .from("assignment_catalogue")
      .select("*")
      .eq("id", latest.catalogue_id)
      .single<AssignmentCatalogueItem>();
    catalogue = data;
  }

  const cycleDone =
    (profile?.cycle_position ?? 0) >= (profile?.cycle_total ?? 15) &&
    (!latest || latest.status === "completed");

  const active = cycleDone ? null : latest;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          Assignments
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold">
          Cycle {profile?.cycle_position ?? 0}/{profile?.cycle_total ?? 15}
        </h1>
      </div>

      <AssignmentPanel
        instance={active}
        catalogue={catalogue}
        creditBalance={profile?.credit_balance ?? 0}
        cycleDone={cycleDone}
        nextLevelHint={profile?.level}
      />
    </div>
  );
}
