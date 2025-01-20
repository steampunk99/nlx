import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markAsRead, markAllAsRead } from '@/lib/api/notifications';

export function useNotifications() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const queryClient = useQueryClient();

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications', { page, limit }],
    queryFn: () => fetchNotifications({ page, limit }),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 30000,
  });

  const unreadCount = notificationsData?.data?.data?.filter(n => !n.isRead).length || 0;

  const handleMarkAsRead = useCallback(async (notificationId) => {
    await markAsRead(notificationId);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SYSTEM_ALERT':
        return '⚠️';
      case 'COMMISSION_EARNED':
        return '💰';
      case 'NEW_USER':
        return '👤';
      case 'NEW_REFERRAL':
        return '🤝';
      case 'PACKAGE_PURCHASE':
        return '📦';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'SYSTEM_ALERT':
        return 'bg-red-100 text-red-800';
      case 'COMMISSION_EARNED':
        return 'bg-green-100 text-green-800';
      case 'NEW_USER':
      case 'NEW_REFERRAL':
        return 'bg-blue-100 text-blue-800';
      case 'PACKAGE_PURCHASE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return {
    notifications: notificationsData?.data?.data || [],
    pagination: notificationsData?.data?.pagination,
    isLoading,
    error,
    unreadCount,
    page,
    setPage,
    refetch,
    handleMarkAsRead,
    handleMarkAllAsRead,
    getNotificationIcon,
    getNotificationColor
  };
}
