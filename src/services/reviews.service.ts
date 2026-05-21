import API from '@/api/axios'

export const getReviews = () => API.get('/reviews')

export const getReviewsByAttraction = (attractionId: string) =>
  API.get(`/reviews/attraction/${attractionId}`)

export const createReview = (reviewData: any) =>
  API.post('/reviews', reviewData)
