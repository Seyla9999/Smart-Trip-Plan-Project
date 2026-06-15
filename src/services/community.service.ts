import API from '@/api/axios'
import type { CommunityStory, StoryCategory, ComposerSubmission } from '@/data/community'
function mapStory(raw: any): CommunityStory {
  let images: string[] = []

  if (Array.isArray(raw.imageUrls) && raw.imageUrls.length > 0) {
    images = raw.imageUrls
  } else if (Array.isArray(raw.imageUrl) && raw.imageUrl.length > 0) {
    images = raw.imageUrl
  } else {
    const single = raw.imageUrl || raw.image_url || raw.image || raw.imageUrls || null
    if (single && typeof single === 'string') {
      images = [single]
    } else if (single && Array.isArray(single)) {
      images = single
    }
  }

  images = images.filter(img => typeof img === 'string' && img.trim() !== '')

  return {
    id: raw.id,
    title: raw.title,
    excerpt: raw.content ?? '',
    images: images,
    category: (raw.category ?? 'Natural') as StoryCategory,
    location: raw.location ?? 'Cambodia',
    likes: raw.likesCount ?? 0,
    comments: raw.commentsCount ?? 0,
    rating: raw.rating ?? 3,
    publishedAt: raw.publishedAt ?? raw.createdAt,
    author: {
      name: raw.authorName ?? 'Traveler',
      handle: raw.authorHandle ?? '@traveler',
      initials: raw.authorInitials ?? 'T',
      avatarColor: raw.authorAvatarColor ?? '#1a2340',
      avatar: raw.authorAvatarUrl ?? null,
      homeBase: raw.authorHomeBase ?? '',
    },
    liked: false,
  }
}

export interface StoriesResponse {
  data: CommunityStory[]
  total: number
}

export async function fetchStories(params?: {
  category?: string
  sort?: string
  search?: string
  page?: number
  limit?: number
}): Promise<StoriesResponse> {
  const { data } = await API.get('/stories', {
    params: { ...params, status: 'published,approved' },
  })
  return {
    data: (data.data ?? []).map(mapStory),
    total: data.total ?? 0,
  }
}

export async function createStory(
  payload: ComposerSubmission, 
  imageUrls?: string[],
  author?: { id?: string; name: string; initials: string; avatar?: string }
): Promise<CommunityStory> {
  const body = {
    title: payload.title,
    content: payload.body,
    category: payload.category,
    location: payload.location || 'Cambodia',
    rating: payload.rating,
    imageUrls: imageUrls ?? [],
    userId: author?.id ?? null,
    authorName: author?.name ?? 'You',
    authorHandle: '@newtraveler',
    authorInitials: author?.initials ?? 'YO',
    authorAvatarColor: '#1a2340',
    authorAvatarUrl: author?.avatar ?? null,
    authorHomeBase: 'Community member',
  }
  const { data } = await API.post('/stories', body)
  return mapStory(data)
}

export async function likeStory(id: string, liked: boolean): Promise<void> {
  if (liked) {
    await API.post(`/stories/${id}/like`)
  } else {
    await API.delete(`/stories/${id}/like`)
  }
}

export interface Comment {
  id: string
  storyId: string
  authorName: string
  body: string
  createdAt: string
}

export async function getComments(storyId: string): Promise<Comment[]> {
  const { data } = await API.get(`/stories/${storyId}/comments`)
  return data as Comment[]
}

export async function addComment(storyId: string, body: string, authorName: string): Promise<Comment> {
  const { data } = await API.post(`/stories/${storyId}/comments`, { body, authorName })
  return data as Comment
}

export async function fetchStats(): Promise<{ totalStories: number; totalLikes: number }> {
  const { data } = await API.get('/stories/stats')
  return data
}
