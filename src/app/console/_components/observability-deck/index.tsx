"use client";

import React, { useState } from "react";
import { TopologyVisualizer } from "../topology-visualizer";
import { EventStream } from "../event-stream";
import { useAppSelector } from "@/store/hooks";
import { selectAllNotifications } from "@/features/notifications/notifications.slice";
import { selectEventLog, selectConnectionStatus } from "@/features/telemetry/telemetry.slice";
import { Network, ScrollText } from "lucide-react";

type DeckTab = "topology" | "ledger";

export function ObservabilityDeck() {
  const [tab, setTab] = useState<DeckTab>("topology");

  const notifications = useAppSelector(selectAllNotifications);
  const liveEvents = useAppSelector(selectEventLog);
  const connection = useAppSelector(selectConnectionStatus);

  const tabs: {
    id: DeckTab;
    label: string;
    icon: React.ReactNode;
    count: number;
  }[] = [
    {
      id: "topology",
      label: "Live Topology",
      icon: <Network className="h-3.5 w-3.5" />,
      count: liveEvents.length,
    },
    {
      id: "ledger",
      label: "Event Ledger",
      icon: <ScrollText className="h-3.5 w-3.5" />,
      count: notifications.length,
    },
  ];

  const isConnected = connection === "connected";

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Observability views"
          className="inline-flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/80 font-mono text-xs self-start"
        >
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 min-h-9 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-[background-color,color,box-shadow] duration-150 ${
                  active
                    ? "bg-background text-primary shadow-sm border border-border/40"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                <span
                  className={`ml-1 px-1.5 py-px rounded-full text-[9px] tabular-nums font-extrabold ${
                    active ? "bg-primary/15 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] self-start sm:self-auto">
          <span className="relative flex h-2 w-2">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? "bg-emerald-500" : connection === "connecting" ? "bg-amber-500" : "bg-rose-500"
              }`}
            />
          </span>
          <span className="uppercase tracking-wider font-bold text-muted-foreground">WS {connection}</span>
        </div>
      </div>

      {tab === "topology" ? (
        <TopologyVisualizer />
      ) : (
        <div className="border border-border bg-card/45 backdrop-blur-md rounded-2xl p-5 shadow-xl h-[560px]">
          <EventStream />
        </div>
      )}
    </section>
  );
}
