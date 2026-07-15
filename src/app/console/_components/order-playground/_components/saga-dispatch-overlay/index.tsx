"use client";

import React, { useEffect, useState } from "react";
import { Check, Loader2, Zap } from "lucide-react";
import { DISPATCH_STEPS } from "../../dispatch-steps";

export function SagaDispatchOverlay() {
  const [visibleStep, setVisibleStep] = useState(0);

  useEffect(() => {
    if (visibleStep >= DISPATCH_STEPS.length - 1) return;
    const timer = setTimeout(() => setVisibleStep((s) => s + 1), 600);
    return () => clearTimeout(timer);
  }, [visibleStep]);

  return (
    <div className="absolute inset-0 z-20 rounded-xl bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-5 p-6 font-mono">
      <div className="relative flex items-center justify-center">
        <span className="absolute h-16 w-16 rounded-full bg-primary/20 animate-ping" />
        <span className="absolute h-12 w-12 rounded-full bg-primary/30 animate-pulse" />
        <Zap className="relative h-7 w-7 text-primary" />
      </div>

      <div className="text-center">
        <p className="text-xs font-extrabold text-foreground uppercase tracking-widest mb-1">
          Dispatching Saga Transaction
        </p>
        <p className="text-[10px] text-muted-foreground">
          Initializing distributed choreography...
        </p>
      </div>

      <div className="w-full space-y-2">
        {DISPATCH_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isVisible = i <= visibleStep;
          const isActive = i === visibleStep;
          return (
            <div
              key={step.label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-500 ${
                isVisible
                  ? isActive
                    ? "border-primary/40 bg-primary/5 opacity-100"
                    : "border-border/30 bg-background/30 opacity-70"
                  : "opacity-0 translate-y-1"
              }`}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <span className="shrink-0">
                <Icon className={step.iconClassName} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-foreground truncate">
                  {step.label}
                </p>
                <p className="text-[9px] text-muted-foreground truncate">
                  {step.detail}
                </p>
              </div>
              {isActive ? (
                <Loader2 className="h-3 w-3 text-primary animate-spin shrink-0" />
              ) : isVisible ? (
                <Check className="h-3 w-3 text-emerald-400 shrink-0" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
