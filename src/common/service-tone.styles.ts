export type ServiceTone = {
  border: string;
  bg: string;
  text: string;
  dot: string;
};

export type ServiceKey =
  | "order"
  | "inventory"
  | "payment"
  | "shipping"
  | "notification";

/** @deprecated Prefer `ServiceKey` — kept for chapter-visual / shared imports. */
export type ServiceToneKey = ServiceKey;

/** Tailwind + hex tones per saga service (topology, activity feed, legends). */
export const SERVICE_TONES: Record<ServiceKey, ServiceTone> = {
  order: {
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    dot: "#06b6d4",
  },
  inventory: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "#f59e0b",
  },
  payment: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "#10b981",
  },
  shipping: {
    border: "border-purple-500/40",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    dot: "#a855f7",
  },
  notification: {
    border: "border-rose-500/40",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    dot: "#f43f5e",
  },
};

/** Alias matching the previous topology `COLORS` export. */
export const COLORS = SERVICE_TONES;

export function getServiceTone(key: string): ServiceTone {
  return SERVICE_TONES[key as ServiceKey] ?? SERVICE_TONES.order;
}
