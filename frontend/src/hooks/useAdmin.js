import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/axios'
import { useState } from 'react';
import toast from 'react-hot-toast';

// Query key factory for better organization and type safety
const queryKeys = {
  users: {
    all: ['admin', 'users'],
    list: (filters) => [...queryKeys.users.all, 'list', filters],
    detail: (id) => [...queryKeys.users.all, 'detail', id]
  },
  stats: ['admin', 'stats'],
  network: ['admin', 'network'],
  withdrawals: ['admin', 'withdrawals'],
  adminConfig: ['adminConfig']
}

export function useAdmin() {
  const queryClient = useQueryClient()

  // Error Handler
  const handleError = (error, fallbackMessage = 'An error occurred') => {
    console.error('Admin operation failed:', error)
    return {
      message: error.response?.data?.message || fallbackMessage,
      status: error.response?.status
    }
  }

  // User Management
  const useUsers = () => {
    return useQuery({
      queryKey: queryKeys.users.all,
      queryFn: async () => {
        const { data } = await api.get('/admin/users')
        return data.data
      },
      onError: (error) => handleError(error, 'Failed to fetch users')
    })
  }

  const useUserDetails = (userId) => {
    return useQuery({
      queryKey: queryKeys.users.detail(userId),
      queryFn: async () => {
        if (!userId) return null;
        const { data } = await api.get(`/admin/users/${userId}`)
        return data.data
      },
      enabled: !!userId,
      onError: (error) => handleError(error, 'Failed to fetch user details')
    })
  }

  const useUpdateUserStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async ({ userId, newStatus }) => {
        const { data } = await api.put(`/admin/users/${userId}/status`, {
          status: newStatus
        })
        return data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
      },
      onError: (error) => handleError(error, 'Failed to update user status')
    })
  }

  const useDeleteUser = () => {
    return useMutation({
      mutationFn: async (userId) => {
        if (!userId) throw new Error('User ID is required');
        const { data } = await api.delete(`/admin/users/${userId}`)
        return data
      },
      onSuccess: (_, userId) => {
        queryClient.invalidateQueries(queryKeys.users.all)
        queryClient.invalidateQueries(queryKeys.stats)
      },
      onError: (error) => handleError(error, 'Failed to delete user')
    })
  }

  // Statistics Management
  const useSystemStats = () => {
    return useQuery({
      queryKey: queryKeys.stats,
      queryFn: async () => {
        const { data } = await api.get('/admin/stats')
        return data.data
      },
      onError: (error) => handleError(error, 'Failed to fetch system statistics')
    })
  }

  // Network Management
  const useNetworkStats = () => {
    return useQuery({
      queryKey: queryKeys.network,
      queryFn: async () => {
        const { data } = await api.get('/admin/network/stats')
        return data.data
      },
      onError: (error) => handleError(error, 'Failed to fetch network statistics')
    })
  }

  const useNetworkTree = (nodeId) => {
    return useQuery({
      queryKey: [...queryKeys.network, nodeId],
      queryFn: async () => {
        if (!nodeId) return null;
        const { data } = await api.get(`/admin/network/tree/${nodeId}`)
        return data.data
      },
      enabled: !!nodeId,
      onError: (error) => handleError(error, 'Failed to fetch network tree')
    })
  }

  // Admin config queries
  const useAdminConfig = () => {
    return useQuery({
      queryKey: queryKeys.adminConfig,
      queryFn: async () => {
        const response = await api.get('/admin/config');
        return response.data.data;
      }
    });
  };

  const useUpdateAdminConfig = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.put('/admin/config', data);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.adminConfig);
        toast.success('Settings updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update settings');
      }
    });
  };

  return {
    useUsers,
    useUserDetails,
    useUpdateUserStatus,
    useDeleteUser,
    useSystemStats,
    useNetworkStats,
    useNetworkTree,
    useAdminConfig,
    useUpdateAdminConfig
  }
}