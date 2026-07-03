"use client";

import React, { useEffect, useState } from "react";
import { Cpu, DollarSign, Package, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectEventLog } from "@/features/telemetry/telemetry.slice";
import { selectAllNotifications } from "@/features/notifications/notifications.slice";

interface TickerItem {
  id: string;
  eventType: string;
  message: string;
  time: string;
}

export function EventTicker() {
  const liveLogs = useAppSelector(selectEventLog);
  const dbNotifications = useAppSelector(selectAllNotifications);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    if (liveLogs.length > 0) {
      setTickerItems(
        liveLogs.slice(0, 10).map((log, i) => ({
          id: `${log.orderId}-${i}`,
          eventType: log.eventType,
          message: log.message,
          time: new Date(log.occurredAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        }))
      );
    } else if (dbNotifications.length > 0) {
      setTickerItems(
        dbNotifications.slice(0, 10).map((notif) => ({
          id: notif.id,
          eventType: notif.eventType,
          message: notif.message,
          time: new Date(notif.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        }))
      );
    } else {
      setTickerItems([]);
    }
  }, [liveLogs, dbNotifications]);

  const getEventIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("placed")) return <Cpu className="h-3.5 w-3.5 text-cyan-400" />;
    if (t.includes("reserved") || t.includes("inventory")) return <Package className="h-3.5 w-3.5 text-emerald-400" />;
    if (t.includes("payment")) return <DollarSign className="h-3.5 w-3.5 text-violet-400" />;
    if (t.includes("ship") || t.includes("truck")) return <Truck className="h-3.5 w-3.5 text-amber-400" />;
    return <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />;
  };

  const getEventClass = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("placed")) return "border-cyan-500/20 bg-cyan-500/5 text-cyan-400";
    if (t.includes("reserved") || t.includes("inventory")) return "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
    if (t.includes("payment")) return "border-violet-500/20 bg-violet-500/5 text-violet-400";
    if (t.includes("ship") || t.includes("truck")) return "border-amber-500/20 bg-amber-500/5 text-amber-400";
    return "border-rose-500/20 bg-rose-500/5 text-rose-400";
  };

  return (
    <div className="w-full border-y border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden py-3.5 flex items-center relative z-20">
      {/* Absolute label badge */}
      <div className="absolute left-0 top-0 bottom-0 px-4 bg-background border-r border-border/60 flex items-center gap-1.5 z-30 shadow-[4px_0_12px_rgba(0,0,0,0.15)]">
        <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" style={{ animationDuration: "3s" }} />
        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Live Telemetry Stream</span>
      </div>

      <div className="flex gap-6 animate-marquee whitespace-nowrap pl-40">
        {/* Double render list to create seamless infinite loop */}
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className={`inline-flex items-center gap-2 border px-3.5 py-1.5 rounded-full text-xs font-medium font-mono ${getEventClass(
              item.eventType
            )}`}
          >
            {getEventIcon(item.eventType)}
            <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-80">{item.eventType}</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="max-w-[280px] truncate text-foreground/90">{item.message}</span>
            <span className="text-[9px] text-muted-foreground">{item.time}</span>
          </div>
        ))}
      </div>

      {/* Styled Marquee Animation styles directly injected */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.333%, 0, 0);
          }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
