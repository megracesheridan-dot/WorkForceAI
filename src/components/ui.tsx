import { type ReactNode } from "react";

export function Card({
  children,
  className = "",
  interactive = false,
  accent = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border bg-surface p-6 shadow-sm transition-all duration-150 ease-out ${
        interactive
          ? "hover:-translate-y-px hover:border-border-strong hover:shadow-[0_8px_28px_-8px_var(--accent-glow)]"
          : ""
      } ${className}`}
    >
      {accent ? (
        <span className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent via-cyan to-accent" />
      ) : null}
      {children}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "good" | "bad" | "neutral" | "accent" | "cyan" | "gold";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    good: "bg-good-tint text-good",
    bad: "bg-bad-tint text-bad",
    accent: "bg-accent-tint text-accent-strong",
    cyan: "bg-cyan-tint text-cyan",
    gold: "bg-gold-tint text-gold",
    neutral: "bg-surface-2 text-ink-soft border border-border",
  };
  const dots: Record<string, string> = {
    good: "bg-good",
    bad: "bg-bad",
    accent: "bg-accent-strong",
    cyan: "bg-cyan",
    gold: "bg-gold",
    neutral: "bg-ink-faint",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${tones[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} />
      {children}
    </span>
  );
}

export function StatusDot({ live = false }: { live?: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      {live ? (
        <span
          className="absolute inline-flex h-full w-full rounded-full bg-cyan"
          style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
        />
      ) : null}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${live ? "bg-cyan" : "bg-ink-faint"}`} />
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "neutral",
  glow = false,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "good" | "bad" | "neutral" | "gold";
  glow?: boolean;
}) {
  const valueTone: Record<string, string> = {
    good: "text-good",
    bad: "text-bad",
    gold: "text-gold",
    neutral: "text-ink",
  };
  const glowShadow: Record<string, string> = {
    good: "0 0 20px var(--good)",
    bad: "0 0 20px var(--bad)",
    gold: "0 0 24px var(--gold-glow)",
    neutral: "0 0 24px var(--accent-glow)",
  };
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">{label}</p>
      <p
        className={`mt-1 font-display text-3xl font-bold tabular-nums ${valueTone[tone]}`}
        style={glow ? { textShadow: glowShadow[tone] } : undefined}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold tracking-wide transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:translate-y-px";
  const variants: Record<string, string> = {
    primary:
      "bg-accent text-white hover:bg-accent-strong hover:shadow-[0_0_22px_-2px_var(--accent-glow)]",
    ghost: "border border-border text-ink hover:border-border-strong hover:bg-surface-2",
    danger: "bg-bad text-white hover:opacity-90",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card className="text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">{body}</p>
    </Card>
  );
}
