<template>
  <div class="community-view">
    <CommunityHero :stats="heroStats" />

    <CommunityFilterBar
      :categories="communityCategories"
      :active-category="selectedCategory"
      :search-query="searchQuery"
      :sort-option="sortOption"
      :sort-options="communitySortOptions"
      @change-category="selectedCategory = $event"
      @update:search-query="searchQuery = $event"
      @update:sort-option="sortOption = $event"
    />

    <section class="community-shell">
      <div class="community-layout">
        <StoryFeed
          :featured-story="featuredStory"
          :stories="feedStories"
          :categories="composerCategories"
          @submit-story="handleStorySubmit"
          @toggle-like="toggleLike"
        />

        <Sidebar
          :trending-places="trendingPlaces"
          :travelers="travelers"
          :provinces="popularProvinces"
          @toggle-follow="toggleFollow"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import CommunityFilterBar from '@/components/community/CommunityFilterBar.vue'
import CommunityHero from '@/components/community/CommunityHero.vue'
import StoryFeed from '@/components/community/StoryFeed.vue'
import Sidebar from '@/components/community/sidebar/Sidebar.vue'
import api from '@/api/axios'
import {
  categoryCoverMap,
  communityCategories,
  communitySortOptions,
  communityStories as fallbackStories,
  popularProvinces,
  topTravelers,
  trendingPlaces,
} from '@/data/community'
import type {
  CommunityCategory,
  CommunitySortOption,
  CommunityStory,
  ComposerSubmission,
  HeroStat,
  StoryCategory,
  TopTraveler,
} from '@/data/community'
import { fetchStories, createStory, likeStory, fetchStats } from '@/services/community.service'

// â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const stories = ref<CommunityStory[]>([...fallbackStories])
const travelers = ref<TopTraveler[]>(topTravelers.map((t) => ({ ...t })))
const selectedCategory = ref<CommunityCategory>('All')
const searchQuery = ref('')
const sortOption = ref<CommunitySortOption>('latest')
const apiLoaded = ref(false)

// Track liked IDs locally (Supabase likes are just counters, not per-user for now)
const LIKED_KEY = 'community:liked_ids'
const likedIds = ref<Set<string>>(loadLikedIds())

function loadLikedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}
function saveLikedIds() {
  localStorage.setItem(LIKED_KEY, JSON.stringify([...likedIds.value]))
}

// â”€â”€ Load stories from Supabase on mount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadFromAPI() {
  try {
    const { data } = await fetchStories({ limit: 50 })
    if (data.length > 0) {
      // Mark which stories are liked by this user
      stories.value = data.map((s) => ({ ...s, liked: likedIds.value.has(s.id) }))
      apiLoaded.value = true
    }
  } catch {
    // Keep fallback stories if API is unavailable
  }
}

onMounted(loadFromAPI)

// â”€â”€ Derived stats from Supabase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const apiStats = ref({ totalStories: 0, totalLikes: 0 })
onMounted(async () => {
  try {
    apiStats.value = await fetchStats()
  } catch { /* keep defaults */ }
})

const composerCategories = communityCategories.filter(
  (c): c is StoryCategory => c !== 'All',
)

// â”€â”€ Filtering & sorting (client-side on fetched data) â”€â”€â”€â”€â”€â”€â”€â”€â”€
const filteredStories = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()

  const results = stories.value.filter((story) => {
    const matchesCategory =
      selectedCategory.value === 'All' || story.category === selectedCategory.value
    if (!matchesCategory) return false
    if (!keyword) return true
    return [story.title, story.excerpt, story.location, story.author.name, story.category]
      .join(' ').toLowerCase().includes(keyword)
  })

  return [...results].sort((a, b) => sortStories(a, b, sortOption.value))
})

const featuredStory = computed(() => filteredStories.value[0] ?? null)
const feedStories = computed(() => filteredStories.value.slice(1))

const heroStats = computed<HeroStat[]>(() => {
  const totalLikes = apiStats.value.totalLikes ||
    stories.value.reduce((sum, s) => sum + s.likes, 0)
  const totalStories = apiStats.value.totalStories || 1800 + stories.value.length

  return [
    {
      label: 'Travelers',
      value: '14.8k',
      hint: 'Locals and visitors sharing routes, tips, and weekend plans.',
    },
    {
      label: 'Stories',
      value: totalStories.toLocaleString(),
      hint: 'Post recaps, lists, and quick reviews from every region.',
    },
    {
      label: 'Likes',
      value: totalLikes.toLocaleString(),
      hint: 'Signals from the community on what is genuinely worth checking out.',
    },
  ]
})

