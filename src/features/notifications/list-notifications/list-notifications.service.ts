import { axiosInstance } from "@/config/axios";
import { ListNotificationsRequest } from "./list-notifications.interface";

export const listNotificationsService = (params?: ListNotificationsRequest) =>
  axiosInstance.get("/api/notifications", { params });
