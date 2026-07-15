import type { LucideIcon } from "lucide-react";
import { GitFork, Layers, Server, Zap } from "lucide-react";

export type DispatchStep = {
  icon: LucideIcon;
  iconClassName: string;
  label: string;
  detail: string;
};

export const DISPATCH_STEPS: DispatchStep[] = [
  {
    icon: Server,
    iconClassName: "h-3 w-3 text-cyan-400",
    label: "POST /api/orders",
    detail: "Persisting order metadata to DB...",
  },
  {
    icon: GitFork,
    iconClassName: "h-3 w-3 text-amber-400",
    label: "Publishing → order-exchange",
    detail: "Routing via topic exchange (RabbitMQ)",
  },
  {
    icon: Layers,
    iconClassName: "h-3 w-3 text-emerald-400",
    label: "→ inventory-queue",
    detail: "Awaiting inventory reservation saga step",
  },
  {
    icon: Zap,
    iconClassName: "h-3 w-3 text-purple-400",
    label: "Choreography initiated",
    detail: "Distributed saga now in flight...",
  },
];
