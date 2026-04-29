import apiClient from '@/lib/axios';

export const getMessages = async ({ chatId, pageParam }: { chatId: string; pageParam?: string }) => {
  const response = await apiClient.get('/messages', {
    params: { chatId, cursor: pageParam, limit: 50 },
  });
  return response.data;
};

export const sendMessage = async ({ chatId, content }: { chatId: string; content: string }) => {
  const response = await apiClient.post('/messages', { chatId, content });
  return response.data;
};

export const sendMessage = async ({ chatId, content }: { chatId: string; content: string }) => {
  const response = await apiClient.post('/messages', { chatId, content });
  return response.data.data;
};
