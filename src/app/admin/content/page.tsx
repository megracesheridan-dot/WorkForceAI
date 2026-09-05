import { createClient } from "@/lib/supabase/server";
import { Card, Button } from "@/components/ui";
import type { SiteSettings } from "@/lib/types";
import { updateSiteSettings } from "../actions";

export default async function AdminContentPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .single<SiteSettings>();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">Content</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Contenu du site</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Ces textes et coordonnées sont affichés directement sur le site vitrine public.
        </p>
      </div>

      <Card>
        <form action={updateSiteSettings} className="flex flex-col gap-4">
          <div>
            <p className="mb-3 font-display text-lg font-semibold">Hero</p>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-ink-faint">Titre</span>
                <textarea
                  name="hero_title"
                  defaultValue={settings?.hero_title}
                  rows={2}
                  className="input"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-ink-faint">Sous-titre</span>
                <textarea
                  name="hero_subtitle"
                  defaultValue={settings?.hero_subtitle}
                  rows={3}
                  className="input"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-3 font-display text-lg font-semibold">Contacts</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-ink-faint">Email</span>
                <input
                  name="contact_email"
                  type="email"
                  defaultValue={settings?.contact_email ?? ""}
                  className="input"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-ink-faint">Téléphone</span>
                <input
                  name="contact_phone"
                  defaultValue={settings?.contact_phone ?? ""}
                  className="input"
                />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-xs text-ink-faint">Adresse</span>
                <input
                  name="contact_address"
                  defaultValue={settings?.contact_address ?? ""}
                  className="input"
                />
              </label>
            </div>
          </div>

          <Button type="submit" className="self-start">
            Enregistrer
          </Button>
        </form>
      </Card>
    </div>
  );
}
