import { describe, expect, it, vi } from 'vitest';
import { enablePushNotifications, isWithinQuietHours, shouldDeliverPushNotification } from './pushNotifications';

describe('pushNotifications', () => {
  it('returns unsupported when Notification API is unavailable', async () => {
    const result = await enablePushNotifications({
      notificationApi: undefined,
      registerSubscription: vi.fn()
    });

    expect(result).toEqual({ permission: 'unsupported' });
  });

  it('requests permission and registers subscription payload on grant', async () => {
    const registerSubscription = vi.fn().mockResolvedValue(undefined);
    const requestPermission = vi.fn().mockResolvedValue('granted');
    const subscribe = vi.fn().mockResolvedValue({ endpoint: 'https://example.com/sub' });

    const result = await enablePushNotifications({
      notificationApi: { requestPermission },
      subscribe,
      registerSubscription
    });

    expect(result).toEqual({ permission: 'granted' });
    expect(registerSubscription).toHaveBeenCalledWith({ endpoint: 'https://example.com/sub' });
  });

  it('registers service worker and creates new push subscription when none exists', async () => {
    const registerSubscription = vi.fn().mockResolvedValue(undefined);
    const requestPermission = vi.fn().mockResolvedValue('granted');
    const subscribe = vi.fn().mockResolvedValue({
      endpoint: 'https://example.com/new-sub',
      expirationTime: null,
      keys: { p256dh: 'k1', auth: 'k2' },
      toJSON: () => ({ endpoint: 'https://example.com/new-sub', expirationTime: null, keys: { p256dh: 'k1', auth: 'k2' } })
    });
    const getSubscription = vi.fn().mockResolvedValue(null);
    const registerWorker = vi.fn().mockResolvedValue({
      pushManager: {
        getSubscription,
        subscribe
      }
    });

    const result = await enablePushNotifications({
      notificationApi: { requestPermission },
      registerSubscription,
      serviceWorkerApi: {
        register: registerWorker
      },
      vapidPublicKey: 'BEl6N3v4rG_wYvVvP6oUYhU4w-Bq5U1lqzq4JY55QjkMGy8FQbQ8n2yTQkWwKk5hjhQY3pCtU5hM8x0Lr1VwxY0'
    });

    expect(result).toEqual({ permission: 'granted' });
    expect(registerWorker).toHaveBeenCalledWith('/service-worker.js', { scope: '/' });
    expect(getSubscription).toHaveBeenCalledTimes(1);
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(registerSubscription).toHaveBeenCalledWith({
      endpoint: 'https://example.com/new-sub',
      expirationTime: null,
      keys: { p256dh: 'k1', auth: 'k2' }
    });
  });

  it('does not register when permission is denied', async () => {
    const registerSubscription = vi.fn();
    const requestPermission = vi.fn().mockResolvedValue('denied');

    const result = await enablePushNotifications({
      notificationApi: { requestPermission },
      registerSubscription
    });

    expect(result).toEqual({ permission: 'denied' });
    expect(registerSubscription).not.toHaveBeenCalled();
  });

  it('suppresses quiet-hours range crossing midnight', () => {
    expect(isWithinQuietHours('22:00', '07:00', new Date('2026-01-01T23:10:00'))).toBe(true);
    expect(isWithinQuietHours('22:00', '07:00', new Date('2026-01-01T06:50:00'))).toBe(true);
    expect(isWithinQuietHours('22:00', '07:00', new Date('2026-01-01T12:00:00'))).toBe(false);
  });

  it('returns false for push delivery during enabled quiet hours', () => {
    expect(
      shouldDeliverPushNotification(
        { enabled: true, start: '22:00', end: '07:00' },
        new Date('2026-01-01T23:30:00')
      )
    ).toBe(false);
    expect(
      shouldDeliverPushNotification(
        { enabled: true, start: '22:00', end: '07:00' },
        new Date('2026-01-01T14:10:00')
      )
    ).toBe(true);
  });
});
