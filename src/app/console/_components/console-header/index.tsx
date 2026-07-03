"use client";

import React, { useEffect } from "react";
import { Database, Radio, Wifi, ShoppingBag, ShieldCheck, Bell, Activity, Sun, Moon, Palette } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectHealthData, selectHealthLoading } from "@/features/health/health.slice";
import { getHealthAction } from "@/features/health/get-health/get-health.action";
import { selectConnectionStatus, selectEventLog } from "@/features/telemetry/telemetry.slice";
import { selectAllOrders } from "@/features/orders/orders.slice";
import { selectAllNotifications } from "@/features/notifications/notifications.slice";
import { useTheme } from "@/theme/theme-provider";
import { OrderStatus } from "@/common/order-status.enum";

export function ConsoleHeader() {
  const dispatch = useAppDispatch();
  const healthData = useAppSelector(selectHealthData);
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const orders = useAppSelector(selectAllOrders);
  const notifications = useAppSelector(selectAllNotifications);
  const eventLog = useAppSelector(selectEventLog);
  const { theme, setTheme } = useTheme();

  // Poll health endpoint every 10 seconds
  useEffect(() => {
    dispatch(getHealthAction());
    const interval = setInterval(() => {
      dispatch(getHealthAction());
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Aggregate stats
  const totalOrders = orders.length;
  const activeSagas = orders.filter(
    (o) => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED
  ).length;

  // We show notifications today by adding backend notification count + current session socket events
  const totalNotifications = notifications.length + eventLog.length;

  const dbStatus = healthData?.details?.database?.status === "up" ? "healthy" : "unhealthy";
  const rmqStatus = healthData?.details?.rabbitmq?.status === "up" ? "healthy" : "unhealthy";

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground font-mono">
              APEX<span className="text-primary">.CONSOLE</span>
            </h1>
            <p className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase font-mono">
              Choreography Saga Observability
            </p>
          </div>
        </div>

        {/* Real-time Infrastructure Health Indicators */}
        <div className="flex flex-wrap items-center gap-3">
          {/* DB Health */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/50 border-border/80">
            <Database className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-mono font-medium text-foreground">DB:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  dbStatus === "healthy" ? "bg-emerald-500 animate-ping" : "bg-rose-500 animate-pulse"
                }`}
              />
              <span className={`text-[11px] font-mono font-bold ${
                dbStatus === "healthy" ? "text-emerald-500" : "text-rose-500"
              }`}>
                {dbStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* RabbitMQ Health */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/50 border-border/80">
            <Radio className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-mono font-medium text-foreground">RabbitMQ:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  rmqStatus === "healthy" ? "bg-emerald-500 animate-ping" : "bg-rose-500 animate-pulse"
                }`}
              />
              <span className={`text-[11px] font-mono font-bold ${
                rmqStatus === "healthy" ? "text-emerald-500" : "text-rose-500"
              }`}>
                {rmqStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* WS Connection Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/50 border-border/80">
            <Wifi className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-mono font-medium text-foreground">WebSocket:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-cyan-500 animate-ping"
                    : connectionStatus === "connecting"
                    ? "bg-amber-500 animate-bounce"
                    : "bg-rose-500 animate-pulse"
                }`}
              />
              <span className={`text-[11px] font-mono font-bold ${
                connectionStatus === "connected"
                  ? "text-cyan-500"
                  : connectionStatus === "connecting"
                  ? "text-amber-500"
                  : "text-rose-500"
              }`}>
                {connectionStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Theme Settings Selector */}
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <div className="flex rounded-md border border-border bg-background/40 p-0.5">
            {(["obsidian", "midnight", "steel"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-extrabold uppercase transition-all ${
                  theme === t
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aggregate Stats Dashboard Ribbon */}
      <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-border/40 grid grid-cols-3 gap-4">
        {/* Total Orders Stat */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/60 bg-background/25">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <ShoppingBag className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-mono font-bold tracking-wider uppercase">
              Total Orders
            </p>
            <p className="text-lg font-bold font-mono tracking-tight text-foreground">
              {totalOrders}
            </p>
          </div>
        </div>

        {/* Active Sagas Stat */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/60 bg-background/25">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <ShieldCheck className="h-4 w-4 text-amber-500 animate-spin-slow" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-mono font-bold tracking-wider uppercase">
              Active Sagas
            </p>
            <p className="text-lg font-bold font-mono tracking-tight text-foreground">
              {activeSagas}
            </p>
          </div>
        </div>

        {/* Notification Event Counter */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/60 bg-background/25">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Bell className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-mono font-bold tracking-wider uppercase">
              Choreography Events
            </p>
            <p className="text-lg font-bold font-mono tracking-tight text-foreground">
              {totalNotifications}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
