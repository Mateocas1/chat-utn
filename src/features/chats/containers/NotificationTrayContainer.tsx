import { NotificationTray, type NotificationTrayItem, type NotificationTrayVariant } from '@/features/chats/components/NotificationTray';
import { useMarkNotificationRead, useNotifications } from '@/features/notifications/hooks/useNotifications';
import type { NotificationItem } from '@/features/notifications/api/notifications';

const toTrayItems = (notifications: NotificationItem[]): NotificationTrayItem[] => {
  return notifications
    .filter((notification) => !notification.read)
    .map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      variant: 'status' as NotificationTrayVariant
    }));
};

const toVisibleItems = (items: NotificationItem[] | undefined): NotificationTrayItem[] => {
  if (!items) {
    return [];
  }

  return toTrayItems(items);
};

export function NotificationTrayContainer() {
  const notificationsQuery = useNotifications();
  const markAsReadMutation = useMarkNotificationRead();
  const trayItems = toVisibleItems(notificationsQuery.data?.items);

  const handleDismiss = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  return (
    <NotificationTray
      isVisible={trayItems.length > 0}
      items={trayItems}
      onDismiss={handleDismiss}
    />
  );
}
