"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function claimRewardedAd(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_rewarded_ad");
  if (error) throw new Error(error.message);
  revalidatePath("/ads");
  revalidatePath("/assets");
  revalidatePath("/dashboard");
  return data as number;
}
