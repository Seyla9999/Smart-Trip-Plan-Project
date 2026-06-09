import API from '@/api/axios'

export interface Province {
  id:                  number
  name_en:             string
  name_kh:             string
  description:         string
  main_image_url:      string
  attraction_count:    number
  accommodation_count: number
}

export interface Attraction {
  id:             string
  name_en:        string
  name_kh:        string
  category:       string
  description:    string
  is_hidden_gem:  boolean
  average_rating: number
  review_count:   number
  image_url:      string  
  province:       Province
}

export interface Story {
  id:            string
  title:         string
  content:       string
  created_at:    string
  user_id:       string
  user_name:     string
  user_avatar:   string
  user_username: string
  attachments:   { url: string; file_type: string }[]
}

export interface Sponsor {
  id:          string
  name:        string
  logo_url:    string
  website_url: string
  description: string
  tier:        string
  is_active?:  boolean
}

export interface Weather {
  province_id:    number
  province_name:  string
  temp_celsius:   number
  condition_text: string
  icon_url:       string
  last_updated:   string
}

export async function getProvinces(): Promise<Province[]> {
  const res = await API.get('/provinces')
  return res.data.data
}

export async function createProvince(data: any): Promise<any> {
  const res = await API.post('/provinces', data)
  return res.data.data
}

export async function getAttractionsByCategory(
  category: string,
  province?: string,
  limit = 4,
): Promise<Attraction[]> {
  const params: Record<string, string | number> = { category, limit }
  if (province && province !== 'All') params.province = province
  const res = await API.get('/attractions', { params })
  return res.data.data
}

export async function getHiddenGems(limit = 5): Promise<Attraction[]> {
  const res = await API.get('/attractions/hidden-gems', { params: { limit } })
  return res.data.data
}

export async function getStories(limit = 5): Promise<Story[]> {
  try {
    const res = await API.get('/stories', {
      params: { limit, status: 'published,approved' },
    })
    
    let stories: any[] = []
    if (Array.isArray(res.data)) {
      stories = res.data
    } else if (res.data?.data && Array.isArray(res.data.data)) {
      stories = res.data.data
    }
    
    console.log('✓ Stories loaded from Supabase DB:', stories.length, 'stories')
    
    // Map database stories to Story interface
    // Generate images based on title keywords for better visuals
    const mappedStories = stories.map((s: any, idx: number) => {
      const imageMap: Record<string, string> = {
        'mondulkiri': 'https://images.unsplash.com/photo-1548364837-35d37261e1c2?w=400&q=70',
        'koh': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70',
        'angkor': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70',
        'phnom penh': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=70',
        'kampot': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&q=70',
      }
      
      let imageUrl = ''
      const titleLower = s.title?.toLowerCase() || ''
      for (const [key, url] of Object.entries(imageMap)) {
        if (titleLower.includes(key)) {
          imageUrl = url
          break
        }
      }
      
      return {
        id: s.id,
        title: s.title || 'Untitled Story',
        content: s.content || '',
        created_at: s.created_at,
        user_id: s.user_id || 'unknown',
        user_name: 'Traveler', // Backend doesn't return author name yet
        user_avatar: '#4A7C59',
        user_username: '@traveler',
        attachments: imageUrl ? [{ url: imageUrl, file_type: 'image' }] : [],
      }
    })
    
    return mappedStories
  } catch (err: any) {
    console.error('✗ Failed to fetch stories from database:', {
      message: err.message,
      status: err.response?.status,
    })
    throw err
  }
}

export async function getSponsors(): Promise<Sponsor[]> {
  const res = await API.get('/sponsors')
  return res.data.data
}

export async function createSponsor(data: any): Promise<any> {
  const res = await API.post('/sponsors/save', data)
  return res.data
}

export async function getAllWeather(): Promise<Record<number, Weather>> {
  const res = await API.get('/weather')
  return res.data.data
}

export interface HomePageData {
  provinces:  Province[]
  hiddenGems: Attraction[]
  stories:    Story[]
  sponsors:   Sponsor[]
  weather:    Record<number, Weather>
}

export async function loadHomePage(): Promise<HomePageData> {
  const [provinces, hiddenGems, stories, sponsors, weather] =
    await Promise.allSettled([
      getProvinces(),
      getHiddenGems(5),
      getStories(5),
      getSponsors(),
      getAllWeather(),
    ])

  return {
    provinces:  provinces.status  === 'fulfilled' ? provinces.value  : [],
    hiddenGems: hiddenGems.status === 'fulfilled' ? hiddenGems.value : [],
    stories:    stories.status    === 'fulfilled' ? stories.value    : [],
    sponsors:   sponsors.status   === 'fulfilled' ? sponsors.value   : [],
    weather:    weather.status    === 'fulfilled' ? weather.value    : {},
  }
}