"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/assignments", label: "Assignment Catalogue" },
];

export function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-col gap-0.5">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative rounded-md px-3 py-2 text-sm transition-colors duration-150 ease-out ${
              active ? "bg-accent-tint text-ink" : "text-ink-soft hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {active ? (
              <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-x-3 -translate-y-1/2 rounded-full bg-accent" />
            ) : null}
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/dashboard"
        className="mt-4 rounded-md border border-border px-3 py-2 text-sm transition-colors duration-150 ease-out hover:border-border-strong hover:bg-surface-2"
      >
        ← Retour à l&apos;app
      </Link>
    </nav>
  );
}
