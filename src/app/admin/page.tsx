import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Stat } from "@/components/ui";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: users },
    { count: completed },
    { count: catalogueSize },
    { count: pendingDeposits },
    { count: pendingWithdrawals },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("assignment_instances")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase.from("assignment_catalogue").select("id", { count: "exact", head: true }),
    supabase
      .from("deposit_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("withdrawal_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">Overview</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Vue d&apos;ensemble</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link href="/admin/deposits">
          <Card interactive accent={!!pendingDeposits} className="hover:-translate-y-0.5">
            <Stat
              label="Dépôts en attente"
              value={String(pendingDeposits ?? 0)}
              tone={pendingDeposits ? "gold" : "neutral"}
            />
          </Card>
        </Link>
        <Link href="/admin/withdrawals">
          <Card interactive accent={!!pendingWithdrawals} className="hover:-translate-y-0.5">
            <Stat
              label="Retraits en attente"
              value={String(pendingWithdrawals ?? 0)}
              tone={pendingWithdrawals ? "gold" : "neutral"}
            />
          </Card>
        </Link>
        <Card>
          <Stat label="Utilisateurs" value={String(users ?? 0)} />
        </Card>
        <Card>
          <Stat label="Assignments complétées" value={String(completed ?? 0)} />
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <Stat label="Catalogue" value={String(catalogueSize ?? 0)} />
        </Card>
      </div>
    </div>
  );
}
