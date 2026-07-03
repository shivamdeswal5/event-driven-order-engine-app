"use client";

import React, { useState } from "react";
import { Terminal, ShieldCheck, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectEventLog } from "@/features/telemetry/telemetry.slice";
import { Badge } from "@/components/ui/badge";

export function TelemetryLedger() {
  const logs = useAppSelector(selectEventLog);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-xl bg-card/25 backdrop-blur-sm p-5 select-none overflow-hidden">
      <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-4">
        <Terminal className="h-4.5 w-4.5 text-primary" />
        <h3 className="font-bold text-sm tracking-tight uppercase">Telemetry Ledger</h3>
      </div>

      {logs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-lg text-xs text-muted-foreground gap-1.5 bg-background/25">
          <Terminal className="h-6 w-6 text-muted-foreground/45 animate-pulse" />
          <span>Awaiting real-time transaction events...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-thin">
          {logs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const eventPayloadString = JSON.stringify(log.payload, null, 2);

            return (
              <div
                key={log.id}
                className={`flex flex-col border rounded-lg transition-all duration-300 ${
                  isExpanded ? "border-primary bg-background/40" : "border-border/60 bg-background/20"
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-background/30 transition-colors gap-3"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-mono font-bold text-xs text-foreground truncate max-w-[190px]">
                      {log.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-normal line-clamp-1">
                      {log.message}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={`font-mono text-[9px] capitalize py-0.5 px-2 ${
                        log.status === "failed"
                          ? "border-rose-500/20 bg-rose-500/5 text-rose-500"
                          : "border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
                      }`}
                    >
                      {log.status}
                    </Badge>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border/40 p-3.5 bg-black/30 flex flex-col gap-3 font-mono text-[10px]">
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground border-b border-border/30 pb-2 mb-1">
                      <div className="flex flex-col gap-0.5">
                        <span>Correlation ID</span>
                        <span className="text-foreground truncate max-w-[120px] font-bold">{log.correlationId}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span>Timestamp</span>
                        <span className="text-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Envelope Payload</span>
                        <button
                          onClick={() => handleCopy(eventPayloadString, log.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        >
                          {copiedId === log.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                      <pre className="p-2.5 rounded border border-border/40 bg-black/60 text-foreground/90 overflow-x-auto leading-normal max-h-[140px] scrollbar-thin">
                        <code>{eventPayloadString}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
