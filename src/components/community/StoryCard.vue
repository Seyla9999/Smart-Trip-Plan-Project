<template>
  <article class="story-card" :class="[{ featured }, 'cat--' + catKey(category)]">
    <!-- Category accent strip -->
    <div class="story-card__accent" />

    <!-- Media panel -->
    <div class="story-card__media" :style="mediaStyle">
      <div class="story-card__overlay" />

      <div class="story-card__media-top">
        <span class="story-card__badge" :class="'cb-' + catKey(category)">{{ category }}</span>
        <span v-if="formattedDate" class="story-card__date">{{ formattedDate }}</span>
      </div>

      <!-- Fallback initials when no image -->
      <div v-if="!images || images.length === 0" class="story-card__fallback">
        {{ author.initials }}
      </div>

      <!-- Multi-image mini-grid (only for featured cards) -->
      <div v-if="featured && images && images.length > 1" class="story-card__extra-imgs">
        <div
          v-for="(img, i) in images.slice(1, 3)"
          :key="i"
          class="story-card__extra-img"
          :style="{ backgroundImage: `url(${img})` }"
        />
      </div>
    </div>

    <!-- Body -->
    <div class="story-card__body">
      <!-- Author row -->
      <div class="story-card__author">
        <div class="story-card__av">
          <img v-if="author.avatar" :src="getAvatarSrc(author.avatar)" :alt="author.name" class="story-card__av-img" />
          <span v-else class="story-card__av-fallback" :style="{ background: author.avatarColor || '#2A9D8F' }">
            {{ author.initials }}
          </span>
        </div>
        <div>
          <div class="story-card__author-name">{{ author.name }}</div>
          <div class="story-card__author-meta">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ location || 'Cambodia' }}
          </div>
        </div>
        <div class="story-card__stars">
          <svg v-for="n in 5" :key="n" width="11" height="11" viewBox="0 0 24 24" :fill="n <= (rating || 0) ? '#C8922A' : 'none'" stroke="#C8922A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
      </div>

      <!-- Title & excerpt -->
      <div class="story-card__text">
        <h3 class="story-card__title">{{ title }}</h3>
        <p v-if="excerpt" class="story-card__excerpt">{{ excerpt }}</p>
      </div>

      <!-- Footer -->
      <div class="story-card__footer">
        <div class="story-card__stats">
          <span class="stat">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {{ likes.toLocaleString() }}
          </span>
          <span class="stat">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {{ comments }}
          </span>
        </div>

        <button
          class="story-card__like"
          :class="{ active: liked }"
          type="button"
          @click="emit('toggleLike', id)"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          {{ liked ? 'Liked' : 'Like' }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import API from '../../api/axios'
import { computed } from 'vue'
import type { CommunityAuthor } from '../../data/community'

const props = withDefaults(
  defineProps<{
    id: string
    title: string
    images: string[]
    category: string
    location: string
    likes: number
    comments: number
    author: CommunityAuthor
    excerpt?: string
    rating?: number
    publishedAt?: string
    featured?: boolean
    liked?: boolean
  }>(),
  {
    excerpt: '',
    rating: 0,
    publishedAt: '',
    featured: false,
    liked: false,
    images: () => [],
  },
)

const emit = defineEmits<{
  toggleLike: [id: string]
}>()

const mediaStyle = computed(() => {
  if (props.images && props.images.length > 0) {
    return { backgroundImage: `url(${props.images[0]})` }
  }
  return { background: 'linear-gradient(135deg, #0D1B2A 0%, #1D3557 55%, #2A9D8F 100%)' }
})

const formattedDate = computed(() => {
  if (!props.publishedAt) return ''
  const d = new Date(props.publishedAt)
  if (isNaN(d.getTime())) return ''
  const h = Math.floor((Date.now() - d.getTime()) / 3_600_000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

function getAvatarSrc(url: string | null | undefined): string {
  if (!url) return ''
  if (typeof url !== 'string') return ''
  if (url.startsWith('data:')) return url
  if (url.startsWith('http')) return url
  if (url.startsWith('/uploads') || url.startsWith('/storage') || url.startsWith('/images')) return `${API.baseURL}${url}`
  return url
}

const CAT_MAP: Record<string, string> = {
  Natural: 'natural', Food: 'food', Sea: 'sea',
  Cultural: 'cultural', Waterfall: 'waterfall', Mountain: 'mountain', Forest: 'forest'
}
function catKey(c: string) { return CAT_MAP[c] ?? 'natural' }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Cinzel:wght@500;600&display=swap');

/* ── Base card ─────────────────────────────────────────────────── */
.story-card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #E8E2D6;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(26,26,46,0.07);
  transition: box-shadow 0.2s, transform 0.2s;
}
.story-card:hover {
  box-shadow: 0 8px 28px rgba(26,26,46,0.13);
  transform: translateY(-2px);
}

/* Featured = side-by-side layout */
.story-card.featured {
  flex-direction: row;
}

/* ── Category accent strip ─────────────────────────────────────── */
.story-card__accent {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  z-index: 2;
}
.cat--natural   .story-card__accent { background: linear-gradient(90deg, #2A9D8F, #52b788); }
.cat--food      .story-card__accent { background: linear-gradient(90deg, #C8922A, #e9c46a); }
.cat--sea       .story-card__accent { background: linear-gradient(90deg, #1D6FA4, #48cae4); }
.cat--cultural  .story-card__accent { background: linear-gradient(90deg, #C8922A, #9b5de5); }
.cat--waterfall .story-card__accent { background: linear-gradient(90deg, #2A9D8F, #4361ee); }
.cat--mountain  .story-card__accent { background: linear-gradient(90deg, #5C4B8A, #1D3557); }
.cat--forest    .story-card__accent { background: linear-gradient(90deg, #2D6A4F, #52b788); }

/* ── Media ─────────────────────────────────────────────────────── */
.story-card__media {
  position: relative;
  min-height: 200px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}
.story-card.featured .story-card__media {
  width: 42%;
  min-height: 280px;
}

.story-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10,12,20,0.04) 0%, rgba(10,12,20,0.55) 100%);
}

.story-card__media-top {
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  z-index: 1;
}

.story-card__badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  backdrop-filter: blur(6px);
}
/* Coloured pills */
.cb-natural   { background: rgba(42,157,143,0.85); color: #fff; }
.cb-food      { background: rgba(200,146,42,0.85); color: #fff; }
.cb-sea       { background: rgba(29,111,164,0.85); color: #fff; }
.cb-cultural  { background: rgba(123,94,167,0.85); color: #fff; }
.cb-waterfall { background: rgba(67,97,238,0.85);  color: #fff; }
.cb-mountain  { background: rgba(92,75,138,0.85);  color: #fff; }
.cb-forest    { background: rgba(45,106,79,0.85);  color: #fff; }

.story-card__date {
  font-size: 11px;
  color: rgba(255,255,255,0.82);
  font-weight: 500;
  backdrop-filter: blur(4px);
  background: rgba(0,0,0,0.25);
  padding: 3px 8px;
  border-radius: 999px;
}

.story-card__fallback {
  position: absolute;
  bottom: 14px;
  left: 14px;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cinzel', serif;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  z-index: 1;
}

/* Extra images strip (featured only) */
.story-card__extra-imgs {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1;
}
.story-card__extra-img {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  border: 2px solid rgba(255,255,255,0.5);
}

/* ── Body ──────────────────────────────────────────────────────── */
.story-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px 16px;
}

/* Author */
.story-card__author {
  display: flex;
  align-items: center;
  gap: 10px;
}
.story-card__av {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #E8E2D6;
}
.story-card__av-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.story-card__av-fallback {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff;
}

.story-card__author-name {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A2E;
}
.story-card__author-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #9896A8;
  margin-top: 2px;
}
.story-card__author-meta svg { color: #2A9D8F; flex-shrink: 0; }

.story-card__stars {
  display: flex;
  gap: 1px;
  margin-left: auto;
  flex-shrink: 0;
}

/* Text */
.story-card__text { flex: 1; }
.story-card__title {
  font-family: 'Cinzel', serif;
  font-size: 16px;
  font-weight: 600;
  color: #1A1A2E;
  line-height: 1.35;
  margin: 0 0 8px;
}
.story-card.featured .story-card__title { font-size: 20px; }

.story-card__excerpt {
  font-size: 13px;
  color: #5A5A72;
  line-height: 1.65;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer */
.story-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 4px;
  border-top: 1px solid #F0EDE8;
}
.story-card__stats {
  display: flex;
  gap: 14px;
}
.stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #9896A8;
}
.stat svg { color: #C8922A; }

.story-card__like {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #E8E2D6;
  border-radius: 999px;
  background: transparent;
  color: #5A5A72;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
}
.story-card__like:hover {
  border-color: #fca5a5;
  color: #C0392B;
  background: #FDECEA;
}
.story-card__like.active {
  border-color: #fca5a5;
  color: #C0392B;
  background: #FDECEA;
}
.story-card__like.active svg { fill: currentColor; }

/* ── Responsive ────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .story-card.featured {
    flex-direction: column;
  }
  .story-card.featured .story-card__media {
    width: 100%;
    min-height: 200px;
  }
}
@media (max-width: 640px) {
  .story-card__body { padding: 14px 16px 14px; }
}
</style>