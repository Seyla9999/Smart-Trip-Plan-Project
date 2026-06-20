import API from '@/api/axios'
import { clearAuthSession, markAuthActivity } from './auth-session.service'

// REGISTER
export const register = (data: {
  email: string
  password: string
  full_name: string
}) => {
  return API.post('/auth/register', data)
}

const storeAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token)
  localStorage.setItem('access_token', token)
  localStorage.setItem('token', token)
}

// LOGIN
export const login = async (data: {
  email: string
  password: string
}) => {
  const response = await API.post('/auth/login', data)
  
  const token = response.data.token ?? response.data.access_token ?? response.data.accessToken
  if (token) {
    storeAuthToken(token)
    markAuthActivity()
  }
  
  return response
}

// VERIFY
export const verify = (data: {
  email: string
  code: string
}) => {
  return API.post('/auth/verify', data)
}

export const resendCode = (data: { email: string }) =>
  API.post('/auth/resend', data)

// LOGOUT
export const logout = () => {
  clearAuthSession()
  window.location.href = '/login'
}