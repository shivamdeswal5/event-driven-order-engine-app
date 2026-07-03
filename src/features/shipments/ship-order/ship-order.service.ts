import { axiosInstance } from "@/config/axios";
import { ShipOrderRequest } from "./ship-order.interface";

export const shipOrderService = (payload: ShipOrderRequest) => {
  const { orderId, ...body } = payload;
  return axiosInstance.post(`/api/shipments/${orderId}/ship`, body);
};
