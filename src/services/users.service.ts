import API from '@/api/axios'

export const getAdminUsers = async () => {
  try {
    const response = await API.get('/users')
    const users = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
        ? response.data.data
        : []

    return { data: { data: users } }
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return { data: { data: [] } }
    }
    throw error
  }
}

export const getUsersCount = async (): Promise<number> => {
  try {
    const res = await API.get('/users/count')
    if (typeof res.data === 'number') return res.data
    return Number(res.data?.count ?? 0)
  } catch (error) {
    console.error('Failed to load user count:', error)
    return 0
  }
}

export const updateUserStatus = (id: string, status: 'active' | 'banned') =>
  API.patch(`/users/${id}/status`, { status })
export const createUser = (userData: any) => API.post('/users', userData)
