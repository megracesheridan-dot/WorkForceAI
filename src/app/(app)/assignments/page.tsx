import { createClient } from "@/lib/supabase/server";
import type { AssignmentInstance, AssignmentCatalogueItem, AiEmployee, Profile } from "@/lib/types";
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

  let employees: AiEmployee[] = [];
  if (catalogue) {
    const { data } = await supabase
      .from("ai_employees")
      .select("*")
      .in("role", catalogue.recommended_roles)
      .returns<AiEmployee[]>();
    employees = data ?? [];
  }

  let missingRoleLevel: number | null = null;
  if (latest?.status === "specialist_required" && latest.missing_role) {
    const { data } = await supabase
      .from("ai_employees")
      .select("level_required")
      .eq("role", latest.missing_role)
      .order("level_required", { ascending: true })
      .limit(1)
      .maybeSingle<{ level_required: number }>();
    missingRoleLevel = data?.level_required ?? null;
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
        missingRoleLevel={missingRoleLevel}
        employees={employees}
      />
    </div>
  );
}
