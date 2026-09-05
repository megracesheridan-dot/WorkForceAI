import { createClient } from "@/lib/supabase/server";
import { Card, Badge, Button } from "@/components/ui";
import { formatCredits, formatDate } from "@/lib/format";
import type { WithdrawalRequest, Profile } from "@/lib/types";
import { approveWithdrawal, rejectWithdrawal } from "../actions";

const STATUS_TONE: Record<string, "good" | "bad" | "neutral"> = {
  pending: "neutral",
  approved: "good",
  rejected: "bad",
};

export default async function AdminWithdrawalsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<WithdrawalRequest[]>();

  const userIds = Array.from(new Set((requests ?? []).map((r) => r.user_id)));
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", userIds).returns<
        Pick<Profile, "id" | "display_name">[]
      >()
    : { data: [] as Pick<Profile, "id" | "display_name">[] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  const pending = (requests ?? []).filter((r) => r.status === "pending");
  const reviewed = (requests ?? []).filter((r) => r.status !== "pending");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          Withdrawals
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Demandes de retrait</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Les fonds sont déjà retenus sur le compte utilisateur. Approuver confirme que le
          virement réel a été effectué manuellement ; refuser rembourse automatiquement le
          solde.
        </p>
      </div>

      <div>
        <p className="mb-3 font-display text-lg font-semibold">
          En attente <span className="text-ink-faint">({pending.length})</span>
        </p>
        <div className="flex flex-col gap-3">
          {pending.map((r) => (
            <Card key={r.id} className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium">{nameById.get(r.user_id) || r.user_id}</p>
                <p className="font-mono text-sm font-semibold tabular-nums text-accent-strong">
                  {formatCredits(r.amount)} crédits
                </p>
                <p className="mt-1 max-w-md text-xs text-ink-soft">
                  Destination : {r.destination}
                </p>
                <p className="text-xs text-ink-faint">{formatDate(r.created_at)}</p>
              </div>
              <div className="flex flex-col gap-2">
                <form action={approveWithdrawal} className="flex items-center gap-2">
                  <input type="hidden" name="request_id" value={r.id} />
                  <input name="note" placeholder="Note (optionnel)" className="input w-40" />
                  <Button type="submit" className="px-3 py-1.5 text-xs">
                    Approuver (viré)
                  </Button>
                </form>
                <form action={rejectWithdrawal} className="flex items-center gap-2">
                  <input type="hidden" name="request_id" value={r.id} />
                  <input name="note" placeholder="Raison du refus" className="input w-40" />
                  <Button type="submit" variant="danger" className="px-3 py-1.5 text-xs">
                    Refuser (rembourser)
                  </Button>
                </form>
              </div>
            </Card>
          ))}
          {!pending.length ? (
            <Card className="text-center text-sm text-ink-faint">Aucune demande en attente.</Card>
          ) : null}
        </div>
      </div>

      {reviewed.length ? (
        <div>
          <p className="mb-3 font-display text-lg font-semibold">Historique</p>
          <div className="flex flex-col gap-2">
            {reviewed.map((r) => (
              <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{nameById.get(r.user_id) || r.user_id}</p>
                  <p className="font-mono text-sm tabular-nums">{formatCredits(r.amount)} crédits</p>
                  {r.admin_note ? (
                    <p className="text-xs text-ink-faint">Note : {r.admin_note}</p>
                  ) : null}
                </div>
                <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
