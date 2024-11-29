import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { api } from '../lib/axios'
import { userAtom, setAuthTokens, clearAuthTokens } from '../lib/auth'

export function useAuth() {
  const [user, setUser] = useAtom(userAtom)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post('/auth/login', credentials)
      return response.data
    },
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data.data
      setUser(user)
      setAuthTokens(accessToken, refreshToken)
      navigate({ to: '/dashboard' })
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await api.post('/auth/register', userData)
      return response.data
    },
    onSuccess: (data) => {
      const { user, tokens } = data.data
      setUser(user)
      setAuthTokens(tokens.accessToken, tokens.refreshToken)
      navigate({ to: '/dashboard' })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout')
    },
    onSuccess: () => {
      setUser(null)
      clearAuthTokens()
      queryClient.clear()
      navigate({ to: '/login' })
    },
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email) => {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, newPassword }) => {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword,
      })
      return response.data
    },
  })

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user) return null
      const response = await api.get('/auth/profile')
      return response.data.data
    },
    enabled: !!user,
  })

  return {
    user: profile || user,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    isLoading: loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    isError: loginMutation.isError || registerMutation.isError || logoutMutation.isError,
    error: loginMutation.error || registerMutation.error || logoutMutation.error,
  }
}
