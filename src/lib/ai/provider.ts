// Adaptateur moteur IA — interchangeable (OpenAI aujourd'hui, autre fournisseur possible demain)
// sans toucher au reste de l'application.

export interface AssignmentBrief {
  title: string;
  category: string;
  objective: string;
  audience?: string | null;
  tone?: string | null;
  deliverableExpected: string;
  recommendedRoles: string[];
}

export interface AIProvider {
  /** Exécute l'Assignment et retourne le livrable réel (texte/markdown) produit par la Workforce. */
  runAssignment(brief: AssignmentBrief, employeeNames: string[]): Promise<string>;
}
