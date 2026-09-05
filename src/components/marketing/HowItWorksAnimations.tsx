"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { UserPlus, Search, PenTool, Palette } from "lucide-react";

const RECRUITS = [
  { icon: UserPlus, label: "Nova" },
  { icon: Search, label: "Reed" },
  { icon: PenTool, label: "Iris" },
];

export function RecruitAnimation() {
  return (
    <div className="flex h-24 items-end gap-3">
      {RECRUITS.map((r, i) => (
        <motion.div
          key={r.label}
          initial={{ opacity: 0, y: 16, scale: 0.8 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-1.5"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-strong text-black">
            <r.icon className="h-5 w-5" />
          </span>
          <span className="font-mono text-[10px] text-ink-faint">{r.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

const TITLE = "Étude de marché Q1";

export function AssignmentAnimation() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => (c >= TITLE.length ? 0 : c + 1));
    }, 130);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-24 flex-col justify-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
        Nouvelle Assignment
      </span>
      <p className="font-display text-base font-semibold text-ink">
        {TITLE.slice(0, count)}
        <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-accent-strong align-middle" />
      </p>
    </div>
  );
}

export function CapacityCheckAnimation() {
  const [pct, setPct] = useState(8);
  useEffect(() => {
    const id = setInterval(() => setPct((p) => (p >= 82 ? 8 : p + 3)), 90);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-24 flex-col justify-center gap-3">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-ink-soft">Coût</span>
        <span className="font-semibold text-ink">18 crédits</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-strong transition-all duration-150 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-ink-soft">Reward</span>
        <span className="font-semibold text-accent-strong">32–48 crédits</span>
      </div>
    </div>
  );
}

export function RewardAnimation() {
  const [amount, setAmount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setAmount((a) => (a >= 42 ? 0 : a + 2)), 60);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-24 flex-col items-start justify-center gap-1">
      <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
        Reward créditée
      </span>
      <motion.p className="font-display text-3xl font-bold tabular-nums text-good">
        +{amount}
      </motion.p>
    </div>
  );
}
