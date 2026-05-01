import { useState } from 'react';
import { NotificationSettingsPanel } from '@/features/chats/components/NotificationSettingsPanel';
import { useChatUIStore } from '@/features/chat/store/chatUIStore';
import { enablePushNotifications } from '@/features/notifications/push/pushNotifications';

export function NotificationSettingsContainer() {
  const selectedChatId = useChatUIStore((state) => state.selectedChatId);
  const pushPermission = useChatUIStore((state) => state.pushPermission);
  const pushOptInDialogOpen = useChatUIStore((state) => state.pushOptInDialogOpen);
  const quietHours = useChatUIStore((state) => state.quietHours);
  const threadPushEnabled = useChatUIStore((state) => state.threadPushEnabled);
  const setPushPermission = useChatUIStore((state) => state.setPushPermission);
  const setPushOptInDialogOpen = useChatUIStore((state) => state.setPushOptInDialogOpen);
  const setQuietHours = useChatUIStore((state) => state.setQuietHours);
  const setThreadPushEnabled = useChatUIStore((state) => state.setThreadPushEnabled);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedThreadEnabled = selectedChatId ? (threadPushEnabled[selectedChatId] ?? true) : true;

  const handleConfirmEnable = async () => {
    setIsSubmitting(true);

    try {
      const result = await enablePushNotifications();
      setPushPermission(result.permission);
      setPushOptInDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <NotificationSettingsPanel
      pushPermission={pushPermission}
      pushOptInDialogOpen={pushOptInDialogOpen}
      isSubmitting={isSubmitting}
      threadEnabled={selectedThreadEnabled}
      quietHours={quietHours}
      onEnableClick={() => setPushOptInDialogOpen(true)}
      onConfirmEnable={handleConfirmEnable}
      onCancelEnable={() => setPushOptInDialogOpen(false)}
      onThreadEnabledChange={(enabled) => {
        if (!selectedChatId) {
          return;
        }

        setThreadPushEnabled(selectedChatId, enabled);
      }}
      onQuietHoursEnabledChange={(enabled) =>
        setQuietHours({
          ...quietHours,
          enabled
        })
      }
      onQuietHoursStartChange={(start) =>
        setQuietHours({
          ...quietHours,
          start
        })
      }
      onQuietHoursEndChange={(end) =>
        setQuietHours({
          ...quietHours,
          end
        })
      }
    />
  );
}
