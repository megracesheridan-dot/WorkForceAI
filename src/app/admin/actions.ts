"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Toutes les écritures ici respectent les policies RLS "admin" (vérifiées côté DB,
// pas seulement côté UI) : un non-admin qui appellerait ces actions serait rejeté par Postgres.

export async function grantCredits(formData: FormData) {
  const userId = String(formData.get("user_id"));
  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") || "Admin manual credit");

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_grant_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_note: note,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}

export async function createCatalogueItem(formData: FormData) {
  const supabase = await createClient();
  const recommendedRoles = String(formData.get("recommended_roles") || "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  const { error } = await supabase.from("assignment_catalogue").insert({
    title: String(formData.get("title")),
    category: String(formData.get("category")),
    level_required: Number(formData.get("level_required")),
    objective: String(formData.get("objective")),
    audience: String(formData.get("audience") || "") || null,
    tone: String(formData.get("tone") || "") || null,
    deliverable_expected: String(formData.get("deliverable_expected")),
    recommended_roles: recommendedRoles,
    credit_cost: Number(formData.get("credit_cost")),
    reward_min: Number(formData.get("reward_min")),
    reward_max: Number(formData.get("reward_max")),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/assignments");
}

export async function toggleCatalogueStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const nextStatus = String(formData.get("next_status"));

  const supabase = await createClient();
  const { error } = await supabase
    .from("assignment_catalogue")
    .update({ status: nextStatus })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/assignments");
}
