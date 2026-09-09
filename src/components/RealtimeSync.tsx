"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RealtimeSync({ userId, isAdmin = false }: { userId: string; isAdmin?: boolean }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      if (refreshTimer) return;
      refreshTimer = setTimeout(() => {
        refreshTimer = undefined;
        router.refresh();
      }, 200);
    };

    const channel = supabase.channel(`workforce-sync:${userId}:${isAdmin ? "admin" : "member"}`);
    const ownTables = ["assignment_instances", "execution_jobs", "notifications", "ledger_transactions"];
    ownTables.forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table, filter: `user_id=eq.${userId}` }, refresh);
    });
    channel.on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `id=eq.${userId}` }, refresh);
    channel.on("postgres_changes", { event: "*", schema: "public", table: "execution_steps" }, refresh);

    if (isAdmin) {
      ["deposit_requests", "withdrawal_requests", "assignment_position_rules"].forEach((table) => {
        channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
      });
    }
    channel.subscribe();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [isAdmin, router, userId]);

  return null;
}