function sortStories(a: CommunityStory, b: CommunityStory, mode: CommunitySortOption) {
  if (mode === 'popular') return b.likes - a.likes
  if (mode === 'discussed') return b.comments - a.comments
  if (mode === 'top-rated') return b.rating - a.rating
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
}

// â”€â”€ Like toggle (calls Supabase API + updates local state) â”€â”€â”€â”€
async function toggleLike(id: string) {
  const story = stories.value.find((s) => s.id === id)
  if (!story) return

  const nowLiked = !story.liked
  stories.value = stories.value.map((s) =>
    s.id !== id ? s : { ...s, liked: nowLiked, likes: s.likes + (nowLiked ? 1 : -1) },
  )

  if (nowLiked) likedIds.value.add(id)
  else likedIds.value.delete(id)
  saveLikedIds()

  // Only call API for stories that came from Supabase (UUID format)
  if (apiLoaded.value && !id.startsWith('local-')) {
    try {
      await likeStory(id, nowLiked)
    } catch { /* optimistic update already applied */ }
  }
}

function toggleFollow(id: number) {
  travelers.value = travelers.value.map((t) =>
    t.id === id ? { ...t, followed: !t.followed } : t,
  )

  // Send to backend
  const traveler = travelers.value.find(t => t.id === id)
  if (traveler) {
    api.patch(`/community/travelers/${id}/follow`, {
      followerId: travelers.value[0]?.id || '3fff4738-55a9-4724-9c7e-1b256cb198eb',
      follow: traveler.followed
    }).catch(error => {
      console.error('Error toggling follow:', error)
      // Revert on error
      travelers.value = travelers.value.map((t) =>
        t.id === id ? { ...t, followed: !t.followed } : t,
      )
    })
  }
}

// â”€â”€ Submit story â†’ Supabase API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function handleStorySubmit(payload: ComposerSubmission) {
  const imageUrl = payload.photoUrl || categoryCoverMap[payload.category]

  if (apiLoaded.value) {
    try {
      const created = await createStory(payload, imageUrl)
      stories.value = [{ ...created, liked: false }, ...stories.value]
      selectedCategory.value = 'All'
      searchQuery.value = ''
      sortOption.value = 'latest'
      return
    } catch { /* fall through to local */ }
  }

  // Fallback: add locally if API unavailable
  const localStory: CommunityStory = {
    id: `local-${Date.now()}`,
    title: payload.title,
    excerpt: payload.body,
    image: imageUrl,
    category: payload.category,
    location: payload.location || 'Cambodia',
    likes: 0,
    comments: 0,
    rating: payload.rating,
    publishedAt: new Date().toISOString(),
    author: {
      name: 'You',
      handle: '@newtraveler',
      initials: 'YO',
      avatarColor: '#1a2340',
      homeBase: 'Community member',
    },
    liked: false,
  }
  stories.value = [localStory, ...stories.value]
  selectedCategory.value = 'All'
  searchQuery.value = ''
  sortOption.value = 'latest'
}

// Reload from API when filters change (re-query with server-side params)
watch([selectedCategory, sortOption], async () => {
  if (!apiLoaded.value) return
  try {
    const { data } = await fetchStories({
      category: selectedCategory.value !== 'All' ? selectedCategory.value : undefined,
      sort: sortOption.value,
      limit: 50,
    })
    stories.value = data.map((s) => ({ ...s, liked: likedIds.value.has(s.id) }))
  } catch { /* keep current */ }
})
</script>

<style scoped>
.community-view {
  min-height: calc(100vh - 64px);
  background:
    linear-gradient(180deg, #121a2f 0, #121a2f 360px, #f5f3ee 360px, #f5f3ee 100%);
}

.community-shell {
  padding: 0 40px 72px;
}

.community-layout {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) 360px;
  gap: 24px;
  align-items: start;
}

@media (max-width: 1100px) {
  .community-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .community-shell {
    padding: 0 20px 56px;
  }
}
</style>
