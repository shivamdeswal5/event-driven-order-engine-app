import { axiosInstance } from "@/config/axios";

export const getHealthService = () =>
  axiosInstance.get("/health");
