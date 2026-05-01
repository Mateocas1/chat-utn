import apiClient from '@/lib/axios';

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterPayload = {
  email: string;
  displayName: string;
  password: string;
};

type AuthResponse = {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      displayName: string;
    };
  };
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post('/users/login', credentials);
  return response.data;
};

export const register = async (userData: RegisterPayload): Promise<AuthResponse> => {
  const response = await apiClient.post('/users/register', userData);
  return response.data;
};
