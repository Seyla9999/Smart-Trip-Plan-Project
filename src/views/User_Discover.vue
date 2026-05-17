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

        <h1 class="text-5xl font-bold text-white mb-3 tracking-tight">Discover Attractions</h1>
        <p class="text-slate-300 text-lg mb-10">Explore incredible places across Cambodia</p>
        
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

    <div class="bg-white border-b border-slate-200 sticky top-0 z-40 flex shadow-sm items-center justify-center">
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
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-10">
      <div class="flex justify-between items-center mb-8">
        <p class="text-slate-600 font-medium">Showing <span class="font-bold text-slate-800">{{ attractions.length }}</span> attractions</p>
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
                <h3 class="text-white font-bold text-lg mb-0.5">{{ attraction.name }}</h3>
                <p class="text-white/70 text-xs font-medium">{{ attraction.category }}</p>
              </div>
              
              <div class="absolute flex top-3 right-3 flex-col gap-2">
                <button
                  type="button"
                  class="flex items-center gap-1.5 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-md font-bold shadow-lg transition-all bg-blue-900/95 hover:bg-blue-800"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V5z" />
                  </svg>
                </button>
                
                <div class="flex items-center gap-1.5 bg-amber-600/95 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-md font-bold shadow-lg">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {{ attraction.rating }}
                </div>
              </div>
            </div>

            <div class="pl-2 pt-4 pb-4 pr-3">
              <div class="flex items-center justify-between">
                <span v-if="attraction.entrance_fee" class="inline-flex items-center bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                  ${{ attraction.entrance_fee }}
                </span>
                <span v-else class="inline-flex items-center bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                  {{ attraction.province_name_en }}
                </span>
                <p class="text-xs text-slate-500 mb-2">{{ attraction.review_count }} reviews</p>
              </div>
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

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAttractions, getCategories } from '@/services/attractions.service'
import { getProvinces } from '@/services/home.service'

const router = useRouter()


const searchQuery = ref<string>('')
const selectedCategory = ref<string>('')
const categories = ref<string[]>([''])
const attractions = ref<any[]>([])
const provinceNameById = ref<Record<number, string>>({})
const loading = ref(false)
const error = ref<string | null>(null)
const sortBy = ref<string>('rating')

onMounted(async () => {
  await Promise.all([loadCategories(), loadProvinces()])
  await fetchAttractions()
})

async function loadCategories() {
  try {
    const response = await getCategories()
    categories.value = ['', ...response.data.categories]
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

// Fetch attractions with filters
async function fetchAttractions() {
  loading.value = true
  error.value = null

  try {
    const response = await getAttractions({
      search: searchQuery.value || undefined,
      category: selectedCategory.value || undefined,
      sortBy: sortBy.value,
      sortOrder: 'DESC',
    })

    const rawAttractions = Array.isArray(response.data?.data) ? response.data.data : []

    attractions.value = rawAttractions.map((item: any) => ({
      id: item.id,
      name: item.name ?? item.name_en ?? item.name_kh ?? 'Unnamed Attraction',
      category: item.category ?? 'Unknown',
      rating: Number(item.rating ?? item.average_rating ?? 0),
      review_count: Number(item.review_count ?? 0),
      image_url: item.image_url ?? item.image ?? '',
      entrance_fee: item.entrance_fee ?? item.entry_fee ?? null,
      province_name_en:
        item.province?.name_en ??
        provinceNameById.value[Number(item.province_id)] ??
        'Unknown Province',
    }))
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to fetch attractions'
    console.error('Error fetching attractions:', err)
  } finally {
    loading.value = false
  }
}

// Select category and fetch
function selectCategory(category: string) {
  selectedCategory.value = category
  fetchAttractions()
}

// Navigate to attraction detail page
function goToAttractionDetail(attraction: any) {
  router.push({
    name: 'AttractionDetail',
    params: {
      id: attraction.id,
    },
  })
}

</script>

<style scoped>
.bg-navy {
  background: #1e293b;
}

.bg-navy-dark {
  background: #0f172a;
}

.border-navy-light {
  border-color: #334155;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
