import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getAuthTokens } from '../lib/auth'
import toast from 'react-hot-toast'
import { api } from '../lib/axios'

export function usePackages(options = {}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

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


 // Purchase package mutation
 const purchasePackageMutation = useMutation({
  mutationFn: async ({ phone, amount, packageId }) => {
    console.log('Payload being sent:', { phone, amount, packageId });
    if (!phone || !amount || !packageId) {
      throw new Error('Missing required payment information');
    }

    try {
     const payload = {
        phone,
        amount,
        packageId
      };

      const response = await api.post('/payments/package', payload);
      console.log('Raw API Response:', response);

     

      console.log('Payment data:', response);
      return response;  // Return the nested data object
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response);
      handleAuthError(error, 'Package Purchase');
      throw error;
    }
  },
  onSuccess: (data) => {
    // Invalidate relevant queries
    queryClient.invalidateQueries(['userPackage']);
    queryClient.invalidateQueries(['packages']);
  },
  onError: (error) => {
    console.error('Package purchase error:', error);
  }
});

  return {
    // Data
    availablePackages,
    userPackage,
    
    // Loading states
    packagesLoading: packagesLoading || !isAuthenticated(),
    isLoadingUserPackage: isLoadingUserPackage || !isAuthenticated(),
    
    // Errors
    packagesError,
    
    // Return the full mutation object instead of just the mutate function
    purchasePackageMutation: {
      ...purchasePackageMutation,
      mutateAsync: purchasePackageMutation.mutateAsync,
      isLoading: purchasePackageMutation.isLoading,
      isError: purchasePackageMutation.isError,
      error: purchasePackageMutation.error,
      reset: purchasePackageMutation.reset
    }
  };

}