import type { AIProvider, AssignmentBrief, WorkforceEmployee } from "./provider";

export async function runWorkforceExecution(
  provider: AIProvider,
  brief: AssignmentBrief,
  employees: WorkforceEmployee[],
  onStep: (employee: WorkforceEmployee, status: "running" | "completed", output?: string) => Promise<void>,
) {
  const outputs: string[] = [];
  for (const employee of employees) {
    await onStep(employee, "running");
    const context = outputs.join("\n\n").slice(-12000);
    const result = await provider.runAgentTask(brief, employee, context);
    outputs.push(`### ${employee.name} (${employee.role})\n${result.output}`);
    await onStep(employee, "completed", result.output);
  }
  const deliverable = await provider.synthesize(brief, outputs);
  const qualityScore = await provider.evaluateQuality(brief, deliverable);
  return { deliverable, qualityScore };
}
