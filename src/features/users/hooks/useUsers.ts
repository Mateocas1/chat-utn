import { useQuery } from '@tanstack/react-query';
import { getUsers, type UsersResponse } from '../api/users';

export const USERS_QUERY_KEY = ['users'] as const;

export const useUsers = () => {
  return useQuery<UsersResponse>({
    queryKey: USERS_QUERY_KEY,
    queryFn: getUsers
  });
};
