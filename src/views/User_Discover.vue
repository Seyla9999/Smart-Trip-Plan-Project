<template>
  <div class="min-h-screen min-w-full bg-slate-50">

    <div class="relative w-full bg-navy-dark overflow-hidden">
      <div class="absolute inset-0 opacity-15">
        <svg viewBox="0 0 1200 300" class="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="map-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="1.5" fill="currentColor" class="text-blue-300" opacity="0.3"/>
              <line x1="20" y1="30" x2="80" y2="70" stroke="currentColor" class="text-blue-300" opacity="0.15" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-pattern)"/>
        </svg>
      </div>

      <div class="relative z-10 max-w-full mx-auto px-6 py-16 text-center overflow-hidden">
        <div 
          class="absolute inset-0 -z-10 bg-cover bg-center" 
          :style="{ opacity: 0.3, backgroundImage: `url(https://www.trailsofindochina.com/wp-content/uploads/2017/08/Siem-Reap_header-1.jpg)` }"
        ></div>

        <h1 class="text-5xl font-bold text-white mb-3 tracking-tight">
          {{ showHiddenOnly ? 'Hidden Gems' : 'Discover Attractions' }}
        </h1>
        <p class="text-slate-300 text-lg mb-10">
          {{ showHiddenOnly ? 'Off the beaten path secrets of Cambodia' : 'Explore incredible places across Cambodia' }}
        </p>
        
        <div class="flex justify-center">
          <div class="relative w-full max-w-xl">
            <div class="relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" stroke-width="2"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35" />
              </svg>
              <input 
                v-model="searchQuery"
                @keyup.enter="fetchAttractions"
                type="text" 
                placeholder="Search attractions by name..."
                class="w-full bg-white px-12 py-3.5 pr-32 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 placeholder-slate-400 shadow-xl"
              />
              <button 
                @click="fetchAttractions"
                class="absolute right-1.5 top-1/2 -translate-y-1/2 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-bold tracking-wide transition shadow-md"
              >
                SEARCH
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!showHiddenOnly" class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex gap-1 overflow-x-auto scrollbar-hide py-1">
          <button 
            v-for="filter in categories" 
            :key="filter"
            @click="selectCategory(filter)"
            :class="[
              'px-4 py-3 whitespace-nowrap text-sm font-medium transition-all',
              selectedCategory === filter 
                ? 'text-green-700 border-b-2 border-green-700' 
                : 'text-slate-500 hover:text-slate-700 border-b-2 border-transparent'
            ]"
          >
            {{ filter || 'All' }}
          </button>
        </div>
        <div v-if="Object.keys(provinceNameById).length > 0" class="flex items-center gap-2 pb-2">
          <span class="text-xs text-slate-400 whitespace-nowrap">Province:</span>
          <select
            v-model="selectedProvince"
            @change="selectProvince(selectedProvince)"
            class="text-xs text-slate-600 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-700"
          >
            <option value="">All provinces</option>
            <option v-for="(name, id) in provinceNameById" :key="id" :value="name">
              {{ name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="showHiddenOnly" class="bg-amber-50 border-b border-amber-200 py-3 px-6 flex items-center justify-between">
      <span class="text-amber-800 text-sm font-medium">Showing hidden gems only</span>
      <button @click="clearHiddenFilter" class="text-xs text-amber-700 underline">Show all attractions</button>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-10">
      <div class="flex justify-between items-center mb-8">
        <p class="text-slate-600 font-medium">
          Showing <span class="font-bold text-slate-800">{{ attractions.length }}</span>
          {{ showHiddenOnly ? 'hidden gems' : 'attractions' }}
          <span v-if="selectedCategory" class="text-green-700"> in {{ selectedCategory }}</span>
          <span v-if="selectedProvince" class="text-green-700"> · {{ selectedProvince }}</span>
        </p>
        <div class="flex items-center gap-3">
          <select 
            v-model="sortBy"
            @change="fetchAttractions"
            class="text-sm text-slate-600 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-700"
          >
            <option value="rating">Rating (High to Low)</option>
            <option value="name">Name (A-Z)</option>
            <option value="reviewCount">Most Reviewed</option>
            <option value="createdAt">Newest</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="h-64 bg-slate-200 rounded-xl animate-pulse"></div>
      </div>

      <div v-else-if="attractions.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="attraction in attractions" 
          :key="attraction.id"
          class="group cursor-pointer"
          @click="goToAttractionDetail(attraction)"
        >
          <div class="relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 bg-white border border-slate-100">
            <div class="relative h-48 overflow-hidden">
              <img 
                :src="attraction.image_url || 'https://via.placeholder.com/300x200'" 
                :alt="attraction.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

              <div class="absolute bottom-3 left-3 right-3">
                <h3 class="text-white font-bold text-lg mb-0.5 leading-tight">{{ attraction.name }}</h3>
                <p class="text-white/70 text-xs font-medium">{{ attraction.category }}</p>
              </div>

              <div v-if="attraction.is_hidden_gem" class="absolute top-3 left-3">
                <span class="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Hidden Gem
                </span>
              </div>

              <div class="absolute top-3 right-3">
                <div class="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-bold">
                  <svg class="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {{ attraction.rating }}
                </div>
              </div>
            </div>

            <!-- Card bottom -->
            <div class="px-3 py-3 flex items-center justify-between">
              <div class="flex items-center gap-1 text-slate-500 text-xs">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {{ attraction.province_name_en }}
              </div>
              <span class="text-xs text-slate-400">{{ attraction.review_count }} reviews</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 class="text-xl font-semibold text-slate-700 mb-2">No attractions found</h3>
        <p class="text-slate-500">Try adjusting your search or filters</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAttractions, getCategories } from '@/services/attractions.service'
import type { AttractionsFilterParams } from '@/services/attractions.service'
import { getProvinces } from '@/services/home.service'

const router = useRouter()
const route  = useRoute()

const searchQuery      = ref<string>('')
const selectedCategory = ref<string>('')
const selectedProvince = ref<string>('')
const showHiddenOnly   = ref<boolean>(false)
const categories       = ref<string[]>([''])
const attractions      = ref<any[]>([])
const provinceNameById = ref<Record<number, string>>({})
const loading          = ref(false)
const error            = ref<string | null>(null)
const sortBy           = ref<string>('rating')
const FETCH_LIMIT      = 100

const normalizeText = (value: unknown) =>
  value ? value.toString().trim().toLowerCase() : ''

const resolveCategoryLabel = (category: unknown) => {
  if (!category) return ''
  if (typeof category === 'string') return category
  if (typeof category === 'object') {
    const maybe =
      (category as any).name ??
      (category as any).name_en ??
      (category as any).title ??
      (category as any).label
    if (maybe) return maybe
  }
  return String(category)
}

function readQueryParams() {
  selectedCategory.value = (route.query.category as string) || ''
  selectedProvince.value = (route.query.province as string) || ''
  showHiddenOnly.value   = route.query.hidden === 'true'
  if (showHiddenOnly.value) selectedCategory.value = ''
}

watch(
  () => route.query,
  async () => {
    readQueryParams()
    await fetchAttractions()
  },
  { immediate: true, deep: true },
)

onMounted(async () => {
  await Promise.all([loadCategories(), loadProvinces()])
})

async function loadCategories() {
  try {
    const response = await getCategories()
    const list = Array.isArray(response.data?.categories)
      ? (response.data.categories as unknown[])
      : []
    const normalized = list
      .map(resolveCategoryLabel)
      .filter((value): value is string => Boolean(value))
    categories.value = ['', ...Array.from(new Set(normalized))]
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
}

async function loadProvinces() {
  try {
    const provinces = await getProvinces()
    provinceNameById.value = Object.fromEntries(
      provinces.map((province) => [Number(province.id), province.name_en]),
    )
  } catch (err) {
    console.error('Failed to load provinces:', err)
  }
}

async function fetchAttractions() {
  loading.value = true
  error.value   = null

  try {
    const filters: AttractionsFilterParams = {
      search:        searchQuery.value      || undefined,
      category:      selectedCategory.value || undefined,
      is_hidden_gem: showHiddenOnly.value   ? 'true' : undefined,
      sortBy:        sortBy.value,
      sortOrder:     'DESC',
    }
    const allAttractions: any[] = []
    let offset = 0

    for (let page = 0; page < 100; page += 1) {
      const response = await getAttractions({ ...filters, limit: FETCH_LIMIT, offset })
      const pageAttractions = Array.isArray(response.data?.data) ? response.data.data : []
      allAttractions.push(...pageAttractions)
      const total = Number(response.data?.pagination?.total ?? pageAttractions.length)
      if (pageAttractions.length === 0 || allAttractions.length >= total) break
      offset += FETCH_LIMIT
    }

    const uniqueAttractions = Array.from(
      new Map(allAttractions.map((item: any) => [String(item.id), item])).values(),
    )

    const mappedAttractions = uniqueAttractions.map((item: any) => ({
      id:               item.id,
      name:             item.name ?? item.name_en ?? item.name_kh ?? 'Unnamed Attraction',
      category:         resolveCategoryLabel(item.category ?? item.main_category ?? item.category_name) || 'Unknown',
      rating:           Number(item.rating ?? item.average_rating ?? 0),
      review_count:     Number(item.review_count ?? 0),
      image_url:        item.image_url ?? item.image ?? '',
      entrance_fee:     item.entrance_fee ?? item.entry_fee ?? null,
      is_hidden_gem:    item.is_hidden_gem ?? false,
      province_name_en: item.province?.name_en ?? provinceNameById.value[Number(item.province_id)] ?? 'Unknown Province',
      created_at:       item.created_at ?? item.createdAt ?? null,
    }))

    const selected = normalizeText(selectedCategory.value)
    const query    = normalizeText(searchQuery.value)
    const province = normalizeText(selectedProvince.value)

    let filtered = mappedAttractions

    if (selected) {
      filtered = filtered.filter(item => normalizeText(item.category) === selected)
    }
    if (province) {
      filtered = filtered.filter(item => normalizeText(item.province_name_en) === province)
    }
    if (query) {
      filtered = filtered.filter(item =>
        normalizeText([item.name, item.category, item.province_name_en].join(' ')).includes(query)
      )
    }

    if (sortBy.value === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy.value === 'reviewCount') {
      filtered = [...filtered].sort((a, b) => b.review_count - a.review_count)
    } else if (sortBy.value === 'createdAt') {
      filtered = [...filtered].sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
        return bTime - aTime
      })
    } else {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating)
    }

    attractions.value = filtered
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to fetch attractions'
    console.error('Error fetching attractions:', err)
  } finally {
    loading.value = false
  }
}

function selectCategory(category: string) {
  router.replace({ query: {
    ...(category               ? { category }                         : {}),
    ...(selectedProvince.value ? { province: selectedProvince.value } : {}),
  }})
}

function selectProvince(province: string) {
  router.replace({ query: {
    ...(selectedCategory.value ? { category: selectedCategory.value } : {}),
    ...(province               ? { province }                         : {}),
    ...(showHiddenOnly.value   ? { hidden: 'true' }                   : {}),
  }})
}

function clearHiddenFilter() {
  router.replace({ query: {} })
}

function goToAttractionDetail(attraction: any) {
  router.push({ name: 'AttractionDetail', params: { id: attraction.id } })
}
</script>

<style scoped>
.bg-navy      { background: #1e293b; }
.bg-navy-dark { background: #0f172a; }
.border-navy-light { border-color: #334155; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>