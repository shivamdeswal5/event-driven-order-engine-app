"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Cpu, Wifi, WifiOff, Sun, Moon, Palette, ShieldAlert } from "lucide-react";
import { useTheme } from "@/theme/theme-provider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectConnectionStatus,
  selectTelemetryMetrics,
  setConnectionStatus,
  addLogMessage,
} from "@/features/telemetry/telemetry.slice";
import { getTelemetrySocket } from "@/features/telemetry/socket/telemetry.socket";
import { Button } from "@/components/ui/button";

export function ConsoleHeader() {
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const metrics = useAppSelector(selectTelemetryMetrics);

  // Hook up WebSockets
  useEffect(() => {
    const socket = getTelemetrySocket();

    dispatch(setConnectionStatus("connecting"));
    socket.connect();

    socket.on("connect", () => {
      dispatch(setConnectionStatus("connected"));
    });

    socket.on("disconnect", () => {
      dispatch(setConnectionStatus("disconnected"));
    });

    socket.on("notification", (data: any) => {
      dispatch(
        addLogMessage({
          id: data.occurredAt || Math.random().toString(),
          timestamp: data.occurredAt || new Date().toISOString(),
          type: data.eventType || "unknown",
          message: data.message || "",
          correlationId: data.correlationId || "N/A",
          causationId: data.causationId || "N/A",
          payload: data.payload || {},
          status: data.eventType?.includes("failed") || data.eventType?.includes("cancelled") ? "failed" : "success",
        })
      );
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("notification");
      socket.disconnect();
    };
  }, [dispatch]);

  const themes = [
    { name: "obsidian", label: "Obsidian", icon: <Moon className="h-3.5 w-3.5" /> },
    { name: "midnight", label: "Midnight", icon: <Palette className="h-3.5 w-3.5" /> },
    { name: "steel", label: "Steel", icon: <Sun className="h-3.5 w-3.5" /> },
  ];

  return (
    <header className="border-b border-border bg-card/60 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-30">
      {/* Title & Brand */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <Cpu className="h-5.5 w-5.5 text-primary animate-pulse" />
          <span>APEX CONSOLE</span>
        </Link>
        <span className="text-[10px] font-bold font-mono tracking-widest bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full uppercase">
          Observability
        </span>
      </div>

      {/* Metrics Row */}
      <div className="flex flex-wrap items-center gap-3 md:gap-6 bg-background/50 border border-border/80 rounded-xl px-4 py-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-muted-foreground">Active:</span>
          <span className="font-extrabold text-foreground">{metrics.active}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-muted-foreground">Completed:</span>
          <span className="font-extrabold text-foreground">{metrics.completed}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          <span className="text-muted-foreground">Failed:</span>
          <span className="font-extrabold text-foreground">{metrics.failed}</span>
        </div>
      </div>

      {/* Action Controls & Theme Switcher */}
      <div className="flex items-center gap-4">
        {/* Connection Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold ${
            connectionStatus === "connected"
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
              : "border-rose-500/20 bg-rose-500/5 text-rose-500"
          }`}
        >
          {connectionStatus === "connected" ? (
            <>
              <Wifi className="h-3.5 w-3.5" />
              <span>LIVE</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 animate-bounce" />
              <span>OFFLINE</span>
            </>
          )}
        </div>

        {/* Theme Switcher Toggle */}
        <div className="flex items-center border border-border bg-background rounded-lg p-0.5">
          {themes.map((t) => (
            <Button
              key={t.name}
              variant="ghost"
              size="sm"
              onClick={() => setTheme(t.name)}
              className={`h-7 px-2.5 rounded-md gap-1.5 text-xs ${
                theme === t.name
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              <span className="hidden lg:inline">{t.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
}
