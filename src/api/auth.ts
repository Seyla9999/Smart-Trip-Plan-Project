import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' }
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normalize errors so components get a clean message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      'Something went wrong'
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message))
  }
)

export const authApi = {
  signIn: async (body: { email: string; password: string }) => {
    const { data } = await api.post('/auth/sign-in', body)
    return data // { access_token, user }
  },

  signUp: async (body: { email: string; username: string; password: string }) => {
    const { data } = await api.post('/auth/sign-up', body)
    return data // { access_token, user }
  },

  getProfile: async () => {
    const { data } = await api.get('/auth/profile')
    return data // User
  }
}