import { MarkerType, type Edge, type Node } from "@xyflow/react";
import { COL, ROW } from "./constants";

export function mkEdge(
  id: string,
  source: string,
  target: string,
  label: string,
  color: string,
): Edge {
  return {
    id,
    source,
    target,
    label,
    type: "animated",
    data: { isActive: false, color },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  };
}

export const initialNodes: Node[] = [
  {
    id: "api",
    type: "serviceNode",
    position: { x: COL.api, y: 190 },
    data: { label: "Order API", role: "publisher", color: "order" },
  },

  {
    id: "ex-order",
    type: "exchangeNode",
    position: { x: COL.ex, y: ROW.order },
    data: { label: "order-exchange", routingKey: "order.*", color: "order" },
  },
  {
    id: "ex-inv",
    type: "exchangeNode",
    position: { x: COL.ex, y: ROW.inventory },
    data: {
      label: "inventory-exchange",
      routingKey: "inventory.*",
      color: "inventory",
    },
  },
  {
    id: "ex-pay",
    type: "exchangeNode",
    position: { x: COL.ex, y: ROW.payment },
    data: {
      label: "payment-exchange",
      routingKey: "payment.*",
      color: "payment",
    },
  },
  {
    id: "ex-ship",
    type: "exchangeNode",
    position: { x: COL.ex, y: ROW.shipping },
    data: {
      label: "shipping-exchange",
      routingKey: "shipping.*",
      color: "shipping",
    },
  },

  {
    id: "q-inv",
    type: "queueNode",
    position: { x: COL.q, y: ROW.order },
    data: {
      label: "inventory-queue",
      consumer: "Inventory Consumer",
      color: "inventory",
    },
  },
  {
    id: "q-pay",
    type: "queueNode",
    position: { x: COL.q, y: ROW.inventory },
    data: {
      label: "payment-queue",
      consumer: "Payment Consumer",
      color: "payment",
    },
  },
  {
    id: "q-ship",
    type: "queueNode",
    position: { x: COL.q, y: ROW.payment },
    data: {
      label: "shipping-queue",
      consumer: "Shipping Consumer",
      color: "shipping",
    },
  },
  {
    id: "q-order",
    type: "queueNode",
    position: { x: COL.q, y: ROW.shipping },
    data: {
      label: "order-queue",
      consumer: "Order Consumer",
      color: "order",
    },
  },
  {
    id: "q-notif",
    type: "queueNode",
    position: { x: COL.q, y: ROW.notification },
    data: {
      label: "notification-queue",
      consumer: "Notification Consumer",
      color: "notification",
    },
  },

  {
    id: "con-inv",
    type: "serviceNode",
    position: { x: COL.con, y: ROW.order },
    data: { label: "Inventory", role: "consumer", color: "inventory" },
  },
  {
    id: "con-pay",
    type: "serviceNode",
    position: { x: COL.con, y: ROW.inventory },
    data: { label: "Payment", role: "consumer", color: "payment" },
  },
  {
    id: "con-ship",
    type: "serviceNode",
    position: { x: COL.con, y: ROW.payment },
    data: { label: "Shipping", role: "consumer", color: "shipping" },
  },
  {
    id: "con-order",
    type: "serviceNode",
    position: { x: COL.con, y: ROW.shipping },
    data: { label: "Order", role: "consumer", color: "order" },
  },
  {
    id: "con-notif",
    type: "serviceNode",
    position: { x: COL.con, y: ROW.notification },
    data: { label: "Notification", role: "consumer", color: "notification" },
  },
];

export const initialEdges: Edge[] = [
  mkEdge("e-api-order", "api", "ex-order", "order.placed", "order"),
  mkEdge("e-order-inv", "ex-order", "q-inv", "order.placed", "inventory"),
  mkEdge(
    "e-order-notif",
    "ex-order",
    "q-notif",
    "order.placed/cancelled",
    "notification",
  ),
  mkEdge("e-inv-pay", "ex-inv", "q-pay", "inventory.reserved", "payment"),
  mkEdge(
    "e-inv-order",
    "ex-inv",
    "q-order",
    "inventory.reservation-failed",
    "order",
  ),
  mkEdge("e-inv-notif", "ex-inv", "q-notif", "inventory.*", "notification"),
  mkEdge("e-pay-ship", "ex-pay", "q-ship", "payment.completed", "shipping"),
  mkEdge(
    "e-pay-order",
    "ex-pay",
    "q-order",
    "payment.completed/failed",
    "order",
  ),
  mkEdge("e-pay-notif", "ex-pay", "q-notif", "payment.*", "notification"),
  mkEdge(
    "e-ship-order",
    "ex-ship",
    "q-order",
    "shipping.shipped/delivered",
    "order",
  ),
  mkEdge("e-ship-notif", "ex-ship", "q-notif", "shipping.*", "notification"),
  mkEdge("e-q-inv-con", "q-inv", "con-inv", "consume", "inventory"),
  mkEdge("e-q-pay-con", "q-pay", "con-pay", "consume", "payment"),
  mkEdge("e-q-ship-con", "q-ship", "con-ship", "consume", "shipping"),
  mkEdge("e-q-order-con", "q-order", "con-order", "consume", "order"),
  mkEdge("e-q-notif-con", "q-notif", "con-notif", "consume", "notification"),
];
