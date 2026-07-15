"use client";

import React, { memo, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import { CAPTIONS, GRAPHS } from "./graphs";
import { LearnEdge } from "./_components/learn-edge";
import { LearnNode } from "./_components/learn-node";
import type { ChapterVisualProps } from "./types";

const nodeTypes = { learnNode: LearnNode };
const edgeTypes = { learnEdge: LearnEdge };

function ChapterVisualInner({ chapterId, className }: ChapterVisualProps) {
  const graph = GRAPHS[chapterId] ?? GRAPHS.orientation;
  const caption = CAPTIONS[chapterId] ?? "";

  const { nodes, edges } = useMemo(() => graph, [graph]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 via-card/50 to-primary/5 overflow-hidden shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/50 bg-muted/20">
        <p className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-primary">
          Visual map
        </p>
        <p className="text-[10px] font-mono text-muted-foreground text-right leading-snug max-w-[70%]">
          {caption}
        </p>
      </div>
      <div className="h-[240px] sm:h-[260px] w-full [&_.react-flow__attribution]:hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1}
            color="#cbd5e1"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export const ChapterVisual = memo(ChapterVisualInner);
