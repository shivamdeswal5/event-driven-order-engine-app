"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Layers } from "lucide-react";
import { getServiceTone } from "@/common/service-tone.styles";
import { useTheme } from "@/theme/theme-provider";
import type { CustomQueueNode } from "../../types";

export function QueueNode({ data }: NodeProps<CustomQueueNode>) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const c = getServiceTone(data.color);
  return (
    <div
      className={`px-3 py-2 rounded-xl border font-mono text-center relative min-w-[148px] transition-all ${c.border} ${isLight ? "bg-white shadow-md" : `${c.bg} backdrop-blur-md`}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !border-0"
        style={{ background: c.dot }}
      />
      <div className="flex items-center justify-center gap-1 mb-0.5">
        <Layers className={`h-3 w-3 ${c.text}`} />
        <span
          className={`text-[10px] font-extrabold uppercase tracking-wider ${c.text}`}
        >
          {data.label}
        </span>
      </div>
      <div className={`text-[8px] font-semibold ${c.text} opacity-70`}>
        durable · {data.consumer}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !border-0"
        style={{ background: c.dot }}
      />
    </div>
  );
}
