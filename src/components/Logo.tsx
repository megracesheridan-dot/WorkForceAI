// Mark original — un "W" géométrique tracé en trait, pas une copie de la
// spirale ChatGPT. Utilisé partout où la marque WorkGPT doit apparaître.
export function Logo({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "mark";
  className?: string;
}) {
  const mark = (
    <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="var(--surface-2)" stroke="var(--border)" />
      <path
        d="M6 9 L11.5 23 L16 13 L20.5 23 L26 9"
        stroke="var(--accent)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  if (variant === "mark") return mark;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {mark}
      <span className="font-display text-lg font-bold tracking-tight text-ink">WorkGPT</span>
    </span>
  );
}
