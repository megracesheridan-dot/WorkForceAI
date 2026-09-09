import { createClient } from "@/lib/supabase/server";
import type { AssignmentInstance, AssignmentCatalogueItem, ExecutionJob, ExecutionStep, Profile } from "@/lib/types";
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

  let missingRoleLevel: number | null = null;
  if (latest?.status === "paused" && latest.missing_role) {
    const { data } = await supabase
      .from("ai_employees")
      .select("level_required")
      .eq("role", latest.missing_role)
      .order("level_required", { ascending: true })
      .limit(1)
      .maybeSingle<{ level_required: number }>();
    missingRoleLevel = data?.level_required ?? null;
  }

  let executionJob: ExecutionJob | null = null;
  let executionSteps: ExecutionStep[] = [];
  if (latest?.execution_job_id) {
    const { data } = await supabase
      .from("execution_jobs")
      .select("*")
      .eq("id", latest.execution_job_id)
      .single<ExecutionJob>();
    executionJob = data;
    const { data: steps } = await supabase
      .from("execution_steps")
      .select("id, job_id, employee_id, sequence, status, output_text, started_at, completed_at, ai_employees(id, name, role)")
      .eq("job_id", latest.execution_job_id)
      .order("sequence", { ascending: true })
      .returns<ExecutionStep[]>();
    executionSteps = steps ?? [];
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
        bonusCredits={profile?.bonus_credits ?? 0}
        cycleDone={cycleDone}
        nextLevelHint={profile?.level}
        missingRoleLevel={missingRoleLevel}
        executionJob={executionJob}
        executionSteps={executionSteps}
      />
    </div>
  );
}
