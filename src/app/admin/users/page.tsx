import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui";
import { formatCredits } from "@/lib/format";
import type { Profile } from "@/lib/types";

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
        <h1 className="mt-1 font-display text-3xl font-semibold">User Control</h1>
        <p className="mt-1 text-sm text-ink-soft">Open a profile to manage account access, payout details, balances, team context, and audit history.</p>
      </div>

      <div className="flex flex-col gap-3">
        {(users ?? []).map((u) => (
          <Link key={u.id} href={`/admin/users/${u.id}`}>
          <Card interactive className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium">{u.display_name || u.id}</p>
              <p className="text-xs text-ink-faint">
                Level {u.level} · Cycle {u.cycle_position}/{u.cycle_total} · {u.account_status}
                {u.is_admin ? " · " : ""}
                {u.is_admin ? <Badge tone="accent">Admin</Badge> : null}
              </p>
            </div>
            <div className="text-right"><div className="font-mono text-sm font-semibold tabular-nums">{formatCredits(u.credit_balance)} credits</div><p className="mt-1 text-xs text-ink-faint">Open control record</p></div>
          </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
