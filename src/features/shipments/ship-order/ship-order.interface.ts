export interface ShipOrderRequest {
  orderId: string;
  carrier: string;
  trackingNumber: string;
}

export interface ShipOrderResponse {
  message: string;
}
