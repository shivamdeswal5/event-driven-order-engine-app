import { OrderStatus } from "./order-status.enum";

/** Tailwind classes for order-status badges / pills across the Console. */
export function getOrderStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse";
    case OrderStatus.PLACED:
      return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    case OrderStatus.PAID:
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case OrderStatus.SHIPPED:
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case OrderStatus.DELIVERED:
      return "bg-teal-500/10 text-teal-400 border-teal-500/20";
    case OrderStatus.CANCELLED:
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}
