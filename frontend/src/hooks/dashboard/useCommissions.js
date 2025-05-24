import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function useCommissions(options = {}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { 
    page = 1, 
    limit = 10, 
    type = null, 
    status = null,
    userId = null,
    isAdmin = false 
  } = options;


//get user total earnings from "/dashboard/earnings"


//get user's daily reward from "/dashboard/reward"


  // Transform filters to match backend expectations
  const transformedType = type === 'All' ? null : type;
  const transformedStatus = status === 'All' ? null : status;

  // Fetch commission statistics
  const { 
    data: commissionStats = null, 
    isLoading: statsLoading, 
    error: statsError 
  } = useQuery({
    queryKey: ['commissionStats', userId],
    queryFn: async () => {
      const endpoint = userId ? `/commissions/stats/${userId}` : '/commissions/stats';
      const { data } = await api.get(endpoint);
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch commission history
  const { 
    data: commissionHistory = { commissions: [], total: 0, pages: 0 }, 
    isLoading: historyLoading, 
    error: historyError,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['commissionHistory', { page, limit, transformedType, transformedStatus, userId, isAdmin }],
    queryFn: async () => {
      try {
        const endpoint = isAdmin ? 'commissions/admin' : 'commissions';
        const params = {
          page,
          limit,
          ...(transformedType && { type: transformedType }),
          ...(transformedStatus && { status: transformedStatus }),
          ...(userId && { userId })
        };
        
        const { data } = await api.get(endpoint, { params });

        console.log("commission history:..",data.data )
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch commission history');
        }
        
        return {
          commissions: data.data || [],
          total: data.total || 0,
          pages: data.pages || 0
        };
      } catch (error) {
        console.error('Commission history error:', error);
        toast.error(error.message || 'Failed to fetch commission history');
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async (withdrawalData) => {
      const { data } = await api.post('/commissions/withdraw', withdrawalData);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Withdrawal of ${data.amount} processed successfully.`);
      queryClient.invalidateQueries(['commissionStats']);
      queryClient.invalidateQueries(['commissionHistory']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to process withdrawal.');
    }
  });

  // Admin: Process commission queue
  const processQueueMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/commissions/process-queue');
      return data;
    },
    onSuccess: () => {
      toast.success('Commission queue processed successfully.');
      queryClient.invalidateQueries(['commissionStats']);
      queryClient.invalidateQueries(['commissionHistory']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to process commission queue.');
    }
  });

  return {
    // Data
    commissionStats,
    commissionHistory: commissionHistory.commissions,
    totalCommissions: commissionHistory.total,
    totalPages: commissionHistory.pages,
    
    // Loading states
    statsLoading,
    historyLoading,
    
    // Errors
    statsError,
    historyError,
    
    // Actions
    refetchHistory,
    withdraw: withdrawMutation.mutate,
    isWithdrawing: withdrawMutation.isLoading,
    
    // Admin actions
    processQueue: processQueueMutation.mutate,
    isProcessingQueue: processQueueMutation.isLoading
  };
}
