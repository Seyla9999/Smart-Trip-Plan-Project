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
import { computed, ref, watch } from 'vue'
import CommunityFilterBar from '@/components/community/CommunityFilterBar.vue'
import CommunityHero from '@/components/community/CommunityHero.vue'
import StoryFeed from '@/components/community/StoryFeed.vue'
import Sidebar from '@/components/community/sidebar/Sidebar.vue'
import {
  categoryCoverMap,
  communityCategories,
  communitySortOptions,
  communityStories,
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

const STORIES_STORAGE_KEY = 'community:stories'
const TRAVELERS_STORAGE_KEY = 'community:travelers'

const stories = ref<CommunityStory[]>(loadStories())
const travelers = ref<TopTraveler[]>(loadTravelers())
const selectedCategory = ref<CommunityCategory>('All')
const searchQuery = ref('')
const sortOption = ref<CommunitySortOption>('latest')

const composerCategories = communityCategories.filter(
  (category): category is StoryCategory => category !== 'All',
)

const filteredStories = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()

  const results = stories.value.filter((story) => {
    const matchesCategory =
      selectedCategory.value === 'All' || story.category === selectedCategory.value

    if (!matchesCategory) {
      return false
    }

    if (!keyword) {
      return true
    }

    return [story.title, story.excerpt, story.location, story.author.name, story.category]
      .join(' ')
      .toLowerCase()
      .includes(keyword)
  })

  return [...results].sort((first, second) => sortStories(first, second, sortOption.value))
})

const featuredStory = computed(() => filteredStories.value[0] ?? null)
const feedStories = computed(() => filteredStories.value.slice(1))

const heroStats = computed<HeroStat[]>(() => {
  const totalLikes = stories.value.reduce((sum, story) => sum + story.likes, 0)

  return [
    {
      label: 'Travelers',
      value: '14.8k',
      hint: 'Locals and visitors sharing routes, tips, and weekend plans.',
    },
    {
      label: 'Stories',
      value: (1800 + stories.value.length).toLocaleString(),
      hint: 'Post recaps, lists, and quick reviews from every region.',
    },
    {
      label: 'Likes',
      value: (86000 + totalLikes).toLocaleString(),
      hint: 'Signals from the community on what is genuinely worth checking out.',
    },
  ]
})

function sortStories(
  first: CommunityStory,
  second: CommunityStory,
  mode: CommunitySortOption,
) {
  if (mode === 'popular') {
    return second.likes - first.likes
  }

  if (mode === 'discussed') {
    return second.comments - first.comments
  }

  if (mode === 'top-rated') {
    return second.rating - first.rating
  }

  return (
    new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime()
  )
}

function toggleLike(id: number) {
  stories.value = stories.value.map((story) => {
    if (story.id !== id) {
      return story
    }

    const liked = !story.liked

    return {
      ...story,
      liked,
      likes: story.likes + (liked ? 1 : -1),
    }
  })
}

function toggleFollow(id: number) {
  travelers.value = travelers.value.map((traveler) =>
    traveler.id === id ? { ...traveler, followed: !traveler.followed } : traveler,
  )
}

function handleStorySubmit(payload: ComposerSubmission) {
  stories.value = [
    {
      id: Date.now(),
      title: payload.title,
      excerpt: payload.body,
      image: payload.photoUrl || categoryCoverMap[payload.category],
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
    },
    ...stories.value,
  ]

  selectedCategory.value = 'All'
  searchQuery.value = ''
  sortOption.value = 'latest'
}

function loadStories(): CommunityStory[] {
  if (typeof window === 'undefined') {
    return getDefaultStories()
  }

  const storedStories = window.localStorage.getItem(STORIES_STORAGE_KEY)
  if (!storedStories) {
    return getDefaultStories()
  }

  try {
    const parsedStories = JSON.parse(storedStories) as CommunityStory[]
    return Array.isArray(parsedStories) && parsedStories.length > 0
      ? parsedStories
      : getDefaultStories()
  } catch {
    return getDefaultStories()
  }
}

function loadTravelers(): TopTraveler[] {
  if (typeof window === 'undefined') {
    return getDefaultTravelers()
  }

  const storedTravelers = window.localStorage.getItem(TRAVELERS_STORAGE_KEY)
  if (!storedTravelers) {
    return getDefaultTravelers()
  }

  try {
    const parsedTravelers = JSON.parse(storedTravelers) as TopTraveler[]
    return Array.isArray(parsedTravelers) && parsedTravelers.length > 0
      ? parsedTravelers
      : getDefaultTravelers()
  } catch {
    return getDefaultTravelers()
  }
}

function getDefaultStories(): CommunityStory[] {
  return communityStories.map((story) => ({
    ...story,
    author: { ...story.author },
  }))
}

function getDefaultTravelers(): TopTraveler[] {
  return topTravelers.map((traveler) => ({ ...traveler }))
}

watch(
  stories,
  (nextStories) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(nextStories))
    }
  },
  { deep: true },
)

watch(
  travelers,
  (nextTravelers) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TRAVELERS_STORAGE_KEY, JSON.stringify(nextTravelers))
    }
  },
  { deep: true },
)
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
