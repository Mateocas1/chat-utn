import apiClient from '@/lib/axios';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export type ChatPreviewResponseItem = {
  id: string;
  title?: string;
  unreadCount?: number;
  updatedAt?: string;
  lastMessage?: {
    content?: string;
  } | null;
};

export type ChatsResponse = ChatPreviewResponseItem[];

type ChatCreationResponse = {
  id: string;
};

export const getChats = async ({ pageParam }: { pageParam?: string }): Promise<ChatsResponse> => {
  const response = await apiClient.get<ApiEnvelope<ChatsResponse>>('/chats', {
    params: { cursor: pageParam, limit: 20 },
  });
  return response.data.data;
};

export const createChat = async (recipientId: string) => {
  const response = await apiClient.post<ApiEnvelope<ChatCreationResponse>>('/chats', { recipientId });
  return response.data.data;
};
