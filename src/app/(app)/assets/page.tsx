import { createClient } from "@/lib/supabase/server";
import { Card, Stat, Badge } from "@/components/ui";
import { formatCredits, formatDate } from "@/lib/format";
import type { LedgerTransaction, Profile, DepositRequest, WithdrawalRequest } from "@/lib/types";
import { requestDeposit, requestWithdrawal } from "./actions";

const TYPE_LABEL: Record<string, string> = {
  assignment_cost: "Assignment — coût d'exécution",
  assignment_reward: "Assignment — performance reward",
  deposit: "Dépôt",
  withdrawal: "Retrait",
  bonus_credit: "Bonus credit",
  level_upgrade: "Déblocage de niveau",
};

const REQUEST_STATUS_TONE: Record<string, "good" | "bad" | "neutral"> = {
  pending: "neutral",
  approved: "good",
  rejected: "bad",
};

export default async function AssetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: transactions }, { data: deposits }, { data: withdrawals }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user!.id).single<Profile>(),
      supabase
        .from("ledger_transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(30)
        .returns<LedgerTransaction[]>(),
      supabase
        .from("deposit_requests")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .returns<DepositRequest[]>(),
      supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .returns<WithdrawalRequest[]>(),
    ]);

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <p className="font-display text-lg font-semibold">Demander un dépôt</p>
          <p className="text-sm text-ink-soft">
            Effectue le virement/paiement par le moyen de ton choix, puis dépose la preuve
            ci-dessous. Un admin valide manuellement et les crédits sont ajoutés à ton solde.
          </p>
          <form action={requestDeposit} className="flex flex-col gap-3">
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Montant (crédits)"
              required
              className="input"
            />
            <select name="method" required className="input" defaultValue="">
              <option value="" disabled>
                Moyen de paiement
              </option>
              <option value="bank_transfer">Virement bancaire</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="crypto">Crypto</option>
              <option value="other">Autre</option>
            </select>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-ink-faint">Preuve de paiement (image ou PDF)</span>
              <input
                name="proof"
                type="file"
                accept="image/*,.pdf"
                required
                className="input file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-ink"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black transition-all duration-150 ease-out hover:bg-accent-strong"
            >
              Soumettre la demande
            </button>
          </form>
        </Card>

        <Card className="flex flex-col gap-3">
          <p className="font-display text-lg font-semibold">Demander un retrait</p>
          <p className="text-sm text-ink-soft">
            Le montant est retenu immédiatement sur ton Withdrawable Balance. Un admin traite le
            virement manuellement puis confirme.
          </p>
          <form action={requestWithdrawal} className="flex flex-col gap-3">
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={profile?.withdrawable_balance ?? 0}
              placeholder="Montant (crédits)"
              required
              className="input"
            />
            <textarea
              name="destination"
              placeholder="Coordonnées de destination (IBAN, numéro Mobile Money…)"
              required
              rows={3}
              className="input"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-all duration-150 ease-out hover:border-border-strong hover:bg-surface-2"
            >
              Demander le retrait
            </button>
          </form>
        </Card>
      </div>

      {(deposits?.length || withdrawals?.length) ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {deposits?.length ? (
            <div>
              <p className="mb-3 font-display text-lg font-semibold">Mes demandes de dépôt</p>
              <div className="flex flex-col gap-2">
                {deposits.map((d) => (
                  <Card key={d.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-semibold tabular-nums">
                        {formatCredits(d.amount)} crédits
                      </p>
                      <p className="text-xs text-ink-faint">{formatDate(d.created_at)}</p>
                    </div>
                    <Badge tone={REQUEST_STATUS_TONE[d.status]}>{d.status}</Badge>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}

          {withdrawals?.length ? (
            <div>
              <p className="mb-3 font-display text-lg font-semibold">Mes demandes de retrait</p>
              <div className="flex flex-col gap-2">
                {withdrawals.map((w) => (
                  <Card key={w.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-semibold tabular-nums">
                        {formatCredits(w.amount)} crédits
                      </p>
                      <p className="text-xs text-ink-faint">{formatDate(w.created_at)}</p>
                    </div>
                    <Badge tone={REQUEST_STATUS_TONE[w.status]}>{w.status}</Badge>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

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
