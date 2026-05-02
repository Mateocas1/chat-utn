import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/lib/axios';
import { registerPushSubscription } from './pushNotifications';

vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn()
  }
}));

describe('pushNotifications api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not call push-subscriptions endpoint when feature flag is disabled', async () => {
    vi.stubEnv('VITE_PUSH_ENABLED', 'false');

    await registerPushSubscription({
      endpoint: 'https://example.com/subscription',
      expirationTime: null,
      keys: { p256dh: 'k1', auth: 'k2' }
    });

    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('calls push-subscriptions endpoint when feature flag is enabled', async () => {
    vi.stubEnv('VITE_PUSH_ENABLED', 'true');
    vi.mocked(apiClient.post).mockResolvedValue({ data: {} });

    await registerPushSubscription({
      endpoint: 'https://example.com/subscription',
      expirationTime: null,
      keys: { p256dh: 'k1', auth: 'k2' }
    });

    expect(apiClient.post).toHaveBeenCalledWith('/notifications/push-subscriptions', {
      endpoint: 'https://example.com/subscription',
      expirationTime: null,
      keys: { p256dh: 'k1', auth: 'k2' }
    });
  });
});
