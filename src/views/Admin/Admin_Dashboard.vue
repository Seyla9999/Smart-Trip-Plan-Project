<template>
  <section
    class="relative h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
  >
    <div class="flex h-full flex-col">
      <header class="border-b border-slate-800 bg-slate-900 px-4 py-4 md:px-6">
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="text-xs font-semibold mb-3 uppercase tracking-[0.2em] text-emerald-300/80">
                Let's Go Cambodia
              </p>
              <h1 class="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p class="text-sm text-slate-300 mt-1">
                Snapshot of platform performance and community growth.
              </p>
            </div>
            <div class="flex items-center gap-3">
              <div class="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200">
                Last updated: {{ lastUpdated }}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="flex-1 min-h-0 overflow-auto p-4 md:p-6">
        <div v-if="isLoading" class="flex h-full items-center justify-center text-slate-500 font-medium">
          Loading platform metrics...
        </div>
        <div v-else class="flex flex-col gap-6">
          <!-- Main Stats -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Total users</p>
              <p class="mt-2 text-3xl font-bold text-slate-900">{{ metrics.totalUsers }}</p>
              <p class="mt-1 text-xs text-slate-500">All registered accounts</p>
            </div>
            <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-emerald-700">Admin accounts</p>
              <p class="mt-2 text-3xl font-bold text-emerald-700">{{ metrics.adminCount }}</p>
              <p class="mt-1 text-xs text-emerald-700/80">Active staff members</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Top Province</p>
              <p class="mt-2 text-xl font-bold text-slate-900 truncate">{{ metrics.topProvince?.name_en || 'N/A' }}</p>
              <p class="mt-1 text-xs text-slate-500">Highest attraction density</p>
            </div>
            <div class="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
              <div class="absolute -right-3 -top-4 text-white/10">
                <svg class="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                  />
                </svg>
              </div>
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Most popular</p>
              <p class="mt-2 text-xl font-bold text-white truncate" :title="metrics.mostPopular?.name">
                {{ metrics.mostPopular?.name || 'N/A' }}
              </p>
              <p v-if="metrics.mostPopular" class="mt-1 text-xs text-emerald-300">
                {{ metrics.mostPopular.rating }} ★ · {{ metrics.mostPopular.reviewCount }} Reviews
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <!-- Left Column: Highlights and Top Provinces -->
            <div class="lg:col-span-2 flex flex-col gap-4">
              <!-- Highlights -->
              <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3 md:px-6">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Platform Highlights</p>
                    <p class="text-sm font-semibold text-slate-900">Key metrics at a glance</p>
                  </div>
                  <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Global Summary
                  </span>
                </div>
                <div class="grid gap-3 p-4 md:grid-cols-3 md:p-6">
                  <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Total Attractions</p>
                    <p class="mt-2 text-2xl font-bold text-slate-900">{{ metrics.totalAttractions }}</p>
                    <p class="mt-1 text-xs font-semibold text-emerald-600">Across Cambodia</p>
                  </div>
                  <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Community Stories</p>
                    <p class="mt-2 text-2xl font-bold text-slate-900">{{ metrics.totalStories }}</p>
                    <p class="mt-1 text-xs font-semibold text-slate-600">Published updates</p>
                  </div>
                  <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Total Reviews</p>
                    <p class="mt-2 text-2xl font-bold text-slate-900">{{ metrics.totalReviews }}</p>
                    <p class="mt-1 text-xs font-semibold text-emerald-600">User contributions</p>
                  </div>
                </div>
              </div>

              <!-- Top Provinces -->
              <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3 md:px-6">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Top Provinces</p>
                    <p class="text-sm font-semibold text-slate-900">By attraction density</p>
                  </div>
                </div>
                <div class="grid gap-3 p-4 md:grid-cols-2 md:p-6">
                  <div
                    v-for="province in metrics.topProvincesList"
                    :key="province.id"
                    class="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <p class="text-sm font-semibold text-slate-900">{{ province.name_en }}</p>
                        <p class="text-xs text-slate-500">{{ province.attraction_count }} destinations</p>
                      </div>
                      <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {{ Math.round((province.attraction_count / metrics.totalAttractions) * 100) }}%
                      </span>
                    </div>
                    <div class="mt-3 h-1.5 rounded-full bg-slate-100">
                      <div class="h-1.5 rounded-full bg-emerald-500" :style="progressStyle((province.attraction_count / metrics.maxAttractionCount) * 100)"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Top Attractions and Operational Status -->
            <div class="flex flex-col gap-4">
              <!-- Top Attractions -->
              <div class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div class="border-b border-slate-100 px-4 py-3 md:px-6 bg-slate-50/50">
                  <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Highest Rated</p>
                  <p class="text-sm font-semibold text-slate-900">User favorites</p>
                </div>
                <div class="divide-y divide-slate-100">
                  <div
                    v-for="attraction in metrics.topRatedList"
                    :key="attraction.id"
                    class="px-4 py-4 md:px-6 hover:bg-slate-50 transition-colors"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="text-sm font-semibold text-slate-900 truncate">{{ attraction.name }}</p>
                        <p class="text-xs text-slate-500 truncate">{{ attraction.provinceLabel }}</p>
                      </div>
                      <span class="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                        {{ attraction.rating }} ★
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { getAdminUsers, getUsersCount } from '@/services/users.service'
import { getAttractions } from '@/services/attractions.service'
import { getProvinces, getStories } from '@/services/home.service'
import { getReviews } from '@/services/reviews.service'

