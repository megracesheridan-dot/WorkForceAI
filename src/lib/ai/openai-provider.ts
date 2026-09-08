import OpenAI from "openai";
import type { AIProvider, AssignmentBrief, WorkforceEmployee } from "./provider";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

function briefContext(brief: AssignmentBrief) {
  return Object.entries(brief.context ?? {})
    .map(([label, value]) => `${label.replace(/_/g, " ")}: ${value}`)
    .join("\n");
}

export const openaiProvider: AIProvider = {
  async runAgentTask(brief: AssignmentBrief, employee: WorkforceEmployee, context: string) {
    const system = [
      "You are an AI Employee in a professional AI workforce.",
      `Your role is ${employee.role}. Your specialty is ${employee.specialty}.`,
      "Produce concrete, useful work for the next employee. Do not describe your process or invent results.",
    ].join(" ");
    const user = [
      `Assignment: ${brief.title}`,
      `Objective: ${brief.objective}`,
      `Expected deliverable: ${brief.deliverableExpected}`,
      brief.audience ? `Audience: ${brief.audience}` : null,
      brief.tone ? `Tone: ${brief.tone}` : null,
      briefContext(brief) ? `Client brief:\n${briefContext(brief)}` : null,
      context ? `Work completed by earlier employees:\n${context}` : null,
      "Return your contribution in Markdown.",
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

    return { output: completion.choices[0]?.message?.content?.trim() || "No output was produced." };
  },

  async synthesize(brief: AssignmentBrief, agentOutputs: string[]) {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are the lead of an AI workforce. Combine the specialist contributions into one polished, directly usable business deliverable. Use clear Markdown headings.",
        },
        {
          role: "user",
          content: [
            `Assignment: ${brief.title}`,
            `Objective: ${brief.objective}`,
            `Expected deliverable: ${brief.deliverableExpected}`,
            briefContext(brief) ? `Client brief:\n${briefContext(brief)}` : null,
            "Specialist contributions:",
            agentOutputs.join("\n\n---\n\n"),
          ].join("\n"),
        },
      ],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || "No final deliverable was produced.";
  },

  async evaluateQuality(brief: AssignmentBrief, deliverable: string) {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "Evaluate whether a business deliverable meets its requested objective. Reply with JSON only: {\"score\": number}. Score from 0 to 100.",
        },
        {
          role: "user",
          content: `Objective: ${brief.objective}\nExpected: ${brief.deliverableExpected}\n${briefContext(brief) ? `Client brief:\n${briefContext(brief)}\n` : ""}\nDeliverable:\n${deliverable}`,
        },
      ],
      temperature: 0,
    });
    const content = completion.choices[0]?.message?.content ?? "";
    const match = content.match(/\{\s*"score"\s*:\s*(\d+(?:\.\d+)?)\s*\}/);
    const score = match ? Number(match[1]) : 0;
    return Math.max(0, Math.min(100, score));
  },
};
