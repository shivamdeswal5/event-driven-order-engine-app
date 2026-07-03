import { axiosInstance } from "@/config/axios";
import { CancelOrderRequest } from "./cancel-order.interface";

export const cancelOrderService = (orderId: string, payload: CancelOrderRequest) =>
  axiosInstance.post(`/api/orders/${orderId}/cancel`, payload);
