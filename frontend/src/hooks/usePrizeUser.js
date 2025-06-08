import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';

// Fetch the active prize only
export function useActivePrize() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activePrize'],
    queryFn: async () => {
      try {
        const res = await api.get('/prizes/config');
        return res.data?.data || null;
      } catch (error) {
        // If no active prize, return null instead of throwing
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    prize: data,
    isLoading,
    error,
    refetch
  };
}

export function usePrizeClaim() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await api.post('/prizes/claim');
        return res.data.data;
      } catch (error) {
        // Re-throw the error to be handled by the component
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Failed to claim prize. Please try again.'
        );
      }
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['activePrize'] });
      // Show success message
      toast.success('Prize claimed successfully!');
    },
    // Let the component handle the error state
  });

  return {
    claimPrize: mutation.mutateAsync,
    isClaiming: mutation.isPending,
    claimError: mutation.error,
    claimSuccess: mutation.isSuccess,
  };
}
