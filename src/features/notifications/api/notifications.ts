import apiClient from '@/lib/axios';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationsResponse {
  items: NotificationItem[];
}

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export const getNotifications = async (): Promise<NotificationsResponse> => {
  const response = await apiClient.get<ApiEnvelope<NotificationItem[]>>('/notifications');
  return {
    items: response.data.data
  };
};

export const markNotificationRead = async (id: string): Promise<NotificationItem> => {
  const response = await apiClient.patch<ApiEnvelope<NotificationItem>>(`/notifications/${id}/read`);
  return response.data.data;
};
