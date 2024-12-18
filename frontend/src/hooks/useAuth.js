import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '../lib/axios'
import { clearAuthTokens } from '../lib/auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { userAtom, setAuthTokens } from '../lib/auth'

export function useAuth() {
  const [user, setUser] = useAtom(userAtom)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const getErrorMessage = (error) => {
    // Network or server errors
    if (!error.response) {
      return 'Unable to connect to server. Please check your internet connection.'
    }

    // Get message from server response
    const serverMessage = error.response?.data?.message

    // Handle specific status codes
    switch (error.response.status) {
      case 400:
        return serverMessage || 'Please check your input and try again.'
      case 401:
        return serverMessage || 'Invalid credentials. Please try again.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'Resource not found.'
      case 409:
        return serverMessage || 'This email is already registered.'
      case 422:
        return serverMessage || 'Invalid input data. Please check your information.'
      case 429:
        return 'Too many attempts. Please try again later.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return serverMessage || 'An unexpected error occurred. Please try again.'
    }
  }

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post('/auth/login', credentials)
      const { accessToken, refreshToken, user } = response.data.data
      // Set tokens first
      setAuthTokens(accessToken, refreshToken)
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      // Then update user state
      setUser(user)
      return response.data
    },
    onMutate: () => {
      setLoading(true)
      toast('Signing in...')
    },
    onSuccess: (data) => {
      if (data?.data?.user) {
        toast.success('Welcome back!')
        navigate('/dashboard')
      } else {
        toast.error('Login failed: Invalid response format')
        clearAuthTokens()
        setUser(null)
      }
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
      console.error('Login error:', error)
      clearAuthTokens()
      setUser(null)
    },
    onSettled: () => {
      setLoading(false)
    }
  })

  const registerMutation = useMutation({
    mutationFn: (userData) => {
      console.log('Registration data:', userData); // Debug log
      
      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userData.email)) {
        throw new Error('Please enter a valid email address')
      }

      // Prepare registration data with trimming
      const registrationData = {
        email: userData.email.trim(),
        password: userData.password,
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        phone: userData.phone.trim(),
        country: (userData.country || 'UG').trim(),
        ...(userData.position && { position: Number(userData.position) }),
        ...(userData.referralCode?.trim() && { referralCode: userData.referralCode.trim() })
      };

      console.log('Exact Registration Payload:', JSON.stringify(registrationData, null, 2));
      
      return api.post('/auth/register', registrationData).then(response => {
        console.log('Registration successful:', response.data);
        const { accessToken, refreshToken } = response.data.data
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        setUser(response.data.data.user)
        setAuthTokens(accessToken, refreshToken)
        return response.data
      })
    },
    onMutate: () => {
      setLoading(true)
      toast('Creating your account...')
    },
    onSuccess: () => {
      toast('Account created successfully!')
      navigate('/dashboard')
    },
    onError: (error) => {
    

      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
    onSettled: () => {
      setLoading(false)
    }
  })

  const logoutMutation = useMutation({
    mutationFn: () => {
      return api.post('/auth/logout').then(() => {
        clearAuthTokens()
        setUser(null)
        return true
      })
    },
    onMutate: () => {
      toast('Signing out...')
    },
    onSuccess: () => {
      toast('Signed out successfully')
      navigate('/login')
    },
    onError: (error) => {
      // Even if the server call fails, we should still clear local storage and redirect
      clearAuthTokens()
      toast('Error signing out. Please try again.')
      console.error('Logout error:', error)
      setUser(null)
      navigate('/login')
    }
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }) => {
      return api.post('/auth/reset-password', { token, password }).then(response => response.data)
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)
      toast(errorMessage)
    }
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: (email) => {
      return api.post('/auth/forgot-password', { email }).then(response => response.data)
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)
      toast(errorMessage)
    }
  })

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) return null
      const response = await api.get('/auth/profile')
      return response.data.data
    },
    enabled: !!localStorage.getItem('accessToken'),
    retry: false,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  return {
    user,
    loading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    profile,
    isLoading: loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending
  }
}
