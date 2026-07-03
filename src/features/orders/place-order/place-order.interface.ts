export interface PlaceOrderItemRequest {
  productId: string;
  quantity: number;
  price: number;
}

export interface PlaceOrderRequest {
  customerId: string;
  items: PlaceOrderItemRequest[];
}

export interface PlaceOrderResponse {
  message: string;
  id: string; // The newly created order ID
}
