import { axiosInstance } from "@/config/axios";
import { PlaceOrderRequest } from "./place-order.interface";

export const placeOrderService = (payload: PlaceOrderRequest) =>
  axiosInstance.post("/api/orders", payload);
