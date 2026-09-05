"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function buildNav(pendingDeposits: number, pendingWithdrawals: number) {
  return [
    { href: "/admin", label: "Overview" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/deposits", label: "Deposits", badge: pendingDeposits },
    { href: "/admin/withdrawals", label: "Withdrawals", badge: pendingWithdrawals },
    { href: "/admin/assignments", label: "Assignment Catalogue" },
  ];
}

export function AdminNavLinks({
  pendingDeposits = 0,
  pendingWithdrawals = 0,
}: {
  pendingDeposits?: number;
  pendingWithdrawals?: number;
}) {
  const pathname = usePathname();
  const NAV = buildNav(pendingDeposits, pendingWithdrawals);

  return (
    <nav className="mt-6 flex flex-col gap-0.5">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors duration-150 ease-out ${
              active ? "bg-accent-tint text-ink" : "text-ink-soft hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {active ? (
              <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-x-3 -translate-y-1/2 rounded-full bg-accent" />
            ) : null}
            {item.label}
            {item.badge ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-mono text-[11px] font-semibold text-black">
                {item.badge}
              </span>
            ) : null}
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
