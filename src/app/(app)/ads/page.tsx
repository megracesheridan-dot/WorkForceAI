import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { RewardedAdPanel } from "./RewardedAdPanel";

export default async function AdsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  const { data: claimedToday } = await supabase.rpc("rewarded_ads_claimed_today");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          Rewarded Ads
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Filet de relance quotidien</h1>
      </div>
      <RewardedAdPanel
        claimedToday={claimedToday ?? 0}
        bonusCredits={profile?.bonus_credits ?? 0}
      />
    </div>
  );
}
