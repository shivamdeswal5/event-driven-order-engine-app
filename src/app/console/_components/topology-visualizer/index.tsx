"use client";

import React, { useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAppSelector } from "@/store/hooks";
import { selectViewMode } from "@/features/ui/ui.slice";
import { selectEventLog } from "@/features/telemetry/telemetry.slice";

export function TopologyVisualizer() {
  const viewMode = useAppSelector(selectViewMode);
  const eventLogs = useAppSelector(selectEventLog);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Track the most recent event type to highlight nodes/edges
  const activeEvent = eventLogs[0]?.type || "";

  useEffect(() => {
    if (viewMode === "monolith") {
      // Monolith view nodes layout
      const monolithNodes: Node[] = [
        {
          id: "monolith-container",
          data: { label: "Modular Monolith Runtime" },
          position: { x: 50, y: 50 },
          style: {
            width: 780,
            height: 380,
            backgroundColor: "rgba(100, 100, 200, 0.03)",
            border: "1.5px dashed var(--border)",
            borderRadius: "16px",
            color: "var(--muted-foreground)",
            fontFamily: "monospace",
            fontSize: "10px",
            textAlign: "right",
            paddingRight: "15px",
            paddingTop: "10px",
            pointerEvents: "none",
          },
        },
        {
          id: "order",
          data: { label: "Order Context" },
          position: { x: 100, y: 150 },
          parentId: "monolith-container",
          extent: "parent",
          style: {
            backgroundColor: activeEvent.includes("placed") || activeEvent.includes("cancelled") ? "var(--primary)" : "var(--card)",
            color: activeEvent.includes("placed") || activeEvent.includes("cancelled") ? "var(--primary-foreground)" : "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "12px",
            fontWeight: "bold",
            textAlign: "center",
            width: 140,
            boxShadow: activeEvent.includes("placed") ? "0 0 15px var(--primary)" : "none",
          },
        },
        {
          id: "inventory",
          data: { label: "Inventory Context" },
          position: { x: 320, y: 100 },
          parentId: "monolith-container",
          extent: "parent",
          style: {
            backgroundColor: activeEvent.includes("inventory") ? "var(--primary)" : "var(--card)",
            color: activeEvent.includes("inventory") ? "var(--primary-foreground)" : "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "12px",
            fontWeight: "bold",
            textAlign: "center",
            width: 140,
            boxShadow: activeEvent.includes("inventory") ? "0 0 15px var(--primary)" : "none",
          },
        },
        {
          id: "payment",
          data: { label: "Payment Context" },
          position: { x: 320, y: 250 },
          parentId: "monolith-container",
          extent: "parent",
          style: {
            backgroundColor: activeEvent.includes("payment") ? "var(--primary)" : "var(--card)",
            color: activeEvent.includes("payment") ? "var(--primary-foreground)" : "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "12px",
            fontWeight: "bold",
            textAlign: "center",
            width: 140,
            boxShadow: activeEvent.includes("payment") ? "0 0 15px var(--primary)" : "none",
          },
        },
        {
          id: "shipping",
          data: { label: "Shipping Context" },
          position: { x: 550, y: 180 },
          parentId: "monolith-container",
          extent: "parent",
          style: {
            backgroundColor: activeEvent.includes("shipment") ? "var(--primary)" : "var(--card)",
            color: activeEvent.includes("shipment") ? "var(--primary-foreground)" : "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "12px",
            fontWeight: "bold",
            textAlign: "center",
            width: 140,
            boxShadow: activeEvent.includes("shipment") ? "0 0 15px var(--primary)" : "none",
          },
        },
      ];

      const monolithEdges: Edge[] = [
        {
          id: "e-order-inventory",
          source: "order",
          target: "inventory",
          label: "In-Memory Event Bus",
          animated: activeEvent.includes("placed"),
          style: { stroke: activeEvent.includes("placed") ? "var(--primary)" : "var(--border)", strokeWidth: 1.5 },
          labelStyle: { fill: "var(--muted-foreground)", fontSize: 8, fontFamily: "monospace" },
          markerEnd: { type: MarkerType.ArrowClosed, color: activeEvent.includes("placed") ? "var(--primary)" : "var(--border)" },
        },
        {
          id: "e-inventory-payment",
          source: "inventory",
          target: "payment",
          label: "In-Memory Event Bus",
          animated: activeEvent.includes("reserved"),
          style: { stroke: activeEvent.includes("reserved") ? "var(--primary)" : "var(--border)", strokeWidth: 1.5 },
          labelStyle: { fill: "var(--muted-foreground)", fontSize: 8, fontFamily: "monospace" },
          markerEnd: { type: MarkerType.ArrowClosed, color: activeEvent.includes("reserved") ? "var(--primary)" : "var(--border)" },
        },
        {
          id: "e-payment-shipping",
          source: "payment",
          target: "shipping",
          label: "In-Memory Event Bus",
          animated: activeEvent.includes("payment-completed"),
          style: { stroke: activeEvent.includes("payment-completed") ? "var(--primary)" : "var(--border)", strokeWidth: 1.5 },
          labelStyle: { fill: "var(--muted-foreground)", fontSize: 8, fontFamily: "monospace" },
          markerEnd: { type: MarkerType.ArrowClosed, color: activeEvent.includes("payment-completed") ? "var(--primary)" : "var(--border)" },
        },
      ];

      setNodes(monolithNodes);
      setEdges(monolithEdges);
    } else {
      // Microservices view nodes layout
      const microNodes: Node[] = [
        {
          id: "rabbitmq",
          data: { label: "RabbitMQ Message Broker" },
          position: { x: 380, y: 180 },
          style: {
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            border: "1.5px solid #f59e0b",
            borderRadius: "50px",
            padding: "16px",
            fontSize: "11px",
            fontWeight: "extrabold",
            color: "#f59e0b",
            textAlign: "center",
            width: 160,
            boxShadow: activeEvent !== "" ? "0 0 20px rgba(245, 158, 11, 0.3)" : "none",
          },
        },
        {
          id: "order",
          data: { label: "Order Service" },
          position: { x: 100, y: 70 },
          style: {
            backgroundColor: activeEvent.includes("placed") || activeEvent.includes("cancelled") ? "var(--primary)" : "var(--card)",
            color: activeEvent.includes("placed") || activeEvent.includes("cancelled") ? "var(--primary-foreground)" : "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "12px",
            fontWeight: "bold",
            textAlign: "center",
            width: 140,
          },
        },
        {
          id: "inventory",
          data: { label: "Inventory Service" },
          position: { x: 640, y: 70 },
          style: {
            backgroundColor: activeEvent.includes("inventory") ? "var(--primary)" : "var(--card)",
            color: activeEvent.includes("inventory") ? "var(--primary-foreground)" : "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "12px",
            fontWeight: "bold",
            textAlign: "center",
            width: 140,
          },
        },
        {
          id: "payment",
          data: { label: "Payment Service" },
          position: { x: 640, y: 310 },
          style: {
            backgroundColor: activeEvent.includes("payment") ? "var(--primary)" : "var(--card)",
            color: activeEvent.includes("payment") ? "var(--primary-foreground)" : "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "12px",
            fontWeight: "bold",
            textAlign: "center",
            width: 140,
          },
        },
        {
          id: "shipping",
          data: { label: "Shipping Service" },
          position: { x: 100, y: 310 },
          style: {
            backgroundColor: activeEvent.includes("shipment") ? "var(--primary)" : "var(--card)",
            color: activeEvent.includes("shipment") ? "var(--primary-foreground)" : "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "12px",
            fontWeight: "bold",
            textAlign: "center",
            width: 140,
          },
        },
      ];

      const microEdges: Edge[] = [
        {
          id: "e-order-rmq",
          source: "order",
          target: "rabbitmq",
          label: "order.placed",
          animated: activeEvent.includes("placed"),
          style: { stroke: activeEvent.includes("placed") ? "var(--primary)" : "var(--border)", strokeWidth: 1.5 },
          labelStyle: { fill: "var(--muted-foreground)", fontSize: 8, fontFamily: "monospace" },
          markerEnd: { type: MarkerType.ArrowClosed, color: activeEvent.includes("placed") ? "var(--primary)" : "var(--border)" },
        },
        {
          id: "e-rmq-inventory",
          source: "rabbitmq",
          target: "inventory",
          label: "Consume order.placed",
          animated: activeEvent.includes("placed"),
          style: { stroke: activeEvent.includes("placed") ? "var(--primary)" : "var(--border)", strokeWidth: 1.5 },
          labelStyle: { fill: "var(--muted-foreground)", fontSize: 8, fontFamily: "monospace" },
          markerEnd: { type: MarkerType.ArrowClosed, color: activeEvent.includes("placed") ? "var(--primary)" : "var(--border)" },
        },
        {
          id: "e-inventory-rmq",
          source: "inventory",
          target: "rabbitmq",
          label: "inventory.reserved",
          animated: activeEvent.includes("reserved"),
          style: { stroke: activeEvent.includes("reserved") ? "var(--primary)" : "var(--border)", strokeWidth: 1.5 },
          labelStyle: { fill: "var(--muted-foreground)", fontSize: 8, fontFamily: "monospace" },
          markerEnd: { type: MarkerType.ArrowClosed, color: activeEvent.includes("reserved") ? "var(--primary)" : "var(--border)" },
        },
        {
          id: "e-rmq-payment",
          source: "rabbitmq",
          target: "payment",
          label: "Consume inventory.reserved",
          animated: activeEvent.includes("reserved"),
          style: { stroke: activeEvent.includes("reserved") ? "var(--primary)" : "var(--border)", strokeWidth: 1.5 },
          labelStyle: { fill: "var(--muted-foreground)", fontSize: 8, fontFamily: "monospace" },
          markerEnd: { type: MarkerType.ArrowClosed, color: activeEvent.includes("reserved") ? "var(--primary)" : "var(--border)" },
        },
      ];

      setNodes(microNodes);
      setEdges(microEdges);
    }
  }, [viewMode, activeEvent]);

  return (
    <div className="w-full h-[450px] border border-border rounded-xl bg-card/20 relative overflow-hidden shadow-inner select-none">
      <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded bg-background/80 backdrop-blur-xs border border-border text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
        Event Flow Visualizer
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        panOnDrag={false}
        className="text-foreground"
      >
        <Background color="var(--border)" gap={16} size={1} />
        <Controls showInteractive={false} className="bg-background border border-border" />
      </ReactFlow>
    </div>
  );
}
