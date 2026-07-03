/**
 * Maps to the exact `eventType` values emitted by the backend NotificationGateway.
 * These are the processor class names used by the notification module.
 */
export enum SagaEventType {
  ORDER_PLACED = "OrderPlacedProcessor",
  INVENTORY_RESERVED = "InventoryReservedProcessor",
  INVENTORY_RESERVATION_FAILED = "InventoryReservationFailedProcessor",
  PAYMENT_COMPLETED = "PaymentCompletedProcessor",
  PAYMENT_FAILED = "PaymentFailedProcessor",
  SHIPMENT_CREATED = "ShipmentCreatedProcessor",
  SHIPMENT_DELIVERED = "ShipmentDeliveredProcessor",
  ORDER_CANCELLED = "OrderCancelledProcessor",
}
