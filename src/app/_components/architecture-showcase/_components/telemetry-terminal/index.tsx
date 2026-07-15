import type { RefObject } from "react";
import { motion } from "framer-motion";
import { Terminal as TerminalIcon } from "lucide-react";
import type { TelemetryLog } from "../../types";

type TelemetryTerminalProps = {
  logs: TelemetryLog[];
  isSimulating: boolean;
  terminalRef: RefObject<HTMLDivElement | null>;
};

export function TelemetryTerminal({
  logs,
  isSimulating,
  terminalRef,
}: TelemetryTerminalProps) {
  return (
    <div className="mt-4 border border-border/60 dark:border-border/40 bg-card/45 dark:bg-black/30 backdrop-blur-md rounded-2xl p-4 font-mono text-xs overflow-hidden h-44 flex flex-col z-10 shadow-inner relative">
      {/* Subtle top glowing bar indicator */}
      <div
        className={`absolute top-0 inset-x-0 h-[2.5px] transition-colors duration-500 z-20 ${
          isSimulating
            ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"
            : "bg-indigo-500/25"
        }`}
      />

      {/* CRT Matrix micro-grid background pattern */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "8px 8px",
        }}
      />

      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/20 text-muted-foreground select-none z-10">
        <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase font-sans text-indigo-600 dark:text-indigo-400">
          <TerminalIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> Live Event
          Telemetry Stream
        </span>
        <span
          className={`text-[9px] font-extrabold uppercase font-mono tracking-widest px-2 py-0.5 rounded-full border transition-all duration-300 ${
            isSimulating
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 animate-pulse"
              : "bg-muted text-muted-foreground border-border"
          }`}
        >
          {isSimulating ? "Running" : "Idle"}
        </span>
      </div>
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto space-y-1.5 pr-1 z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {logs.length === 0 ? (
          <div className="text-muted-foreground/60 italic text-[11px] h-full flex items-center justify-center select-none">
            Waiting to capture telemetry loop events... Click &apos;Simulate Order Event Loop&apos; above to run.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {logs.map((log, i) => {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8, filter: "blur(1px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 text-[11px] leading-relaxed font-mono py-0.5"
                >
                  {/* Timestamp & Icon */}
                  <div className="flex items-center gap-1.5 shrink-0 select-none">
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                      [{log.timestamp}]
                    </span>
                    <span className="text-[12px]">{log.icon}</span>
                  </div>

                  {/* Tag Badge */}
                  <span
                    className={`px-1.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase font-mono border shrink-0 ${log.tagClass}`}
                  >
                    {log.tag}
                  </span>

                  {/* Message Body */}
                  <span className={`${log.colorClass} flex-1`}>{log.message}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
