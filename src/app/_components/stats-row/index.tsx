"use client";

import React from "react";
import { ShieldCheck, Zap, Layers, RefreshCw } from "lucide-react";

interface StatItem {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export function StatsRow() {
  const stats: StatItem[] = [
    {
      value: "100%",
      label: "Fault Isolation",
      description: "Any process crash or database failure triggers automatic message retries, preserving system coherence.",
      icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
    },
    {
      value: "< 15ms",
      label: "Event Latency",
      description: "Sub-millisecond routing across exchanges between isolated transactional contexts.",
      icon: <Zap className="h-5 w-5 text-cyan-400" />,
    },
    {
      value: "5",
      label: "Bounded Domains",
      description: "Isolated database schemas representing cleanly bounded DDD business requirements.",
      icon: <Layers className="h-5 w-5 text-violet-400" />,
    },
    {
      value: "At-Least-Once",
      label: "Outbox Semantics",
      description: "Zero lost events. Guaranteed publisher transactions coupled with outbox sweepers.",
      icon: <RefreshCw className="h-5 w-5 text-amber-400" />,
    },
  ];

  return (
    <section className="py-16 border-t border-border/40 bg-card/10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="p-2.5 rounded-full border border-border bg-background mb-4">
              {stat.icon}
            </div>
            <span className="text-4xl font-extrabold tracking-tight text-foreground mb-1">
              {stat.value}
            </span>
            <span className="text-sm font-bold text-muted-foreground mb-2">
              {stat.label}
            </span>
            <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-xs">
              {stat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
