import type { AIProvider } from "./provider";
import { mockProvider } from "./mock-provider";

// Sélection du moteur IA : OpenAI si une clé est configurée, sinon simulation locale.
// Import dynamique pour éviter d'instancier le client OpenAI (qui peut lever une
// erreur à la construction) quand aucune clé n'est présente.
export async function getAIProvider(): Promise<AIProvider> {
  if (process.env.OPENAI_API_KEY) {
    const { openaiProvider } = await import("./openai-provider");
    return openaiProvider;
  }
  return mockProvider;
}
