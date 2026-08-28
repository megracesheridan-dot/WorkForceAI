import { createClient } from "@/lib/supabase/server";
import { Card, Stat, Badge } from "@/components/ui";
import { formatCredits, formatDate } from "@/lib/format";
import type { LedgerTransaction, Profile } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  assignment_cost: "Assignment — coût d'exécution",
  assignment_reward: "Assignment — performance reward",
  deposit: "Dépôt",
  withdrawal: "Retrait",
  bonus_credit: "Bonus credit",
  level_upgrade: "Déblocage de niveau",
};

export default async function AssetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  const { data: transactions } = await supabase
    .from("ledger_transactions")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(30)
    .returns<LedgerTransaction[]>();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">Assets</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Ton solde, en direct</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Toutes les valeurs ci-dessous viennent directement du serveur — aucun calcul local.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card accent>
          <Stat label="Credit Balance" value={formatCredits(profile?.credit_balance)} glow />
        </Card>
        <Card>
          <Stat
            label="Withdrawable Balance"
            value={formatCredits(profile?.withdrawable_balance)}
            tone="gold"
            glow
          />
        </Card>
        <Card>
          <Stat label="Bonus Credits" value={formatCredits(profile?.bonus_credits)} />
        </Card>
      </div>

      <Card className="flex flex-col gap-3">
        <p className="font-display text-lg font-semibold">Deposit / Buy Credits</p>
        <p className="text-sm text-ink-soft">
          Le paiement réel (Stripe ou équivalent) n&apos;est pas encore branché — on teste en
          local avant l&apos;achat du domaine. En attendant, un administrateur peut créditer ton
          compte pour les tests depuis l&apos;espace de gestion (mouvement enregistré au ledger,
          type <code className="rounded bg-surface-2 px-1">deposit</code>).
        </p>
        <Badge tone="neutral">Paiement réel — à venir</Badge>
      </Card>

      <div>
        <p className="mb-3 font-display text-lg font-semibold">Transaction History</p>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Montant</th>
                <th className="px-4 py-2">Solde après</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {(transactions ?? []).map((t) => (
                <tr key={t.id} className="border-t border-border bg-surface">
                  <td className="px-4 py-2">
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          t.amount >= 0 ? "bg-good" : "bg-bad"
                        }`}
                      />
                      {TYPE_LABEL[t.type] ?? t.type}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-2 font-mono tabular-nums ${t.amount >= 0 ? "text-good" : "text-bad"}`}
                  >
                    {t.amount >= 0 ? "+" : ""}
                    {formatCredits(t.amount)}
                  </td>
                  <td className="px-4 py-2 font-mono tabular-nums">{formatCredits(t.balance_after)}</td>
                  <td className="px-4 py-2 text-ink-soft">{formatDate(t.created_at)}</td>
                </tr>
              ))}
              {!transactions?.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ink-faint">
                    Aucune transaction pour l&apos;instant.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
