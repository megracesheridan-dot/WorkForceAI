import { createClient } from "@/lib/supabase/server";
import { Card, Stat } from "@/components/ui";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ count: users }, { count: completed }, { count: catalogueSize }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("assignment_instances")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase.from("assignment_catalogue").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">Overview</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Vue d&apos;ensemble</h1>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <Stat label="Utilisateurs" value={String(users ?? 0)} />
        </Card>
        <Card>
          <Stat label="Assignments complétées" value={String(completed ?? 0)} />
        </Card>
        <Card>
          <Stat label="Catalogue" value={String(catalogueSize ?? 0)} />
        </Card>
      </div>
    </div>
  );
}
