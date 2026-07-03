import { axiosInstance } from "@/config/axios";
import { ListOrdersRequest } from "./list-orders.interface";

export const listOrdersService = (params?: ListOrdersRequest) =>
  axiosInstance.get("/api/orders", { params });
