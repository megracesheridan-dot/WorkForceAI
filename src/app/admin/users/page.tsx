import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui";
import { formatCredits } from "@/lib/format";
import type { Profile } from "@/lib/types";
import { grantCredits } from "../actions";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Profile[]>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">Users</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Utilisateurs</h1>
      </div>

      <div className="flex flex-col gap-3">
        {(users ?? []).map((u) => (
          <Card key={u.id} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium">{u.display_name || u.id}</p>
              <p className="text-xs text-ink-faint">
                Level {u.level} · Cycle {u.cycle_position}/{u.cycle_total}
                {u.is_admin ? " · " : ""}
                {u.is_admin ? <Badge tone="accent">Admin</Badge> : null}
              </p>
            </div>
            <div className="font-mono text-sm">{formatCredits(u.credit_balance)} credits</div>
            <form action={grantCredits} className="flex items-center gap-2">
              <input type="hidden" name="user_id" value={u.id} />
              <input
                name="amount"
                type="number"
                step="0.01"
                placeholder="Montant"
                required
                className="w-28 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm"
              />
              <input
                name="note"
                type="text"
                placeholder="Note"
                className="w-36 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-strong"
              >
                Créditer
              </button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
