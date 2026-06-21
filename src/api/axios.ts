import axios from 'axios'
import { clearAuthSession, getStoredAuthToken, isAuthSessionExpired } from '@/services/auth-session.service'

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`,
})

// Add JWT token to requests
API.interceptors.request.use((config) => {
  const token = getStoredAuthToken()

  // if (token && isAuthSessionExpired()) {
  //   clearAuthSession()
  //   window.location.href = '/login?timeout=1'
  //   return Promise.reject(new axios.Cancel('Auth session expired'))
  // }

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
      const token = getStoredAuthToken()
      if (token) {
        // clearAuthSession()
        // window.location.href = '/login?timeout=1'
      }
    }
    return Promise.reject(error)
  }
)

export default API