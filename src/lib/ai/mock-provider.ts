import type { AIProvider, AssignmentBrief } from "./provider";

// Moteur IA simulé — pas d'appel externe, pas de coût. Produit un livrable
// démonstratif structuré à partir du brief, pour tester la boucle produit
// avant de brancher un vrai fournisseur (voir openai-provider.ts).
export const mockProvider: AIProvider = {
  async runAssignment(brief: AssignmentBrief, employeeNames: string[]): Promise<string> {
    const team = employeeNames.length > 0 ? employeeNames.join(", ") : "Workforce généraliste";

    return [
      `# ${brief.title}`,
      "",
      `*Livrable simulé — Workforce mobilisée : ${team}.*`,
      "",
      "## Objectif",
      brief.objective,
      "",
      brief.audience ? `## Audience\n${brief.audience}` : null,
      brief.tone ? `## Ton\n${brief.tone}` : null,
      "## Livrable",
      brief.deliverableExpected,
      "",
      "*(Ceci est un placeholder généré par le moteur IA simulé — active OPENAI_API_KEY",
      "dans .env.local pour que la Workforce produise un vrai livrable.)*",
    ]
      .filter((line) => line !== null)
      .join("\n");
  },
};
