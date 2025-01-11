import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/axios'
import { clearAuthTokens } from '../lib/auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { userAtom, setAuthTokens } from '../lib/auth'
import  {usePackages}  from './usePackages'
import toast from 'react-hot-toast'

export function useAuth() {
  const [user, setUser] = useAtom(userAtom)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userPackage = usePackages()

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
     try {
      const response = await api.post('/auth/login', credentials)
      

      //validate response
      if (!response.data?.data?.user || !response.data?.data?.accessToken) {
        toast('Login failed: wrong email or password')
        clearAuthTokens()
        setUser(null)
        throw new Error('Invalid response format')
      }

      const { accessToken, refreshToken, user } = response.data.data
      // Set tokens first
      setAuthTokens(accessToken, refreshToken)
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      // Then update user state
      setUser(user)
     
      console.log('Login successful:', response.data)
     console.log('userPackage response..',userPackage.userPackage)
      return response.data
     } 
     catch (error) {
      const errorMessage = getErrorMessage(error)
      clearAuthTokens()
      setUser(null)
      toast.error(errorMessage)
      throw error
     }
    },
    onMutate: () => {
      
      setLoading(true)
     
    },
    onSuccess: (data) => {
      try {
      if(userPackage.userPackage) {
        toast.success('Welcome back')
        setTimeout(()=>navigate('/dashboard'),3000)
      }
      else {
        toast.success('No active subscription found')
        setTimeout(() =>navigate('/activation'),3000)
        console.log('credentials',data.credentials)
      }
      }
      catch(error) {
        console.error('Login error:', error)
        clearAuthTokens()
        setUser(null)
        throw error
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
      toast('Account created successfully!, please proceed to activate your account and start earning')

      setTimeout(() => navigate('/login'), 2000)
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
        try {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          clearAuthTokens()
          setUser(null)
          return true
        } catch (error) {
          console.error('Logout error:', error)
          return false
        }
      },
   
    onSuccess: () => {
     toast.success('Logged out successfully')
     setTimeout(() => navigate('/login'), 2000)
      
    },
    onError: (error) => {
      toast.error('Failed to sign out')
      
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
