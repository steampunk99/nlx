import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useToast } from '../components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export function useCommissions(options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    page = 1, 
    limit = 10, 
    type = null, 
    status = null,
    userId = null,
    isAdmin = false 
  } = options;

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
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch commission history',
          variant: 'destructive'
        });
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
      toast({
        title: 'Withdrawal Successful',
        description: `Withdrawal of ${data.amount} processed successfully.`,
        variant: 'success'
      });
      queryClient.invalidateQueries(['commissionStats']);
      queryClient.invalidateQueries(['commissionHistory']);
    },
    onError: (error) => {
      toast({
        title: 'Withdrawal Failed',
        description: error.response?.data?.message || 'An error occurred during withdrawal.',
        variant: 'destructive'
      });
    }
  });

  // Admin: Process commission queue
  const processQueueMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/commissions/process-queue');
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Queue Processed',
        description: 'Commission queue processed successfully.',
        variant: 'success'
      });
      queryClient.invalidateQueries(['commissionStats']);
      queryClient.invalidateQueries(['commissionHistory']);
    },
    onError: (error) => {
      toast({
        title: 'Processing Failed',
        description: error.response?.data?.message || 'Failed to process commission queue.',
        variant: 'destructive'
      });
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
