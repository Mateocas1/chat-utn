import { NotificationTray, type NotificationTrayItem, type NotificationTrayVariant } from '@/features/chats/components/NotificationTray';
import { useChatUIStore, type ChatToast } from '@/features/chat/store/chatUIStore';

const mapToastVariantToTrayVariant = (variant: ChatToast['variant']): NotificationTrayVariant => {
  if (variant === 'info') {
    return 'status';
  }

  return variant;
};

const toTrayItems = (toasts: ChatToast[]): NotificationTrayItem[] => {
  return toasts.map((toast) => ({
    id: toast.id,
    title: toast.message,
    variant: mapToastVariantToTrayVariant(toast.variant)
  }));
};

export function NotificationTrayContainer() {
  const toastQueue = useChatUIStore((state) => state.toastQueue);
  const removeToast = useChatUIStore((state) => state.removeToast);

  return (
    <NotificationTray
      isVisible={toastQueue.length > 0}
      items={toTrayItems(toastQueue)}
      onDismiss={removeToast}
    />
  );
}
