"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updatePayoutDetails(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_own_payout_details", {
    p_method: String(formData.get("payout_method") || ""),
    p_address: String(formData.get("payout_address") || ""),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}
