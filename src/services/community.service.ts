import api from '@/api/axios'
import type { CommunityStory, StoryCategory, ComposerSubmission } from '@/data/community'

// Map backend story → frontend CommunityStory shape
function mapStory(raw: any): CommunityStory {
  return {
    id: raw.id,
    title: raw.title,
    excerpt: raw.content ?? '',
    image: raw.imageUrl ?? '',
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
  const { data } = await api.get('/community', { params })
  return {
    data: (data.data ?? []).map(mapStory),
    total: data.total ?? 0,
  }
}

export async function createStory(payload: ComposerSubmission, imageUrl?: string): Promise<CommunityStory> {
  const body = {
    title: payload.title,
    content: payload.body,
    category: payload.category,
    location: payload.location || 'Cambodia',
    rating: payload.rating,
    imageUrl: imageUrl ?? null,
    authorName: 'You',
    authorHandle: '@newtraveler',
    authorInitials: 'YO',
    authorAvatarColor: '#1a2340',
    authorHomeBase: 'Community member',
  }
  const { data } = await api.post('/community', body)
  return mapStory(data)
}

export async function likeStory(id: string, liked: boolean): Promise<void> {
  if (liked) {
    await api.post(`/community/${id}/like`)
  } else {
    await api.delete(`/community/${id}/like`)
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
  const { data } = await api.get(`/community/${storyId}/comments`)
  return data as Comment[]
}

export async function addComment(storyId: string, body: string, authorName: string): Promise<Comment> {
  const { data } = await api.post(`/community/${storyId}/comments`, { body, authorName })
  return data as Comment
}

export async function fetchStats(): Promise<{ totalStories: number; totalLikes: number }> {
  const { data } = await api.get('/community/stats')
  return data
}
