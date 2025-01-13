import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import toast from 'react-hot-toast';

const queryKeys = {
  withdrawals: ['admin', 'withdrawals']
};

export function useAdminWithdrawals({ page = 1, limit = 10, status, search, startDate, endDate } = {}) {
  const queryClient = useQueryClient();

  // Transform filters to match backend expectations
  const transformedStatus = status === 'All' ? null : status?.toUpperCase();

  // Get withdrawals with filters
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [...queryKeys.withdrawals, { page, limit, status: transformedStatus, search, startDate, endDate }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(transformedStatus && { status: transformedStatus }),
        ...(search && { search }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await api.get(`/admin/withdrawals?${params}`);
      return response.data;
    }
  });

  // Process withdrawal
  const { mutate: processWithdrawal, isLoading: isProcessing } = useMutation({
    mutationFn: async ({ withdrawalId, action, remarks }) => {
      const status = action === 'approve' ? 'SUCCESSFUL' : 'REJECTED';
      const response = await api.post(`/admin/withdrawals/${withdrawalId}/process`, {
        status,
        remarks: remarks || (action === 'approve' ? 'Approved by admin' : 'Rejected by admin')
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.withdrawals);
      toast.success('Withdrawal processed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to process withdrawal');
    }
  });

  return {
    withdrawals: data?.data?.withdrawals || [],
    stats: data?.data?.stats || {
      pending: { count: 0, amount: 0 },
      processing: { count: 0, amount: 0 },
      successful: { count: 0, amount: 0 },
      failed: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 }
    },
    pagination: data?.data?.pagination || {
      total: 0,
      pages: 0,
      currentPage: page,
      limit
    },
    isLoading,
    isFetching,
    processWithdrawal,
    isProcessing
  };
}