const lastUpdated = ref(new Date().toLocaleString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}))

const isLoading = ref(true)
const metrics = reactive({
  totalUsers: 0,
  adminCount: 0,
  totalAttractions: 0,
  hiddenGemsCount: 0,
  totalStories: 0,
  totalReviews: 0,
  topProvince: null,
  mostPopular: null,
  topProvincesList: [],
  topRatedList: [],
  maxAttractionCount: 1
})

const normalizeAttraction = (item) => {
  const rating = Number(item.average_rating || item.rating || 0)
  const reviewCount = Number(item.review_count || 0)
  return {
    id: item.id,
    name: item.name_en || item.name || 'Unknown',
    rating: rating.toFixed(1),
    reviewCount,
    provinceLabel: item.province?.name_en || 'Unknown Province',
    score: rating * Math.log10(reviewCount + 1.1)
  }
}

const loadDashboardData = async () => {
  isLoading.value = true
  try {
    const [usersRes, userCount, attractionsRes, provincesRes, storiesRes, reviewsRes] = await Promise.all([
      getAdminUsers(),
      getUsersCount(),
      getAttractions({ limit: 1000 }),
      getProvinces(),
      getStories(100),
      getReviews()
    ])

    // Users
    const users = Array.isArray(usersRes?.data)
      ? usersRes.data
      : usersRes?.data?.data || []
    metrics.totalUsers = users.length || userCount
    metrics.adminCount = users.filter(u => u.role?.toLowerCase() === 'admin').length

    // Attractions
    const attractionsRaw = Array.isArray(attractionsRes?.data)
      ? attractionsRes.data
      : attractionsRes?.data?.data || []
    metrics.totalAttractions = attractionsRaw.length
    metrics.hiddenGemsCount = attractionsRaw.filter(a => a.is_hidden_gem).length
    
    const normalizedAttractions = attractionsRaw.map(normalizeAttraction)
    metrics.topRatedList = [...normalizedAttractions]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
    
    metrics.mostPopular = [...normalizedAttractions]
      .sort((a, b) => b.score - a.score)[0]

    // Provinces
    const provincesList = provincesRes || []
    metrics.topProvincesList = [...provincesList]
      .sort((a, b) => b.attraction_count - a.attraction_count)
      .slice(0, 4)
    
    metrics.topProvince = metrics.topProvincesList[0]
    metrics.maxAttractionCount = Math.max(...provincesList.map(p => p.attraction_count), 1)

    // Stories
    metrics.totalStories = storiesRes?.length || 0

    // Reviews
    metrics.totalReviews = reviewsRes?.data?.data?.length || 0

    lastUpdated.value = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    isLoading.value = false
  }
}

const progressStyle = (value) => ({
  width: `${Math.max(0, Math.min(100, Number(value) || 0))}%`,
})

onMounted(loadDashboardData)
</script>
