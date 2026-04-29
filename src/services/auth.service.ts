import API from '@/api/axios'

// REGISTER
export const register = (data: {
  email: string
  password: string
  full_name: string
}) => {
  return API.post('/auth/register', data)
}

// LOGIN
export const login = async (data: {
  email: string
  password: string
}) => {
  const response = await API.post('/auth/login', data)
  
  // Store token in localStorage
  if (response.data.token) {
    localStorage.setItem('auth_token', response.data.token)
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
  localStorage.removeItem('auth_token')
  window.location.href = '/login'
}