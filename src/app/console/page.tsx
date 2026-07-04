"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/header";
import { EventTicker } from "../_components/event-ticker";
import { StatsRibbon } from "./_components/stats-ribbon";
import { OrderPlayground } from "./_components/order-playground";
import { TopologyVisualizer } from "./_components/topology-visualizer";
import { useTelemetrySocket } from "@/features/telemetry/hooks/use-telemetry-socket";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { listNotificationsAction } from "@/features/notifications/list-notifications/list-notifications.action";
import { listOrdersAction } from "@/features/orders/list-orders/list-orders.action";
import { selectAllNotifications } from "@/features/notifications/notifications.slice";
import { Terminal, ListTodo, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AwaitingEventsDeck } from "./_components/awaiting-events-deck";

export default function ConsolePage() {
  // Initialize WebSocket telemetry connections and real-time invalidations
  useTelemetrySocket();

  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectAllNotifications);

  useEffect(() => {
    // Initial load
    dispatch(listNotificationsAction({ limit: 50 }));
    dispatch(listOrdersAction({ limit: 50 }));

    // Polling fallback to synchronize background saga transitions
    const interval = setInterval(() => {
      dispatch(listNotificationsAction({ limit: 50 }));
      dispatch(listOrdersAction({ limit: 50 }));
    }, 3000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300 pt-20">
      {/* 1. Global Header with live connection bulbs & aggregated telemetry metrics */}
      <Header />

      {/* 2. Seamless Marquee scrolling event ticker */}
      <EventTicker />

      {/* 3. Main Content Layout */}
      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Metrics Overview Stats ribbon */}
        <StatsRibbon />

        {/* Order Playground & Active Saga Dashboard (Full Width) */}
        <OrderPlayground />

        {/* RabbitMQ Exchange/Queue Topology (Full Width) */}
        <TopologyVisualizer />

        {/* Historical Notification Event Stream (Full Width Log Console) */}
        <div className="border border-border bg-card/45 backdrop-blur-md rounded-2xl p-6 shadow-xl flex flex-col h-[450px]">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="h-5 w-5 text-primary animate-pulse" />
            <h2 className="text-lg font-bold text-foreground font-mono">
              System Event Stream (Notification Logs)
            </h2>
          </div>
          
          <p className="text-xs text-muted-foreground leading-relaxed font-mono mb-4 border-b border-border/40 pb-3">
            Historical timeline of events consumed by the Notification Service, pushed via RabbitMQ and synced in real-time.
          </p>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin scrollbar-thumb-border">
            {notifications.length === 0 ? (
              <AwaitingEventsDeck />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notifications.map((notif) => {
                  const isFailure = notif.eventType.toLowerCase().includes("fail") || notif.eventType.toLowerCase().includes("cancel");
                  
                  return (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border font-mono text-xs transition-all hover:bg-muted/40 flex flex-col justify-between ${
                        isFailure
                          ? "border-rose-500/20 bg-rose-500/5 text-rose-300"
                          : "border-border/60 bg-background/30 text-foreground"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-extrabold uppercase text-[10px] tracking-wide text-primary">
                            {notif.eventType}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="leading-relaxed text-foreground/90 break-words">
                          {notif.message}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-border/20 text-[9px] text-muted-foreground flex items-center justify-between">
                        <span>Order ID: {notif.orderId.slice(0, 8)}...</span>
                        <span className="text-[8px] bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                          RabbitMQ Direct
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
