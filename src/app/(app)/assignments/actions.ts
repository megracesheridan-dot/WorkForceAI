"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai";
import type { AssignmentCatalogueItem, AssignmentInstance, AiEmployee } from "@/lib/types";

export async function requestAssignment() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_assignment");
  if (error && error.message !== "cycle_completed") {
    throw new Error(error.message);
  }
  revalidatePath("/assignments");
  revalidatePath("/dashboard");
}

export async function assignAndExecute(instanceId: string) {
  const supabase = await createClient();

  // 1) Coût déduit uniquement si le solde suffit encore (vérification atomique côté DB).
  const { data: started, error: startError } = await supabase
    .rpc("start_assignment", { p_instance_id: instanceId })
    .single<AssignmentInstance>();

  if (startError) throw new Error(startError.message);
  if (!started || started.status !== "in_progress") {
    // insufficient_credits détecté au moment T : on s'arrête là, rien n'a été facturé.
    revalidatePath("/assignments");
    return;
  }

  // 2) Récupère le brief complet + les employés mobilisés pour générer un livrable réel.
  const { data: catalogue } = await supabase
    .from("assignment_catalogue")
    .select("*")
    .eq("id", started.catalogue_id)
    .single<AssignmentCatalogueItem>();

  const { data: employees } = await supabase
    .from("ai_employees")
    .select("*")
    .in("role", catalogue?.recommended_roles ?? [])
    .returns<AiEmployee[]>();

  const employeeNames = (employees ?? []).map((e) => `${e.name} (${e.role})`);

  let deliverable: string;
  try {
    const provider = await getAIProvider();
    deliverable = await provider.runAssignment(
      {
        title: catalogue!.title,
        category: catalogue!.category,
        objective: catalogue!.objective,
        audience: catalogue!.audience,
        tone: catalogue!.tone,
        deliverableExpected: catalogue!.deliverable_expected,
        recommendedRoles: catalogue!.recommended_roles,
      },
      employeeNames,
    );
  } catch {
    deliverable =
      "⚠️ Le moteur IA n'a pas pu produire de livrable (clé OPENAI_API_KEY invalide dans .env.local). " +
      "Vérifie la clé, ou retire-la de .env.local pour repasser sur le moteur simulé.";
  }

  // 3) Clôture atomique : reward + ledger + cycle + notification.
  const { error: completeError } = await supabase.rpc("complete_assignment", {
    p_instance_id: instanceId,
    p_deliverable: deliverable,
  });
  if (completeError) throw new Error(completeError.message);

  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  revalidatePath("/assets");
}

export async function levelUp() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("level_up");
  if (error) throw new Error(error.message);
  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  revalidatePath("/workforce");
}
