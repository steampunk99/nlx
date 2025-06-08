import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';

// Prize Config hooks
export function usePrizeConfig() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['prizeConfig'],
    queryFn: async () => {
      const res = await api.get('/prizes/config');
      console.log('[usePrizeConfig] fetched config:', res.data.data);
      return res.data.data;
    }
  });

  // Create or update config
  const mutation = useMutation({
    mutationFn: async (data, id) => {
      if (id) {
        const res = await api.put(`/prizes/config/${id}`, data);
        return res.data.data;
      } else {
        const res = await api.post('/prizes/config', data);
        return res.data.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['prizeConfig']);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prizeConfig'] });
    }
  });

  return {
    config: query.data,
    ...query,
    createOrUpdateConfig: mutation.mutateAsync,
    mutation
  };
}

// Admin: fetch all prize configs
export function useAllPrizeConfigs() {
  return useQuery({
    queryKey: ['allPrizeConfigs'],
    queryFn: async () => {
      const res = await api.get('/prizes/configs');
      return res.data.data;
    }
  });
}

// Prize Claims hooks
export function usePrizeClaims(prizeWindowId) {
  return useQuery({
    queryKey: ['prizeClaims', prizeWindowId],
    queryFn: async () => {
      if (!prizeWindowId) return [];
      const res = await api.get('/prizes/claims', { params: { prizeWindowId } });
      return res.data.data;
    },
    enabled: !!prizeWindowId
  });
}
