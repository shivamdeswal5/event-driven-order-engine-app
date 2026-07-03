"use client";

import React, { useState } from "react";
import {
  Activity,
  Flame,
  LayoutGrid,
  Network,
  RotateCcw,
  Zap,
  Play,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setViewMode,
  toggleChaosMonkey,
  resetChaosMonkey,
  selectViewMode,
  selectChaosMonkeyState,
} from "@/features/ui/ui.slice";
import { axiosInstance } from "@/config/axios";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export function ConsoleSidebar() {
  const dispatch = useAppDispatch();
  const viewMode = useAppSelector(selectViewMode);
  const chaosMonkey = useAppSelector(selectChaosMonkeyState);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<"idle" | "success" | "error">("idle");

  const handleTriggerDispatch = async () => {
    setDispatching(true);
    setDispatchStatus("idle");
    try {
      await axiosInstance.post("/api/outbox/dispatch");
      setDispatchStatus("success");
      setTimeout(() => setDispatchStatus("idle"), 3000);
    } catch (err) {
      setDispatchStatus("error");
      setTimeout(() => setDispatchStatus("idle"), 3000);
    } finally {
      setDispatching(false);
    }
  };

  const chaosControls = [
    {
      key: "inventoryDbLock",
      label: "Inventory DB Lock",
      description: "Locks the database schema, forcing transactions to wait and eventually time out.",
    },
    {
      key: "paymentTimeout",
      label: "Stripe Connection Latency",
      description: "Simulates an external Stripe network gateway delay, failing capturing checks.",
    },
    {
      key: "shippingException",
      label: "DHL Carrier System Exception",
      description: "Generates transport routing schema mismatch exceptions on dispatch creation.",
    },
  ];

  return (
    <aside className="w-full lg:w-80 border-r border-border bg-card/45 backdrop-blur-sm p-6 flex flex-col gap-8 select-none">
      {/* Topology Perspective Deck */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-bold text-sm tracking-tight uppercase">Observability View</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 bg-background border border-border p-1 rounded-xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(setViewMode("monolith"))}
            className={`text-xs gap-1.5 h-8 ${
              viewMode === "monolith" ? "bg-card text-foreground font-bold shadow-xs" : "text-muted-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Monolith
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(setViewMode("microservices"))}
            className={`text-xs gap-1.5 h-8 ${
              viewMode === "microservices" ? "bg-card text-foreground font-bold shadow-xs" : "text-muted-foreground"
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            Microservices
          </Button>
        </div>
      </div>

      {/* Outbox Event Dispatcher */}
      <div className="flex flex-col gap-4 border-t border-border/60 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4.5 w-4.5 text-primary" />
            <h3 className="font-bold text-sm tracking-tight uppercase">Outbox Sweeper</h3>
          </div>
          {dispatchStatus === "success" && (
            <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-500 font-mono text-[9px]">
              DISPATCHED
            </Badge>
          )}
          {dispatchStatus === "error" && (
            <Badge variant="outline" className="border-rose-500/20 bg-rose-500/5 text-rose-500 font-mono text-[9px]">
              FAILED
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Manually sweep and publish accumulated Outbox messages to the RabbitMQ exchange.
        </p>
        <Button
          onClick={handleTriggerDispatch}
          disabled={dispatching}
          variant="outline"
          className="w-full font-semibold border-primary/20 hover:border-primary/50 text-foreground flex items-center justify-center gap-2"
        >
          <Play className={`h-3.5 w-3.5 text-primary ${dispatching ? "animate-spin" : ""}`} />
          {dispatching ? "Sweeping Outbox..." : "Force Event Sweep"}
        </Button>
      </div>

      {/* Chaos Monkey Fault Deck */}
      <div className="flex flex-col gap-4 border-t border-border/60 pt-6 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4.5 w-4.5 text-primary" />
            <h3 className="font-bold text-sm tracking-tight uppercase">Chaos Injection</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(resetChaosMonkey())}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Reset fault status"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Inject infrastructure anomalies to trigger choreographed Saga compensatory transactions.
        </p>

        <div className="flex flex-col gap-5 mt-2">
          {chaosControls.map((control) => (
            <div
              key={control.key}
              className={`flex flex-col gap-2 p-3.5 rounded-xl border transition-all duration-300 ${
                chaosMonkey[control.key]
                  ? "border-rose-500/30 bg-rose-500/5"
                  : "border-border/60 bg-background/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">{control.label}</span>
                <Switch
                  checked={chaosMonkey[control.key]}
                  onCheckedChange={() => dispatch(toggleChaosMonkey(control.key))}
                />
              </div>
              <p className="text-[10px] text-muted-foreground/80 leading-normal">
                {control.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
