import apiClient from '@/lib/axios';

export const login = async (credentials: any) => {
  const response = await apiClient.post('/users/login', credentials);
  return response.data;
};

export const register = async (userData: any) => {
  const response = await apiClient.post('/users/register', userData);
  return response.data;
};
