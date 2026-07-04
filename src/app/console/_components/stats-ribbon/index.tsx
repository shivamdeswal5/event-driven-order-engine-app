"use client";

import React from "react";
import { ShoppingBag, ShieldCheck, Bell } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectAllOrders } from "@/features/orders/orders.slice";
import { selectAllNotifications } from "@/features/notifications/notifications.slice";
import { selectEventLog } from "@/features/telemetry/telemetry.slice";
import { OrderStatus } from "@/common/order-status.enum";

export function StatsRibbon() {
  const orders = useAppSelector(selectAllOrders);
  const notifications = useAppSelector(selectAllNotifications);
  const eventLog = useAppSelector(selectEventLog);

  // Aggregate stats
  const totalOrders = orders.length;
  const activeSagas = orders.filter(
    (o) => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED
  ).length;

  const totalNotifications = notifications.length + eventLog.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
      {/* Total Orders Stat */}
      <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-border/80 bg-card/45 backdrop-blur-md shadow-lg transition-all hover:bg-card/60">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <ShoppingBag className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground font-mono font-bold tracking-wider uppercase">
            Total Orders
          </p>
          <p className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {totalOrders}
          </p>
        </div>
      </div>

      {/* Active Sagas Stat */}
      <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-border/80 bg-card/45 backdrop-blur-md shadow-lg transition-all hover:bg-card/60">
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <ShieldCheck className="h-5 w-5 text-amber-500 animate-pulse" />
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground font-mono font-bold tracking-wider uppercase">
            Active Sagas
          </p>
          <p className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {activeSagas}
          </p>
        </div>
      </div>

      {/* Notification Event Counter */}
      <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-border/80 bg-card/45 backdrop-blur-md shadow-lg transition-all hover:bg-card/60">
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <Bell className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground font-mono font-bold tracking-wider uppercase">
            Choreography Events
          </p>
          <p className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {totalNotifications}
          </p>
        </div>
      </div>
    </div>
  );
}
