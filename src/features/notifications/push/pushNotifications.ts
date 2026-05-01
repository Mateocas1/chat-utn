import { registerPushSubscription } from '@/features/notifications/api/pushNotifications';
import type { QuietHours } from '@/features/chat/store/chatUIStore';

type PushPermissionResult = {
  permission: NotificationPermission | 'unsupported';
};

type PushSubscriptionPayload = {
  endpoint: string;
  expirationTime: number | null;
  keys?: Record<string, string>;
};

type EnablePushNotificationsOptions = {
  notificationApi?: Pick<typeof Notification, 'requestPermission'>;
  subscribe?: () => Promise<PushSubscriptionPayload | null>;
  registerSubscription?: (payload: PushSubscriptionPayload) => Promise<void>;
  serviceWorkerApi?: Pick<ServiceWorkerContainer, 'register'>;
  vapidPublicKey?: string;
};

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map((segment) => Number(segment));
  return (hours * 60) + minutes;
};

export const isWithinQuietHours = (start: string, end: string, now: Date = new Date()) => {
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  const currentMinutes = (now.getHours() * 60) + now.getMinutes();

  if (startMinutes === endMinutes) {
    return false;
  }

  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
};

export const shouldDeliverPushNotification = (quietHours: QuietHours, now: Date = new Date()) => {
  if (!quietHours.enabled) {
    return true;
  }

  return !isWithinQuietHours(quietHours.start, quietHours.end, now);
};

const base64ToArrayBuffer = (base64String: string): ArrayBuffer => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const bytes = Uint8Array.from(rawData, (char) => char.charCodeAt(0));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
};

const normalizeSubscription = (subscription: PushSubscription | PushSubscriptionPayload): PushSubscriptionPayload => {
  if ('toJSON' in subscription) {
    const json = subscription.toJSON();
    return {
      endpoint: json.endpoint ?? subscription.endpoint,
      expirationTime: json.expirationTime ?? subscription.expirationTime ?? null,
      keys: json.keys
    };
  }

  return subscription;
};

const subscribeFromServiceWorker = async (
  serviceWorkerApi?: Pick<ServiceWorkerContainer, 'register'>,
  vapidPublicKey?: string
) => {
  const swApi = serviceWorkerApi ?? (typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? navigator.serviceWorker : undefined);

  if (!swApi) {
    return null;
  }

  const registration = await swApi.register('/service-worker.js', { scope: '/' });
  if (!registration.pushManager) {
    return null;
  }

  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    return normalizeSubscription(existingSubscription);
  }

  if (!vapidPublicKey) {
    return null;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64ToArrayBuffer(vapidPublicKey)
  });

  return normalizeSubscription(subscription);
};

export const enablePushNotifications = async (
  options: EnablePushNotificationsOptions = {}
): Promise<PushPermissionResult> => {
  const notificationApi = options.notificationApi ?? (typeof Notification !== 'undefined' ? Notification : undefined);

  if (!notificationApi) {
    return { permission: 'unsupported' };
  }

  const permission = await notificationApi.requestPermission();
  if (permission !== 'granted') {
    return { permission };
  }

  const subscribe = options.subscribe ?? (() => subscribeFromServiceWorker(options.serviceWorkerApi, options.vapidPublicKey ?? import.meta.env.VITE_VAPID_PUBLIC_KEY));
  const registerSubscription = options.registerSubscription ?? registerPushSubscription;
  const subscription = await subscribe();

  if (!subscription?.endpoint) {
    return { permission };
  }

  await registerSubscription(subscription);
  return { permission };
};
