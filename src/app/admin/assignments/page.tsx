import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui";
import { formatCredits } from "@/lib/format";
import type { AssignmentCatalogueItem } from "@/lib/types";
import { createCatalogueItem, toggleCatalogueStatus } from "../actions";

export default async function AdminAssignmentsPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("assignment_catalogue")
    .select("*")
    .order("level_required", { ascending: true })
    .returns<AssignmentCatalogueItem[]>();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          Assignment Catalogue
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Catalogue d&apos;Assignments</h1>
      </div>

      <Card>
        <p className="mb-4 font-display text-lg font-semibold">Nouvelle Assignment</p>
        <form action={createCatalogueItem} className="grid grid-cols-2 gap-3">
          <input name="title" placeholder="Titre" required className="input" />
          <input name="category" placeholder="Catégorie" required className="input" />
          <input
            name="level_required"
            type="number"
            min={1}
            defaultValue={1}
            placeholder="Niveau requis"
            required
            className="input"
          />
          <input
            name="recommended_roles"
            placeholder="Rôles recommandés (séparés par virgule)"
            className="input"
          />
          <textarea
            name="objective"
            placeholder="Objectif"
            required
            className="input col-span-2"
            rows={2}
          />
          <input name="audience" placeholder="Audience" className="input" />
          <input name="tone" placeholder="Ton" className="input" />
          <textarea
            name="deliverable_expected"
            placeholder="Livrable attendu"
            required
            className="input col-span-2"
            rows={2}
          />
          <input
            name="credit_cost"
            type="number"
            step="0.01"
            placeholder="Coût (crédits)"
            required
            className="input"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="reward_min"
              type="number"
              step="0.01"
              placeholder="Reward min"
              required
              className="input"
            />
            <input
              name="reward_max"
              type="number"
              step="0.01"
              placeholder="Reward max"
              required
              className="input"
            />
          </div>
          <button
            type="submit"
            className="col-span-2 mt-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
          >
            Ajouter au catalogue
          </button>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {(items ?? []).map((item) => (
          <Card key={item.id} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium">
                {item.title} <span className="text-ink-faint">· Niveau {item.level_required}</span>
              </p>
              <p className="text-xs text-ink-soft">
                {formatCredits(item.credit_cost)} credits → {formatCredits(item.reward_min)}–
                {formatCredits(item.reward_max)} reward
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={item.status === "active" ? "good" : "neutral"}>{item.status}</Badge>
              <form action={toggleCatalogueStatus}>
                <input type="hidden" name="id" value={item.id} />
                <input
                  type="hidden"
                  name="next_status"
                  value={item.status === "active" ? "inactive" : "active"}
                />
                <button type="submit" className="text-sm text-accent-strong underline">
                  {item.status === "active" ? "Désactiver" : "Activer"}
                </button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
