import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';

export const useWithdrawalStatus = (transactionId) => {
  const [status, setStatus] = useState('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!transactionId) return;

    let timeoutId;
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const response = await api.get(`/withdrawals/status/${transactionId}`);
        console.log("get status response",response)
        if (!isMounted) return;
        const newStatus = response.data?.status || 'PENDING';
        setStatus(newStatus);
        setDetails(response.data || null);
        setError(null);
        // Continue polling only if status is PENDING or PROCESSING
        if (newStatus === 'PENDING' || newStatus === 'PROCESSING') {
          timeoutId = setTimeout(checkStatus, 10000);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkStatus();
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [transactionId]);

  return { status, isLoading, error, details };
};
