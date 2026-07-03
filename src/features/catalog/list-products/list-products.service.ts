import { axiosInstance } from "@/config/axios";

export const listProductsService = () =>
  axiosInstance.get("/api/products");
