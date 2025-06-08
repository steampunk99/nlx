import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

// Fetch the active prize only
export function useActivePrize() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activePrize'],
    queryFn: async () => {
      const res = await api.get('/prizes/config');
      return res.data.data;
    }
  });

  return {
    prize: data,
    isLoading,
    error,
    refetch
  };
}

import { toast } from 'react-hot-toast';

export function usePrizeClaim() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/prizes/claim');
      return res.data.data;
    },
    onSuccess: (data) => {
      toast.success('Prize claimed successfully!');
      queryClient.invalidateQueries(['activePrize']);
    },
    onError: (error) => {
      let msg = error?.response?.data?.message || error.message || 'Unknown error';
      if (msg.toLowerCase().includes('already claimed')) {
        toast.error('You have already claimed this prize.');
      } else if (msg.toLowerCase().includes('fully claimed')) {
        toast.error('Prize has already been fully claimed.');
      } else {
        toast.error(msg);
      }
    }
  });

  // Compute disableButton for UI
  const errorMsg = mutation.error?.response?.data?.message?.toLowerCase() || '';
  const alreadyClaimed = errorMsg.includes('already claimed');
  const fullyClaimed = errorMsg.includes('fully claimed');
  const disableButton = mutation.isLoading || mutation.isSuccess || alreadyClaimed || fullyClaimed;

  return {
    claimPrize: mutation.mutateAsync,
    isClaiming: mutation.isLoading,
    claimError: mutation.error,
    claimSuccess: mutation.isSuccess,
    disableButton
  };
}

