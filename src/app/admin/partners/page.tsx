import { createClient } from "@/lib/supabase/server";
import { Card, Badge, Button } from "@/components/ui";
import type { PartnerLogo } from "@/lib/types";
import { createPartnerLogo, togglePartnerLogoStatus, deletePartnerLogo } from "../actions";

export default async function AdminPartnersPage() {
  const supabase = await createClient();
  const { data: partners } = await supabase
    .from("partner_logos")
    .select("*")
    .order("sort_order", { ascending: true })
    .returns<PartnerLogo[]>();

  const urlByPath = new Map<string, string>();
  for (const p of partners ?? []) {
    const { data } = supabase.storage.from("partner-logos").getPublicUrl(p.logo_path);
    urlByPath.set(p.logo_path, data.publicUrl);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">Partners</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Logos partenaires</h1>
        <p className="mt-1 text-sm text-ink-soft">
          La bande de logos n&apos;apparaît sur le site public que si au moins un partenaire est
          actif ici — jamais de logo affiché sans vrai partenariat.
        </p>
      </div>

      <Card>
        <p className="mb-4 font-display text-lg font-semibold">Nouveau partenaire</p>
        <form action={createPartnerLogo} className="grid grid-cols-2 gap-3">
          <input name="name" placeholder="Nom du partenaire" required className="input" />
          <input
            name="website_url"
            type="url"
            placeholder="Site web (optionnel)"
            className="input"
          />
          <input
            name="sort_order"
            type="number"
            defaultValue={0}
            placeholder="Ordre d'affichage"
            className="input"
          />
          <label className="flex items-center">
            <input
              name="logo"
              type="file"
              accept="image/*"
              required
              className="input file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-ink"
            />
          </label>
          <Button type="submit" className="col-span-2 mt-1">
            Ajouter
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {(partners ?? []).map((p) => (
          <Card key={p.id} className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlByPath.get(p.logo_path)}
                alt={p.name}
                className="h-10 w-10 rounded-lg border border-border bg-surface-2 object-contain p-1"
              />
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-ink-faint">Ordre {p.sort_order}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={p.active ? "good" : "neutral"}>{p.active ? "actif" : "inactif"}</Badge>
              <form action={togglePartnerLogoStatus}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="next_active" value={(!p.active).toString()} />
                <Button type="submit" variant="ghost" className="px-3 py-1.5 text-xs">
                  {p.active ? "Désactiver" : "Activer"}
                </Button>
              </form>
              <form action={deletePartnerLogo}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="logo_path" value={p.logo_path} />
                <Button type="submit" variant="danger" className="px-3 py-1.5 text-xs">
                  Supprimer
                </Button>
              </form>
            </div>
          </Card>
        ))}
        {!partners?.length ? (
          <Card className="text-center text-sm text-ink-faint">
            Aucun partenaire pour l&apos;instant — la section reste masquée sur le site public.
          </Card>
        ) : null}
      </div>
    </div>
  );
}
