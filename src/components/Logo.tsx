// eslint-disable-next-line @next/next/no-img-element
import NextImage from "next/image";

// Logo fourni par le client (public/logo-mark.png, fond blanc détouré en
// transparent) — utilisé partout où la marque WorkGPT doit apparaître.
export function Logo({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "mark";
  className?: string;
}) {
  const mark = (
    <NextImage
      src="/logo-mark.png"
      alt="WorkGPT"
      width={465}
      height={456}
      className="h-8 w-8 shrink-0 object-contain"
      priority
    />
  );

  if (variant === "mark") return mark;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {mark}
      <span className="font-display text-lg font-bold tracking-tight text-ink">WorkGPT</span>
    </span>
  );
}
