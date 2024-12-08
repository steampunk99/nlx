import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/axios'
import { useToast } from '../components/ui/use-toast'
import { useNavigate } from 'react-router-dom'
import { getAuthTokens } from '../lib/auth'

export function usePackages() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Enhanced authentication check with logging
  const isAuthenticated = () => {
    const tokens = getAuthTokens()
    const isAuth = !!tokens.accessToken
    
    console.group('Authentication Check')
    console.log('Access Token Present:', !!tokens.accessToken)
    console.log('Refresh Token Present:', !!tokens.refreshToken)
    console.log('Is Authenticated:', isAuth)
    console.trace('Authentication Check Trace')
    console.groupEnd()

    return isAuth
  }

  // Detailed error handler
  const handleAuthError = (error, context = 'Unknown') => {
    console.group(`Auth Error in ${context}`)
    console.error('Full Error:', error)
    console.log('Error Response:', error.response)
    console.log('Error Status:', error.response?.status)
    console.log('Error Data:', error.response?.data)
    console.groupEnd()

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
    data: activePackages = [], 
    isLoading: activePackagesLoading, 
    error: activePackagesError,
    refetch: refetchActivePackages 
  } = useQuery({
    queryKey: ['userPackages'],
    queryFn: async () => {
      console.log('Fetching User Packages - Authentication Check')
      if (!isAuthenticated()) {
        console.warn('Not authenticated - redirecting to login')
        navigate('/login')
        return []
      }
      
      try {
        console.log('Attempting to fetch user packages')
        const { data } = await api.get('/packages/user')
        console.log('User Packages fetched successfully:', data)
        return data.data || []
      } catch (error) {
        console.error('User packages fetch error:', error)
        handleAuthError(error, 'User Packages Fetch')
        return []
      }
    },
    enabled: isAuthenticated(),
    retry: 1,
    staleTime: 1000 * 60 * 5,
    onError: (error) => {
      console.error('Query error in user packages:', error)
      handleAuthError(error, 'User Packages Query')
    }
  })

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
    mutationFn: async ({ packageId, paymentMethod, phoneNumber = '' }) => {
      console.group('Package Purchase Debug')
      console.log('Authentication Status:', isAuthenticated())
      console.log('Package ID:', packageId)
      console.log('Payment Method:', paymentMethod)
      console.log('Phone Number:', phoneNumber)

      if (!isAuthenticated()) {
        console.warn('Not authenticated - redirecting to login')
        navigate('/login')
        throw new Error('Not authenticated')
      }
      
      try {
        console.log('Attempting package purchase', { packageId, paymentMethod, phoneNumber })
        
        // Validate inputs before making the request
        if (!packageId) {
          throw new Error('Package ID is required')
        }
        if (!paymentMethod) {
          throw new Error('Payment method is required')
        }

        const purchasePayload = {
          packageId,
          paymentMethod,
          ...(phoneNumber && { phoneNumber })
        }

        console.log('Purchase Payload:', JSON.stringify(purchasePayload, null, 2))

        const { data } = await api.post('/packages/purchase', purchasePayload)

        console.log('Purchase Response:', data)

        // Handle different payment method scenarios
        switch (paymentMethod) {
          case 'MTN_MOBILE_MONEY':
          case 'AIRTEL_MONEY':
            // Mobile money specific handling
            if (data.paymentUrl) {
              // Redirect to mobile money payment page
              window.location.href = data.paymentUrl
              return data
            }
            break
          default:
            // Standard payment methods
            break
        }

        // Refetch active packages after successful purchase
        queryClient.invalidateQueries(['userPackages'])

        toast({
          title: 'Package Purchase Successful',
          description: `You have successfully purchased the package.`,
          variant: 'success'
        })

        console.groupEnd()
        return data
      } catch (error) {
        console.error('Package purchase error', error)
        
        // Log detailed error information
        console.group('Purchase Error Details')
        console.log('Error Response:', error.response)
        console.log('Error Status:', error.response?.status)
        console.log('Error Data:', error.response?.data)
        console.log('Error Message:', error.message)
        console.groupEnd()
        
        // Detailed error handling for mobile money
        if (error.response?.data?.mobileMoneyError) {
          toast({
            title: 'Mobile Money Payment Error',
            description: error.response.data.mobileMoneyError,
            variant: 'destructive'
          })
        } else {
          handleAuthError(error, 'Package Purchase')
        }
        
        console.groupEnd()
        throw error
      }
    },
    onSuccess: (data) => {
      // Additional success handling if needed
      console.log('Package purchase successful', data)
    },
    onError: (error) => {
      console.error('Package purchase mutation error', error)
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Unable to complete package purchase',
        variant: 'destructive'
      })
    }
  })

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
      
      queryClient.invalidateQueries(['userPackages'])
      queryClient.invalidateQueries(['packages'])
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

    // Refetch function
    refetchActivePackages
  }
}

// Specific hook for package purchase
export function usePackagePurchase() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ packageId, paymentMethod, phoneNumber = '' }) => {
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
