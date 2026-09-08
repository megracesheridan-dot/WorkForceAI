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
  context?: Record<string, string>;
}

export interface WorkforceEmployee {
  id: string;
  name: string;
  role: string;
  specialty: string;
}

export interface AgentResult {
  output: string;
}

export interface AIProvider {
  runAgentTask(brief: AssignmentBrief, employee: WorkforceEmployee, context: string): Promise<AgentResult>;
  synthesize(brief: AssignmentBrief, agentOutputs: string[]): Promise<string>;
  evaluateQuality(brief: AssignmentBrief, deliverable: string): Promise<number>;
}
