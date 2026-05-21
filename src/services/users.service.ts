import API from '@/api/axios'

export const getAdminUsers = () => API.get('/users')
export const updateUserStatus = (id: string, status: 'active' | 'banned') =>
  API.patch(`/users/${id}/status`, { status })
export const createUser = (userData: any) => API.post('/users', userData)
