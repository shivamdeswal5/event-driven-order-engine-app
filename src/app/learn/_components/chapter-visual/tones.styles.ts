import type { ServiceTone } from "@/common/service-tone.styles";

/** Color-name tones for Learn chapter graphs (not saga service keys). */
export type LearnToneKey =
  | "cyan"
  | "amber"
  | "emerald"
  | "violet"
  | "rose"
  | "orange"
  | "blue"
  | "slate";

export const TONE: Record<LearnToneKey, ServiceTone> = {
  cyan: {
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    dot: "#06b6d4",
  },
  amber: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "#f59e0b",
  },
  emerald: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "#10b981",
  },
  violet: {
    border: "border-purple-500/40",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    dot: "#a855f7",
  },
  rose: {
    border: "border-rose-500/40",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    dot: "#f43f5e",
  },
  orange: {
    border: "border-orange-500/40",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    dot: "#f97316",
  },
  blue: {
    border: "border-blue-500/40",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    dot: "#3b82f6",
  },
  slate: {
    border: "border-slate-500/40",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    dot: "#94a3b8",
  },
};

export const EDGE_STROKE = "#64748b";
export const EDGE_MARKER = "#64748b";
