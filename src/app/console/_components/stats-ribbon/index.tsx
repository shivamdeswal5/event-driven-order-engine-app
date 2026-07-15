"use client";
import React from "react";
import { ShoppingBag, ShieldCheck, Bell } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectAllOrders } from "@/features/orders/orders.slice";
import { selectAllNotifications } from "@/features/notifications/notifications.slice";
import { selectEventLog } from "@/features/telemetry/telemetry.slice";
import { OrderStatus } from "@/common/order-status.enum";
import { motion } from "framer-motion";

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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
      {/* Total Orders Stat */}
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/40 bg-card/25 backdrop-blur-md shadow-sm transition-colors hover:bg-card/40 hover:border-primary/40 group cursor-default"
      >
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary transition-colors group-hover:bg-primary/20">
          <ShoppingBag className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-muted-foreground font-mono font-bold tracking-widest uppercase">
            Total Orders
          </span>
          <span className="text-lg font-bold font-mono tracking-tight text-foreground tabular-nums">
            {totalOrders}
          </span>
        </div>
      </motion.div>

      {/* Active Sagas Stat */}
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/40 bg-card/25 backdrop-blur-md shadow-sm transition-colors hover:bg-card/40 hover:border-amber-500/40 group cursor-default"
      >
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 transition-colors group-hover:bg-amber-500/20">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-muted-foreground font-mono font-bold tracking-widest uppercase flex items-center gap-1.5">
            Active Sagas
            {activeSagas > 0 ? (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="System Idle" />
            )}
          </span>
          <span className="text-lg font-bold font-mono tracking-tight text-foreground tabular-nums">
            {activeSagas}
          </span>
        </div>
      </motion.div>

      {/* Notification Event Counter */}
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/40 bg-card/25 backdrop-blur-md shadow-sm transition-colors hover:bg-card/40 hover:border-cyan-500/40 group cursor-default"
      >
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 transition-colors group-hover:bg-cyan-500/20">
          <Bell className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-muted-foreground font-mono font-bold tracking-widest uppercase">
            Choreography Events
          </span>
          <span className="text-lg font-bold font-mono tracking-tight text-foreground tabular-nums">
            {totalNotifications}
          </span>
        </div>
      </motion.div>
    </div>
  );
}


