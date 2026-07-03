"use client";

import React, { useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAppSelector } from "@/store/hooks";
import { selectEventLog } from "@/features/telemetry/telemetry.slice";
import { GitFork, Layers, HelpCircle, Activity } from "lucide-react";

// ==========================================
// Custom CustomNode Types
// ==========================================

type ExchangeNodeData = {
  label: string;
  type: string;
};

type QueueNodeData = {
  label: string;
  app: string;
};

type CustomExchangeNode = Node<ExchangeNodeData, "exchangeNode">;
type CustomQueueNode = Node<QueueNodeData, "queueNode">;

// Custom Exchange Node
function ExchangeNode({ data }: NodeProps<CustomExchangeNode>) {
  return (
    <div className="px-4 py-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md shadow-lg shadow-cyan-950/20 min-w-[150px] font-mono text-center relative">
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-cyan-500" />
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <GitFork className="h-3.5 w-3.5 text-cyan-400" />
        <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">{data.label}</span>
      </div>
      <div className="text-[9px] font-semibold text-cyan-400/80 bg-cyan-950/50 px-1.5 py-0.5 rounded-full inline-block uppercase">
        {data.type} Exchange
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-cyan-500" />
    </div>
  );
}

// Custom Queue Node
function QueueNode({ data }: NodeProps<CustomQueueNode>) {
  return (
    <div className="px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-md shadow-lg shadow-emerald-950/20 min-w-[150px] font-mono text-center relative">
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-emerald-500" />
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <Layers className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">{data.label}</span>
      </div>
      <div className="text-[9px] font-semibold text-emerald-400/80 bg-emerald-950/50 px-1.5 py-0.5 rounded-full inline-block uppercase">
        Queue ({data.app})
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-emerald-500" />
    </div>
  );
}

const nodeTypes = {
  exchangeNode: ExchangeNode,
  queueNode: QueueNode,
};

// ==========================================
// Base Layout & Node Definitions
// ==========================================

const initialNodes: Node[] = [
  // EXCHANGES (Left Column)
  {
    id: "ex-order",
    type: "exchangeNode",
    position: { x: 50, y: 50 },
    data: { label: "order-exchange", type: "topic" },
  },
  {
    id: "ex-inventory",
    type: "exchangeNode",
    position: { x: 50, y: 170 },
    data: { label: "inventory-exchange", type: "topic" },
  },
  {
    id: "ex-payment",
    type: "exchangeNode",
    position: { x: 50, y: 290 },
    data: { label: "payment-exchange", type: "topic" },
  },
  {
    id: "ex-shipping",
    type: "exchangeNode",
    position: { x: 50, y: 410 },
    data: { label: "shipping-exchange", type: "topic" },
  },

  // QUEUES (Right Column)
  {
    id: "q-order",
    type: "queueNode",
    position: { x: 420, y: 50 },
    data: { label: "order-queue", app: "Order Service" },
  },
  {
    id: "q-inventory",
    type: "queueNode",
    position: { x: 420, y: 140 },
    data: { label: "inventory-queue", app: "Inventory Service" },
  },
  {
    id: "q-payment",
    type: "queueNode",
    position: { x: 420, y: 230 },
    data: { label: "payment-queue", app: "Payment Service" },
  },
  {
    id: "q-shipping",
    type: "queueNode",
    position: { x: 420, y: 320 },
    data: { label: "shipping-queue", app: "Shipping Service" },
  },
  {
    id: "q-notification",
    type: "queueNode",
    position: { x: 420, y: 410 },
    data: { label: "notification-queue", app: "Notification Service" },
  },
];

