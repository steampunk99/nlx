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
      console.log('Fetching Packages - Authentication Check')
      if (!isAuthenticated()) {
        console.warn('Not authenticated - redirecting to login')
        navigate('/login')
        return []
      }
      
      try {
        console.log('Attempting to fetch packages')
        const { data } = await api.get('/packages')
        console.log('Packages fetched successfully:', data)
        return data.data || []
      } catch (error) {
        console.error('Packages fetch error:', error)
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

  // Fetch user's current packages
  const { 
    data: activePackagesData = [], 
    isLoading: activePackagesLoading, 
    error: activePackagesError,
    refetch: refetchActivePackages 
  } = useQuery({
    queryKey: ['userPackages'],
    queryFn: async () => {
     
      const response = await api.get('/packages/user');
      console.log('Raw Response:', response);
      
      // Transform the single object into an array
      const packageData = response.data?.data;
      const packages = packageData ? [packageData] : [];
     
      return packages;
    },
    enabled: isAuthenticated()
  });

  // No additional transformation needed
  const activePackages = activePackagesData || [];
 
  

  // Fetch upgrade options (with fallback)
  const { 
    data: upgradeOptions = null, 
    isLoading: upgradeOptionsLoading 
  } = useQuery({
    queryKey: ['packageUpgradeOptions'],
    queryFn: async () => {
      console.log('Fetching Upgrade Options - Authentication Check')
      if (!isAuthenticated()) {
        console.warn('Not authenticated - redirecting to login')
        navigate('/login')
        return null
      }
      
      try {
        console.log('Attempting to fetch upgrade options')
        const { data } = await api.get('/packages/upgrade-options')
        console.log('Upgrade options fetched successfully:', data)
        return data.data || null
      } catch (error) {
        console.error('Upgrade options fetch error:', error)
        handleAuthError(error, 'Upgrade Options Fetch')
        return null
      }
    },
    enabled: isAuthenticated(),
    retry: 1,
    staleTime: 1000 * 60 * 5,
    onError: (error) => {
      console.error('Query error in upgrade options:', error)
      handleAuthError(error, 'Upgrade Options Query')
    }
  })

  // Package purchase mutation
  const purchasePackageMutation = useMutation({
    mutationFn: async (paymentData) => {
      if (!paymentData?.phoneNumber) {
        throw new Error('Phone number is required');
      }

      const response = await api.post('/payments/package', {
        trans_id: paymentData.trans_id,
        packageId: paymentData.packageId,
        amount: paymentData.amount,
        phone: paymentData.phoneNumber
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

          // get the status from the response of the purchase
          console.log('Data:', data.data.status);
          if (!data.data.status) {
            throw new Error('No mobile money response');
          }
          const status = data.data.status;

          if (status === 'SUCCESS') {
            clearInterval(pollInterval);
            onPaymentStatusChange?.(PAYMENT_STATES.SUCCESS);
            queryClient.invalidateQueries({ queryKey: ['userPackages'] });
            setTimeout(() => {
              navigate('/dashboard/packages');
            }, 2000);
          }
        } catch (error) {
          console.error('Status check failed:', error);
        }
      }, 55000);
    }
  });

  // Package upgrade mutation
  const upgradePackageMutation = useMutation({
    mutationFn: async ({ currentPackageId, newPackageId, paymentMethod, phoneNumber = '' }) => {
      console.log('Package Upgrade - Authentication Check')
      if (!isAuthenticated()) {
        console.warn('Not authenticated - redirecting to login')
        navigate('/login')
        throw new Error('Not authenticated')
      }
      
      try {
        console.log('Attempting package upgrade', { currentPackageId, newPackageId, paymentMethod })
        const { data } = await api.post('/packages/upgrade', {
          currentPackageId,
          newPackageId,
          paymentMethod,
          phoneNumber
        })
        console.log('Package upgrade successful:', data)
        return data
      } catch (error) {
        console.error('Package upgrade error:', error)
        handleAuthError(error, 'Package Upgrade')
        throw error
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Package Upgraded',
        description: data.message || 'Package upgraded successfully',
        variant: 'default'
      })
      
      queryClient.invalidateQueries({ queryKey: ['userPackages'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error) => {
      console.error('Package upgrade mutation error:', error)
      handleAuthError(error, 'Package Upgrade Mutation')
    }
  })

  return {
    // Packages data
    availablePackages,
    activePackages,
    upgradeOptions,

    // Loading states
    packagesLoading: packagesLoading || !isAuthenticated(),
    activePackagesLoading: activePackagesLoading || !isAuthenticated(),
    upgradeOptionsLoading: upgradeOptionsLoading || !isAuthenticated(),

    // Errors
    packagesError,
    activePackagesError,

    // Mutations
    purchasePackage: purchasePackageMutation.mutate,
    upgradePackage: upgradePackageMutation.mutate,
    purchasePackageMutation,
    upgradePackageMutation,
    

    // Refetch function
    refetchActivePackages
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
      
      queryClient.invalidateQueries(['userPackages'])
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
      
      queryClient.invalidateQueries(['userPackages'])
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
