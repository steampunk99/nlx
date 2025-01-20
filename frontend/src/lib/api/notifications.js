import { api } from '@/lib/axios';

export async function fetchNotifications({ page = 1, limit = 10 }) {
  const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
  return response.data;
}

export async function markAsRead(notificationId) {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
}

export async function markAllAsRead() {
  const response = await api.put('/notifications/mark-all-read');
  return response.data;
}

export async function getUnreadCount() {
  const response = await api.get('/notifications/unread-count');
  return response.data;
}
