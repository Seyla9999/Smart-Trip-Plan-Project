<template>
  <div class="community-view">

    <!-- ── Composer Bar ──────────────────────────────────────── -->
    <div class="composer-bar">
      <div class="composer-bar__avatar">
        <img v-if="currentUser.avatar" :src="getAvatarSrc(currentUser.avatar)" :alt="currentUser.name" class="av-img" />
        <span v-else class="av-fallback">{{ currentUser.initials }}</span>
      </div>

      <div class="composer-bar__search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          v-model="localSearchQuery"
          class="composer-bar__input"
          placeholder="Search community stories…"
        />
        <button v-if="localSearchQuery" class="composer-bar__clear" @click="localSearchQuery = ''" aria-label="Clear">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <button class="composer-bar__post-btn" @click="showComposer = true">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Share Story
      </button>
    </div>

    <!-- ── Composer Modal ───────────────────────────────────── -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showComposer" class="modal-overlay" @click.self="cancelComposer">
          <div class="modal-container">
            <div class="modal-header">
                <div class="modal-header__left">
                <div class="modal-av">
                  <img v-if="currentUser.avatar" :src="getAvatarSrc(currentUser.avatar)" :alt="currentUser.name" class="av-img" />
                  <span v-else class="av-fallback av-sm">{{ currentUser.initials }}</span>
                </div>
                <div>
                  <h3 class="modal-title">New Story</h3>
                  <p class="modal-author">{{ currentUser.name }}</p>
                </div>
              </div>
              <button class="modal-close" @click="cancelComposer" aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="modal-body">
              <textarea
                v-model="newPost.body"
                class="form-textarea"
                placeholder="What did you discover in Cambodia? Share your experience…"
                rows="4"
              />

              <div class="form-group">
                <label class="form-label">Photos</label>
                <div class="image-upload-wrapper">
                  <label v-if="imagePreviews.length === 0" for="story-image-upload" class="upload-box-full">
                    <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" multiple class="hidden-input" id="story-image-upload" />
                    <div class="upload-box-content">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span class="upload-text-main">Add photos</span>
                      <span class="upload-text-sub">Up to 5 images</span>
                    </div>
                  </label>
                  <div v-else class="image-upload-grid">
                    <div v-for="(preview, idx) in imagePreviews" :key="idx" class="preview-item">
                      <img :src="preview" class="image-preview" />
                      <button class="remove-img-btn" @click.prevent="removeImage(idx)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    <label v-if="imagePreviews.length < 5" for="story-image-upload" class="upload-box">
                      <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" multiple class="hidden-input" id="story-image-upload" />
                      <div class="upload-box-content">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        <span>Add more</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Title</label>
                  <input v-model="newPost.title" class="form-input" placeholder="Give it a headline" />
                </div>
                <div class="form-group">
                  <label class="form-label">Location</label>
                  <input v-model="newPost.location" class="form-input" placeholder="Where were you?" />
                </div>
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <select v-model="newPost.category" class="form-input form-select">
                    <option value="">Select category</option>
                    <option v-for="c in composerCategories" :key="c" :value="c">{{ c }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Rating</label>
                  <div class="stars-input">
                    <button v-for="n in 5" :key="n" class="star-btn" :class="{ on: n <= newPost.rating }" @click="newPost.rating = n" type="button">
                      <svg width="20" height="20" viewBox="0 0 24 24" :fill="n <= newPost.rating ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-ghost" @click="cancelComposer" :disabled="isSubmitting">Discard</button>
              <button class="btn-primary" :disabled="!newPost.body.trim() || isSubmitting" @click="submitPost">
                {{ isSubmitting ? 'Publishing…' : 'Publish Story' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ── Main 2-col Layout ─────────────────────────────────── -->
    <div class="community-layout">

      <!-- Feed Column -->
      <div class="feed-col">

        <!-- Empty state -->
        <div v-if="!loading && stories.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <p class="empty-title">No stories yet</p>
          <p class="empty-sub">Be the first to share a travel experience from Cambodia.</p>
          <button class="btn-primary" @click="showComposer = true">Share a Story</button>
        </div>

        <!-- Story cards -->
        <article v-for="story in filteredStories" :key="story.id" class="post-card" :class="'cat--' + catKey(story.category)">

          <div class="post-card__accent" />

          <div class="post-header">
            <div class="post-header__av">
              <!-- avatar_url from users JOIN or author_avatar_url column; falls back to initials on error -->
              <img
                v-if="story.author.avatar && !brokenAvatars[story.id]"
                :src="getAvatarSrc(story.author.avatar)"
                :alt="story.author.name"
                class="av-img"
                @error="brokenAvatars[story.id] = true"
              />
              <span v-else class="av-fallback" :style="{ background: story.author.avatarColor || '#1D3557' }">{{ story.author.initials }}</span>
            </div>
            <div class="post-meta">
              <span class="post-author">{{ story.author.name }}</span>
              <div class="post-sub">
                <span class="post-date">{{ formatDate(story.publishedAt) }}</span>
                <span v-if="story.location" class="dot-sep">·</span>
                <span v-if="story.location" class="post-loc">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ story.location }}
                </span>
              </div>
            </div>
            <div class="post-header__right">
              <span class="cat-pill" :class="'cb-' + catKey(story.category)">{{ story.category }}</span>
              <div class="star-row">
                <svg v-for="n in 5" :key="n" width="11" height="11" viewBox="0 0 24 24" :fill="n <= story.rating ? '#C8922A' : 'none'" stroke="#C8922A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
            </div>
          </div>

          <div class="post-body">
            <h3 v-if="story.title" class="post-title">{{ story.title }}</h3>
            <p class="post-text">{{ story.excerpt }}</p>
          </div>

          <!-- Single image -->
          <div v-if="story.images && story.images.length === 1" class="post-img-wrap">
            <img
              :src="story.images[0]"
              :alt="story.title"
              class="post-img post-img--clickable"
              loading="lazy"
              @click="openImageViewer(story.images[0])"
            />
          </div>

          <!-- Multi image grid -->
          <div v-else-if="story.images && story.images.length > 1" class="post-img-grid" :class="'count-' + Math.min(story.images.length, 4)">
            <div v-for="(img, idx) in story.images.slice(0, 4)" :key="idx" class="post-img-item">
              <img
                :src="img"
                :alt="story.title"
                class="post-img post-img--clickable"
                loading="lazy"
                @click="openImageViewer(img)"
              />
              <div v-if="idx === 3 && story.images.length > 4" class="more-imgs-overlay">+{{ story.images.length - 3 }}</div>
            </div>
          </div>

          <!-- Legacy fallback -->
          <div v-else-if="story.image" class="post-img-wrap">
            <img
              :src="story.image"
              :alt="story.title"
              class="post-img post-img--clickable"
              loading="lazy"
              @click="openImageViewer(story.image)"
            />
          </div>

          <div class="post-footer">
            <div class="post-stats">
              <span class="stat-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {{ story.likes.toLocaleString() }}
              </span>
              <span class="stat-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {{ story.comments }}
              </span>
            </div>
            <div class="post-actions">
              <button class="act-btn" :class="{ 'act-liked': story.liked }" @click="handleToggleLike(story.id)">
                <svg width="15" height="15" viewBox="0 0 24 24" :fill="story.liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {{ story.liked ? 'Liked' : 'Like' }}
              </button>
              <button class="act-btn" :class="{ 'act-active': expandedComments[story.id] }" @click="toggleComments(story.id)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Comment
              </button>
            </div>
          </div>

          <!-- Comments section -->
          <div v-if="expandedComments[story.id]" class="post-comments">
            <div v-if="commentsLoading[story.id]" class="comments-loading">
              <div class="spinner-sm" /> Loading…
            </div>
            <div v-else-if="!commentsMap[story.id] || commentsMap[story.id].length === 0" class="comments-empty">
              No comments yet. Start the conversation.
            </div>
            <div v-else class="comments-list">
              <div v-for="comment in commentsMap[story.id]" :key="comment.id" class="comment-item">
                <div class="comment-av" :style="{ background: getCommentAvatarColor(comment.authorName) }">
                  {{ getCommentInitials(comment.authorName) }}
                </div>
                <div class="comment-bubble">
                  <div class="comment-meta">
                    <span class="comment-name">{{ comment.authorName }}</span>
                    <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.body }}</p>
                </div>
              </div>
            </div>
            <div class="comment-composer">
              <div class="comment-av" :style="{ background: '#2A9D8F' }">{{ currentUser.initials }}</div>
              <input
                v-model="newCommentText[story.id]"
                class="comment-input"
                placeholder="Add a comment…"
                @keyup.enter="submitComment(story.id)"
                :disabled="commentsSubmitting[story.id]"
              />
              <button
                class="comment-send"
                @click="submitComment(story.id)"
                :disabled="!newCommentText[story.id] || !newCommentText[story.id].trim() || commentsSubmitting[story.id]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>

        </article>

        <div v-if="hasMore" class="load-more">
          <button class="load-more-btn" @click="loadMore" :disabled="loading">
            {{ loading ? 'Loading…' : 'Load more stories' }}
          </button>
        </div>

        <div v-if="loading && stories.length === 0" class="feed-loading">
          <div class="spinner-lg" />
        </div>
      </div>

      <!-- Sidebar Column -->
      <aside class="sidebar-col">
        <!-- Profile card -->
        <div class="profile-card">
          <div class="profile-card__bg" />
          <div class="profile-card__body">
            <div class="profile-card__av-wrap">
              <img v-if="currentUser.avatar" :src="getAvatarSrc(currentUser.avatar)" :alt="currentUser.name" class="profile-av-img" />
              <span v-else class="profile-av-fallback">{{ currentUser.initials }}</span>
            </div>
            <h3 class="profile-name">{{ currentUser.name }}</h3>
            <p class="profile-handle">@{{ currentUser.name?.split(' ')[0]?.toLowerCase() }}</p>
            <div class="profile-stats">
              <div class="profile-stat">
                <span class="profile-stat__val">{{ userStoryCount }}</span>
                <span class="profile-stat__label">Stories</span>
              </div>
              <div class="profile-stat__div" />
              <div class="profile-stat">
                <span class="profile-stat__val">{{ userProvinceCount }}</span>
                <span class="profile-stat__label">Provinces</span>
              </div>
            </div>
            <a href="/profile" class="profile-link">View Profile</a>
          </div>
        </div>

        <Sidebar
          :trending-places="trendingPlaces"
          :travelers="topTravelers"
          :provinces="popularProvinces"
          @toggle-follow="toggleFollowTraveler"
        />
      </aside>
    </div>

    <div v-if="imageViewerUrl" class="image-viewer-overlay" @click.self="closeImageViewer">
      <button type="button" class="image-viewer-close" @click="closeImageViewer" aria-label="Close image viewer">
        ×
      </button>
      <img :src="imageViewerUrl" alt="Preview image" class="image-viewer-img" />
    </div>
  </div>
