import { axiosInstance } from "@/config/axios";

export const deliverOrderService = (orderId: string) =>
  axiosInstance.post(`/api/shipments/${orderId}/deliver`);
