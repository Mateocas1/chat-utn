import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead, type NotificationsResponse } from '../api/notifications';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

export const useNotifications = () => {
  return useQuery<NotificationsResponse>({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: getNotifications
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

      const previous = queryClient.getQueryData<NotificationsResponse>(NOTIFICATIONS_QUERY_KEY);

      queryClient.setQueryData<NotificationsResponse>(NOTIFICATIONS_QUERY_KEY, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          items: current.items.map((notification) => {
            if (notification.id !== notificationId) {
              return notification;
            }

            return {
              ...notification,
              read: true
            };
          })
        };
      });

      return { previous };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    }
  });
};
