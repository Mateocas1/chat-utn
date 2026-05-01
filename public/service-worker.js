self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  /**
   * @typedef {{ enabled: boolean; start: string; end: string }} QuietHoursPayload
   * @typedef {{
   *   title?: string;
   *   body?: string;
   *   icon?: string;
   *   badge?: string;
   *   tag?: string;
   *   data?: unknown;
   *   quietHours?: QuietHoursPayload;
   *   now?: string;
   * }} PushNotificationPayload
   */

  const toMinutes = (value) => {
    const [hours, minutes] = String(value ?? '00:00').split(':').map((segment) => Number(segment));
    return (hours * 60) + minutes;
  };

  const isTimeString = (value) => {
    if (typeof value !== 'string') {
      return false;
    }

    return /^\d{2}:\d{2}$/.test(value);
  };

  const normalizeQuietHours = (quietHours) => {
    if (!quietHours || typeof quietHours !== 'object') {
      return null;
    }

    if (quietHours.enabled !== true) {
      return null;
    }

    if (!isTimeString(quietHours.start) || !isTimeString(quietHours.end)) {
      return null;
    }

    return {
      enabled: true,
      start: quietHours.start,
      end: quietHours.end
    };
  };

  const isWithinQuietHours = (start, end, now) => {
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

  const shouldDisplay = (quietHours, now) => {
    if (!quietHours) {
      return true;
    }

    return !isWithinQuietHours(quietHours.start, quietHours.end, now);
  };

  const parsePayload = () => {
    if (!event.data) {
      return {};
    }

    try {
      const jsonPayload = event.data.json();
      if (jsonPayload && typeof jsonPayload === 'object') {
        return jsonPayload;
      }
    } catch {
    }

    const textPayload = event.data.text();
    return {
      body: textPayload
    };
  };

  /** @type {PushNotificationPayload} */
  const payload = parsePayload();
  const quietHours = normalizeQuietHours(payload.quietHours);
  const displayTime = quietHours && typeof payload.now === 'string' ? new Date(payload.now) : new Date();
  const effectiveTime = Number.isNaN(displayTime.getTime()) ? new Date() : displayTime;

  if (!shouldDisplay(quietHours, effectiveTime)) {
    return;
  }

  const title = typeof payload.title === 'string' && payload.title.length > 0
    ? payload.title
    : 'New message';

  const options = {
    body: typeof payload.body === 'string' ? payload.body : '',
    icon: typeof payload.icon === 'string' ? payload.icon : undefined,
    badge: typeof payload.badge === 'string' ? payload.badge : undefined,
    tag: typeof payload.tag === 'string' ? payload.tag : 'chat-notification',
    data: payload.data
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