const initialEdges: Edge[] = [
  // Bindings from Exchanges to Queues
  // Order Exchange bindings
  {
    id: "b-order-to-inventory",
    source: "ex-order",
    target: "q-inventory",
    label: "order.placed",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-order-to-notification-placed",
    source: "ex-order",
    target: "q-notification",
    label: "order.placed",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-order-to-notification-cancelled",
    source: "ex-order",
    target: "q-notification",
    label: "order.cancelled",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-order-to-payment-cancelled",
    source: "ex-order",
    target: "q-payment",
    label: "order.cancelled",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-order-to-shipping-cancelled",
    source: "ex-order",
    target: "q-shipping",
    label: "order.cancelled",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },

  // Inventory Exchange bindings
  {
    id: "b-inventory-to-payment",
    source: "ex-inventory",
    target: "q-payment",
    label: "inventory.reserved",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-inventory-to-order-failed",
    source: "ex-inventory",
    target: "q-order",
    label: "inventory.reservation-failed",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-inventory-to-notification-reserved",
    source: "ex-inventory",
    target: "q-notification",
    label: "inventory.reserved",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-inventory-to-notification-failed",
    source: "ex-inventory",
    target: "q-notification",
    label: "inventory.reservation-failed",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },

  // Payment Exchange bindings
  {
    id: "b-payment-to-shipping",
    source: "ex-payment",
    target: "q-shipping",
    label: "payment.completed",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-payment-to-order-completed",
    source: "ex-payment",
    target: "q-order",
    label: "payment.completed",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-payment-to-order-failed",
    source: "ex-payment",
    target: "q-order",
    label: "payment.failed",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-payment-to-notification-completed",
    source: "ex-payment",
    target: "q-notification",
    label: "payment.completed",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-payment-to-notification-failed",
    source: "ex-payment",
    target: "q-notification",
    label: "payment.failed",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },

  // Shipping Exchange bindings
  {
    id: "b-shipping-to-order-created",
    source: "ex-shipping",
    target: "q-order",
    label: "shipping.created",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-shipping-to-order-delivered",
    source: "ex-shipping",
    target: "q-order",
    label: "shipping.delivered",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-shipping-to-notification-created",
    source: "ex-shipping",
    target: "q-notification",
    label: "shipping.created",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-shipping-to-notification-delivered",
    source: "ex-shipping",
    target: "q-notification",
    label: "shipping.delivered",
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: "#030712", fillOpacity: 0.8 },
    labelStyle: { fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
];

export function TopologyVisualizer() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const eventLog = useAppSelector(selectEventLog);
  const [activeEdgeIds, setActiveEdgeIds] = useState<string[]>([]);

  // Trigger pulse effect on websocket event
  useEffect(() => {
    if (eventLog.length === 0) return;

    const latestEvent = eventLog[0];
    const eventType = latestEvent.eventType.toLowerCase();

    // Map domain events to corresponding edge IDs
    let matchedEdges: string[] = [];

    if (eventType.includes("orderplaced")) {
      matchedEdges = ["b-order-to-inventory", "b-order-to-notification-placed"];
    } else if (eventType.includes("inventoryreserved")) {
      matchedEdges = ["b-inventory-to-payment", "b-inventory-to-notification-reserved"];
    } else if (eventType.includes("inventoryreservationfailed")) {
      matchedEdges = ["b-inventory-to-order-failed", "b-inventory-to-notification-failed"];
    } else if (eventType.includes("paymentcompleted")) {
      matchedEdges = [
        "b-payment-to-shipping",
        "b-payment-to-order-completed",
        "b-payment-to-notification-completed",
      ];
    } else if (eventType.includes("paymentfailed")) {
      matchedEdges = ["b-payment-to-order-failed", "b-payment-to-notification-failed"];
    } else if (eventType.includes("shipmentcreated")) {
      matchedEdges = ["b-shipping-to-order-created", "b-shipping-to-notification-created"];
    } else if (eventType.includes("shipmentdelivered")) {
      matchedEdges = ["b-shipping-to-order-delivered", "b-shipping-to-notification-delivered"];
    } else if (eventType.includes("ordercancelled")) {
      matchedEdges = [
        "b-order-to-notification-cancelled",
        "b-order-to-payment-cancelled",
        "b-order-to-shipping-cancelled",
      ];
    }

    if (matchedEdges.length > 0) {
      setActiveEdgeIds(matchedEdges);
      const timer = setTimeout(() => {
        setActiveEdgeIds([]);
      }, 3500); // Pulse style lasts 3.5 seconds
      return () => clearTimeout(timer);
    }
  }, [eventLog]);

  // Dynamically update edge styles to reflect pulse
  useEffect(() => {
    setEdges((prevEdges) =>
      prevEdges.map((edge) => {
        const isActive = activeEdgeIds.includes(edge.id);
        return {
          ...edge,
          animated: isActive,
          style: {
            ...edge.style,
            stroke: isActive ? "#06b6d4" : "#374151",
            strokeWidth: isActive ? 3 : 1.5,
          },
          labelStyle: {
            ...edge.labelStyle,
            fill: isActive ? "#06b6d4" : "#9ca3af",
            fontWeight: isActive ? "bold" : "normal",
          },
        };
      })
    );
  }, [activeEdgeIds, setEdges]);

  return (
    <div className="border border-border bg-card/45 backdrop-blur-md rounded-2xl p-6 shadow-xl flex flex-col h-[520px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary animate-pulse" />
          <h2 className="text-lg font-bold text-foreground font-mono">
            RabbitMQ Exchange/Queue Topology
          </h2>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Pulsing edge = Live event routing</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full border border-border/50 rounded-xl overflow-hidden bg-background/40 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.5}
          maxZoom={1.5}
          nodesConnectable={false}
          nodesDraggable={true}
          className="font-mono text-xs"
        >
          <Background color="#1f2937" gap={12} size={1} />
          <Controls className="!bg-background/80 !border-border !rounded-lg overflow-hidden" />
        </ReactFlow>
      </div>
    </div>
  );
}
