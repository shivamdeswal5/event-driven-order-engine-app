import type React from "react";

export interface NodeComponent {
  name: string;
  icon: React.ReactNode;
}

export interface NodeData {
  id: string;
  title: string;
  subtitle: string;
  shortDesc: string;
  longDesc: string;
  color: string;
  textColor: string;
  glowColor: string;
  techs: string[];
  components: NodeComponent[];
  icon: React.ReactNode;
}

export interface Stage {
  label: string;
  key: string[];
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  color: string;
  delay: string;
  dur: string;
}

export interface TelemetryLog {
  icon: string;
  timestamp: string;
  tag: string;
  message: string;
  colorClass: string;
  tagClass: string;
}

export interface SimulationStep {
  time: number;
  node: string;
  stage: number;
  log: TelemetryLog;
}

export type SocketSide = "left" | "right" | "top" | "bottom";

export type ArchitectureNodeVariant = "ingress" | "core" | "worker";
