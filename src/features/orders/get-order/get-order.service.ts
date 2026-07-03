import { axiosInstance } from "@/config/axios";

export const getOrderService = (orderId: string) =>
  axiosInstance.get(`/api/orders/${orderId}`);
