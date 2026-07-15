import React from "react";
import { STAGES } from "../../constants";

type StageTrackerProps = {
  currentStage: number;
  logsLength: number;
};

export function StageTracker({ currentStage, logsLength }: StageTrackerProps) {
  return (
    <div className="max-w-4xl mx-auto mb-12 border border-border/30 rounded-2xl bg-card/25 p-4 md:px-8 backdrop-blur-sm shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
        {STAGES.map((stage, idx) => {
          const isActive = currentStage === idx;
          const isCompleted = currentStage > idx || (currentStage === -1 && logsLength > 0);

          return (
            <React.Fragment key={stage.label}>
              <div className="flex items-center gap-2">
                <div
                  className={`relative flex items-center justify-center h-7 w-7 rounded-full text-[10.5px] font-bold border transition-all duration-500 ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                      : isCompleted
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                        : "bg-background text-muted-foreground border-border"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                  {isActive && (
                    <span className="absolute -inset-1 rounded-full border border-primary animate-ping opacity-60 pointer-events-none" />
                  )}
                </div>
                <span
                  className={`text-[11.5px] font-bold transition-colors duration-300 ${
                    isActive
                      ? "text-primary dark:text-indigo-400 font-extrabold"
                      : isCompleted
                        ? "text-foreground dark:text-zinc-200 font-semibold"
                        : "text-muted-foreground"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <div className="hidden md:block flex-1 h-[2px] mx-4 rounded-full relative bg-border overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                      isCompleted
                        ? "w-full bg-primary/70"
                        : isActive
                          ? "w-1/2 bg-primary animate-pulse"
                          : "w-0"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
