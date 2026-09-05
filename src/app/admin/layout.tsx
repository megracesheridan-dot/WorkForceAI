import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { AdminNavLinks } from "./AdminNavLinks";
import { Logo } from "@/components/Logo";

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
        <aside className="w-56 shrink-0 rounded-xl border border-border bg-surface/60 p-4">
          <Logo />
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-accent-strong">
            Espace de gestion
          </p>
          <AdminNavLinks />
        </aside>
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
