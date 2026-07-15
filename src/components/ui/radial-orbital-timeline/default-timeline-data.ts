import {
  ShoppingCart,
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
} from "lucide-react";
import type { TimelineItem } from "./types";

export const defaultTimelineData: TimelineItem[] = [
  {
    id: 1,
    title: "1. Order Placed",
    date: "Step 1",
    content:
      "Order Service receives order request, persists Order entity (status: PLACED) to order_schema, and stores OrderPlacedEvent in the outbox_messages table in the same transaction.",
    category: "Order Context",
    icon: ShoppingCart,
    relatedIds: [2],
    status: "completed",
    energy: 100,
  },
  {
    id: 2,
    title: "2. Inventory Reserved",
    date: "Step 2",
    content:
      "Inventory Service consumes order.placed, checks stock, decrements stock_quantity, increases reserved_quantity, saves Reservation (status: RESERVED) to inventory_schema, and dispatches InventoryReservedEvent.",
    category: "Inventory Context",
    icon: Package,
    relatedIds: [1, 3],
    status: "completed",
    energy: 95,
  },
  {
    id: 3,
    title: "3. Payment Completed",
    date: "Step 3",
    content:
      "Payment Service consumes inventory.reserved, simulates authorization (fails on amount ending in .99), creates Payment (status: COMPLETED) in payment_schema, and saves PaymentCompletedEvent in the transactional outbox.",
    category: "Payment Context",
    icon: CreditCard,
    relatedIds: [2, 4],
    status: "completed",
    energy: 98,
  },
  {
    id: 4,
    title: "4. Shipment Created",
    date: "Step 4",
    content:
      "Shipping Service consumes payment.completed, schedules delivery, creates Shipment (status: PENDING) in shipping_schema, and dispatches ShipmentCreatedEvent via the Outbox Relay.",
    category: "Shipping Context",
    icon: Truck,
    relatedIds: [3, 5],
    status: "in-progress",
    energy: 90,
  },
  {
    id: 5,
    title: "5. Eventual Consistency",
    date: "Step 5",
    content:
      "Order Service consumes ShipmentCreatedEvent and transitions order status to SHIPPED. When the shipment is delivered, ShipmentDeliveredEvent transitions the order status to DELIVERED, completing the decentralized saga.",
    category: "Success Context",
    icon: CheckCircle2,
    relatedIds: [4],
    status: "pending",
    energy: 99,
  },
];
