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
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAppSelector } from "@/store/hooks";
import { selectEventLog } from "@/features/telemetry/telemetry.slice";
import { GitFork, Layers, HelpCircle, Activity } from "lucide-react";
import { useTheme } from "@/theme/theme-provider";

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
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className={`px-4 py-3 rounded-xl border font-mono text-center relative transition-colors ${
      isLight 
        ? "border-cyan-200 bg-cyan-50/95 shadow-md shadow-cyan-100/40 text-cyan-800" 
        : "border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md shadow-lg shadow-cyan-950/20 text-cyan-300"
    } min-w-[155px]`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-cyan-500" />
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <GitFork className={`h-3.5 w-3.5 ${isLight ? "text-cyan-600" : "text-cyan-400"}`} />
        <span className="text-xs font-bold uppercase tracking-wider">{data.label}</span>
      </div>
      <div className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full inline-block uppercase ${
        isLight ? "text-cyan-700 bg-cyan-100/80" : "text-cyan-400/80 bg-cyan-950/50"
      }`}>
        {data.type} Exchange
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-cyan-500" />
    </div>
  );
}

// Custom Queue Node
function QueueNode({ data }: NodeProps<CustomQueueNode>) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className={`px-4 py-3 rounded-xl border font-mono text-center relative transition-colors ${
      isLight 
        ? "border-emerald-200 bg-emerald-50/95 shadow-md shadow-emerald-100/40 text-emerald-800" 
        : "border-emerald-500/30 bg-emerald-950/20 backdrop-blur-md shadow-lg shadow-emerald-950/20 text-emerald-300"
    } min-w-[155px]`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-emerald-500" />
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <Layers className={`h-3.5 w-3.5 ${isLight ? "text-emerald-600" : "text-emerald-400"}`} />
        <span className="text-xs font-bold uppercase tracking-wider">{data.label}</span>
      </div>
      <div className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full inline-block uppercase ${
        isLight ? "text-emerald-700 bg-emerald-100/80" : "text-emerald-400/80 bg-emerald-950/50"
      }`}>
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
// Custom HTML Edge Component to prevent crossing lines from distorting text
// ==========================================

function CustomTopologyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  label,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const isActive = data?.isActive as boolean | undefined;
  const activeEventType = data?.activeEventType as string | undefined;

  const isPartActive = (part: string) => {
    if (!isActive || !activeEventType) return false;
    const normalizedPart = part.replace(/[\s\._-]/g, "").toLowerCase();
    const normalizedActive = activeEventType.replace(/[\s\._-]/g, "").toLowerCase();
    return normalizedActive.includes(normalizedPart);
  };

  const renderLabelContent = () => {
    if (typeof label !== "string") return label;
    if (!label.includes("/")) {
      const isFail = label.includes("fail") || label.includes("cancel");
      return (
        <span className={isActive ? (isFail ? "text-rose-400 font-extrabold animate-pulse" : "text-cyan-400 font-extrabold animate-pulse") : ""}>
          {label}
        </span>
      );
    }

    const parts = label.split(" / ");
    return (
      <span className="flex items-center gap-1">
        {parts.map((part, index) => {
          const partActive = isPartActive(part);
          const isFail = part.includes("fail") || part.includes("cancel");
          return (
            <React.Fragment key={part}>
              {index > 0 && <span className="text-muted-foreground/30 font-normal">/</span>}
              <span className={partActive
                ? (isFail ? "text-rose-400 font-extrabold animate-pulse" : "text-cyan-400 font-extrabold animate-pulse")
                : "opacity-75"
              }>
                {part}
              </span>
            </React.Fragment>
          );
        })}
      </span>
    );
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan select-none z-50"
          >
            <div className={`px-2.5 py-1 rounded-md border text-[9px] font-mono transition-all duration-300 shadow-md ${
              isActive
                ? "bg-cyan-500/10 border-cyan-400/80 shadow-cyan-950/20"
                : "bg-card border-border/80 text-muted-foreground"
            }`}>
              {renderLabelContent()}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const edgeTypes = {
  customTopologyEdge: CustomTopologyEdge,
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
    type: "customTopologyEdge",
    data: { isActive: false },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-order-to-payment",
    source: "ex-order",
    target: "q-payment",
    label: "order.cancelled",
    type: "customTopologyEdge",
    data: { isActive: false },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-order-to-shipping",
    source: "ex-order",
    target: "q-shipping",
    label: "order.cancelled",
    type: "customTopologyEdge",
    data: { isActive: false },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-order-to-notification",
    source: "ex-order",
    target: "q-notification",
    label: "order.placed / order.cancelled",
    type: "customTopologyEdge",
    data: { isActive: false },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },

  // Inventory Exchange bindings
  {
    id: "b-inventory-to-payment",
    source: "ex-inventory",
    target: "q-payment",
    label: "inventory.reserved",
    type: "customTopologyEdge",
    data: { isActive: false },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-inventory-to-order",
    source: "ex-inventory",
    target: "q-order",
    label: "inventory.reservation-failed",
    type: "customTopologyEdge",
    data: { isActive: false },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-inventory-to-notification",
    source: "ex-inventory",
    target: "q-notification",
    label: "inventory.reserved / inventory.reservation-failed",
    type: "customTopologyEdge",
    data: { isActive: false },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },

  // Payment Exchange bindings
  {
    id: "b-payment-to-shipping",
    source: "ex-payment",
    target: "q-shipping",
    label: "payment.completed",
    type: "customTopologyEdge",
    data: { isActive: false },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-payment-to-order",
    source: "ex-payment",
    target: "q-order",
    label: "payment.completed / payment.failed",
    type: "customTopologyEdge",
    data: { isActive: false },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-payment-to-notification",
    source: "ex-payment",
    target: "q-notification",
    label: "payment.completed / payment.failed",
    type: "customTopologyEdge",
    data: { isActive: false },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },

  // Shipping Exchange bindings
  {
    id: "b-shipping-to-order",
    source: "ex-shipping",
    target: "q-order",
    label: "shipping.created / shipping.delivered",
    type: "customTopologyEdge",
    data: { isActive: false },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
  {
    id: "b-shipping-to-notification",
    source: "ex-shipping",
    target: "q-notification",
    label: "shipping.created / shipping.delivered",
    type: "customTopologyEdge",
    data: { isActive: false },
    style: { stroke: "#374151", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#374151" },
  },
];

export function TopologyVisualizer() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const eventLog = useAppSelector(selectEventLog);
  const [activeEdgeIds, setActiveEdgeIds] = useState<string[]>([]);
  const [activeEventType, setActiveEventType] = useState<string>("");

  // Trigger pulse effect on websocket event
  useEffect(() => {
    if (eventLog.length === 0) return;

    const latestEvent = eventLog[0];
    const eventType = latestEvent.eventType.toLowerCase();

    // Map domain events to corresponding edge IDs
    let matchedEdges: string[] = [];

    if (eventType.includes("orderplaced")) {
      matchedEdges = ["b-order-to-inventory", "b-order-to-notification"];
    } else if (eventType.includes("inventoryreserved")) {
      matchedEdges = ["b-inventory-to-payment", "b-inventory-to-notification"];
    } else if (eventType.includes("inventoryreservationfailed")) {
      matchedEdges = ["b-inventory-to-order", "b-inventory-to-notification"];
    } else if (eventType.includes("paymentcompleted")) {
      matchedEdges = [
        "b-payment-to-shipping",
        "b-payment-to-order",
        "b-payment-to-notification",
      ];
    } else if (eventType.includes("paymentfailed")) {
      matchedEdges = ["b-payment-to-order", "b-payment-to-notification"];
    } else if (eventType.includes("shipmentcreated")) {
      matchedEdges = ["b-shipping-to-order", "b-shipping-to-notification"];
    } else if (eventType.includes("shipmentdelivered")) {
      matchedEdges = ["b-shipping-to-order", "b-shipping-to-notification"];
    } else if (eventType.includes("ordercancelled")) {
      matchedEdges = [
        "b-order-to-notification",
        "b-order-to-payment",
        "b-order-to-shipping",
      ];
    }

    if (matchedEdges.length > 0) {
      setActiveEdgeIds(matchedEdges);
      setActiveEventType(eventType);
      const timer = setTimeout(() => {
        setActiveEdgeIds([]);
        setActiveEventType("");
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
          data: {
            ...edge.data,
            isActive,
            activeEventType: isActive ? activeEventType : undefined,
          },
          style: {
            ...edge.style,
            stroke: isActive ? "#06b6d4" : (isLight ? "#cbd5e1" : "#374151"),
            strokeWidth: isActive ? 3 : 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isActive 
              ? "#06b6d4" 
              : (isLight ? "#cbd5e1" : "#374151"),
          },
        };
      })
    );
  }, [activeEdgeIds, activeEventType, setEdges, isLight]);

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
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.5}
          maxZoom={1.5}
          nodesConnectable={false}
          nodesDraggable={true}
          className="font-mono text-xs"
        >
          <Background color={isLight ? "#cbd5e1" : "#1f2937"} gap={12} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
