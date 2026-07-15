"use client";

import React from "react";

type Props = {
  label: string;
  code: string;
};

export function CodeSnippet({ label, code }: Props) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/30">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-500/70" />
          <span className="h-2 w-2 rounded-full bg-amber-500/70" />
          <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
        </div>
      </div>
      <pre className="p-4 text-[11px] sm:text-xs font-mono text-foreground/90 leading-relaxed overflow-x-auto scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}
