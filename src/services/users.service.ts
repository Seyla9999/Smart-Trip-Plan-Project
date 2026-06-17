import API from '@/api/axios'

const extractUsers = (data: any) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.users)) return data.users
  if (Array.isArray(data?.data?.users)) return data.data.users
  if (Array.isArray(data?.result)) return data.result
  return []
}

export const getAdminUsers = async () => {
  try {
    const response = await API.get('/users')
    let users = extractUsers(response.data)

    if (!users.length) {
      try {
        const altResponse = await API.get('/users', { params: { limit: 1000 } })
        users = extractUsers(altResponse.data)
      } catch (altError) {
        console.warn('Alternative users endpoint failed:', altError)
      }
    }

    return { data: users }
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return { data: [] }
    }
    throw error
  }
}

export const getUsersCount = async (): Promise<number> => {
  try {
    const res = await API.get('/users/count')
    if (typeof res.data === 'number') return res.data
    if (res.data?.count) return Number(res.data.count)

    try {
      const usersRes = await API.get('/users', { params: { limit: 1000 } })
      return extractUsers(usersRes.data).length
    } catch (fallbackError) {
      console.warn('Users count fallback failed:', fallbackError)
      return 0
    }
  } catch (error) {
    console.error('Failed to load user count:', error)
    return 0
  }
}

export const updateUserStatus = (id: string, status: 'active' | 'banned') =>
  API.patch(`/users/${id}/status`, { status })

export const getUserById = async (id: string) => {
  const response = await API.get(`/users/${id}`)
  return response.data?.data ?? response.data
}

export const createUser = (userData: any) => API.post('/users', userData)
