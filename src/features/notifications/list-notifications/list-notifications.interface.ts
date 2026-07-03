export interface ListNotificationsRequest {
  orderId?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationResponse {
  id: string;
  orderId: string;
  eventType: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListNotificationsResponse {
  items: NotificationResponse[];
  total: number;
  limit: number;
  offset: number;
  page: number;
  totalPages: number;
}
