import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URLS,
  headers: {
    'Content-Type': 'application/json'
  }
})

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      try {
        const response = await api.get('health');
        return {
          status: response.status,
          uptime: response.data?.uptime,
          version: response.data?.version,
          environment: response.data?.environment,
          ok: true
        };
      } catch (error) {
        return {
          status: error.response?.status || 500,
          uptime: 0,
          version: 'unknown',
          environment: 'unknown',
          ok: false,
          error: error.message
        };
      }
    },
    retry: 1, // Only retry once
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 1000 * 20, // Consider data stale after 20 seconds
  });
}
