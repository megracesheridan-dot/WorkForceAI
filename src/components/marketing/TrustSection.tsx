import { Card } from "@/components/ui";

const POINTS = [
  {
    title: "Capacity Check transparent",
    body: "Coût et reward toujours affichés avant l'exécution — jamais un montant retenu après coup.",
  },
  {
    title: "Livrables réels",
    body: "Chaque Assignment produit un vrai livrable exploitable, pas juste un chiffre qui augmente.",
  },
  {
    title: "Jamais de mission qui échoue",
    body: "Une Assignment lancée aboutit toujours. Les limites (spécialiste manquant, solde insuffisant) sont signalées avant, jamais après.",
  },
  {
    title: "Teams avec bonus réel",
    body: "Le bonus d'équipe est recalculé à partir des Assignments réellement complétées — jamais un chiffre décoratif.",
  },
];

export function TrustSection() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          Pourquoi WorkGPT
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold">Construit pour la confiance.</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {POINTS.map((p) => (
          <Card key={p.title}>
            <p className="font-display text-lg font-semibold">{p.title}</p>
            <p className="mt-1 text-sm text-ink-soft">{p.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
