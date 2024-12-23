import axios from 'axios'
import { getAuthTokens, setAuthTokens, clearAuthTokens } from './auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Track if we're currently refreshing the token
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = getAuthTokens()
    
 

    if (accessToken && !config.url.includes('/auth/refresh')) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    console.error('Request Interceptor Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    
    return response
  },
  async (error) => {
    const originalRequest = error.config

  

    // Network error
    if (!error.response) {
      console.error('Network error:', error)
      return Promise.reject(new Error('Network error. Please check your internet connection and try again.'))
    }

    // Don't retry refresh token requests
    if (originalRequest.url.includes('/auth/refresh')) {
      clearAuthTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        } catch (err) {
          return Promise.reject(err)
        }
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { refreshToken } = getAuthTokens()
        
        console.log('Attempting token refresh')
        
        if (!refreshToken) {
          console.warn('No refresh token available')
          clearAuthTokens()
          window.location.href = '/login'
          return Promise.reject(new Error('No refresh token'))
        }

        const response = await api.post('/auth/refresh', { refreshToken })
        console.log('Token refresh response:', response.data)

        const { accessToken: newAccessToken } = response.data.data

        // Store the new tokens
        setAuthTokens({ accessToken: newAccessToken, refreshToken })
        
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        
        // Process queued requests
        processQueue(null, newAccessToken)
        
        return api(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        processQueue(refreshError, null)
        clearAuthTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
