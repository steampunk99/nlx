import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/axios'
import { useToast } from '../components/ui/use-toast'
import { useNavigate } from 'react-router-dom'
import { getAuthTokens } from '../lib/auth'
import { PaymentStatusModal, PAYMENT_STATES } from '@/components/payment/PaymentStatusModal'

export function usePackages(options = {}) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { onPaymentStatusChange = () => {} } = options;

  // Enhanced authentication check with logging
  const isAuthenticated = () => {
    const tokens = getAuthTokens()
    const isAuth = !!tokens.accessToken
    return isAuth
  }

  // Detailed error handler
  const handleAuthError = (error, context = 'Unknown') => {
    // Only handle non-refresh errors here
    // Let axios interceptor handle refresh token flow
    if (error.response?.status === 401) {
      return
    }

    // Handle other errors
    if (error.response) {
      switch (error.response.status) {
        case 403:
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to access this resource.',
            variant: 'destructive'
          })
          break
        case 404:
          toast({
            title: 'Resource Not Found',
            description: 'The requested resource could not be found.',
            variant: 'destructive'
          })
          break
        default:
          toast({
            title: 'Error',
            description: `An unexpected error occurred: ${error.message}`,
            variant: 'destructive'
          })
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast({
        title: 'Network Error',
        description: 'No response received from server. Check your internet connection.',
        variant: 'destructive'
      })
    } else {
      // Something happened in setting up the request
      toast({
        title: 'Request Error',
        description: `Error: ${error.message}`,
        variant: 'destructive'
      })
    }
  }

  // Fetch available packages
  const { 
    data: availablePackages = [], 
    isLoading: packagesLoading, 
    error: packagesError 
  } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      if (!isAuthenticated()) {
        navigate('/login')
        return []
      }
      
      try {
        const { data } = await api.get('/packages')
        return data.data || []
      } catch (error) {
        handleAuthError(error, 'Packages Fetch')
        return []
      }
    },
    enabled: isAuthenticated(),
    retry: 1,
    staleTime: 1000 * 60 * 5,
    onError: (error) => {
      console.error('Query error in packages:', error)
      handleAuthError(error, 'Packages Query')
    }
  })

  // Get user's active package
  const { data: userPackage, isLoading: isLoadingUserPackage } = useQuery({
    queryKey: ['userPackage'],
    queryFn: async () => {
      try {
        const response = await api.get('/packages/user');
        const packageData = response.data.data;
        console.log('package response 1',packageData)
        if(!packageData){
          navigate('/activation')
        } else {
          toast({
            message: 'You have a package already'
          })
          navigate('/dashboard')
        }
        
        if (packageData) {
          return {
            ...packageData,
            formattedExpiresAt: packageData.expiresAt ? new Date(packageData.expiresAt).toLocaleDateString() : 'N/A',
            status: packageData.isExpired ? 'EXPIRED' : packageData.status,
            statusColor: packageData.isExpired ? 'red' : 
                        packageData.daysRemaining <= 7 ? 'orange' : 'green'
          };
        }
        return null;
      } catch (error) {
        handleAuthError(error, 'Fetching user package');
        return null;
      }
    },
    enabled: isAuthenticated()
  });

  // Fetch upgrade options (with fallback)
 

  // Purchase package mutation
  const purchasePackageMutation = useMutation({
    mutationFn: async (paymentData) => {
      const response = await api.post('/payments/package', paymentData);
      return response.data;
    },
    onMutate: () => {
      // Start with waiting state (for PIN entry)
      onPaymentStatusChange(PAYMENT_STATES.WAITING);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Move to processing state and start polling
        onPaymentStatusChange(PAYMENT_STATES.PROCESSING);
        startPaymentStatusPolling(data.data.trans_id);
      }
    },
    onError: (error) => {
      onPaymentStatusChange(PAYMENT_STATES.FAILED);
      handleAuthError(error, 'Package Purchase');
    }
  });

  // Payment status polling
  const startPaymentStatusPolling = async (transId) => {
    const pollInterval = 4000; // 2 seconds
    const maxAttempts = 20; // 2 minutes total (60 attempts * 2 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        console.log(`📡 Polling attempt ${attempts}/${maxAttempts} for transaction:`, transId);
        
        const { data } = await api.post('/payments/status/check', { trans_id: transId });
        console.log('📥 Received status response:', {
          success: data.success,
          status: data.data?.status,
        });

        if (attempts >= maxAttempts) {
          console.log('⏰ Maximum polling attempts reached:', {
            transId,
            attempts,
            totalTime: `${(attempts * pollInterval) / 1000}s`
          });
          onPaymentStatusChange(PAYMENT_STATES.TIMEOUT);
          return true;
        }

        switch (data.data?.status) {
          case 'COMPLETED':
            console.log('✅ Payment completed successfully:', {
              transId,
              totalAttempts: attempts,
              totalTime: `${(attempts * pollInterval) / 1000}s`
            });
            onPaymentStatusChange(PAYMENT_STATES.SUCCESS);
            queryClient.invalidateQueries(['userPackage']);
            navigate('/dashboard');
            return true;

          case 'FAILED':
            console.log('❌ Payment failed:', {
              transId,
              totalAttempts: attempts
            });
            onPaymentStatusChange(PAYMENT_STATES.FAILED);
            return true;

          case 'PENDING':
            console.log('⏳ Payment still pending:', {
              transId,
              attempt: attempts
            });
            return false;

          default:
            console.warn('⚠️ Unknown payment status:', {
              status: data.data?.status,
              transId
            });
            return false;
        }
      } catch (error) {
        console.error('💥 Error polling payment status:', {
          error: error.message,
          attempt: attempts,
          transId
        });
        return false;
      }
    };

    const pollIntervalId = setInterval(poll, pollInterval);
    const stopPolling = async () => {
      clearInterval(pollIntervalId);
    };

    await poll();
  };

  // Package upgrade mutation
  const upgradePackageMutation = useMutation({
    mutationFn: async (paymentData) => {
      if (!paymentData?.phone) {
        throw new Error('Phone number is required');
      }

      const response = await api.post('/payments/upgrade', {
        trans_id: paymentData.trans_id,
        currentPackageId: paymentData.currentPackageId,
        newPackageId: paymentData.newPackageId,
        amount: paymentData.amount,
        phone: paymentData.phone
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      let pollCount = 0;
      const maxPolls = 6;
      
      const pollInterval = setInterval(async () => {
        try {
          pollCount++;
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            onPaymentStatusChange?.(PAYMENT_STATES.TIMEOUT);
            return;
          }

          if (!data.data.status) {
            throw new Error('No mobile money response');
          }
          const status = data.data.status;

          if (status === 'SUCCESS') {
            clearInterval(pollInterval);
            onPaymentStatusChange?.(PAYMENT_STATES.SUCCESS);
            queryClient.invalidateQueries({ queryKey: ['userPackage'] });
            setTimeout(() => {
              navigate('/dashboard/packages');
            }, 5000);
          }
        } catch (error) {
          console.error('Status check failed:', error);
        }
      }, 125000);
    },
    onError: (error) => {
      console.error('Package upgrade error:', error);
      handleAuthError(error, 'Package Upgrade');
    }
  });

  return {
    // Packages data
    availablePackages,
    userPackage,
  

    // Loading states
    packagesLoading: packagesLoading || !isAuthenticated(),
    isLoadingUserPackage: isLoadingUserPackage || !isAuthenticated(),
    

    // Errors
    packagesError,

    // Mutations
    purchasePackage: purchasePackageMutation.mutate,
    upgradePackage: upgradePackageMutation.mutate,
    purchasePackageMutation,
    upgradePackageMutation,
  }
}

