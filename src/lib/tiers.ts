export type TierTone = "neutral" | "cyan" | "accent" | "gold";

const TIERS: { label: string; tone: TierTone }[] = [
  { label: "Standard", tone: "neutral" },
  { label: "Advanced", tone: "cyan" },
  { label: "Expert", tone: "accent" },
  { label: "Elite", tone: "gold" },
  { label: "Master", tone: "gold" },
];

export function tierFor(level: number): { label: string; tone: TierTone } {
  return TIERS[Math.min(Math.max(level, 1), TIERS.length) - 1];
}
