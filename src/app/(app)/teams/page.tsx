import { EmptyState } from "@/components/ui";

export default function TeamsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">Teams</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Ton équipe</h1>
      </div>
      <EmptyState
        title="Bientôt disponible"
        body="Team Name, Team Level, bonus collectif et progression d'équipe arrivent après le MVP solo — la boucle Assignment individuelle est la priorité actuelle."
      />
    </div>
  );
}
