"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/header";
import { StatsRibbon } from "./_components/stats-ribbon";
import { OrderPlayground } from "./_components/order-playground";
import { ObservabilityDeck } from "./_components/observability-deck";
import { useTelemetrySocket } from "@/features/telemetry/hooks/use-telemetry-socket";
import { useAppDispatch } from "@/store/hooks";
import { listNotificationsAction } from "@/features/notifications/list-notifications/list-notifications.action";
import { listOrdersAction } from "@/features/orders/list-orders/list-orders.action";

export default function ConsolePage() {
  useTelemetrySocket();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(listNotificationsAction({ limit: 50, offset: 0 }));
    dispatch(listOrdersAction({ limit: 50 }));

    const interval = setInterval(() => {
      dispatch(listNotificationsAction({ limit: 50, offset: 0 }));
      dispatch(listOrdersAction({ limit: 50 }));
    }, 3000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300 pt-20">
      <Header />

      <main className="flex-1 w-full mx-auto max-w-[1600px] px-4 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6">
        <StatsRibbon />

        <OrderPlayground />

        <ObservabilityDeck />
      </main>
    </div>
  );
}
