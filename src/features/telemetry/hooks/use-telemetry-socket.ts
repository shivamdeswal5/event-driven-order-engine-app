"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getTelemetrySocket, closeTelemetrySocket } from "../socket/telemetry.socket";
import {
  setConnectionStatus,
  addNotification,
  WebSocketNotification,
} from "../telemetry.slice";
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
      // Clear tracked subscriptions so we re-subscribe to all on reconnect
      subscribedOrdersRef.current.clear();
      orders.forEach((order) => {
        socket.emit("subscribeToOrder", { orderId: order.id });
        subscribedOrdersRef.current.add(order.id);
      });
    };

    const onDisconnect = () => {
      dispatch(setConnectionStatus("disconnected"));
    };

    const onNotification = (data: WebSocketNotification) => {
      // Add real-time event to telemetry slice log
      dispatch(addNotification(data));

      // Trigger event-driven cache invalidations:
      // 1. Re-fetch the specific order to update its status/saga state
      dispatch(getOrderAction(data.orderId));
      // 2. Re-fetch catalog products to update stock quantities
      dispatch(listProductsAction());
      // 3. Re-fetch notification feed list
      dispatch(listNotificationsAction({ limit: 50 }));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("notification", onNotification);

    // Fallback if already connected
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("notification", onNotification);
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
