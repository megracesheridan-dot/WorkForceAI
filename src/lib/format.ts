export function formatCredits(n: number | null | undefined) {
  const v = n ?? 0;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(v);
}

export function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(d));
}
