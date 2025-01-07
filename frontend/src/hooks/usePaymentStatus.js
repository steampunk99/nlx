import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';

export const usePaymentStatus = (trans_id) => {
  const [status, setStatus] = useState('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!trans_id) return;

    let timeoutId;
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const response = await api.post('/payments/status/check', { trans_id });
        console.log('Payment status:', response.data);
        
        if (!isMounted) return;
        
        const newStatus = response.data?.status || 'PENDING';
        setStatus(newStatus);
        setError(null);

        // Continue polling only if status is PENDING
        if (newStatus === 'PENDING') {
          timeoutId = setTimeout(checkStatus, 10000);
        }
      } catch (err) {
        console.error('Payment check failed:', err);
        if (!isMounted) return;
        setError(err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Start checking
    checkStatus();

    // Cleanup
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [trans_id]);

  return { status, isLoading, error };
};