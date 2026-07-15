"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import { EDGE_STROKE } from "../../tones.styles";

export function LearnEdge({
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
    targetX,
    targetY,
    targetPosition,
  });
  const animated = Boolean(data?.animated ?? true);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: EDGE_STROKE,
          strokeWidth: 1.5,
          opacity: 0.75,
          ...style,
        }}
        className={animated ? "react-flow__edge-path animated" : undefined}
      />
      {label ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-none absolute z-10"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            <span className="inline-block rounded-md border border-border/70 bg-background/95 px-2 py-0.5 text-[9px] font-mono font-semibold text-muted-foreground shadow-sm backdrop-blur-sm dark:bg-card/95">
              {String(label)}
            </span>
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
