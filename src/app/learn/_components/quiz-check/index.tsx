"use client";

import React, { useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Circle, Sparkles, XCircle } from "lucide-react";
import type { QuizItem } from "../../_content/chapters";

type Props = {
  items: QuizItem[];
};

function CelebrationBurst({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  if (!active || reduce) return null;

  const particles = Array.from({ length: 18 }, (_, i) => i);
  const colors = ["#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e", "#3b82f6"];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
      {particles.map((i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const dist = 48 + (i % 5) * 12;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
            style={{ background: colors[i % colors.length] }}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{
              opacity: 0,
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              scale: 0.2,
            }}
            transition={{ duration: 0.85, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

export function QuizCheck({ items }: Props) {
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [burstFor, setBurstFor] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const reduce = useReducedMotion();

  const onPick = useCallback(
    (qi: number, oi: number, correctIndex: number) => {
      setAnswers((prev) => {
        if (prev[qi] !== undefined && prev[qi] !== null) return prev;
        return { ...prev, [qi]: oi };
      });
      if (oi === correctIndex) {
        setBurstFor(qi);
        setStreak((s) => s + 1);
        window.setTimeout(() => setBurstFor((b) => (b === qi ? null : b)), 900);
      } else {
        setStreak(0);
      }
    },
    [],
  );

  const correctCount = items.reduce((acc, q, i) => {
    const a = answers[i];
    return a === q.correctIndex ? acc + 1 : acc;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-muted-foreground">
          Check your understanding
        </p>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded-full border border-border/60 text-muted-foreground">
            {correctCount}/{items.length} correct
          </span>
          {streak >= 2 && (
            <motion.span
              initial={reduce ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
            >
              <Sparkles className="h-3 w-3" />
              streak ×{streak}
            </motion.span>
          )}
        </div>
      </div>

      {items.map((q, qi) => {
        const selected = answers[qi];
        const revealed = selected !== undefined && selected !== null;
        const gotIt = selected === q.correctIndex;

        return (
          <motion.div
            key={q.prompt}
            layout
            className={`relative border rounded-xl p-4 space-y-3 overflow-hidden transition-colors ${
              revealed && gotIt
                ? "border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_24px_rgba(16,185,129,0.12)]"
                : revealed && !gotIt
                  ? "border-rose-500/40 bg-rose-500/5"
                  : "border-border/60 bg-card/30"
            }`}
          >
            <CelebrationBurst active={burstFor === qi} />

            <div className="flex items-start justify-between gap-2 relative z-10">
              <p className="text-sm font-semibold text-foreground">
                <span className="text-primary font-mono text-[11px] mr-2">
                  Q{qi + 1}
                </span>
                {q.prompt}
              </p>
              <AnimatePresence>
                {revealed && gotIt && (
                  <motion.span
                    initial={reduce ? false : { scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="shrink-0 text-emerald-500"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </motion.span>
                )}
                {revealed && !gotIt && (
                  <motion.span
                    initial={reduce ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    className="shrink-0 text-rose-500"
                  >
                    <XCircle className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <ul className="space-y-2 relative z-10">
              {q.options.map((opt, oi) => {
                const isSelected = selected === oi;
                const isCorrect = oi === q.correctIndex;
                let style =
                  "border-border/60 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground";
                if (revealed && isCorrect) {
                  style =
                    "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
                } else if (revealed && isSelected && !isCorrect) {
                  style = "border-rose-500/50 bg-rose-500/10 text-rose-500";
                } else if (isSelected) {
                  style = "border-primary/40 bg-primary/10 text-primary";
                }
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      disabled={revealed}
                      onClick={() => onPick(qi, oi, q.correctIndex)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer disabled:cursor-default ${style}`}
                    >
                      {revealed && isCorrect ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 shrink-0 opacity-50" />
                      )}
                      {opt}
                    </button>
                  </li>
                );
              })}
            </ul>

            <AnimatePresence>
              {revealed && (
                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs leading-relaxed pl-1 relative z-10 ${
                    gotIt
                      ? "text-emerald-700 dark:text-emerald-400/90"
                      : "text-muted-foreground"
                  }`}
                >
                  {gotIt ? "Nice — " : "Not quite — "}
                  {q.explanation}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
