import API from '@/api/axios'

export interface BookmarkData {
  place_id: string
  place_name?: string
  place_type?: string
  place_image_url?: string
}

export interface BookmarkResponse {
  id: string
  userId: string
  placeId: string
  placeName: string
  placeType: string
  placeImageUrl: string
  status: string
  createdAt: string
}

function getCurrentUserId(): string | null {
  try {
    const raw = localStorage.getItem('user_data')
    return raw ? JSON.parse(raw)?.id ?? null : null
  } catch {
    return null
  }
}

export const createBookmark = (data: BookmarkData) => {
  const userId = getCurrentUserId()
  return API.post<BookmarkResponse>('/bookmarks', {
    userId,
    place_id: data.place_id,
    place_name: data.place_name,
    place_type: data.place_type,
    place_image_url: data.place_image_url,
  })
}

export const getUserBookmarks = () => {
  const userId = getCurrentUserId()
  return API.get<{ data: BookmarkResponse[] }>('/bookmarks', { params: { userId } })
}

export const removeBookmark = (bookmarkId: string) => {
  const userId = getCurrentUserId()
  return API.delete(`/bookmarks/${bookmarkId}`, { params: { userId } })
}

export const archiveBookmark = (bookmarkId: string) => {
  return API.patch(`/bookmarks/${bookmarkId}/archive`)
}

export const checkIfBookmarked = async (placeId: string): Promise<{ bookmarked: boolean; bookmarkId: string | null }> => {
  try {
    const response = await getUserBookmarks()
    const match = response.data.data.find((b) => b.placeId === placeId)
    return { bookmarked: !!match, bookmarkId: match?.id ?? null }
  } catch {
    return { bookmarked: false, bookmarkId: null }
  }
}
