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
            <span className={`text-[11px] font-mono font-bold ${
              dbStatus === "healthy" ? "text-emerald-500" : "text-rose-500"
            }`}>
              {dbStatus.toUpperCase()}
            </span>
          </div>

          {/* RabbitMQ Health */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/50 border-border/80">
            <Radio className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-mono font-medium text-foreground">RabbitMQ:</span>
            <span className={`text-[11px] font-mono font-bold ${
              rmqStatus === "healthy" ? "text-emerald-500" : "text-rose-500"
            }`}>
              {rmqStatus.toUpperCase()}
            </span>
          </div>

          {/* WS Connection Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/50 border-border/80">
            <Wifi className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-mono font-medium text-foreground">WebSocket:</span>
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

        {/* Theme Settings Toggle */}
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="flex items-center justify-center p-2 rounded-lg border border-border bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4 text-primary" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500 animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
}
