<template>
  <div class="community-view">
    <div class="composer-card">
      <div class="composer-top">
        <div v-if="currentUser.avatar" class="avatar-img-wrap">
          <img :src="currentUser.avatar" :alt="currentUser.name" class="avatar-img" />
        </div>
        <div v-else class="avatar av-you">{{ currentUser.initials }}</div>
        <div class="composer-user-info">
          <div class="composer-user-name">{{ currentUser.name }}</div>
          <div v-if="currentUser.name" class="composer-user-handle">@{{ currentUser.name.split(' ')[0].toLowerCase() }}</div>
        </div>
        
        <div class="composer-search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            v-model="localSearchQuery" 
            class="composer-search-input" 
            placeholder="Search stories or share your own..." 
          />
          <button v-if="localSearchQuery" class="clear-search" @click="localSearchQuery = ''" aria-label="Clear search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <button class="compose-btn" @click="showComposer = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Post
        </button>
      </div>
    </div>

    <!-- Composer Modal -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showComposer" class="modal-overlay" @click.self="cancelComposer">
          <div class="modal-container">
            <div class="modal-header">
              <div class="header-left">
                <div v-if="currentUser.avatar" class="avatar-sm">
                  <img :src="currentUser.avatar" :alt="currentUser.name" class="avatar-img" />
                </div>
                <div v-else class="avatar-sm av-you">{{ currentUser.initials }}</div>
                <h3>Create New Story</h3>
              </div>
              <button class="close-modal" @click="cancelComposer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="modal-body">
              <textarea
                v-model="newPost.body"
                class="form-textarea"
                placeholder="Write something inspiring..."
                rows="4"
              />

              <div class="form-group mb-6">
                <label class="form-label">Add Photos</label>
                <div class="image-upload-wrapper">
                  <label v-if="imagePreviews.length === 0" for="story-image-upload" class="upload-box-full">
                    <input 
                      type="file" 
                      ref="fileInput" 
                      @change="handleFileChange" 
                      accept="image/*" 
                      multiple
                      class="hidden-input" 
                      id="story-image-upload" 
                    />
                  </label>
                  
                  <div v-else class="image-upload-grid">
                    <div v-for="(preview, idx) in imagePreviews" :key="idx" class="preview-item">
                      <img :src="preview" class="image-preview" />
                      <button class="remove-img-btn" @click.prevent="removeImage(idx)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    
                    <label v-if="imagePreviews.length < 5" for="story-image-upload" class="upload-box">
                      <input 
                        type="file" 
                        ref="fileInput" 
                        @change="handleFileChange" 
                        accept="image/*" 
                        multiple
                        class="hidden-input" 
                        id="story-image-upload" 
                      />
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
                    <button
                      v-for="n in 5" :key="n"
                      class="star-btn"
                      :class="{ on: n <= newPost.rating }"
                      @click="newPost.rating = n"
                      type="button"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" :fill="n <= newPost.rating ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-ghost" @click="cancelComposer" :disabled="isSubmitting">Discard</button>
              <button class="btn-primary" :disabled="!newPost.body.trim() || isSubmitting" @click="submitPost">
                {{ isSubmitting ? 'Publishing...' : 'Publish Story' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Empty -->
    <div v-if="!loading && stories.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      </div>
      <p>No stories yet. Be the first to share.</p>
    </div>

    <!-- Posts -->
    <article v-for="story in filteredStories" :key="story.id" class="post-card">

      <div class="post-header">
        <div v-if="story.author.avatar" class="avatar avatar-has-img">
          <img :src="story.author.avatar" :alt="story.author.name" class="avatar-img" />
        </div>
        <div v-else class="avatar" :style="{ background: story.author.avatarColor || '#3b4a6b' }">
          {{ story.author.initials }}
        </div>
        <div class="post-meta">
          <span class="post-author">{{ story.author.name }}</span>
          <div class="post-sub">
            <span class="post-date">{{ formatDate(story.publishedAt) }}</span>
            <span class="dot-sep">·</span>
            <span class="cat-badge" :class="catClass(story.category)">{{ story.category }}</span>
          </div>
        </div>
        <div class="post-header-right">
          <div class="star-display">
            <svg v-for="n in 5" :key="n" width="11" height="11" viewBox="0 0 24 24" :fill="n <= story.rating ? '#f59e0b' : 'none'" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <button class="more-btn" aria-label="More options">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
          </button>
        </div>
      </div>

      <div class="post-body">
        <h3 v-if="story.title" class="post-title">{{ story.title }}</h3>
        <p class="post-text">{{ story.excerpt }}</p>
        <div v-if="story.location" class="post-location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {{ story.location }}
        </div>
      </div>

      <!-- Single Image -->
      <div v-if="story.images && story.images.length === 1" class="post-img-wrap">
        <img :src="story.images[0]" :alt="story.title" class="post-img" loading="lazy" />
      </div>

      <!-- Multiple Images Grid -->
      <div v-else-if="story.images && story.images.length > 1" class="post-img-grid" :class="'count-' + Math.min(story.images.length, 4)">
        <div v-for="(img, idx) in story.images.slice(0, 4)" :key="idx" class="post-img-item">
          <img :src="img" :alt="story.title" class="post-img" loading="lazy" />
          <div v-if="idx === 3 && story.images.length > 4" class="more-images-overlay">
            +{{ story.images.length - 3 }}
          </div>
        </div>
      </div>
      
      <!-- Fallback for legacy single image if images array is somehow empty but item.image exists (though mapStory handles this) -->
      <div v-else-if="story.image" class="post-img-wrap">
        <img :src="story.image" :alt="story.title" class="post-img" loading="lazy" />
      </div>

      <div class="post-footer">
        <div class="post-stats">
          <div class="stat-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span>{{ story.likes.toLocaleString() }}</span>
          </div>
          <div class="stat-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>{{ story.comments }}</span>
          </div>
        </div>

        <div class="post-actions">
          <button
            class="act-btn"
            :class="{ 'act-liked': story.liked }"
            @click="handleToggleLike(story.id)"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" :fill="story.liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {{ story.liked ? 'Liked' : 'Like' }}
          </button>
          <button
            class="act-btn"
            :class="{ 'act-active': expandedComments[story.id] }"
            @click="toggleComments(story.id)"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Comment
          </button>
        </div>
      </div>

      <!-- Comments section -->
      <div v-if="expandedComments[story.id]" class="post-comments">
        <div v-if="commentsLoading[story.id]" class="comments-loading">
          <div class="spinner-sm" /> Loading comments...
        </div>
        
        <div v-else-if="!commentsMap[story.id] || commentsMap[story.id].length === 0" class="comments-empty">
          No comments yet. Be the first to share your thoughts!
        </div>
        
        <div v-else class="comments-list">
          <div v-for="comment in commentsMap[story.id]" :key="comment.id" class="comment-item">
            <div class="comment-avatar" :style="{ background: getCommentAvatarColor(comment.authorName) }">
              {{ getCommentInitials(comment.authorName) }}
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author">{{ comment.authorName }}</span>
                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <p class="comment-body">{{ comment.body }}</p>
            </div>
          </div>
        </div>

        <div class="comment-composer">
          <input
            v-model="newCommentText[story.id]"
            class="comment-input"
            placeholder="Write a comment..."
            @keyup.enter="submitComment(story.id)"
            :disabled="commentsSubmitting[story.id]"
          />
          <button
            class="comment-submit-btn"
            @click="submitComment(story.id)"
            :disabled="!newCommentText[story.id] || !newCommentText[story.id].trim() || commentsSubmitting[story.id]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>

    </article>
    
    <div v-if="hasMore" class="load-more-wrap">
      <button class="btn-ghost" @click="loadMore" :disabled="loading">
        {{ loading ? 'Loading...' : 'Load more stories' }}
      </button>
    </div>
    <!-- Sidebar -->
    <aside class="community-sidebar">
      <!-- User Profile Card -->
      <div class="profile-card">
        <div class="profile-header">
          <div v-if="currentUser.avatar" class="profile-avatar-wrap">
            <img :src="currentUser.avatar" :alt="currentUser.name" class="profile-avatar" />
          </div>
          <div v-else class="profile-avatar av-profile">{{ currentUser.initials }}</div>
        </div>
        <div class="profile-body">
          <h3 class="profile-name">{{ currentUser.name }}</h3>
          <p v-if="currentUser.name" class="profile-handle">@{{ currentUser.name.split(' ')[0].toLowerCase() }}</p>
          <div class="profile-stats">
            <div class="stat">
              <div class="stat-value">0</div>
              <div class="stat-label">Stories</div>
            </div>
            <div class="stat">
              <div class="stat-value">0</div>
              <div class="stat-label">Followers</div>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  communityCategories,
} from '@/data/community'
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

// Sidebar data
const trendingPlaces = ref<TrendingPlace[]>([
  { id: 1, name: 'Angkor Wat', visits: 5234, category: 'Cultural' },
  { id: 2, name: 'Tonle Sap Lake', visits: 3421, category: 'Natural' },
  { id: 3, name: 'Koh Rong Island', visits: 2890, category: 'Beach' },
  { id: 4, name: 'Kbal Spean', visits: 1567, category: 'Waterfall' },
  { id: 5, name: 'Phnom Penh Markets', visits: 2103, category: 'Cultural' },
])

const topTravelers = ref<TopTraveler[]>([
  { id: 1, name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?img=1', following: false, stories: 24 },
  { id: 2, name: 'Marco Rodriguez', avatar: 'https://i.pravatar.cc/150?img=2', following: false, stories: 18 },
  { id: 3, name: 'Emma Thompson', avatar: 'https://i.pravatar.cc/150?img=3', following: false, stories: 15 },
])

const popularProvinces = ref<PopularProvince[]>([
  { id: 1, name: 'Siem Reap', slug: 'siem-reap', image: '/provinces/siem-reap.jpg', stories: 523 },
  { id: 2, name: 'Phnom Penh', slug: 'phnom-penh', image: '/provinces/phnom-penh.jpg', stories: 412 },
  { id: 3, name: 'Sihanoukville', slug: 'sihanoukville', image: '/provinces/sihanoukville.jpg', stories: 287 },
])

// Search state
const localSearchQuery = ref(props.searchQuery || '')

// User state
const currentUser = ref({
  id: null as string | null,
  name: 'You',
  avatar: null as string | null,
  initials: 'YO',
})

function updateCurrentUser() {
  try {
    const raw = localStorage.getItem('user_data')
              || localStorage.getItem('user')
              || localStorage.getItem('currentUser')
    if (raw) {
      const parsed = JSON.parse(raw)
      currentUser.value.id = parsed.id || parsed.uuid || parsed.user_id || null
      currentUser.value.name = parsed.name || parsed.username || parsed.full_name || parsed.user_name || parsed.user?.name || parsed.email || 'You'
      currentUser.value.avatar = parsed.avatar || parsed.avatar_url || parsed.profile_image || parsed.imageUrl || parsed.user_avatar || null
      currentUser.value.initials = currentUser.value.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
  } catch {}
}

// Local liked states persistence
const LIKED_STORIES_KEY = 'liked_stories'

function getLikedStories(): string[] {
  try {
    const data = localStorage.getItem(LIKED_STORIES_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveLikedStory(id: string, liked: boolean) {
  const list = getLikedStories()
  if (liked) {
    if (!list.includes(id)) {
      list.push(id)
    }
  } else {
    const index = list.indexOf(id)
    if (index !== -1) {
      list.splice(index, 1)
    }
  }
  localStorage.setItem(LIKED_STORIES_KEY, JSON.stringify(list))
}

// Comments variables
const expandedComments = ref<Record<string, boolean>>({})
const commentsMap = ref<Record<string, Comment[]>>({})
const commentsLoading = ref<Record<string, boolean>>({})
const newCommentText = ref<Record<string, string>>({})
const commentsSubmitting = ref<Record<string, boolean>>({})

function getCommentInitials(name: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const AVATAR_COLORS = [
  '#1D3557', '#C8922A', '#2D6A4F', '#5C4B8A', '#AE2012', '#2196A6', '#6B4C3B', '#3b4a6b', '#059669', '#dc2626'
]

function getCommentAvatarColor(name: string): string {
  if (!name) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const idx = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

function getCurrentUserName(): string {
  try {
    const raw = localStorage.getItem('user_data')
              || localStorage.getItem('user')
              || localStorage.getItem('currentUser')
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed.name || parsed.username || parsed.full_name || parsed.email || 'You'
    }
  } catch {}
  return 'You'
}

function toggleComments(storyId: string) {
  expandedComments.value[storyId] = !expandedComments.value[storyId]
  if (expandedComments.value[storyId] && (!commentsMap.value[storyId] || commentsMap.value[storyId].length === 0)) {
    loadComments(storyId)
  }
}

async function loadComments(storyId: string) {
  commentsLoading.value[storyId] = true
  try {
    const comments = await getComments(storyId)
    commentsMap.value[storyId] = comments
  } catch (error) {
    console.error('Failed to load comments:', error)
  } finally {
    commentsLoading.value[storyId] = false
  }
}

async function submitComment(storyId: string) {
  const text = (newCommentText.value[storyId] || '').trim()
  if (!text) return
  
  commentsSubmitting.value[storyId] = true
  try {
    const authorName = getCurrentUserName()
    const newComment = await addComment(storyId, text, authorName)
    if (!commentsMap.value[storyId]) {
      commentsMap.value[storyId] = []
    }
    commentsMap.value[storyId].push(newComment)
    newCommentText.value[storyId] = ''
    
    const story = stories.value.find(s => s.id === storyId)
    if (story) {
      story.comments++
    }
  } catch (error) {
    console.error('Failed to submit comment:', error)
  } finally {
    commentsSubmitting.value[storyId] = false
  }
}

async function loadStories(append = false) {
  loading.value = true
  try {
    const response = await fetchStories({
      page: append ? page.value + 1 : 1,
      limit: 10
    })
    const likedList = getLikedStories()
    const mappedStories = response.data.map(story => ({
      ...story,
      liked: likedList.includes(story.id)
    }))
    if (append) {
      stories.value.push(...mappedStories)
      page.value++
    } else {
      stories.value = mappedStories
      page.value = 1
    }
    total.value = response.total
  } catch (error) {
    console.error('Failed to load stories:', error)
  } finally {
    loading.value = false
  }
}

function loadMore() {
  loadStories(true)
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

const showComposer = ref(false)
const isSubmitting = ref(false)
const selectedFiles = ref<File[]>([])
const imagePreviews = ref<string[]>([])

const newPost = ref({
  title: '',
  body: '',
  location: '',
  category: '' as StoryCategory | '',
  rating: 5,
})

const composerCategories = communityCategories.filter((c): c is StoryCategory => c !== 'All')

function handleFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) {
    const newFiles = Array.from(files)
    // Limit to 5 images
    const remainingSlots = 5 - selectedFiles.value.length
    const filesToAdd = newFiles.slice(0, remainingSlots)
    
    filesToAdd.forEach(file => {
      selectedFiles.value.push(file)
      imagePreviews.value.push(URL.createObjectURL(file))
    })
  }
}

function removeImage(index: number) {
  selectedFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

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
      const uploadPromises = selectedFiles.value.map(file => uploadImage(file, 'story-images'))
      const results = await Promise.all(uploadPromises)
      imageUrls = results.filter((url): url is string => !!url)
    }

    const story = await createStory({
      title: newPost.value.title,
      body: newPost.value.body,
      location: newPost.value.location,
      category: (newPost.value.category || 'Natural') as StoryCategory,
      rating: newPost.value.rating,
    }, imageUrls, {
      id: currentUser.value.id || undefined,
      name: currentUser.value.name,
      initials: currentUser.value.initials,
      avatar: currentUser.value.avatar || undefined
    })

    alert('Your story has been submitted and is awaiting admin approval!')
    cancelComposer()
  } catch (error) {
    console.error('Failed to post story:', error)
  } finally {
    isSubmitting.value = false
  }
}

async function handleToggleLike(id: string) {
  const story = stories.value.find(s => s.id === id)
  if (!story) return
  
  const originalLiked = story.liked
  story.liked = !story.liked
  story.likes += story.liked ? 1 : -1
  saveLikedStory(story.id, story.liked)
  
  try {
    await likeStory(id, story.liked)
  } catch (error) {
    story.liked = originalLiked
    story.likes += story.liked ? 1 : -1
    saveLikedStory(story.id, story.liked)
    console.error('Failed to toggle like:', error)
  }
}

const filteredStories = computed(() => {
  // Note: Filtering is now client-side. For a real "Facebook" experience, 
  // you'd typically handle filtering/sorting on the backend with query params.
  const kw = localSearchQuery.value.trim().toLowerCase()
  const cat = props.selectedCategory ?? 'All'
  const sort = props.sortOption ?? 'latest'
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

function toggleFollowTraveler(travelerId: number) {
  const traveler = topTravelers.value.find(t => t.id === travelerId)
  if (traveler) {
    traveler.following = !traveler.following
  }
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

const CAT: Record<string, string> = {
  Natural: 'cb-sky', Food: 'cb-emerald', Sea: 'cb-teal',
  Cultural: 'cb-violet', Waterfall: 'cb-rose', Mountain: 'cb-slate', Forest: 'cb-emerald'
}
function catClass(c: string) { return CAT[c] ?? 'cb-slate' }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

.community-view,
.modal-overlay {
  --bg: white ;
  --surface: #ffffff;
  --surface-hover: #f3f4f6;
  --border: #e5e7eb;
  --border-hover: #d1d5db;
  --text: #1f2937;
  --text-muted: #6b7280;
  --text-dim: #9ca3af;
  --accent: #059669;
  --accent-light: #ecfdf5;
  --accent-hover: #047857;
  --red: #dc2626;
  --red-light: #fee2e2;
  --radius: 12px;
  --radius-sm: 8px;
  --radius-pill: 999px;
}

.community-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px 64px;
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  min-height: 100vh;
}

@media (max-width: 1100px) {
  .community-view {
    grid-template-columns: 1fr;
    max-width: 700px;
  }
}

.composer-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.composer-card:focus-within {
  border-color: var(--accent);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 3px var(--accent-light);
}

.composer-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.composer-search-bar {
  flex: 1;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 0 16px;
  height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.composer-search-bar:focus-within {
  background: #fff;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.composer-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: var(--text);
  padding: 8px 0;
}

.composer-search-input::placeholder {
  color: var(--text-dim);
}

.search-icon {
  color: var(--text-dim);
  flex-shrink: 0;
}

.composer-search-bar:focus-within .search-icon {
  color: var(--accent);
}

.clear-search {
  background: var(--border);
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;
  padding: 0;
}

.clear-search:hover {
  background: var(--text-dim);
  color: #fff;
}

.avatar-img-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--border);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── Modal Composer ───────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(5px);
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
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modal-slide-up 0.3s ease-out;
}

@keyframes modal-slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h3 {
  font-family: 'DM Serif Display', serif;
  font-size: 20px;
  margin: 0;
  color: var(--text);
}

.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  overflow: hidden;
}

.close-modal {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--surface-hover);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-modal:hover {
  background: var(--border);
  color: var(--text);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.upload-box-full {
  width: 100%;
  border: 2px dashed var(--border);
  border-radius: var(--radius-sm);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--surface-hover);
}

.upload-box-full:hover {
  border-color: var(--accent);
  background: var(--accent-light);
}

.upload-box-full .upload-box-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-dim);
}

.upload-text-main {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.upload-text-sub {
  font-size: 12px;
  color: var(--text-muted);
}

/* Image Upload Grid */
.image-upload-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-img-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-img-btn:hover {
  background: var(--red);
}

.upload-box {
  height: 100px;
  aspect-ratio: 1;
  border: 2px dashed var(--border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--surface-hover);
}

.upload-box:hover {
  border-color: var(--accent);
  background: var(--accent-light);
  color: var(--accent);
}

.upload-box-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-dim);
}

.upload-box:hover .upload-box-content {
  color: var(--accent);
}

/* Image */
.post-img-wrap {
  width: 100%;
  max-height: 420px;
  overflow: hidden;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  position: relative;
  background: #f3f4f6;
}

.post-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── Post Image Grid ─────────────────────────────────────── */
.post-img-grid {
  display: grid;
  gap: 2px;
  background: var(--border);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}

.post-img-grid.count-2 { grid-template-columns: 1fr 1fr; }
.post-img-grid.count-3 { 
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.post-img-grid.count-3 .post-img-item:first-child {
  grid-row: span 2;
}
.post-img-grid.count-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.post-img-item {
  position: relative;
  overflow: hidden;
  background: #f3f4f6;
  aspect-ratio: 1.5;
}

.post-img-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.more-images-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
}

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
  animation: modal-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-fade-leave-active .modal-container {
  animation: modal-out 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modal-in {
  from { transform: scale(0.95) translateY(10px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}
@keyframes modal-out {
  from { transform: scale(1) translateY(0); opacity: 1; }
  to { transform: scale(0.95) translateY(10px); opacity: 0; }
}

.mb-6 { margin-bottom: 1.5rem; }

.compose-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
}

.compose-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
}

.load-more-wrap {
  display: flex;
  justify-content: center;
  padding-top: 16px;
}

.form-textarea {
  width: 100%;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  font-size: 15px;
  font-family: 'DM Sans', sans-serif;
  color: var(--text);
  resize: vertical;
  outline: none;
  line-height: 1.6;
  box-sizing: border-box;
  transition: border-color 0.15s, background 0.15s;
  margin-bottom: 16px;
}

.form-textarea::placeholder { color: var(--text-dim); }
.form-textarea:focus { 
  border-color: var(--accent);
  background: #f3f4f6;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-group { display: flex; flex-direction: column; gap: 8px; }

.form-label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--text);
  text-transform: none;
}

.form-input {
  background: var(--surface-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 11px 14px;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: var(--text);
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}

.form-input::placeholder { color: var(--text-dim); }
.form-input:focus { 
  border-color: var(--accent);
  background: #f3f4f6;
}
.form-select { cursor: pointer; }
.form-select option { background: var(--surface); color: var(--text); }

.stars-input {
  display: flex;
  gap: 4px;
  padding: 6px 0;
}

.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--text-dim);
  line-height: 0;
  transition: color 0.1s, transform 0.1s;
}

