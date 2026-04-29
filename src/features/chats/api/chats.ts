import apiClient from '@/lib/axios';

export const getChats = async ({ pageParam }: { pageParam?: string }) => {
  const response = await apiClient.get('/chats', {
    params: { cursor: pageParam, limit: 20 },
  });
  return response.data;
};

export const createChat = async (participantIds: string[]) => {
  const response = await apiClient.post('/chats', { participantIds });
  return response.data;
};

export const createChat = async (participantIds: string[]) => {
  const response = await apiClient.post('/chats', { participantIds });
  return response.data.data;
};
