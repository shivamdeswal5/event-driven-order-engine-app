"use client";

import { useEffect, useRef, useState } from "react";
import { NODES, SIMULATION_SEQUENCE } from "./constants";
import type { TelemetryLog } from "./types";

export function useArchitectureSimulation() {
  const [selectedLayer, setSelectedLayer] = useState<number>(2); // Default to Order Service
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<number>(-1);

  // State to force redraw of connections on mount/resize
  const [resizeKey, setResizeKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Force updating path positions when window size changes
  useEffect(() => {
    const handleResize = () => setResizeKey((prev) => prev + 1);
    window.addEventListener("resize", handleResize);
    // Timeout to make sure DOM is fully painted
    const timer = setTimeout(() => handleResize(), 200);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Autoscroll terminal logs container internally
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTo({
        top: terminalRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [logs]);

  const startSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setLogs([]);
    setActiveNode("client");
    setCurrentStage(0);

    SIMULATION_SEQUENCE.forEach((step) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, step.log]);
        setCurrentStage(step.stage);
        if (step.node) {
          setActiveNode(step.node);
          const index = NODES.findIndex((n) => n.id === step.node);
          if (index !== -1) setSelectedLayer(index);
        } else {
          setActiveNode(null);
        }
      }, step.time);
    });

    setTimeout(() => {
      setIsSimulating(false);
      setCurrentStage(-1);
    }, 17000);
  };

  return {
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
  };
}
