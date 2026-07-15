"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NODES } from "./constants";
import { useArchitectureSimulation } from "./use-architecture-simulation";
import { StageTracker } from "./_components/stage-tracker";
import { ArchitectureNode } from "./_components/architecture-node";
import { ConnectionOverlay } from "./_components/connection-overlay";
import { TelemetryTerminal } from "./_components/telemetry-terminal";
import { NodeDetailPanel } from "./_components/node-detail-panel";

export function ArchitectureShowcase() {
  const {
    selectedLayer,
    setSelectedLayer,
    isSimulating,
    logs,
    activeNode,
    currentStage,
    resizeKey,
    containerRef,
    terminalRef,
    startSimulation,
  } = useArchitectureSimulation();

  const selectedNodeId = NODES[selectedLayer]?.id;

  const selectNode = (nodeId: string) => {
    const nodeIdx = NODES.findIndex((item) => item.id === nodeId);
    setSelectedLayer(nodeIdx);
  };

  return (
    <motion.section
      id="architecture"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-24 border-t border-border/40 relative bg-background/30 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge
            variant="outline"
            className="mb-4 text-xs tracking-wider uppercase font-semibold border-primary/20 bg-primary/5 text-primary"
          >
            Architecture Map
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Interactive System Architecture
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Click on any microservice block to inspect its technology stack, or trigger the event
            loop simulator to watch transaction telemetry propagate in real-time.
          </p>
        </div>

        {/* Dashboard Actions */}
        <div className="flex justify-center mb-10">
          <Button
            onClick={startSimulation}
            disabled={isSimulating}
            className="rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-5 gap-2 border border-primary/30 shadow-lg shadow-primary/10 transition-transform active:scale-95"
          >
            <Play className={`h-4.5 w-4.5 ${isSimulating ? "animate-pulse" : ""}`} />
            {isSimulating ? "Simulating Event Loop..." : "Simulate Order Event Loop"}
          </Button>
        </div>

        <StageTracker currentStage={currentStage} logsLength={logs.length} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Interactive Diagram Sandbox */}
          <div className="lg:col-span-8 flex flex-col justify-between border border-border/40 rounded-3xl p-6 bg-card/10 dark:bg-black/10 backdrop-blur-sm relative overflow-hidden">
            {/* Grid overlay for tech blueprint aesthetic */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none z-0">
              <div className="w-full h-full bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]" />
            </div>

            <ConnectionOverlay
              containerRef={containerRef}
              resizeKey={resizeKey}
              isSimulating={isSimulating}
              activeNode={activeNode}
            />

            {/* Diagram Nodes Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 items-center justify-between z-10 w-full py-8">
              {/* Col 1: Ingress (Client & Gateway) */}
              <div className="flex flex-col gap-8 md:gap-14">
                {NODES.slice(0, 2).map((n) => (
                  <ArchitectureNode
                    key={n.id}
                    node={n}
                    variant="ingress"
                    isActive={activeNode === n.id}
                    isSelected={selectedNodeId === n.id}
                    onSelect={() => selectNode(n.id)}
                  />
                ))}
              </div>

              {/* Col 2: Order Service (Saga Choreography) */}
              <div className="flex flex-col justify-center">
                {NODES.slice(2, 3).map((n) => (
                  <ArchitectureNode
                    key={n.id}
                    node={n}
                    variant="core"
                    isActive={activeNode === n.id}
                    isSelected={selectedNodeId === n.id}
                    onSelect={() => selectNode(n.id)}
                  />
                ))}
              </div>

              {/* Col 3: Event Transport (Message Broker) */}
              <div className="flex flex-col justify-center">
                {NODES.slice(3, 4).map((n) => (
                  <ArchitectureNode
                    key={n.id}
                    node={n}
                    variant="core"
                    isActive={activeNode === n.id}
                    isSelected={selectedNodeId === n.id}
                    onSelect={() => selectNode(n.id)}
                  />
                ))}
              </div>

              {/* Col 4: Worker Domain Services */}
              <div className="flex flex-col gap-5">
                {NODES.slice(4, 7).map((n) => (
                  <ArchitectureNode
                    key={n.id}
                    node={n}
                    variant="worker"
                    isActive={activeNode === n.id}
                    isSelected={selectedNodeId === n.id}
                    onSelect={() => selectNode(n.id)}
                  />
                ))}
              </div>
            </div>

            <TelemetryTerminal
              logs={logs}
              isSimulating={isSimulating}
              terminalRef={terminalRef}
            />
          </div>

          <NodeDetailPanel selectedLayer={selectedLayer} />
        </div>
      </div>
    </motion.section>
  );
}
