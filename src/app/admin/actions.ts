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

export async function createEmployee(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("ai_employees").insert({
    name: String(formData.get("name")),
    role: String(formData.get("role")),
    specialty: String(formData.get("specialty")),
    level_required: Number(formData.get("level_required")),
    execution_capacity: Number(formData.get("execution_capacity")),
    precision_rate: Number(formData.get("precision_rate")),
    speed_index: Number(formData.get("speed_index")),
    synergy_bonus: Number(formData.get("synergy_bonus")),
    icon: String(formData.get("icon") || "Bot"),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/employees");
  revalidatePath("/");
}

export async function toggleEmployeeStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const nextActive = formData.get("next_active") === "true";

  const supabase = await createClient();
  const { error } = await supabase
    .from("ai_employees")
    .update({ active: nextActive })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/employees");
  revalidatePath("/");
}

export async function updateSiteSettings(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      hero_title: String(formData.get("hero_title") || ""),
      hero_subtitle: String(formData.get("hero_subtitle") || ""),
      contact_email: String(formData.get("contact_email") || "") || null,
      contact_phone: String(formData.get("contact_phone") || "") || null,
      contact_address: String(formData.get("contact_address") || "") || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/content");
  revalidatePath("/");
}

export async function createPartnerLogo(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") || "").trim();
  const websiteUrl = String(formData.get("website_url") || "").trim() || null;
  const sortOrder = Number(formData.get("sort_order") || 0);
  const logo = formData.get("logo") as File | null;

  if (!logo || logo.size === 0) throw new Error("Un fichier logo est requis.");
  if (logo.size > 4 * 1024 * 1024) throw new Error("Le fichier dépasse 4 Mo.");

  const ext = logo.name.includes(".") ? logo.name.split(".").pop() : "png";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("partner-logos")
    .upload(path, logo, { contentType: logo.type || "image/png" });
  if (uploadError) throw new Error(uploadError.message);

  const { error } = await supabase.from("partner_logos").insert({
    name,
    logo_path: path,
    website_url: websiteUrl,
    sort_order: sortOrder,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/partners");
  revalidatePath("/");
}

export async function togglePartnerLogoStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const nextActive = formData.get("next_active") === "true";

  const supabase = await createClient();
  const { error } = await supabase
    .from("partner_logos")
    .update({ active: nextActive })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/partners");
  revalidatePath("/");
}

export async function deletePartnerLogo(formData: FormData) {
  const id = String(formData.get("id"));
  const logoPath = String(formData.get("logo_path"));

  const supabase = await createClient();
  const { error } = await supabase.from("partner_logos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.storage.from("partner-logos").remove([logoPath]);

  revalidatePath("/admin/partners");
  revalidatePath("/");
}

export async function approveDeposit(formData: FormData) {
  const requestId = String(formData.get("request_id"));
  const note = String(formData.get("note") || "") || null;

  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_deposit", {
    p_request_id: requestId,
    p_note: note,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/deposits");
  revalidatePath("/admin");
}

export async function rejectDeposit(formData: FormData) {
  const requestId = String(formData.get("request_id"));
  const note = String(formData.get("note") || "") || null;

  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_deposit", {
    p_request_id: requestId,
    p_note: note,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/deposits");
  revalidatePath("/admin");
}

export async function approveWithdrawal(formData: FormData) {
  const requestId = String(formData.get("request_id"));
  const note = String(formData.get("note") || "") || null;

  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_withdrawal", {
    p_request_id: requestId,
    p_note: note,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/withdrawals");
  revalidatePath("/admin");
}

export async function rejectWithdrawal(formData: FormData) {
  const requestId = String(formData.get("request_id"));
  const note = String(formData.get("note") || "") || null;

  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_withdrawal", {
    p_request_id: requestId,
    p_note: note,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/withdrawals");
  revalidatePath("/admin");
}
