import { createClient } from "@/lib/supabase/server";
import { Card, Badge, Button } from "@/components/ui";
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
            <div className="font-mono text-sm font-semibold tabular-nums">
              {formatCredits(u.credit_balance)} credits
            </div>
            <form action={grantCredits} className="flex items-center gap-2">
              <input type="hidden" name="user_id" value={u.id} />
              <input
                name="amount"
                type="number"
                step="0.01"
                placeholder="Montant"
                required
                className="input w-28"
              />
              <input name="note" type="text" placeholder="Note" className="input w-36" />
              <Button type="submit" className="px-3 py-1.5">
                Créditer
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
