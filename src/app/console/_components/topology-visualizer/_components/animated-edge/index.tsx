"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export function AnimatedEdge({
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

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan z-50"
          >
            <div
              className={`px-2 py-0.5 rounded border text-[8px] font-mono font-semibold transition-all duration-300 shadow ${isActive ? "bg-cyan-500/20 border-cyan-400/80 text-cyan-300 animate-pulse" : "bg-card border-border/60 text-muted-foreground"}`}
            >
              {label as string}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
