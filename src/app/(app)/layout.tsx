import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { formatCredits } from "@/lib/format";
import { signOut } from "../(auth)/actions";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assignments", label: "Assignments" },
  { href: "/workforce", label: "AI Workforce" },
  { href: "/assets", label: "Assets" },
  { href: "/teams", label: "Teams" },
  { href: "/settings", label: "Settings" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-6xl gap-10 px-6 py-8">
        <aside className="w-56 shrink-0">
          <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
            AI Arena
          </p>
          <p className="mt-1 font-display text-lg font-semibold">
            {profile?.display_name || "AI Manager"}
          </p>

          <div className="mt-4 rounded-xl border border-border bg-surface p-3">
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              Credit Balance
            </p>
            <p className="font-mono text-xl font-semibold">
              {formatCredits(profile?.credit_balance)}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              Level {profile?.level ?? 1} · Cycle {profile?.cycle_position ?? 0}/
              {profile?.cycle_total ?? 15}
            </p>
          </div>

          <nav className="mt-6 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-surface-2 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            {profile?.is_admin ? (
              <Link
                href="/admin"
                className="mt-2 rounded-lg border border-border px-3 py-2 text-sm text-accent-strong hover:bg-accent-tint"
              >
                Espace de gestion
              </Link>
            ) : null}
          </nav>

          <form action={signOut} className="mt-6">
            <button className="text-sm text-ink-faint hover:text-ink" type="submit">
              Se déconnecter
            </button>
          </form>
        </aside>

        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
