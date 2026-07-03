import { OrderStatus } from "@/common/order-status.enum";

export interface ListOrdersRequest {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}

export interface OrderResponse {
  id: string;
  customerId: string;
  totalPrice: number;
  status: OrderStatus;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListOrdersResponse {
  items: OrderResponse[];
  total: number;
}
