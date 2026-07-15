"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Bell, Cpu, Zap } from "lucide-react";
import { getServiceTone } from "@/common/service-tone.styles";
import { useTheme } from "@/theme/theme-provider";
import type { CustomServiceNode } from "../../types";

export function ServiceNode({ data }: NodeProps<CustomServiceNode>) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const c = getServiceTone(data.color);
  const Icon =
    data.color === "notification"
      ? Bell
      : data.role === "publisher"
        ? Cpu
        : Zap;
  return (
    <div
      className={`px-3 py-2 rounded-xl border-2 font-mono text-center relative min-w-[130px] transition-all ${c.border} ${isLight ? "bg-white shadow-md" : "bg-slate-900/80 backdrop-blur-md"}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !border-0"
        style={{ background: c.dot }}
      />
      <div className="flex items-center justify-center gap-1 mb-0.5">
        <Icon className={`h-3.5 w-3.5 ${c.text}`} />
        <span
          className={`text-[10px] font-extrabold uppercase tracking-wider ${c.text}`}
        >
          {data.label}
        </span>
      </div>
      <div className={`text-[8px] ${c.text} opacity-60`}>{data.role}</div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !border-0"
        style={{ background: c.dot }}
      />
    </div>
  );
}
