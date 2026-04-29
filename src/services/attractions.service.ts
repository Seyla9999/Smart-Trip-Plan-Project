import API from '@/api/axios'

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
export const getAttractions = (filters: AttractionsFilterParams) => {
  return API.get<AttractionsResponse>('/attractions', { params: filters })
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
export const getCategories = () => {
  return API.get<{ categories: string[] }>('/attractions/categories')
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