</template>

<script setup lang="ts">
import API from '@/api/axios'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { communityCategories } from '@/data/community'
import Sidebar from '@/components/community/sidebar/Sidebar.vue'
import { fetchStories, createStory, likeStory, getComments, addComment } from '@/services/community.service'
import { uploadImage } from '@/lib/supabase'
import type { Comment } from '@/services/community.service'
import type {
  CommunityCategory,
  CommunitySortOption,
  CommunityStory,
  StoryCategory,
  TopTraveler,
  TrendingPlace,
  PopularProvince,
} from '@/data/community'

const props = defineProps<{
  selectedCategory?: CommunityCategory
  searchQuery?: string
  sortOption?: CommunitySortOption
}>()

const stories = ref<CommunityStory[]>([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const hasMore = computed(() => stories.value.length < total.value)

const brokenAvatars = ref<Record<string, boolean>>({})

const userStoryCount = computed(() =>
  currentUser.value.id
    ? stories.value.filter(s => s.author?.id === currentUser.value.id).length
    : 0
)
const userProvinceCount = computed(() => {
  if (!currentUser.value.id) return 0
  const provinces = new Set(
    stories.value
      .filter(s => s.author?.id === currentUser.value.id && s.location)
      .map(s => s.location)
  )
  return provinces.size
})

const trendingPlaces = ref<TrendingPlace[]>([
  { id: 1, name: 'Angkor Wat', visits: 5234, category: 'Cultural' },
  { id: 2, name: 'Tonle Sap Lake', visits: 3421, category: 'Natural' },
  { id: 3, name: 'Koh Rong Island', visits: 2890, category: 'Sea' },
  { id: 4, name: 'Kbal Spean', visits: 1567, category: 'Waterfall' },
  { id: 5, name: 'Phnom Penh Markets', visits: 2103, category: 'Cultural' },
] as any[])

const topTravelers = ref<TopTraveler[]>([
  { id: 1, name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?img=1', following: false, stories: 24 },
  { id: 2, name: 'Marco Rodriguez', avatar: 'https://i.pravatar.cc/150?img=2', following: false, stories: 18 },
  { id: 3, name: 'Emma Thompson', avatar: 'https://i.pravatar.cc/150?img=3', following: false, stories: 15 },
] as any[])

const popularProvinces = ref<PopularProvince[]>([
  { id: 1, name: 'Siem Reap', slug: 'siem-reap', image: '/provinces/siem-reap.jpg', stories: 523 },
  { id: 2, name: 'Phnom Penh', slug: 'phnom-penh', image: '/provinces/phnom-penh.jpg', stories: 412 },
  { id: 3, name: 'Sihanoukville', slug: 'sihanoukville', image: '/provinces/sihanoukville.jpg', stories: 287 },
] as any[])

const localSearchQuery = ref(props.searchQuery || '')

const currentUser = ref({
  id: null as string | null,
  name: 'Traveler',
  avatar: null as string | null,
  initials: 'TR',
})

function updateCurrentUser() {
  try {
    const raw = localStorage.getItem('user_data')
              || localStorage.getItem('user')
              || localStorage.getItem('currentUser')
    if (raw) {
      const parsed = JSON.parse(raw)
      currentUser.value.id     = parsed.id || parsed.uuid || parsed.user_id || null
      currentUser.value.name   = parsed.name || parsed.username || parsed.full_name || parsed.email || 'Traveler'
      
      currentUser.value.avatar =
        parsed.avatar || parsed.avatar_url || parsed.profile_image || parsed.imageUrl || parsed.image || parsed.user_avatar || parsed.avatarUrl || parsed.photoURL || null
      currentUser.value.initials = currentUser.value.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
  } catch {}
}

// ── Liked stories (persisted) ────────────────────────────────
const LIKED_KEY = 'liked_stories'
function getLikedStories(): string[] {
  try { return JSON.parse(localStorage.getItem(LIKED_KEY) || '[]') } catch { return [] }
}
function saveLikedStory(id: string, liked: boolean) {
  const list = getLikedStories()
  if (liked && !list.includes(id)) list.push(id)
  else { const i = list.indexOf(id); if (i !== -1) list.splice(i, 1) }
  localStorage.setItem(LIKED_KEY, JSON.stringify(list))
}

// ── Comments ─────────────────────────────────────────────────
const expandedComments  = ref<Record<string, boolean>>({})
const commentsMap       = ref<Record<string, Comment[]>>({})
const commentsLoading   = ref<Record<string, boolean>>({})
const newCommentText    = ref<Record<string, string>>({})
const commentsSubmitting= ref<Record<string, boolean>>({})

const AVATAR_COLORS = ['#1D3557','#C8922A','#2D6A4F','#5C4B8A','#AE2012','#2A9D8F','#6B4C3B','#3b4a6b']
function getCommentInitials(name: string) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
function getCommentAvatarColor(name: string) {
  if (!name) return AVATAR_COLORS[0]
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
function getCurrentUserName() {
  try {
    const raw = localStorage.getItem('user_data') || localStorage.getItem('user') || localStorage.getItem('currentUser')
    if (raw) { const p = JSON.parse(raw); return p.name || p.username || p.full_name || p.email || 'Traveler' }
  } catch {}
  return 'Traveler'
}

function toggleComments(storyId: string) {
  expandedComments.value[storyId] = !expandedComments.value[storyId]
  if (expandedComments.value[storyId] && !commentsMap.value[storyId]?.length) loadComments(storyId)
}
async function loadComments(storyId: string) {
  commentsLoading.value[storyId] = true
  try { commentsMap.value[storyId] = await getComments(storyId) }
  catch (e) { console.error(e) }
  finally { commentsLoading.value[storyId] = false }
}
async function submitComment(storyId: string) {
  const text = (newCommentText.value[storyId] || '').trim()
  if (!text) return
  commentsSubmitting.value[storyId] = true
  try {
    const comment = await addComment(storyId, text, getCurrentUserName(), currentUser.value.id ?? undefined)
    if (!commentsMap.value[storyId]) commentsMap.value[storyId] = []
    commentsMap.value[storyId].push(comment)
    newCommentText.value[storyId] = ''
    const story = stories.value.find(s => s.id === storyId)
    if (story) story.comments++
  } catch (e) { console.error(e) }
  finally { commentsSubmitting.value[storyId] = false }
}

// ── Stories ──────────────────────────────────────────────────
async function loadStories(append = false) {
  loading.value = true
  try {
    const res = await fetchStories({ page: append ? page.value + 1 : 1, limit: 10 })
    const liked = getLikedStories()
    const mapped = res.data.map(s => ({ ...s, liked: liked.includes(s.id) }))
    if (append) { stories.value.push(...mapped); page.value++ }
    else { stories.value = mapped; page.value = 1 }
    total.value = res.total
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}
function loadMore() { loadStories(true) }

const imageViewerUrl = ref<string | null>(null)
function openImageViewer(url: string | null) {
  if (!url) return
  imageViewerUrl.value = url
}
function closeImageViewer() {
  imageViewerUrl.value = null
}


function getAvatarSrc(url: string | null | undefined): string {
  if (!url) return ''
  if (typeof url !== 'string') return ''
  if (url.startsWith('data:')) return url
  if (url.startsWith('http')) return url
  if (url.startsWith('/uploads') || url.startsWith('/storage') || url.startsWith('/images')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${baseUrl}${url}`;
  }
  return url
}

onMounted(() => {
  loadStories()
  updateCurrentUser()
  window.addEventListener('user-updated', updateCurrentUser)
  window.addEventListener('storage', updateCurrentUser)
})
onUnmounted(() => {
  window.removeEventListener('user-updated', updateCurrentUser)
  window.removeEventListener('storage', updateCurrentUser)
})

// ── Composer ─────────────────────────────────────────────────
const showComposer  = ref(false)
const isSubmitting  = ref(false)
const selectedFiles = ref<File[]>([])
const imagePreviews = ref<string[]>([])
const newPost = ref({ title: '', body: '', location: '', category: '' as StoryCategory | '', rating: 5 })
const composerCategories = communityCategories.filter((c): c is StoryCategory => c !== 'All')

function handleFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  const slots = 5 - selectedFiles.value.length
  Array.from(files).slice(0, slots).forEach(f => {
    selectedFiles.value.push(f)
    imagePreviews.value.push(URL.createObjectURL(f))
  })
}
function removeImage(i: number) { selectedFiles.value.splice(i, 1); imagePreviews.value.splice(i, 1) }
function cancelComposer() {
  showComposer.value = false
  newPost.value = { title: '', body: '', location: '', category: '', rating: 5 }
  selectedFiles.value = []
  imagePreviews.value = []
}
async function submitPost() {
  if (!newPost.value.body.trim() || isSubmitting.value) return
  isSubmitting.value = true
  try {
    let imageUrls: string[] = []
    if (selectedFiles.value.length > 0) {
      const results = await Promise.all(selectedFiles.value.map(f => uploadImage(f, 'story-images')))
      imageUrls = results.filter((u): u is string => !!u)
    }
    await createStory(
      { title: newPost.value.title, body: newPost.value.body, location: newPost.value.location, category: (newPost.value.category || 'Natural') as StoryCategory, rating: newPost.value.rating },
      imageUrls,
      { id: currentUser.value.id || undefined, name: currentUser.value.name, initials: currentUser.value.initials, avatar: currentUser.value.avatar || undefined }
    )
    alert('Your story has been submitted and is awaiting admin approval!')
    cancelComposer()
  } catch (e) { console.error(e) }
  finally { isSubmitting.value = false }
}

async function handleToggleLike(id: string) {
  const story = stories.value.find(s => s.id === id)
  if (!story) return
  const orig = story.liked
  story.liked = !story.liked
  story.likes += story.liked ? 1 : -1
  saveLikedStory(id, story.liked)
  try { await likeStory(id, story.liked) }
  catch { story.liked = orig; story.likes += story.liked ? 1 : -1; saveLikedStory(id, story.liked) }
}

const filteredStories = computed(() => {
  const kw  = localSearchQuery.value.trim().toLowerCase()
  const cat = props.selectedCategory ?? 'All'
  const sort= props.sortOption ?? 'latest'
  const list = stories.value.filter(s => {
    if (cat !== 'All' && s.category !== cat) return false
    if (!kw) return true
    return [s.title, s.excerpt, s.location, s.author.name, s.category].join(' ').toLowerCase().includes(kw)
  })
  return [...list].sort((a, b) => {
    if (sort === 'popular')   return b.likes - a.likes
    if (sort === 'discussed') return b.comments - a.comments
    if (sort === 'top-rated') return b.rating - a.rating
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })
})

function toggleFollowTraveler(id: number) {
  const t = topTravelers.value.find(t => t.id === id)
  if (t) t.following = !t.following
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return 'Recently'
  const h = Math.floor((Date.now() - d.getTime()) / 3_600_000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const CAT_MAP: Record<string, string> = {
  Natural: 'natural', Food: 'food', Sea: 'sea',
  Cultural: 'cultural', Waterfall: 'waterfall', Mountain: 'mountain', Forest: 'forest'
}
function catKey(c: string) { return CAT_MAP[c] ?? 'natural' }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Cinzel:wght@500;600&display=swap');

/* ── Tokens ──────────────────────────────────────────────────── */
.community-view,
.modal-overlay {
  --bg:            #F8F6F1;
  --surface:       #ffffff;
  --surface-warm:  #FDFAF4;
  --border:        #E8E2D6;
  --border-hover:  #D4CBBA;
  --text:          #1A1A2E;
  --text-muted:    #5A5A72;
  --text-dim:      #9896A8;
  --gold:          #C8922A;
  --gold-light:    #FBF3E2;
  --jade:          #2A9D8F;
  --jade-light:    #E6F5F4;
  --jade-hover:    #238577;
  --red:           #C0392B;
  --red-light:     #FDECEA;
  --radius:        14px;
  --radius-sm:     8px;
  --radius-pill:   999px;
  --shadow-card:   0 2px 12px rgba(26, 26, 46, 0.07);
  --shadow-modal:  0 32px 80px rgba(26, 26, 46, 0.22);
}

/* ── Layout root ─────────────────────────────────────────────── */
.community-view {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  padding: 28px 16px 80px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.community-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
}

@media (max-width: 1040px) {
  .community-layout {
    grid-template-columns: 1fr;
  }
  .sidebar-col {
    display: none;
  }
}

/* ── Composer bar ────────────────────────────────────────────── */
.composer-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 18px;
  box-shadow: var(--shadow-card);
}

.composer-bar__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--border);
}

.composer-bar__search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 0 14px;
  height: 40px;
  transition: border-color 0.2s, box-shadow 0.2s;
  color: var(--text-dim);
}
.composer-bar__search:focus-within {
  border-color: var(--jade);
  box-shadow: 0 0 0 3px var(--jade-light);
  color: var(--jade);
}

.composer-bar__input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: var(--text);
}
.composer-bar__input::placeholder { color: var(--text-dim); }

.composer-bar__clear {
  background: var(--border);
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.15s;
  padding: 0;
}
.composer-bar__clear:hover { background: var(--text-dim); color: #fff; }

.composer-bar__post-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--gold);
  color: #fff;
  border: none;
  border-radius: var(--radius-pill);
  padding: 0 20px;
  height: 40px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, transform 0.1s;
  flex-shrink: 0;
}
.composer-bar__post-btn:hover { background: #b07d20; transform: translateY(-1px); }
.composer-bar__post-btn:active { transform: translateY(0); }

/* ── Feed column ─────────────────────────────────────────────── */
.feed-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Post card ───────────────────────────────────────────────── */
.post-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.2s, transform 0.2s;
}
.post-card:hover {
  box-shadow: 0 6px 24px rgba(26, 26, 46, 0.11);
  transform: translateY(-1px);
}

/* Category accent strip */
.post-card__accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}
.cat--natural  .post-card__accent { background: linear-gradient(90deg, #2A9D8F, #52b788); }
.cat--food     .post-card__accent { background: linear-gradient(90deg, #C8922A, #e9c46a); }
.cat--sea      .post-card__accent { background: linear-gradient(90deg, #1D6FA4, #48cae4); }
.cat--cultural .post-card__accent { background: linear-gradient(90deg, #C8922A, #9b5de5); }
.cat--waterfall .post-card__accent { background: linear-gradient(90deg, #2A9D8F, #4361ee); }
.cat--mountain .post-card__accent { background: linear-gradient(90deg, #5C4B8A, #1D3557); }
.cat--forest   .post-card__accent { background: linear-gradient(90deg, #2D6A4F, #52b788); }

.post-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 20px 12px;
}

.post-header__av {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--border);
}

.post-meta {
  flex: 1;
  min-width: 0;
}
.post-author {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.post-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
  flex-wrap: wrap;
}
.post-date { font-size: 12px; color: var(--text-dim); }
.dot-sep   { font-size: 12px; color: var(--text-dim); }
.post-loc  {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--text-muted);
}

.post-header__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

/* Category pills */
.cat-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.cb-natural   { background: #e6f5f4; color: #2A9D8F; }
.cb-food      { background: #fbf3e2; color: #C8922A; }
.cb-sea       { background: #e0f0fa; color: #1D6FA4; }
.cb-cultural  { background: #f3effe; color: #7B5EA7; }
.cb-waterfall { background: #e6f5f4; color: #2A9D8F; }
.cb-mountain  { background: #eeedf5; color: #5C4B8A; }
.cb-forest    { background: #ebf5ee; color: #2D6A4F; }

.star-row {
  display: flex;
  gap: 1px;
}

.post-body {
  padding: 0 20px 14px;
}
.post-title {
  font-family: 'Cinzel', serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 8px;
  line-height: 1.4;
}
.post-text {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.65;
  margin: 0;
}

/* Image display */
.post-img-wrap {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  background: var(--bg);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.post-img { width: 100%; height: 100%; object-fit: cover; display: block; }

.post-img-grid {
  display: grid;
  gap: 2px;
  background: var(--border);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}
.post-img-grid.count-2 { grid-template-columns: 1fr 1fr; }
.post-img-grid.count-3 { grid-template-columns: 1fr 1fr; grid-template-rows: 200px 200px; }
.post-img-grid.count-3 .post-img-item:first-child { grid-row: span 2; }
.post-img-grid.count-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 200px 200px; }
.post-img-item { position: relative; overflow: hidden; min-height: 180px; }
.post-img-item .post-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.more-imgs-overlay {
  position: absolute;
  inset: 0;
  background: rgba(26, 26, 46, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
}

/* Post footer */
.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid var(--border);
  gap: 12px;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 14px;
}
.stat-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--text-muted);
}
.stat-chip svg { color: var(--text-dim); }

.post-actions {
  display: flex;
  gap: 8px;
}
.act-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
}
.act-btn:hover { border-color: var(--jade); color: var(--jade); background: var(--jade-light); }
.act-btn.act-liked { border-color: #fca5a5; color: var(--red); background: var(--red-light); }
.act-btn.act-active { border-color: var(--jade); color: var(--jade); background: var(--jade-light); }

/* Comments */
.post-comments {
  background: var(--surface-warm);
  border-top: 1px solid var(--border);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.comments-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-dim);
  justify-content: center;
  padding: 8px 0;
}
.comments-empty {
  font-size: 13px;
  color: var(--text-dim);
  text-align: center;
  padding: 8px 0;
  font-style: italic;
}
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 4px;
}
.comments-list::-webkit-scrollbar { width: 3px; }
.comments-list::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 2px; }
.comment-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.comment-av {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.comment-bubble {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  flex: 1;
}
.comment-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.comment-name { font-size: 12px; font-weight: 600; color: var(--text); }
.comment-time { font-size: 11px; color: var(--text-dim); }
.comment-text { font-size: 13px; color: var(--text-muted); margin: 0; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }

.comment-composer {
  display: flex;
  gap: 8px;
  align-items: center;
}
.comment-input {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 8px 16px;
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  color: var(--text);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.comment-input:focus { border-color: var(--jade); box-shadow: 0 0 0 3px var(--jade-light); }
.comment-input::placeholder { color: var(--text-dim); }

.comment-send {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--jade);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.comment-send:hover:not(:disabled) { background: var(--jade-hover); transform: scale(1.05); }
.comment-send:disabled { background: var(--border-hover); color: var(--text-dim); cursor: not-allowed; }

/* Shared avatar utils */
.av-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.av-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: #2A9D8F;
}
.av-sm { font-size: 11px; }

/* ── Load more / loading ─────────────────────────────────────── */
.load-more { display: flex; justify-content: center; padding: 8px 0; }
.load-more-btn {
  padding: 10px 28px;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--surface);
  color: var(--text-muted);
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
}
.load-more-btn:hover:not(:disabled) { border-color: var(--jade); color: var(--jade); }
.load-more-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.feed-loading { display: flex; justify-content: center; padding: 60px 0; }
.spinner-lg {
  width: 36px; height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--jade);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.spinner-sm {
  width: 14px; height: 14px;
  border: 2px solid rgba(0,0,0,0.1);
  border-top-color: var(--jade);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.post-img--clickable {
  cursor: pointer;
}

.image-viewer-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.84);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.image-viewer-img {
  max-width: min(100%, 1100px);
  max-height: min(100%, calc(100vh - 80px));
  border-radius: 18px;
  object-fit: contain;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35);
}

.image-viewer-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.image-viewer-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ── Empty state ─────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 32px;
  text-align: center;
}
.empty-icon {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: var(--jade-light);
  border: 2px solid var(--jade);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--jade);
}
.empty-title { font-size: 18px; font-weight: 600; color: var(--text); margin: 0; }
.empty-sub { font-size: 14px; color: var(--text-muted); max-width: 280px; margin: 0; }

/* ── Sidebar column ──────────────────────────────────────────── */
.sidebar-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 88px;
}

/* ── Profile card ────────────────────────────────────────────── */
.profile-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}
.profile-card__bg {
  height: 60px;
  background: linear-gradient(135deg, #1D3557 0%, #2A9D8F 60%, #C8922A 100%);
}
.profile-card__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px 22px;
  text-align: center;
}
.profile-card__av-wrap {
  width: 64px; height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--surface);
  margin-top: -32px;
  box-shadow: 0 2px 8px rgba(26, 26, 46, 0.15);
}
.profile-av-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.profile-av-fallback {
  width: 100%; height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--jade);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}
.profile-name {
  font-family: 'Cinzel', serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 12px 0 2px;
}
.profile-handle { font-size: 13px; color: var(--text-dim); margin: 0 0 16px; }

.profile-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
  width: 100%;
  justify-content: center;
}
.profile-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.profile-stat__val { font-size: 20px; font-weight: 700; color: var(--text); line-height: 1; }
.profile-stat__label { font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
.profile-stat__div { width: 1px; height: 30px; background: var(--border); }

.profile-link {
  display: inline-block;
  padding: 8px 24px;
  border: 1.5px solid var(--jade);
  border-radius: var(--radius-pill);
  color: var(--jade);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s;
}
.profile-link:hover { background: var(--jade); color: #fff; }

/* ── Modal ───────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 26, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.modal-container {
  background: var(--surface);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-modal);
  animation: modal-up 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes modal-up {
  from { transform: translateY(24px) scale(0.97); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}
.modal-header {
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-header__left { display: flex; align-items: center; gap: 12px; }
.modal-av {
  width: 40px; height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--border);
}
.modal-title {
  font-family: 'Cinzel', serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}
.modal-author { font-size: 12px; color: var(--text-dim); margin: 2px 0 0; }
.modal-close {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--bg);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.modal-close:hover { background: var(--border); color: var(--text); }

.modal-body { padding: 20px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 18px; }
.modal-footer {
  padding: 16px 22px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ── Form elements ───────────────────────────────────────────── */
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.form-input {
  height: 40px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: var(--text);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.form-input:focus { border-color: var(--jade); box-shadow: 0 0 0 3px var(--jade-light); }
.form-select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239896A8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }

.form-textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  padding: 12px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  color: var(--text);
  outline: none;
  resize: vertical;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
  line-height: 1.6;
}
.form-textarea:focus { border-color: var(--jade); box-shadow: 0 0 0 3px var(--jade-light); }
.form-textarea::placeholder { color: var(--text-dim); }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 500px) { .form-grid { grid-template-columns: 1fr; } }

/* Stars input */
.stars-input { display: flex; gap: 4px; }
.star-btn { background: none; border: none; cursor: pointer; padding: 2px; color: var(--border-hover); transition: color 0.1s, transform 0.1s; }
.star-btn.on { color: var(--gold); }
.star-btn:hover { transform: scale(1.15); }

/* Image upload */
.hidden-input { display: none; }
.upload-box-full {
  display: block;
  width: 100%;
  border: 2px dashed var(--border);
  border-radius: var(--radius-sm);
  padding: 36px 20px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg);
}
.upload-box-full:hover { border-color: var(--jade); background: var(--jade-light); }
.upload-box-full .upload-box-content { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-dim); }
.upload-box-full:hover .upload-box-content { color: var(--jade); }
.upload-text-main { font-size: 14px; font-weight: 600; color: var(--text); }
.upload-text-sub  { font-size: 12px; color: var(--text-muted); }

.image-upload-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 10px;
}
.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border);
}
.preview-item .image-preview { width: 100%; height: 100%; object-fit: cover; display: block; }
.remove-img-btn {
  position: absolute;
  top: 4px; right: 4px;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.remove-img-btn:hover { background: var(--red); }
.upload-box {
  aspect-ratio: 1;
  border: 2px dashed var(--border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg);
}
.upload-box:hover { border-color: var(--jade); background: var(--jade-light); color: var(--jade); }
.upload-box .upload-box-content { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 12px; color: var(--text-dim); }
.upload-box:hover .upload-box-content { color: var(--jade); }

/* ── Shared buttons ──────────────────────────────────────────── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: var(--jade);
  color: #fff;
  border: none;
  border-radius: var(--radius-pill);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.btn-primary:hover:not(:disabled) { background: var(--jade-hover); }
.btn-primary:disabled { background: var(--border-hover); color: var(--text-dim); cursor: not-allowed; }

.btn-ghost {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}
.btn-ghost:hover:not(:disabled) { border-color: var(--border-hover); color: var(--text); }
.btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Modal transition ────────────────────────────────────────── */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.22s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
</style>