.star-btn.on { color: #f59e0b; }
.star-btn:hover { transform: scale(1.2); color: #fbbf24; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}

.btn-ghost {
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-ghost:hover {
  border-color: var(--text-muted);
  color: var(--text);
  background: var(--surface-hover);
}

.btn-primary {
  padding: 10px 24px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
}

.btn-primary:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

/* ── Avatar ──────────────────────────────────────────────── */
.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: 0.3px;
  border: 2px solid transparent;
}

.av-you { background: var(--accent) !important; }

.avatar-has-img {
  overflow: hidden;
  border: 1px solid var(--border);
  padding: 0;
}

/* ── Post card ───────────────────────────────────────────── */
.post-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.post-card:hover {
  border-color: var(--accent-light);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.1);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 0;
}

.post-meta {
  flex: 1;
  min-width: 0;
}

.post-author {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  display: block;
  line-height: 1.3;
}

.post-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.post-date {
  font-size: 13px;
  color: var(--text-muted);
}

.dot-sep {
  color: var(--text-dim);
  font-size: 13px;
}

.cat-badge {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 4px;
}

.cb-sky     { background: #dbeafe; color: #0369a1; }
.cb-emerald { background: #dcfce7; color: #15803d; }
.cb-teal    { background: #ccfbf1; color: #0d9488; }
.cb-violet  { background: #ede9fe; color: #6d28d9; }
.cb-rose    { background: #ffe4e6; color: #be123c; }
.cb-slate   { background: #f1f5f9; color: #334155; }

.post-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.star-display {
  display: flex;
  gap: 2px;
  align-items: center;
}

.more-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.more-btn:hover {
  background: var(--surface-hover);
  color: var(--text);
}

/* Post body */
.post-body {
  padding: 16px 20px;
}

.post-title {
  font-family: 'DM Serif Display', serif;
  font-size: 22px;
  font-weight: 400;
  color: var(--text);
  margin: 0 0 10px;
  line-height: 1.3;
  letter-spacing: -0.3px;
}

.post-text {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 1.7;
  margin: 0;
  font-weight: 300;
}

.post-location {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--surface-hover);
  border: 1px solid var(--border);
  padding: 5px 12px;
  border-radius: var(--radius-pill);
}

/* Footer */
.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  background: var(--surface-hover);
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
}

.stat-item svg { flex-shrink: 0; color: var(--text-dim); }

.post-actions {
  display: flex;
  gap: 6px;
}

.act-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
}

.act-btn:hover {
  background: var(--surface);
  border-color: var(--accent);
  color: var(--accent);
}

.act-btn.act-liked {
  background: var(--red-light);
  border-color: #fca5a5;
  color: var(--red);
}

/* ── Empty state ─────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 32px;
  color: var(--text-dim);
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--accent-light);
  border: 2px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
}

.empty-state p {
  font-size: 15px;
  color: var(--text-muted);
  max-width: 300px;
}

/* ── Comments Section ───────────────────────────────────── */
.post-comments {
  background: #f9fafb;
  border-top: 1px solid var(--border);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comments-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  justify-content: center;
  padding: 8px 0;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0,0,0,0.1);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.comments-empty {
  font-size: 13px;
  color: var(--text-dim);
  text-align: center;
  padding: 12px 0;
  font-style: italic;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

.comments-list::-webkit-scrollbar {
  width: 4px;
}

.comments-list::-webkit-scrollbar-thumb {
  background: var(--border-hover);
  border-radius: 2px;
}

.comment-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.comment-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.comment-content {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 8px;
}

.comment-author {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}

.comment-date {
  font-size: 11px;
  color: var(--text-dim);
}

.comment-body {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-composer {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 4px;
}

.comment-input {
  flex: 1;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 8px 16px;
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  color: var(--text);
  outline: none;
  transition: all 0.15s;
}

.comment-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-light);
}

.comment-submit-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.comment-submit-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: scale(1.05);
}

.comment-submit-btn:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.act-btn.act-active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}
</style>