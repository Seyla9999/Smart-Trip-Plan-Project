import API from '@/api/axios'
import type { CommunityStory, StoryCategory, ComposerSubmission } from '@/data/community'


function normalizeImageList(value: any): string[] {
  if (!value && value !== '') return []
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeImageList(item))
      .filter((img): img is string => typeof img === 'string' && img.trim() !== '')
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const contents = trimmed.slice(1, -1)
      return contents
        .split(',')
        .map((img) => img.trim().replace(/^"|"$/g, ''))
        .filter((img) => img !== '')
    }

    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed
          .flatMap((item) => normalizeImageList(item))
          .filter((img): img is string => typeof img === 'string' && img.trim() !== '')
      }
      if (typeof parsed === 'string' && parsed.trim()) {
        return [parsed.trim()]
      }
    } catch {

    }

    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map((img) => img.trim().replace(/^"|"$/g, ''))
        .filter((img) => img !== '')
    }
    return [trimmed]
  }
  if (typeof value === 'object' && value !== null) {
    if (typeof value.url === 'string' && value.url.trim()) return [value.url.trim()]
    if (typeof value.image_url === 'string' && value.image_url.trim()) return [value.image_url.trim()]
  }
  return []
}

function mapStory(raw: any): CommunityStory {

  const images = [
    ...normalizeImageList(raw.imageUrls),
    ...normalizeImageList(raw.images),
    ...normalizeImageList(raw.image_url),
    ...normalizeImageList(raw.imageUrl),
    ...normalizeImageList(raw.image),
  ]
  const uniqueImages = [...new Set(images.filter((img) => typeof img === 'string' && img.trim() !== ''))]


  const authorName =
    raw.users?.name          ??   
    raw.users?.full_name     ??
    raw.users?.username      ??
    raw.user?.name           ??
    raw.user?.full_name      ??
    raw.user?.username       ??
    raw.authorName           ??  
    raw.author_name          ??
    raw.author?.name         ??
    'Traveler'


  const authorAvatar =
    raw.users?.avatar_url    ??   
    raw.users?.profile_image ??
    raw.users?.avatar        ??
    raw.user?.avatar_url     ??  
    raw.user?.profile_image  ??
    raw.user?.avatar         ??
    raw.authorAvatarUrl      ??  
    raw.author_avatar_url    ??  
    raw.author?.avatar       ??
    null

  const authorId =
    raw.users?.id            ??
    raw.user?.id            ??
    raw.userId              ??
    raw.user_id             ??
    raw.author?.id          ??
    undefined

  const authorHandle =
    raw.users?.username     ??
    raw.user?.username      ??
    raw.authorHandle        ??
    raw.author_handle       ??
    (authorName
      ? ('@' + String(authorName).split(' ')[0].toLowerCase())
      : '@traveler')

  const bodyText =
    raw.content              ??  
    raw.body                 ??   
    ''

  const likesCount =
    raw.likes_count          ??
    raw.likesCount           ??
    raw.likes                ??
    0

  const commentsCount =
    raw.comments_count       ??
    raw.commentsCount        ??
    raw.comments             ??
    0

  const publishedAt =
    raw.published_at         ??
    raw.publishedAt          ??
    raw.created_at           ??
    raw.createdAt            ??
    new Date().toISOString()

  const nameInitials = authorName
    .split(' ')
    .map((w: string) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'TR'

  const AVATAR_COLORS = [
    '#1D3557', '#C8922A', '#2D6A4F', '#5C4B8A',
    '#AE2012', '#2A9D8F', '#6B4C3B', '#3b4a6b',
  ]
  let h = 0
  for (let i = 0; i < authorName.length; i++) h = authorName.charCodeAt(i) + ((h << 5) - h)
  const nameAvatarColor = AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]

  return {
    id:          raw.id,
    title:       raw.title ?? '',
    excerpt:     bodyText.slice(0, 200),
    body:        bodyText,
    images:      uniqueImages,
    image:       uniqueImages[0],
    video:       raw.video_url ?? raw.videoUrl ?? undefined,
    category:    (raw.category ?? 'Natural') as StoryCategory,
    location:    raw.location ?? 'Cambodia',
    rating:      raw.rating ?? 0,
    likes:       likesCount,
    comments:    commentsCount,
    publishedAt,
    status:      raw.status ?? 'pending',
    liked:       false, // set by component from localStorage
    author: {
      id:          authorId,
      name:        authorName,
      handle:      authorHandle,
      initials:    raw.authorInitials ?? nameInitials,
      avatarColor: raw.authorAvatarColor ?? nameAvatarColor,
      avatar:      authorAvatar ?? undefined,
      homeBase:    raw.authorHomeBase ?? raw.location ?? 'Cambodia',
    },
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

  const storiesPayload = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : []

  const total =
    typeof data?.total === 'number' ? data.total :
    typeof data?.meta?.total === 'number' ? data.meta.total :
    storiesPayload.length

  return {
    data: storiesPayload.map(mapStory),
    total,
  }
}

export async function createStory(
  payload: ComposerSubmission,
  imageUrls?: string[],
  author?: { id?: string; name: string; initials: string; avatar?: string },
): Promise<CommunityStory> {
  const body = {
    title:        payload.title,
    content:      payload.body,
    body:         payload.body,
    category:     payload.category,
    location:     payload.location || 'Cambodia',
    rating:       payload.rating,

    image_url:    imageUrls?.[0] ?? null,
    imageUrl:     imageUrls?.[0] ?? null,
    imageUrls:    imageUrls ?? [],
    video_url:    payload.videoUrl ?? undefined,
    videoUrl:     payload.videoUrl ?? undefined,
    // DB column is `user_id`.
    user_id:      author?.id ?? null,
    userId:       author?.id ?? null,
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
  userId?: string
  authorName: string
  body: string
  createdAt: string
}

export async function getComments(storyId: string): Promise<Comment[]> {
  const { data } = await API.get(`/stories/${storyId}/comments`)
  return data as Comment[]
}

export async function addComment(
  storyId: string,
  body: string,
  authorName: string,
  userId?: string,
): Promise<Comment> {
  const payload: Record<string, unknown> = { body, authorName }
  if (userId) {
    payload.userId = userId
    payload.user_id = userId
  }
  const { data } = await API.post(`/stories/${storyId}/comments`, payload)
  return data as Comment
}

export async function fetchStats(): Promise<{ totalStories: number; totalLikes: number }> {
  const { data } = await API.get('/stories/stats')
  return data
}