"use client";

import React, { useEffect, useState } from "react";
import {
  MarkerType,
  useEdgesState,
  useNodesState,
  type Edge,
} from "@xyflow/react";
import { useAppSelector } from "@/store/hooks";
import { selectEventLog } from "@/features/telemetry/telemetry.slice";
import { COLORS, getServiceTone } from "@/common/service-tone.styles";
import { useTheme } from "@/theme/theme-provider";
import { EVENT_EDGES } from "./constants";
import { initialEdges, initialNodes } from "./graph";
import type { ActivityEntry, AnimQueueItem } from "./types";

export function useTopologyAnimation() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const eventLog = useAppSelector(selectEventLog);

  const [activeEdgeIds, setActiveEdgeIds] = useState<string[]>([]);
  const [activeEventType, setActiveEventType] = useState("");
  const [animQueue, setAnimQueue] = useState<AnimQueueItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const seenRef = React.useRef<Set<string>>(new Set());
  const animTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!eventLog.length) return;
    const newEvs: AnimQueueItem[] = [];
    for (let i = eventLog.length - 1; i >= 0; i--) {
      const ev = eventLog[i];
      const key = `${ev.orderId}-${ev.eventType}-${ev.occurredAt}`;
      if (!seenRef.current.has(key)) {
        seenRef.current.add(key);
        newEvs.push({ eventType: ev.eventType, orderId: ev.orderId });
      }
    }
    if (newEvs.length) setAnimQueue((prev) => [...prev, ...newEvs]);
  }, [eventLog]);

  useEffect(() => {
    if (isAnimating || !animQueue.length) return;
    const [next, ...rest] = animQueue;
    setAnimQueue(rest);
    setIsAnimating(true);

    const key = next.eventType.toLowerCase().replace(/event$/, "");
    const matched = EVENT_EDGES[key] ?? [];
    setActiveEdgeIds(matched);
    setActiveEventType(key);

    setActivityLog((prev) =>
      [
        { eventType: next.eventType, orderId: next.orderId, ts: Date.now() },
        ...prev,
      ].slice(0, 8),
    );

    animTimerRef.current = setTimeout(() => {
      setActiveEdgeIds([]);
      setActiveEventType("");
      setIsAnimating(false);
    }, 1800);
  }, [animQueue, isAnimating]);

  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setEdges((prev: Edge[]) =>
      prev.map((edge) => {
        const active = activeEdgeIds.includes(edge.id);
        const col = (edge.data?.color as string) ?? "order";
        const hex = getServiceTone(col).dot;
        return {
          ...edge,
          animated: active,
          data: { ...edge.data, isActive: active },
          style: {
            stroke: active ? hex : isLight ? "#94a3b8" : "#374151",
            strokeWidth: active ? 2.5 : 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: active ? hex : isLight ? "#94a3b8" : "#374151",
          },
        };
      }),
    );
  }, [activeEdgeIds, isLight, setEdges]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    activeEventType,
    activityLog,
    isLight,
    bgColor: isLight ? "#f8fafc" : "#020617",
    gridColor: isLight ? "#e2e8f0" : "#1e293b",
    serviceTones: COLORS,
  };
}
