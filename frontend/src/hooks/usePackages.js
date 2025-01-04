import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getAuthTokens } from '../lib/auth'
import { PaymentStatusModal, PAYMENT_STATES } from '@/components/payment/PaymentStatusModal'
import toast from 'react-hot-toast'
import { api } from '../lib/axios'

export function usePackages(options = {}) {
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
          toast.error('Access Denied, You do not have permission to perform this action.')
          break
        case 404:
          toast.error('Resource Not Found')
          break
        default:
          toast.error(`Error: ${error.response.status} - ${error.response.statusText}`)
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('No response received from server. Check your internet connection.')
    } else {
      // Something happened in setting up the request
      toast.error('Request Error: ' + error.message)
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
          toast.success('You have an active package..redirecting')
          setTimeout(() => navigate('/dashboard'), 3000)
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
        // Move to processing state and navigate to status page
        onPaymentStatusChange(PAYMENT_STATES.PROCESSING);
        
        // Log the response data for debugging
        console.log('Payment Response:', data.data);
        
        // Navigate with available data
        const params = new URLSearchParams({
          trans_id: data.data.trans_id,
          ...(data.data.package?.name && { package: data.data.package.name }),
          ...(data.data.amount && { amount: data.data.amount })
        });
        
        navigate(`/payment/status?${params.toString()}`);
      }
    },
    onError: (error) => {
      onPaymentStatusChange(PAYMENT_STATES.FAILED);
      handleAuthError(error, 'Package Purchase');
    }
  });

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
      toast.success(data.message || 'Package purchased successfully')
      navigate('/dashboard')
      queryClient.invalidateQueries(['userPackage'])
      queryClient.invalidateQueries(['packages'])
      
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to purchase package')
    }
  })
}

// Specific hook for package upgrade
export function usePackageUpgrade() {

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
      toast.success(data.message || 'Package upgraded successfully')
      queryClient.invalidateQueries(['userPackage'])
      queryClient.invalidateQueries(['packages'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upgrade package')
    }
  })
}
