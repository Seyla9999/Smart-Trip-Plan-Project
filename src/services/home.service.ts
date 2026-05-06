import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
})

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
  const res = await API.get('/stories', { params: { limit } })
  return res.data.data
}

export async function getSponsors(): Promise<Sponsor[]> {
  const res = await API.get('/sponsors')
  return res.data.data
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