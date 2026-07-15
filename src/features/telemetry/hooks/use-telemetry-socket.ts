"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getTelemetrySocket, closeTelemetrySocket } from "../socket/telemetry.socket";
import {
  setConnectionStatus,
  addNotification,
  WebSocketNotification,
} from "../telemetry.slice";
import { addToast } from "@/features/ui/ui.slice";
import { selectAllOrders } from "@/features/orders/orders.slice";
import { getOrderAction } from "@/features/orders/get-order/get-order.action";
import { listProductsAction } from "@/features/catalog/list-products/list-products.action";
import { listNotificationsAction } from "@/features/notifications/list-notifications/list-notifications.action";

export function useTelemetrySocket() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectAllOrders);
  const subscribedOrdersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const socket = getTelemetrySocket();

    dispatch(setConnectionStatus("connecting"));

    socket.connect();

    const onConnect = () => {
      dispatch(setConnectionStatus("connected"));
      subscribedOrdersRef.current.clear();
      orders.forEach((order) => {
        socket.emit("subscribeToOrder", { orderId: order.id });
        subscribedOrdersRef.current.add(order.id);
      });
    };

    const onDisconnect = () => {
      dispatch(setConnectionStatus("disconnected"));
    };

    // Targeted, order-scoped channel: only fires for orders this client
    // subscribed to. Used purely for user-facing toasts ("my order updated").
    const onNotification = (data: WebSocketNotification) => {
      const evLower = data.eventType.toLowerCase();
      let type: "success" | "error" | "info" = "info";
      if (evLower.includes("fail") || evLower.includes("cancel") || evLower.includes("exception")) {
        type = "error";
      } else if (evLower.includes("reserve") || evLower.includes("complete") || evLower.includes("deliver") || evLower.includes("ship") || evLower.includes("create")) {
        type = "success";
      }

      dispatch(
        addToast({
          type,
          title: data.eventType.replace(/([A-Z])/g, " $1").trim(), // EventTypeCamel -> Event Type Camel
          message: data.message,
        })
      );
    };

    // Observability firehose: fires for EVERY saga event regardless of order
    // subscriptions. This is the reliable, complete stream that drives the
    // topology / event-flow log and keeps derived state fresh.
    const onSagaEvent = (data: WebSocketNotification) => {
      // 1. Append to the live telemetry log (powers the topology animation)
      dispatch(addNotification(data));
      // 2. Re-fetch the specific order to update its status/saga state
      if (data.orderId) dispatch(getOrderAction(data.orderId));
      // 3. Re-fetch catalog products to update stock quantities
      dispatch(listProductsAction());
      // 4. Re-fetch notification feed list
      dispatch(listNotificationsAction({ limit: 50 }));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("notification", onNotification);
    socket.on("saga-event", onSagaEvent);

    // Fallback if already connected
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("notification", onNotification);
      socket.off("saga-event", onSagaEvent);
      closeTelemetrySocket();
    };
  }, [dispatch]);

  // Subscribe to new orders as they are loaded into the store
  useEffect(() => {
    const socket = getTelemetrySocket();
    if (!socket.connected) return;

    orders.forEach((order) => {
      if (!subscribedOrdersRef.current.has(order.id)) {
        socket.emit("subscribeToOrder", { orderId: order.id });
        subscribedOrdersRef.current.add(order.id);
      }
    });
  }, [orders]);
}
