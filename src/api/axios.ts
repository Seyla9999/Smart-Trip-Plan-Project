import axios from 'axios'
import { clearAuthSession, isAuthSessionExpired } from '@/services/auth-session.service'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

// Add JWT token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')

  if (token && isAuthSessionExpired()) {
    clearAuthSession()
    window.location.href = '/login'
    return Promise.reject(new axios.Cancel('Auth session expired'))
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if token exists (user was logged in)
      // If no token exists, the request was made without auth, which is expected for public endpoints
      const token = localStorage.getItem('auth_token')
      if (token) {
        clearAuthSession()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default API