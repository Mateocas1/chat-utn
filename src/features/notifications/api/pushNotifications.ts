import apiClient from '@/lib/axios';

type RegisterPushSubscriptionPayload = {
  endpoint: string;
  expirationTime: number | null;
  keys?: Record<string, string>;
};

export const registerPushSubscription = async (payload: RegisterPushSubscriptionPayload) => {
  if (import.meta.env.VITE_PUSH_ENABLED !== 'true') {
    return;
  }

  await apiClient.post('/notifications/push-subscriptions', payload);
};
