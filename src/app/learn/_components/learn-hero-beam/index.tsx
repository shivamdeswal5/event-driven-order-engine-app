"use client";

import React, { useRef } from "react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { cn } from "@/lib/utils";

const NODES = [
  { id: "order", label: "Order", className: "border-sky-500/40 text-sky-600 dark:text-sky-400" },
  { id: "inv", label: "Inventory", className: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400" },
  { id: "pay", label: "Payment", className: "border-amber-500/40 text-amber-600 dark:text-amber-400" },
  { id: "ship", label: "Shipping", className: "border-violet-500/40 text-violet-600 dark:text-violet-400" },
  { id: "notif", label: "Notify", className: "border-rose-500/40 text-rose-600 dark:text-rose-400" },
] as const;

export function LearnHeroBeam() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const nodeRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-md mx-auto h-[280px] sm:h-[300px] rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_65%)]" />
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px]" />

      <div
        ref={hubRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/50 bg-primary/10 text-[10px] font-mono font-bold text-primary shadow-[0_0_24px_rgba(59,130,246,0.25)]"
      >
        MQ
      </div>

      {NODES.map((node, i) => {
        const angle = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
        const r = 100;
        const x = 50 + (Math.cos(angle) * r) / 2.8;
        const y = 50 + (Math.sin(angle) * r) / 2.6;
        return (
          <div
            key={node.id}
            ref={nodeRefs[i]}
            className={cn(
              "absolute z-10 flex h-10 px-2.5 items-center justify-center rounded-full border bg-background/90 text-[10px] font-bold shadow-sm backdrop-blur-sm",
              node.className,
            )}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {node.label}
          </div>
        );
      })}

      {nodeRefs.map((fromRef, i) => (
        <AnimatedBeam
          key={NODES[i].id}
          containerRef={containerRef}
          fromRef={fromRef}
          toRef={hubRef}
          curvature={i % 2 === 0 ? 40 : -40}
          delay={i * 0.35}
          duration={3.5}
          pathWidth={1.5}
          gradientStartColor="#3b82f6"
          gradientStopColor="#8b5cf6"
        />
      ))}
    </div>
  );
}
