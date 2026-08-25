"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTeam(formData: FormData) {
  const name = String(formData.get("name") || "");
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_team", { p_name: name });
  if (error) throw new Error(error.message);
  revalidatePath("/teams");
}

export async function joinTeam(formData: FormData) {
  const inviteCode = String(formData.get("invite_code") || "");
  const supabase = await createClient();
  const { error } = await supabase.rpc("join_team", { p_invite_code: inviteCode });
  if (error) throw new Error(error.message);
  revalidatePath("/teams");
}

export async function leaveTeam() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_team");
  if (error) throw new Error(error.message);
  revalidatePath("/teams");
}
