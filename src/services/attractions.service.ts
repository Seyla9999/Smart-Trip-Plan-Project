import API from '@/api/axios'
import { mockAttractions, mockCategories } from '@/data/mockAttractions'

export interface AttractionsFilterParams {
  search?: string
  category?: string
  categories?: string[]
  minRating?: number
  maxRating?: number
  province_id?: string
  mainCategory?: string
  amenities?: string[]
  maxEntryFee?: number
  isOpen?: boolean
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'DESC' | 'ASC'
}

export interface AttractionsResponse {
  data: Array<{
    id: string
    name: string
    description: string
    province_id: string
    category: string
    rating: number
    review_count: number
    address: string
    image_url: string
    entrance_fee?: number
    is_open: boolean
    amenities?: string[]
  }>
  pagination: {
    total: number
    limit: number
    offset: number
    pages: number
  }
}

// Get all attractions with filters
export const getAttractions = async (filters: AttractionsFilterParams) => {
  try {
    return await API.get<AttractionsResponse>('/attractions', { params: filters })
  } catch (error) {
    // Fallback to mock data when API is unavailable
    console.warn('API unavailable, using mock data')
    
    let filtered = [...mockAttractions]
    
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(search) || 
        a.description.toLowerCase().includes(search)
      )
    }
    
    if (filters.category) {
      filtered = filtered.filter(a => a.category === filters.category)
    }
    
    // Sort
    if (filters.sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (filters.sortBy === 'reviewCount') {
      filtered.sort((a, b) => (filters.sortOrder === 'ASC' ? a.review_count - b.review_count : b.review_count - a.review_count))
    } else if (filters.sortBy === 'createdAt') {
      // For mock data, just keep original order
    } else {
      // Default: rating
      filtered.sort((a, b) => (filters.sortOrder === 'ASC' ? a.rating - b.rating : b.rating - a.rating))
    }
    
    return {
      data: {
        data: filtered.slice(0, filters.limit || 20),
        pagination: {
          total: filtered.length,
          limit: filters.limit || 20,
          offset: filters.offset || 0,
          pages: Math.ceil(filtered.length / (filters.limit || 20))
        }
      }
    } as any
  }
}

// Get attractions by category
export const getAttractionsByCategory = (
  category: string,
  limit: number = 10,
  offset: number = 0
) => {
  return API.get(`/attractions/category/${category}`, {
    params: { limit, offset },
  })
}

// Get attractions by province
export const getAttractionsByProvince = (
  province_id: string,
  limit: number = 10,
  offset: number = 0
) => {
  return API.get(`/attractions/province/${province_id}`, {
    params: { limit, offset },
  })
}

// Get top-rated attractions
export const getTopRatedAttractions = (limit: number = 10) => {
  return API.get('/attractions/top-rated', { params: { limit } })
}

// Get all categories
export const getCategories = async () => {
  try {
    return await API.get<{ categories: string[] }>('/attractions/categories')
  } catch (error) {
    // Fallback to mock categories
    console.warn('API unavailable, using mock categories')
    return {
      data: {
        categories: mockCategories
      }
    } as any
  }
}

// Get attraction statistics
export const getAttractionStats = () => {
  return API.get('/attractions/statistics')
}

// Get single attraction
export const getAttractionById = (id: string) => {
  return API.get(`/attractions/${id}`)
}

// Create attraction (admin only)
export const createAttraction = (data: any) => {
  return API.post('/attractions', data)
}

// Update attraction (admin only)
export const updateAttraction = (id: string, data: any) => {
  return API.patch(`/attractions/${id}`, data)
}
