import API from '@/api/axios'

export interface NearbyImageRecord {
  id: string
  imageUrl: string
  placeSlug: string
  createdAt: string
}

export const getNearbyImages = (slug: string) =>
  API.get<{ data: NearbyImageRecord[] }>(`/nearby-images/${slug}`)

export const addNearbyImage = (placeSlug: string, imageUrl: string) =>
  API.post('/nearby-images', { place_slug: placeSlug, image_url: imageUrl })
