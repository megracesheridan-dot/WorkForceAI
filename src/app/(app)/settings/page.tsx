import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui";
import { updatePayoutDetails } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">Settings</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Paramètres</h1>
      </div>

      <Card className="flex flex-col gap-3">
        <p className="font-display text-lg font-semibold">Profile</p>
        <p className="text-sm text-ink-soft">Email : {user?.email}</p>
        <p className="text-sm text-ink-soft">Nom affiché : {profile?.display_name}</p>
      </Card>

      <Card className="flex flex-col gap-2">
        <p className="font-display text-lg font-semibold">Language</p>
        <p className="text-sm text-ink-soft">English (par défaut) · Français disponible dans cette interface.</p>
      </Card>

      <Card>
        <p className="font-display text-lg font-semibold">Payout Details</p>
        <p className="mt-1 text-sm text-ink-soft">These details are used when you request a withdrawal and can be updated at any time.</p>
        <form action={updatePayoutDetails} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5"><span className="text-xs text-ink-faint">Payout method</span><input name="payout_method" defaultValue={profile?.payout_method ?? ""} placeholder="Bank transfer, wallet, mobile money" className="input" required /></label>
          <label className="flex flex-col gap-1.5"><span className="text-xs text-ink-faint">Payout address</span><input name="payout_address" defaultValue={profile?.payout_address ?? ""} className="input" required /></label>
          <Button type="submit" className="sm:col-span-2 sm:w-fit">Save payout details</Button>
        </form>
      </Card>

      <Card className="flex flex-col gap-2">
        <p className="font-display text-lg font-semibold">Contact Preferences</p>
        <p className="text-sm text-ink-soft">Configurable depuis l&apos;espace de gestion (section 14 du blueprint).</p>
      </Card>
    </div>
  );
}
