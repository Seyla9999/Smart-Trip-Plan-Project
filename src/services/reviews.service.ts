import API from '@/api/axios'

export interface Review {
  id: string
  attractionId: string
  authorName: string
  rating: number
  title?: string
  comment: string
  createdAt: string
}

export interface CreateReviewPayload {
  attractionSlug: string
  rating: number
  comment: string
  authorName: string
  title?: string
}

export async function getReviews(): Promise<Review[]> {
  const { data } = await API.get('/reviews')
  return data as Review[]
}

export async function getReviewsByAttraction(attractionId: string): Promise<Review[]> {
  const { data } = await API.get(`/reviews/attraction/${attractionId}`)
  return data as Review[]
}

export async function createReview(payload: CreateReviewPayload): Promise<Review> {
  const { data } = await API.post('/reviews', payload)
  return data as Review
}

export function averageRating(reviews: Review[]): number {
  if (!reviews || reviews.length === 0) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}
