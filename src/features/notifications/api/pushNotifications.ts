import apiClient from '@/lib/axios';

type RegisterPushSubscriptionPayload = {
  endpoint: string;
  expirationTime: number | null;
  keys?: Record<string, string>;
};

export const registerPushSubscription = async (payload: RegisterPushSubscriptionPayload) => {
  await apiClient.post('/notifications/push-subscriptions', payload);
};
