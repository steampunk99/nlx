import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Updated to match your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data, // Directly return the data
  (error) => {
    const message = error.response?.data?.message || 'An error occurred'
    return Promise.reject(new Error(message))
  }
)
