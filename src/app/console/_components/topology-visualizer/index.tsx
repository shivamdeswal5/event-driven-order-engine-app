"use client";

import {
  ReactFlow,
  Background,
  Controls,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Activity } from "lucide-react";
import { ActivityFeed } from "./_components/activity-feed";
import { AnimatedEdge } from "./_components/animated-edge";
import { ExchangeNode } from "./_components/exchange-node";
import { QueueNode } from "./_components/queue-node";
import { ServiceNode } from "./_components/service-node";
import { useTopologyAnimation } from "./use-topology-animation";

const nodeTypes: NodeTypes = {
  exchangeNode: ExchangeNode,
  queueNode: QueueNode,
  serviceNode: ServiceNode,
};

const edgeTypes: EdgeTypes = { animated: AnimatedEdge };

export function TopologyVisualizer() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    activeEventType,
    activityLog,
    gridColor,
  } = useTopologyAnimation();

  return (
    <div className="border border-border bg-card/45 backdrop-blur-md rounded-2xl shadow-xl flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 pb-4 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <Activity className="h-5 w-5 text-primary animate-pulse" />
          <div>
            <h2 className="text-base font-bold text-foreground font-mono">
              RabbitMQ Exchange/Queue Topology
            </h2>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
              Live event routing · Publisher → Exchange → Queue → Consumer
            </p>
          </div>
        </div>
        {activeEventType ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 animate-pulse shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
            <span className="text-[10px] font-extrabold font-mono text-primary uppercase tracking-wider">
              {activeEventType.replace(/([a-z])([A-Z])/g, "$1 $2")}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground shrink-0">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            <span>Idle — awaiting saga events</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="relative flex-1 min-w-0 h-[360px] sm:h-[440px] lg:h-[500px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.35}
            maxZoom={1.5}
            nodesConnectable={false}
            nodesDraggable
            className="font-mono"
            style={{ width: "100%", height: "100%" }}
          >
            <Background color={gridColor} gap={16} size={1} />
            <Controls />
          </ReactFlow>
        </div>

        <ActivityFeed activityLog={activityLog} />
      </div>
    </div>
  );
}
