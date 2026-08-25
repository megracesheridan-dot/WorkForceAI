import OpenAI from "openai";
import type { AIProvider, AssignmentBrief } from "./provider";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

export const openaiProvider: AIProvider = {
  async runAssignment(brief: AssignmentBrief, employeeNames: string[]): Promise<string> {
    const system = [
      "Tu es l'AI Workforce d'AI Arena : une équipe d'employés IA spécialisés qui exécute des",
      "Assignments business réelles pour un utilisateur (AI Manager).",
      `Employés IA mobilisés sur cette Assignment : ${employeeNames.join(", ") || "Workforce généraliste"}.`,
      "Produis un livrable professionnel, concret et directement utilisable — jamais un résumé vague.",
      "Structure le livrable en Markdown avec des titres clairs adaptés au type de livrable demandé.",
    ].join(" ");

    const user = [
      `Titre de l'Assignment : ${brief.title}`,
      `Catégorie : ${brief.category}`,
      `Objectif : ${brief.objective}`,
      brief.audience ? `Audience cible : ${brief.audience}` : null,
      brief.tone ? `Ton attendu : ${brief.tone}` : null,
      `Livrable attendu : ${brief.deliverableExpected}`,
      "",
      "Produis maintenant le livrable complet.",
    ]
      .filter(Boolean)
      .join("\n");

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    });

    return (
      completion.choices[0]?.message?.content?.trim() ||
      "L'exécution n'a produit aucun contenu. Merci de réessayer."
    );
  },
};
