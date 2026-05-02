import apiClient from '@/lib/axios';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type ApiEnvelopeWithMeta<T, M> = {
  success: boolean;
  data: T;
  meta?: M;
};

export type MessageStatus = 'pending' | 'delivered' | 'failed';

export type MessageDto = {
  id: string;
  chatId: string;
  content: string;
  senderId: string;
  senderName?: string;
  createdAt: string;
  status?: MessageStatus;
  retryable?: boolean;
};

export type MessagesResponse = {
  data: MessageDto[];
  nextCursor?: string;
};

type MessageListMeta = {
  nextCursor?: string;
};

export type SendMessageResponse = {
  id?: string;
  createdAt?: string;
};

export const getMessages = async ({ chatId, pageParam }: { chatId: string; pageParam?: string }): Promise<MessagesResponse> => {
  const response = await apiClient.get<ApiEnvelopeWithMeta<MessageDto[], MessageListMeta>>('/messages', {
    params: { chatId, cursor: pageParam, limit: 50 },
  });
  return {
    data: response.data.data,
    nextCursor: response.data.meta?.nextCursor,
  };
};

export const sendMessage = async ({ chatId, content }: { chatId: string; content: string }): Promise<SendMessageResponse> => {
  const response = await apiClient.post<ApiEnvelope<SendMessageResponse>>('/messages', { chatId, content });
  return response.data.data;
};

export const sendTypingSignal = async (payload: { chatId: string; isTyping: boolean }): Promise<void> => {
  await apiClient.post('/messages/typing', payload);
};
