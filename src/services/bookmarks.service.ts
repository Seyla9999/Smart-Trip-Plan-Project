import API from '@/api/axios'

export interface BookmarkData {
  place_id: string
  place_name?: string
  place_type?: string
  place_image_url?: string
}

export interface BookmarkResponse {
  id: string
  user_id: string
  place_id: string
  place_name: string
  place_type: string
  place_image_url: string
  status: string
  created_at: Date
}

// Create a bookmark
export const createBookmark = (data: BookmarkData) => {
  return API.post<BookmarkResponse>('/bookmarks', data)
}

// Get user's bookmarks
export const getUserBookmarks = () => {
  return API.get<{ data: BookmarkResponse[] }>('/bookmarks')
}

// Remove a bookmark
export const removeBookmark = (bookmarkId: string) => {
  return API.delete(`/bookmarks/${bookmarkId}`)
}

// Archive a bookmark
export const archiveBookmark = (bookmarkId: string) => {
  return API.patch(`/bookmarks/${bookmarkId}/archive`)
}

// Check if a place is bookmarked (get from bookmarks list)
export const checkIfBookmarked = async (placeId: string) => {
  try {
    const response = await getUserBookmarks()
    return response.data.data.some((b) => b.place_id === placeId)
  } catch {
    return false
  }
}
