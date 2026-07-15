"use client";

import { Activity, Zap } from "lucide-react";
import { COLORS, getServiceTone } from "@/common/service-tone.styles";
import { getFlowDesc } from "../../constants";
import type { ActivityEntry } from "../../types";

type ActivityFeedProps = {
  activityLog: ActivityEntry[];
};

export function ActivityFeed({ activityLog }: ActivityFeedProps) {
  return (
    <div className="w-full lg:w-72 h-[280px] lg:h-[500px] border-t lg:border-t-0 lg:border-l border-border/40 flex flex-col bg-card/30 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-extrabold uppercase tracking-widest font-mono text-muted-foreground">
          Event Flow Log
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-border">
        {activityLog.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center py-10">
            <div className="h-8 w-8 rounded-full border-2 border-dashed border-border/60 flex items-center justify-center">
              <Activity className="h-4 w-4 text-muted-foreground/40" />
            </div>
            <p className="text-[9px] font-mono text-muted-foreground/50 leading-relaxed">
              Place an order to see
              <br />
              live event routing here
            </p>
          </div>
        ) : (
          activityLog.map((entry, i) => {
            const key = entry.eventType.toLowerCase().replace(/event$/, "");
            const col =
              Object.keys(COLORS).find((c) => key.includes(c)) ?? "order";
            const c = getServiceTone(col);
            const isNewest = i === 0;
            return (
              <div
                key={entry.ts}
                className={`p-2.5 rounded-lg border font-mono transition-all ${c.border} ${c.bg} ${isNewest ? "opacity-100" : "opacity-60"}`}
              >
                <div
                  className={`text-[9px] font-extrabold uppercase tracking-wide mb-1 ${c.text}`}
                >
                  {entry.eventType.replace(/([A-Z])/g, " $1").trim()}
                </div>
                <p className="text-[8px] text-muted-foreground leading-relaxed">
                  {getFlowDesc(key)}
                </p>
                <div className="mt-1.5 text-[7px] text-muted-foreground/50">
                  order_{entry.orderId.slice(0, 8)}...
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-border/40 grid grid-cols-2 gap-1.5">
        {Object.entries(COLORS).map(([svc, c]) => (
          <div key={svc} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: c.dot }}
            />
            <span
              className={`text-[8px] font-mono font-semibold capitalize ${c.text}`}
            >
              {svc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