// Specific hook for package purchase
export function usePackagePurchase() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ packageId, paymentMethod, phone = '' }) => {
      const { data } = await api.post('/packages/purchase', {
        packageId,
        paymentMethod,
        phoneNumber
      })
      return data
    },
    onSuccess: (data) => {
      toast({
        title: 'Package Purchased',
        description: data.message || 'Package purchased successfully',
        variant: 'default'
      })
      navigate('/dashboard')
      queryClient.invalidateQueries(['userPackage'])
      queryClient.invalidateQueries(['packages'])
      
    },
    onError: (error) => {
      toast({
        title: 'Purchase Failed',
        description: error.response?.data?.message || 'Failed to purchase package',
        variant: 'destructive'
      })
    }
  })
}

// Specific hook for package upgrade
export function usePackageUpgrade() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ currentPackageId, newPackageId, paymentMethod, phoneNumber = '' }) => {
      const { data } = await api.post('/packages/upgrade', {
        currentPackageId,
        newPackageId,
        paymentMethod,
        phoneNumber
      })
      return data
    },
    onSuccess: (data) => {
      toast({
        title: 'Package Upgraded',
        description: data.message || 'Package upgraded successfully',
        variant: 'default'
      })
      
      queryClient.invalidateQueries(['userPackage'])
      queryClient.invalidateQueries(['packages'])
    },
    onError: (error) => {
      toast({
        title: 'Upgrade Failed',
        description: error.response?.data?.message || 'Failed to upgrade package',
        variant: 'destructive'
      })
    }
  })
}
