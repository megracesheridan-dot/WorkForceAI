"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assignments", label: "Assignments" },
  { href: "/workforce", label: "AI Workforce" },
  { href: "/assets", label: "Assets" },
  { href: "/teams", label: "Teams" },
  { href: "/ads", label: "Rewarded Ads" },
  { href: "/settings", label: "Settings" },
];

export function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-col gap-0.5">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative rounded-md px-3 py-2 text-sm transition-colors duration-150 ease-out ${
              active
                ? "bg-accent-tint text-ink"
                : "text-ink-soft hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {active ? (
              <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-x-3 -translate-y-1/2 rounded-full bg-accent" />
            ) : null}
            {item.label}
          </Link>
        );
      })}
      {isAdmin ? (
        <Link
          href="/admin"
          className="mt-2 rounded-md border border-border px-3 py-2 text-sm text-accent-strong transition-colors duration-150 ease-out hover:border-border-strong hover:bg-accent-tint"
        >
          Espace de gestion
        </Link>
      ) : null}
    </nav>
  );
}
