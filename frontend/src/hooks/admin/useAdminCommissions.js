import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import toast from 'react-hot-toast';

const queryKeys = {
  commissions: ['admin', 'commissions']
};

export function useAdminCommissions({ page = 1, limit = 10, type, status, userId, startDate, endDate } = {}) {
  const queryClient = useQueryClient();

  // Transform filters to match backend expectations
  const transformedType = type === 'All' ? null : type?.toUpperCase();
  const transformedStatus = status === 'All' ? null : status?.toUpperCase();

  // Get commissions with filters
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [...queryKeys.commissions, { page, limit, type: transformedType, status: transformedStatus, userId, startDate, endDate }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(transformedType && { type: transformedType }),
        ...(transformedStatus && { status: transformedStatus }),
        ...(userId && { userId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await api.get(`/commissions/admin?${params}`);
      return {
        data: {
          commissions: response.data.data,
          pagination: response.data.pagination
        }
      };
    }
  });

  // Process commission
  const processCommission = useMutation({
    mutationFn: async ({ commissionId, action }) => {
      const response = await api.post(`/commissions/admin/${commissionId}/${action}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.commissions);
      toast.success('Commission processed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to process commission');
    }
  });

  return {
    data: data?.data,
    isLoading,
    isFetching,
    processCommission: processCommission.mutate,
    isProcessing: processCommission.isLoading
  };
}
