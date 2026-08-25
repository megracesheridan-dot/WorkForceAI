import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/assignments", label: "Assignment Catalogue" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

  if (!profile?.is_admin) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-6xl gap-10 px-6 py-8">
        <aside className="w-56 shrink-0">
          <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
            Espace de gestion
          </p>
          <p className="mt-1 font-display text-lg font-semibold">AI Arena Admin</p>
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
            <Link
              href="/dashboard"
              className="mt-4 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-2"
            >
              ← Retour à l&apos;app
            </Link>
          </nav>
        </aside>
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
