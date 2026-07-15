export const COL = { api: 0, ex: 220, q: 470, con: 720 } as const;

export const ROW = {
  order: 10,
  inventory: 120,
  payment: 230,
  shipping: 340,
  notification: 450,
} as const;

export const EVENT_EDGES: Record<string, string[]> = {
  orderplaced: ["e-api-order", "e-order-inv", "e-order-notif", "e-q-inv-con"],
  ordercancelled: ["e-order-notif", "e-q-order-con", "e-q-notif-con"],
  inventoryreserved: ["e-inv-pay", "e-inv-notif", "e-q-pay-con", "e-q-notif-con"],
  inventoryreservationfailed: [
    "e-inv-order",
    "e-inv-notif",
    "e-q-order-con",
    "e-q-notif-con",
  ],
  paymentcompleted: [
    "e-pay-ship",
    "e-pay-order",
    "e-pay-notif",
    "e-q-ship-con",
    "e-q-order-con",
    "e-q-notif-con",
  ],
  paymentfailed: ["e-pay-order", "e-pay-notif", "e-q-order-con", "e-q-notif-con"],
  shipmentcreated: ["e-ship-notif", "e-q-notif-con"],
  shipmentshipped: [
    "e-ship-order",
    "e-ship-notif",
    "e-q-order-con",
    "e-q-notif-con",
  ],
  shipmentdelivered: [
    "e-ship-order",
    "e-ship-notif",
    "e-q-order-con",
    "e-q-notif-con",
  ],
};

const FLOW_DESC: Record<string, string> = {
  orderplaced:
    "Order Module → order-exchange → inventory-queue → Inventory Consumer reserves stock",
  ordercancelled:
    "Order Module → order-exchange → notification-queue + order-queue for compensation",
  inventoryreserved:
    "Inventory Module → inventory-exchange → payment-queue → Payment Consumer charges card",
  inventoryreservationfailed:
    "Inventory Module → inventory-exchange → order-queue → Order Consumer cancels order",
  paymentcompleted:
    "Payment Module → payment-exchange → shipping-queue → Shipping Consumer creates shipment",
  paymentfailed:
    "Payment Module → payment-exchange → order-queue → Order Consumer cancels order (compensation)",
  shipmentcreated:
    "Shipping Module → shipping-exchange → notification-queue · order stays PAID, awaiting operator dispatch",
  shipmentshipped:
    "Shipping Module → shipping-exchange → order-queue → Order Consumer marks SHIPPED",
  shipmentdelivered:
    "Shipping Module → shipping-exchange → order-queue → Order Consumer marks DELIVERED ✓",
};

export function getFlowDesc(ev: string): string {
  return FLOW_DESC[ev] ?? "Event routing via RabbitMQ topic exchange";
}
