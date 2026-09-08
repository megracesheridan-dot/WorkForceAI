import type { AIProvider } from "./provider";

// Moteur IA simulé — pas d'appel externe, pas de coût. Produit un livrable
// démonstratif structuré à partir du brief, pour tester la boucle produit
// avant de brancher un vrai fournisseur (voir openai-provider.ts).
export const mockProvider: AIProvider = {
  async runAgentTask(brief, employee, context) {
    return { output: `## ${employee.name} — ${employee.role}\n${employee.specialty}\n\nObjective: ${brief.objective}\n\n${context ? "Reviewed prior workforce context." : "Prepared initial specialist contribution."}` };
  },
  async synthesize(brief, agentOutputs) {
    return `# ${brief.title}\n\n## Objective\n${brief.objective}\n\n## Deliverable\n${brief.deliverableExpected}\n\n${agentOutputs.join("\n\n---\n\n")}`;
  },
  async evaluateQuality() {
    return 100;
  },
};
