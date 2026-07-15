"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { TONE } from "../../tones.styles";
import type { LearnNodeData } from "../../types";

export function LearnNode({ data }: NodeProps<Node<LearnNodeData>>) {
  const tone = TONE[data.tone ?? "slate"];
  return (
    <div
      className={cn(
        "px-3 py-2.5 rounded-xl border-2 font-mono text-center relative min-w-[108px] max-w-[140px] shadow-sm backdrop-blur-sm bg-card/80",
        tone.border,
        tone.bg,
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !border-0 !bg-transparent"
        style={{ background: tone.dot }}
      />
      <div className={cn("text-[10px] font-extrabold uppercase tracking-wide", tone.text)}>
        {data.label}
      </div>
      {data.sublabel && (
        <div className="text-[8px] text-muted-foreground mt-1 leading-tight">
          {data.sublabel}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !border-0 !bg-transparent"
        style={{ background: tone.dot }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-2 !h-2 !border-0 !bg-transparent"
        style={{ background: tone.dot }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-2 !h-2 !border-0 !bg-transparent"
        style={{ background: tone.dot }}
      />
    </div>
  );
}
