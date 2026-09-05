"use client";

import { motion } from "framer-motion";
import { Zap, CheckCircle2, TrendingUp } from "lucide-react";

export function HeroVisual() {
  return (
    <div className="relative h-[420px] w-full max-w-md">
      <div
        className="absolute -inset-16 -z-10"
        style={{
          background:
            "radial-gradient(closest-side, var(--accent-glow), transparent 70%)",
          filter: "blur(40px)",
          opacity: 0.5,
        }}
      />
      <div
        className="absolute -right-10 top-10 -z-10 h-40 w-40 rounded-full"
        style={{
          background: "radial-gradient(closest-side, var(--cyan-glow), transparent 70%)",
          filter: "blur(30px)",
          opacity: 0.5,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl border border-border-strong bg-surface/90 p-5 shadow-2xl backdrop-blur"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-strong font-display text-sm font-bold text-black">
              NV
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-ink">Nova</p>
              <p className="text-xs text-ink-faint">Research Assistant</p>
            </div>
          </div>
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-cyan"
              style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
            />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan" />
          </span>
        </div>

        <p className="mt-4 font-display text-base font-semibold text-ink">
          Assignment : Étude de marché Q1
        </p>

        <div className="mt-4 rounded-xl border border-border bg-surface-2 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
            Capacity Check
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-ink-soft">Coût d&apos;exécution</span>
            <span className="font-mono text-sm font-semibold text-ink">18 crédits</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-xs text-ink-soft">Reward estimée</span>
            <span className="font-mono text-sm font-semibold text-accent-strong">32–48 crédits</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-ink-faint">
            <span>Exécution en cours</span>
            <span>72%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-strong"
              initial={{ width: "8%" }}
              animate={{ width: "72%" }}
              transition={{ duration: 1.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{
          opacity: { duration: 0.5, delay: 1.1 },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.1 },
        }}
        className="absolute -left-6 bottom-6 flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3.5 py-2 shadow-xl"
      >
        <CheckCircle2 className="h-4 w-4 text-good" />
        <span className="font-mono text-xs font-semibold text-ink">Livrable prêt</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{
          opacity: { duration: 0.5, delay: 1.3 },
          y: { duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 1.3 },
        }}
        className="absolute -right-4 -top-4 flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3.5 py-2 shadow-xl"
      >
        <TrendingUp className="h-4 w-4 text-accent-strong" />
        <span className="font-mono text-xs font-semibold text-ink">+42 crédits</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{
          opacity: { duration: 0.5, delay: 1.5 },
          y: { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
        }}
        className="absolute -right-8 bottom-24 flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3.5 py-2 shadow-xl"
      >
        <Zap className="h-4 w-4 text-cyan" />
        <span className="font-mono text-xs font-semibold text-ink">Team bonus +12%</span>
      </motion.div>
    </div>
  );
}
