"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function requestDeposit(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not_authenticated");

  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") || "").trim();
  const proof = formData.get("proof") as File | null;

  if (!proof || proof.size === 0) {
    throw new Error("Une preuve de paiement (capture ou reçu) est requise.");
  }
  if (proof.size > 8 * 1024 * 1024) {
    throw new Error("Le fichier de preuve dépasse 8 Mo.");
  }

  const ext = proof.name.includes(".") ? proof.name.split(".").pop() : "bin";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("deposit-proofs")
    .upload(path, proof, { contentType: proof.type || "application/octet-stream" });
  if (uploadError) throw new Error(uploadError.message);

  const { error } = await supabase.rpc("request_deposit", {
    p_amount: amount,
    p_method: method,
    p_proof_path: path,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/assets");
}

export async function requestWithdrawal(formData: FormData) {
  const supabase = await createClient();
  const amount = Number(formData.get("amount"));
  const destination = String(formData.get("destination") || "").trim();

  const { error } = await supabase.rpc("request_withdrawal", {
    p_amount: amount,
    p_destination: destination,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/assets");
}
