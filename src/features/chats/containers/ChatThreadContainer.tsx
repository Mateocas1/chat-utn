import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { ChatThreadHeader } from '@/features/chats/components/ChatThreadHeader';
import { getChats } from '@/features/chats/api/chats';
import type { ChatsResponse } from '@/features/chats/api/chats';
import { useChatUIStore, type SocketStatus } from '@/features/chat/store/chatUIStore';
import { NotificationSettingsContainer } from './NotificationSettingsContainer';

type ChatThreadResponseItem = {
  id: string;
  title?: string;
  participantCount?: number;
};

const SOCKET_STATUS_LABELS: Record<SocketStatus, string> = {
  disconnected: 'Reconnecting…',
  connecting: 'Conectando…',
  connected: '',
  error: 'Error de conexión'
};

const buildParticipantLabel = (participantCount?: number): string | undefined => {
  if (!participantCount || participantCount < 1) {
    return undefined;
  }

  if (participantCount === 1) {
    return '1 participante';
  }

  return `${participantCount} participantes`;
};

export function ChatThreadContainer() {
  const selectedChatId = useChatUIStore((state) => state.selectedChatId);
  const socketStatus = useChatUIStore((state) => state.socketStatus);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsTriggerRef = useRef<HTMLButtonElement | null>(null);

  const { data } = useQuery<ChatsResponse>({
    queryKey: ['chats'],
    queryFn: () => getChats({})
  });

  if (!selectedChatId) {
    return (
      <section className="flex h-full items-center justify-center px-4 py-6 text-sm text-muted">
        Seleccioná un chat para empezar
      </section>
    );
  }

  const selectedChat = data?.find((chat: ChatThreadResponseItem) => chat.id === selectedChatId);
  const actions = (
    <>
      <button
        type="button"
        ref={settingsTriggerRef}
        onClick={() => setSettingsOpen(true)}
        aria-label="Ajustes de notificaciones"
        className="rounded-[--radius-sm] border border-border bg-surface px-3 py-1 text-xs text-text transition-colors hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      >
        Ajustes de notificaciones
      </button>
      <Dialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        title="Ajustes de notificaciones"
        triggerRef={settingsTriggerRef}
      >
        <NotificationSettingsContainer />
      </Dialog>
    </>
  );

  return (
    <ChatThreadHeader
      title={selectedChat?.title ?? 'Chat'}
      subtitle={buildParticipantLabel(selectedChat?.participantCount)}
      status={SOCKET_STATUS_LABELS[socketStatus] || undefined}
      actions={actions}
    />
  );
}
