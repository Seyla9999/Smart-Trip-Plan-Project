<template>
  <div class="community-view">

    <!-- Composer -->
    <div class="composer-card">
      <div class="composer-top">
        <div class="avatar av-you">YO</div>
        <div class="composer-pill" @click="showComposer = true">
          Share your travel story...
        </div>
        <button class="compose-btn" @click="showComposer = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Post
        </button>
      </div>

      <transition name="expand">
        <div v-if="showComposer" class="composer-form">
          <div class="form-divider" />

          <textarea
            v-model="newPost.body"
            class="form-textarea"
            placeholder="Write something inspiring..."
            rows="4"
          />

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

          <div class="form-actions">
            <button class="btn-ghost" @click="cancelComposer">Discard</button>
            <button class="btn-primary" :disabled="!newPost.body.trim()" @click="submitPost">
              Publish Story
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- Empty -->
    <div v-if="filteredStories.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      </div>
      <p>No stories yet. Be the first to share.</p>
    </div>

    <!-- Posts -->
    <article v-for="story in filteredStories" :key="story.id" class="post-card">

      <div class="post-header">
        <div class="avatar" :style="{ background: story.author.avatarColor || '#3b4a6b' }">
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

      <div v-if="story.image" class="post-img-wrap">
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
            @click="$emit('toggle-like', story.id)"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" :fill="story.liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {{ story.liked ? 'Liked' : 'Like' }}
          </button>
          <button class="act-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Comment
          </button>
        </div>
      </div>

    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  communityCategories,
  communityStories as fallbackStories,
} from '@/data/community'
import type {
  CommunityCategory,
  CommunitySortOption,
  CommunityStory,
  StoryCategory,
} from '@/data/community'

const props = defineProps<{
  stories?: CommunityStory[]
  selectedCategory?: CommunityCategory
  searchQuery?: string
  sortOption?: CommunitySortOption
}>()

const emit = defineEmits<{
  (e: 'toggle-like', id: string): void
  (e: 'submit-story', payload: {
    title: string; body: string; location: string
    category: StoryCategory; rating: number; photoUrl?: string
  }): void
}>()

const showComposer = ref(false)
const newPost = ref({ title: '', body: '', location: '', category: '' as StoryCategory | '', rating: 5 })
const composerCategories = communityCategories.filter((c): c is StoryCategory => c !== 'All')

function cancelComposer() {
  showComposer.value = false
  newPost.value = { title: '', body: '', location: '', category: '', rating: 5 }
}

function submitPost() {
  if (!newPost.value.body.trim()) return
  emit('submit-story', {
    title: newPost.value.title,
    body: newPost.value.body,
    location: newPost.value.location,
    category: (newPost.value.category || 'Adventure') as StoryCategory,
    rating: newPost.value.rating,
  })
  cancelComposer()
}

const sourceStories = computed(() => props.stories ?? fallbackStories)

const filteredStories = computed(() => {
  const kw = (props.searchQuery ?? '').trim().toLowerCase()
  const cat = props.selectedCategory ?? 'All'
  const sort = props.sortOption ?? 'latest'
  const list = sourceStories.value.filter(s => {
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

function formatDate(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const CAT: Record<string, string> = {
  Adventure: 'cb-sky', Food: 'cb-emerald', Nature: 'cb-teal',
  Culture: 'cb-violet', Beach: 'cb-rose', Cities: 'cb-slate',
}
function catClass(c: string) { return CAT[c] ?? 'cb-slate' }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

.community-view {
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

  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 700px;
  margin: 0 auto;
  padding: 32px 16px 64px;
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  min-height: 100vh;
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

.composer-pill {
  flex: 1;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 12px 20px;
  font-size: 15px;
  color: var(--text-dim);
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: background 0.15s, border-color 0.15s;
}

.composer-pill:hover {
  background: #e8eef9;
  border-color: var(--accent);
}

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

.composer-quick {
  display: flex;
  gap: 10px;
}

.quick-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: var(--surface-hover);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
}

.quick-chip:hover {
  background: #e8eef9;
  border-color: var(--accent);
  color: var(--accent);
}

/* Composer form */
.form-divider {
  height: 1px;
  background: var(--border);
  margin: 20px 0;
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

/* Expand transition */
.expand-enter-active, .expand-leave-active {
  transition: max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease;
  max-height: 600px;
  opacity: 1;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
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

/* Image */
.post-img-wrap {
  width: 100%;
  max-height: 380px;
  overflow: hidden;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  position: relative;
}

.post-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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
</style>