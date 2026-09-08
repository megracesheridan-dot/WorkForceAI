import { hostname } from "node:os";
import { getAIProvider } from "../lib/ai";
import { runWorkforceExecution } from "../lib/ai/execution";
import type { AssignmentCatalogueItem, AssignmentInstance, ExecutionJob } from "../lib/types";
import { createAdminClient } from "../lib/supabase/admin";

type WorkerStep = {
  id: string;
  employee_id: string;
  ai_employees: { id: string; name: string; role: string; specialty: string } | null;
};

const workerId = process.env.WORKER_ID || `execution-worker:${hostname()}:${process.pid}`;
const pollInterval = Number(process.env.WORKER_POLL_INTERVAL_MS || 3000);

async function processOneJob() {
  const supabase = createAdminClient();
  const { data: job, error: claimError } = await supabase
    .rpc("claim_execution_job", { p_worker_id: workerId, p_lease_seconds: 600 })
    .maybeSingle<ExecutionJob>();
  if (claimError) throw claimError;
  if (!job) return false;

  try {
    const { data: instance, error: instanceError } = await supabase
      .from("assignment_instances")
      .select("*")
      .eq("id", job.assignment_instance_id)
      .single<AssignmentInstance>();
    if (instanceError || !instance) throw instanceError || new Error("Assignment instance not found.");

    const { data: catalogue, error: catalogueError } = await supabase
      .from("assignment_catalogue")
      .select("*")
      .eq("id", instance.catalogue_id)
      .single<AssignmentCatalogueItem>();
    if (catalogueError || !catalogue) throw catalogueError || new Error("Assignment catalogue item not found.");

    const { data: steps, error: stepsError } = await supabase
      .from("execution_steps")
      .select("id, employee_id, ai_employees(id, name, role, specialty)")
      .eq("job_id", job.id)
      .order("sequence", { ascending: true })
      .returns<WorkerStep[]>();
    if (stepsError) throw stepsError;
    const usableSteps = (steps || []).filter((step) => step.ai_employees);
    if (usableSteps.length === 0) throw new Error("No eligible AI Employees were assigned to this execution.");

    const stepByEmployee = new Map(usableSteps.map((step) => [step.employee_id, step]));
    const provider = await getAIProvider();
    const result = await runWorkforceExecution(
      provider,
      {
        title: catalogue.title,
        category: catalogue.category,
        objective: catalogue.objective,
        audience: catalogue.audience,
        tone: catalogue.tone,
        deliverableExpected: catalogue.deliverable_expected,
        recommendedRoles: catalogue.recommended_roles,
        context: catalogue.brief_context ?? {},
      },
      usableSteps.map((step) => step.ai_employees!),
      async (employee, status, output) => {
        const step = stepByEmployee.get(employee.id);
        if (!step) return;
        const payload = status === "running"
          ? { status, started_at: new Date().toISOString() }
          : { status, output_text: output ?? null, completed_at: new Date().toISOString() };
        const { error } = await supabase.from("execution_steps").update(payload).eq("id", step.id);
        if (error) throw error;
      },
    );

    const { error: completeError } = await supabase.rpc("complete_execution_job", {
      p_job_id: job.id,
      p_deliverable: result.deliverable,
      p_quality_score: result.qualityScore,
    });
    if (completeError) throw completeError;
    console.info(`[${workerId}] completed execution ${job.id}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown execution error.";
    const { error: retryError } = await supabase.rpc("retry_execution_job", {
      p_job_id: job.id,
      p_error_message: message,
    });
    if (retryError) throw retryError;
    console.error(`[${workerId}] execution ${job.id} will be retried: ${message}`);
  }
  return true;
}

async function run() {
  console.info(`[${workerId}] started`);
  for (;;) {
    try {
      const processed = await processOneJob();
      if (!processed) await new Promise((resolve) => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error(`[${workerId}] worker error`, error);
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }
}

void run();
