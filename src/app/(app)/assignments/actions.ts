"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function requestAssignment() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_assignment", { p_idempotency_key: crypto.randomUUID() });
  if (error) throw new Error(error.message);
  revalidatePath("/assignments");
  revalidatePath("/dashboard");
}

export async function assignAndExecute(instanceId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("enqueue_assignment_execution", {
    p_instance_id: instanceId,
    p_idempotency_key: crypto.randomUUID(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  revalidatePath("/assets");
}

export async function resumeExecution(jobId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("resume_execution_job", { p_job_id: jobId });
  if (error) throw new Error(error.message);
  revalidatePath("/assignments");
  revalidatePath("/dashboard");
}

export async function levelUp() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("level_up");
  if (error) throw new Error(error.message);
  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  revalidatePath("/workforce");
}
