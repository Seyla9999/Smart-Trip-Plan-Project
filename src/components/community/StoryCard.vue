<template>
  <article class="story-card" :class="{ featured }">
    <div class="story-card__media" :style="mediaStyle">
      <div class="story-card__overlay" />
      <div class="story-card__top">
        <span class="story-card__badge">{{ category }}</span>
        <span v-if="formattedDate" class="story-card__date">{{ formattedDate }}</span>
      </div>

      <div v-if="!image" class="story-card__fallback">{{ author.initials }}</div>
    </div>

    <div class="story-card__body">
      <div class="story-card__author">
        <span class="story-card__avatar" :style="{ background: author.avatarColor }">
          {{ author.initials }}
        </span>
        <div>
          <div class="story-card__author-name">{{ author.name }}</div>
          <div class="story-card__author-meta">{{ author.handle }} · {{ author.homeBase }}</div>
        </div>
      </div>

      <div class="story-card__location">{{ location }}</div>
      <h3 class="story-card__title">{{ title }}</h3>
      <p v-if="excerpt" class="story-card__excerpt">{{ excerpt }}</p>

      <div class="story-card__footer">
        <div class="story-card__stats">
          <span>{{ ratingLabel }}</span>
          <span>{{ comments }} comments</span>
        </div>

        <button
          class="story-card__like"
          :class="{ active: liked }"
          type="button"
          @click="emit('toggleLike', id)"
        >
          {{ liked ? 'Liked' : 'Like' }} {{ likes }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CommunityAuthor } from '@/data/community'

const props = withDefaults(
  defineProps<{
    id: string
    title: string
    image?: string
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
    image: undefined,
  },
)

const emit = defineEmits<{
  toggleLike: [id: string]
}>()

const mediaStyle = computed(() => {
  if (props.image) {
    return {
      backgroundImage: `url(${props.image})`,
    }
  }

  return {
    background:
      'linear-gradient(135deg, rgba(26, 35, 64, 0.96), rgba(45, 106, 79, 0.86))',
  }
})

const formattedDate = computed(() => {
  if (!props.publishedAt) {
    return ''
  }

  return new Date(props.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
})

const ratingLabel = computed(() => {
  if (!props.rating) {
    return 'New story'
  }

  return `${props.rating.toFixed(1)}/5 rating`
})
</script>

<style scoped>
.story-card {
  display: grid;
  overflow: hidden;
  border: 1px solid rgba(13, 19, 33, 0.08);
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 20px 48px rgba(18, 26, 47, 0.08);
}

.story-card.featured {
  grid-template-columns: minmax(280px, 42%) minmax(0, 1fr);
}

.story-card__media {
  position: relative;
  min-height: 250px;
  background-size: cover;
  background-position: center;
}

.story-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 12, 20, 0.02) 0%, rgba(10, 12, 20, 0.62) 100%);
}

.story-card__top {
  position: absolute;
  inset: 0 0 auto;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 16px;
}

.story-card__badge,
.story-card__date {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.story-card__fallback {
  position: absolute;
  inset: auto auto 18px 18px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 62px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #fff;
  font-family: 'Cinzel', serif;
  font-size: 22px;
  font-weight: 700;
}

.story-card__body {
  display: grid;
  gap: 14px;
  padding: 22px;
}

.story-card__author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.story-card__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.story-card__author-name {
  color: #111827;
  font-size: 14px;
  font-weight: 700;
}

.story-card__author-meta {
  color: #6b7280;
  font-size: 12px;
}

.story-card__location {
  color: #2d6a4f;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.story-card__title {
  margin: 0;
  color: #111827;
  font-family: 'Cinzel', serif;
  font-size: 22px;
  line-height: 1.3;
}

.story-card:not(.featured) .story-card__title {
  font-size: 19px;
}

.story-card__excerpt {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.7;
}

.story-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 6px;
}

.story-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
}

.story-card__like {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 999px;
  background: #f7f4ed;
  color: #111827;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
}

.story-card__like:hover {
  border-color: rgba(45, 106, 79, 0.35);
  color: #2d6a4f;
}

.story-card__like.active {
  background: rgba(45, 106, 79, 0.12);
  border-color: rgba(45, 106, 79, 0.2);
  color: #2d6a4f;
}

@media (max-width: 900px) {
  .story-card.featured {
    grid-template-columns: 1fr;
  }

  .story-card__media {
    min-height: 220px;
  }
}

@media (max-width: 640px) {
  .story-card__body {
    padding: 18px;
  }

  .story-card__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .story-card__like {
    width: 100%;
  }
}
</style>
