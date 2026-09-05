import { createClient } from "@/lib/supabase/server";
import { Card, Badge, Button } from "@/components/ui";
import { formatCredits, formatDate } from "@/lib/format";
import type { DepositRequest, Profile } from "@/lib/types";
import { approveDeposit, rejectDeposit } from "../actions";

const STATUS_TONE: Record<string, "good" | "bad" | "neutral"> = {
  pending: "neutral",
  approved: "good",
  rejected: "bad",
};

const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "webp", "gif"]);

export default async function AdminDepositsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("deposit_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<DepositRequest[]>();

  const userIds = Array.from(new Set((requests ?? []).map((r) => r.user_id)));
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", userIds).returns<
        Pick<Profile, "id" | "display_name">[]
      >()
    : { data: [] as Pick<Profile, "id" | "display_name">[] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  const proofUrlByPath = new Map<string, string>();
  for (const r of requests ?? []) {
    if (proofUrlByPath.has(r.proof_path)) continue;
    const { data } = await supabase.storage
      .from("deposit-proofs")
      .createSignedUrl(r.proof_path, 60 * 15);
    if (data?.signedUrl) proofUrlByPath.set(r.proof_path, data.signedUrl);
  }

  const pending = (requests ?? []).filter((r) => r.status === "pending");
  const reviewed = (requests ?? []).filter((r) => r.status !== "pending");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">Deposits</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Demandes de dépôt</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Vérifie la preuve de paiement avant d&apos;approuver — les crédits sont ajoutés
          immédiatement à la validation.
        </p>
      </div>

      <div>
        <p className="mb-3 font-display text-lg font-semibold">
          En attente <span className="text-ink-faint">({pending.length})</span>
        </p>
        <div className="flex flex-col gap-3">
          {pending.map((r) => {
            const ext = r.proof_path.split(".").pop()?.toLowerCase() ?? "";
            const url = proofUrlByPath.get(r.proof_path);
            return (
              <Card key={r.id} className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-1 gap-4">
                  {url && IMAGE_EXT.has(ext) ? (
                    <a href={url} target="_blank" rel="noreferrer" className="shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt="Preuve de paiement"
                        className="h-24 w-24 rounded-lg border border-border object-cover"
                      />
                    </a>
                  ) : url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-xs text-ink-soft"
                    >
                      Voir le fichier
                    </a>
                  ) : null}
                  <div>
                    <p className="font-medium">{nameById.get(r.user_id) || r.user_id}</p>
                    <p className="font-mono text-sm font-semibold tabular-nums text-accent-strong">
                      {formatCredits(r.amount)} crédits
                    </p>
                    <p className="text-xs text-ink-faint">
                      {r.method} · {formatDate(r.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <form action={approveDeposit} className="flex items-center gap-2">
                    <input type="hidden" name="request_id" value={r.id} />
                    <input name="note" placeholder="Note (optionnel)" className="input w-40" />
                    <Button type="submit" className="px-3 py-1.5 text-xs">
                      Approuver
                    </Button>
                  </form>
                  <form action={rejectDeposit} className="flex items-center gap-2">
                    <input type="hidden" name="request_id" value={r.id} />
                    <input name="note" placeholder="Raison du refus" className="input w-40" />
                    <Button type="submit" variant="danger" className="px-3 py-1.5 text-xs">
                      Refuser
                    </Button>
                  </form>
                </div>
              </Card>
            );
          })}
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
