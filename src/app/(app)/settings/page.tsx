import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import type { Profile } from "@/lib/types";

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

      <Card className="flex flex-col gap-2">
        <p className="font-display text-lg font-semibold">Contact Preferences</p>
        <p className="text-sm text-ink-soft">Configurable depuis l&apos;espace de gestion (section 14 du blueprint).</p>
      </Card>
    </div>
  );
}
