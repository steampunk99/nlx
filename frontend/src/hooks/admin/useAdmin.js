import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCallback } from 'react';

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
  adminConfig: ['adminConfig'],
  transactions: ['admin', 'transactions']
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

  //verify user
  const useVerifyUser = () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async (id) => {
        if (!id) throw new Error('User ID is required');
        const { data } = await api.post(`/admin/users/${id}/verify`)
        return data
      },
      onSuccess: (_, id) => {
        queryClient.invalidateQueries(queryKeys.users.all)
        queryClient.invalidateQueries(queryKeys.stats)
      },
      onError: (error) => handleError(error, 'Failed to verify user')
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

  const useCreateUser = () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async (userData) => {
        const response = await api.post('/admin/users', userData)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
      }
    })
  }

  // Statistics Management
  const useSystemStats = () => {
    return useQuery({
      queryKey: queryKeys.stats,
      queryFn: async () => {
        const { data } = await api.get('/admin/stats')
        console.log('System stats response:', data.data)
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
        queryClient.invalidateQueries({ queryKey: queryKeys.adminConfig });
        toast.success('Settings updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update settings');
      }
    });
  };

  // Admin deposits
  const useAdminDeposits = () => {
    return useQuery({
      queryKey: queryKeys.adminDeposits,
      queryFn: async () => {
        const { data } = await api.get('/admin/admin-deposits');
        console.log("admin deposits",data);
        return data;
      },
      onError: (error) => handleError(error, 'Failed to fetch admin deposits')
    })
  }

  // Transaction Management
  const useTransactions = ({
    page = 1,
    limit = 10,
    status,
    search,
    type,
    startDate,
    endDate
  } = {}) => {
    return useQuery({
      queryKey: [...queryKeys.transactions, page, limit, status, search, type, startDate, endDate],
      queryFn: async () => {
        const params = new URLSearchParams({
          page,
          limit,
          ...(status && { status }),
          ...(search && { search }),
          ...(type && { type }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate })
        });
        const response = await api.get(`/admin/transactions?${params}`);
        return response.data.data;
      }
    });
  };

  const useUpdateTransactionStatus = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async ({ transId, status, type }) => {
        const response = await api.post('/payments/status/callback/usdt', {
          trans_id: transId,
          status,
          type
        });
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.transactions);
        toast.success('Transaction status updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update transaction status');
      }
    });
  };

  const { mutate: updateTransactionStatus } = useUpdateTransactionStatus();

  const approveTransaction = useCallback((transId) => {
    updateTransactionStatus({
      transId,
      status: 'SUCCESSFUL',
      type: 'DEPOSIT'
    });
  }, [updateTransactionStatus]);

  const declineTransaction = useCallback((transId) => {
    updateTransactionStatus({
      transId,
      status: 'FAILED',
      type: 'DEPOSIT'
    });
  }, [updateTransactionStatus]);

  const useDepositToUser = () => {
    return useMutation({
      mutationFn: async ({ userId, amount }) => {
        const { data } = await api.post(`/admin/users/${userId}/deposit`, { amount });
        return data;
      },
      // onSuccess: () => toast.success('Deposit successful!'),
      // onError: (error) => toast.error(error.response?.data?.error || 'Deposit failed')
    });
  };

  return {
    useUsers,
    useVerifyUser,
    useUserDetails,
    useUpdateUserStatus,
    useDeleteUser,
    useCreateUser,
    useSystemStats,
    useNetworkStats,
    useNetworkTree,
    useAdminConfig,
    useUpdateAdminConfig,
    useTransactions,
    approveTransaction,
    declineTransaction,
    useDepositToUser,
    useAdminDeposits
  }
}