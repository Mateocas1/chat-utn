import apiClient from '@/lib/axios';

export interface UserItem {
  id: string;
  displayName: string;
}

export interface UsersResponse {
  items: UserItem[];
}

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export const getUsers = async (): Promise<UsersResponse> => {
  const response = await apiClient.get<ApiEnvelope<UserItem[]>>('/users');
  return {
    items: response.data.data
  };
};
