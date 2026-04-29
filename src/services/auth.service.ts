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
export const login = (data: {
  email: string
  password: string
}) => {
  return API.post('/auth/login', data)
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