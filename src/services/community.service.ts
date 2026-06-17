import API from '@/api/axios'
import type { CommunityStory, StoryCategory, ComposerSubmission } from '@/data/community'

// ---------------------------------------------------------------------------
// DB column → camelCase mapping reference (stories table)
//   id                uuid PK
//   user_id           uuid FK → users.id
//   trip_id           uuid FK → trips.id (nullable)
//   title             varchar
//   content           text              ← body text (NOT "body" or "description")
//   status            varchar           default 'pending'
//   created_at        timestamptz
//   updated_at        timestamptz
//   deleted_at        timestamptz       soft-delete flag
//   category          varchar           default 'Natural'
//   location          varchar           default 'Cambodia'
//   rating            int4
//   image_url         varchar           single cover image
//   video_url         varchar
//   likes_count       int4              default 0
//   comments_count    int4              default 0
//   published_at      timestamptz       default now()
//   author_avatar_url varchar           snapshot of author photo at post time
//
// Your backend may return these in camelCase or snake_case depending on your
// API layer. mapStory() handles both forms.
// ---------------------------------------------------------------------------

function mapStory(raw: any): CommunityStory {
  // ── Images ────────────────────────────────────────────────────────────────
  // DB has a single `image_url` column. Backend may wrap it as imageUrl,
  // image_url, imageUrls (array), etc.
  let images: string[] = []

  if (Array.isArray(raw.imageUrls) && raw.imageUrls.length > 0) {
    images = raw.imageUrls
  } else if (Array.isArray(raw.image_url) && raw.image_url.length > 0) {
    images = raw.image_url
  } else {
    // single-value forms — snake_case and camelCase
    const single =
      raw.imageUrl     ??   // camelCase from API transform
      raw.image_url    ??   // raw snake_case passthrough
      raw.image        ??   // legacy alias
      null
    if (typeof single === 'string' && single.trim()) {
      images = [single]
    } else if (Array.isArray(single)) {
      images = single.filter((s: any) => typeof s === 'string' && s.trim())
    }
  }
  images = images.filter(img => typeof img === 'string' && img.trim() !== '')

  // ── Author name ───────────────────────────────────────────────────────────
  // Backend JOIN with users table may expose name under different keys.
  // Priority: joined user name > stored author_name snapshot > fallback
  const authorName =
    raw.users?.name          ??   // Supabase-style nested join
    raw.users?.full_name     ??
    raw.users?.username      ??
    raw.author?.name         ??   // REST API nested object
    raw.authorName           ??   // flat camelCase
    raw.author_name          ??   // flat snake_case
    'Traveler'

  // ── Author avatar ─────────────────────────────────────────────────────────
  // Priority: live users.avatar_url from JOIN > stored author_avatar_url snapshot
  const authorAvatar =
    raw.users?.avatar_url    ??   // joined from users table (most up-to-date)
    raw.author?.avatar       ??   // REST API nested
    raw.authorAvatarUrl      ??   // flat camelCase
    raw.author_avatar_url    ??   // flat snake_case (stored snapshot)
    null

  // ── Author ID (user_id) ───────────────────────────────────────────────────
  const authorId =
    raw.users?.id            ??
    raw.author?.id           ??
    raw.userId               ??
    raw.user_id              ??
    undefined

  // ── Other fields ──────────────────────────────────────────────────────────
  // DB column is `content`, not `body`. Backend may camelCase it or pass raw.
  const bodyText =
    raw.content              ??   // raw DB column name (most likely)
    raw.body                 ??   // if your API transforms it
    ''

  // likes_count / comments_count from DB; backend may camelCase them
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

  // published_at from DB; fallback to created_at
  const publishedAt =
    raw.published_at         ??
    raw.publishedAt          ??
    raw.created_at           ??
    raw.createdAt            ??
    new Date().toISOString()

  // Generate initials + avatar colour from name (deterministic, no RNG)
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
    images,
    image:       images[0],
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
      handle:      raw.authorHandle ?? ('@' + authorName.split(' ')[0].toLowerCase()),
      initials:    raw.authorInitials ?? nameInitials,
      avatarColor: raw.authorAvatarColor ?? nameAvatarColor,
      // ← this is the key fix: real avatar from DB, not a hardcoded placeholder
      avatar:      authorAvatar ?? undefined,
      homeBase:    raw.authorHomeBase ?? raw.location ?? 'Cambodia',
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
    data:  (data.data ?? []).map(mapStory),
    total: data.total ?? 0,
  }
}

export async function createStory(
  payload: ComposerSubmission,
  imageUrls?: string[],
  author?: { id?: string; name: string; initials: string; avatar?: string },
): Promise<CommunityStory> {
  const body = {
    title:             payload.title,
    // DB column is `content` — send as both so any API transform works
    content:           payload.body,
    body:              payload.body,
    category:          payload.category,
    location:          payload.location || 'Cambodia',
    rating:            payload.rating,
    imageUrls:         imageUrls ?? [],
    // DB column is `user_id`
    userId:            author?.id ?? null,
    user_id:           author?.id ?? null,
    authorName:        author?.name ?? 'Traveler',
    authorInitials:    author?.initials ?? 'TR',
    // DB column is `author_avatar_url` — send as both forms
    authorAvatarUrl:   author?.avatar ?? null,
    author_avatar_url: author?.avatar ?? null,
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

export async function addComment(
  storyId: string,
  body: string,
  authorName: string,
): Promise<Comment> {
  const { data } = await API.post(`/stories/${storyId}/comments`, { body, authorName })
  return data as Comment
}

export async function fetchStats(): Promise<{ totalStories: number; totalLikes: number }> {
  const { data } = await API.get('/stories/stats')
  return data
}