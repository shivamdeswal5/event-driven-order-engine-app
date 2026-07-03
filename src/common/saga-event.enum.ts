export enum SagaEventType {
  ORDER_PLACED = "order.saga.placed",
  INVENTORY_RESERVED = "order.saga.inventory-reserved",
  INVENTORY_RESERVATION_FAILED = "order.saga.inventory-reservation-failed",
  PAYMENT_COMPLETED = "order.saga.payment-completed",
  PAYMENT_FAILED = "order.saga.payment-failed",
  SHIPMENT_CREATED = "order.saga.shipment-created",
  SHIPMENT_DELIVERED = "order.saga.shipment-delivered",
  ORDER_CANCELLED = "order.saga.cancelled",
}
