"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectToasts, removeToast, ToastInfo } from "@/features/ui/ui.slice";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const MAX_TOASTS = 5;
const DURATION_MS = 5000;

export function Toaster() {
  const toasts = useAppSelector(selectToasts);
  const visible = toasts.slice(-MAX_TOASTS);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-[380px] pointer-events-none select-none">
      <AnimatePresence mode="popLayout">
        {visible.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast }: { toast: ToastInfo }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast.id, dispatch]);

  const handleDismiss = () => dispatch(removeToast(toast.id));

  // Fully opaque backgrounds with border accents — work on both light & dark
  const config: Record<
    string,
    { border: string; bg: string; titleColor: string; icon: React.ReactNode; progress: string }
  > = {
    success: {
      border: "border-emerald-500/50",
      bg: "bg-card shadow-emerald-500/10",
      titleColor: "text-emerald-500",
      icon: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />,
      progress: "bg-emerald-500",
    },
    error: {
      border: "border-rose-500/50",
      bg: "bg-card shadow-rose-500/10",
      titleColor: "text-rose-500",
      icon: <XCircle className="h-5 w-5 text-rose-500 shrink-0" />,
      progress: "bg-rose-500",
    },
    warning: {
      border: "border-amber-500/50",
      bg: "bg-card shadow-amber-500/10",
      titleColor: "text-amber-500",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
      progress: "bg-amber-500",
    },
    info: {
      border: "border-cyan-500/50",
      bg: "bg-card shadow-cyan-500/10",
      titleColor: "text-cyan-500",
      icon: <Info className="h-5 w-5 text-cyan-500 shrink-0" />,
      progress: "bg-cyan-500",
    },
  };

  const c = config[toast.type] ?? config.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.88 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${c.border} ${c.bg} shadow-xl backdrop-blur-md text-left relative overflow-hidden font-mono`}
    >
      {/* Animated progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-[3px] ${c.progress} rounded-full`}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: DURATION_MS / 1000, ease: "linear" }}
      />

      {/* Subtle colored left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${c.progress} opacity-80`} />

      <div className="pl-1">{c.icon}</div>

      <div className="flex-1 flex flex-col gap-1 pr-5 min-w-0">
        <span className={`font-extrabold uppercase tracking-wider text-[10px] ${c.titleColor}`}>
          {toast.title}
        </span>
        <span className="text-[11px] text-foreground/80 leading-relaxed break-words font-medium">
          {toast.message}
        </span>
      </div>

      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md p-0.5 transition-all cursor-pointer"
      >
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  );
}
