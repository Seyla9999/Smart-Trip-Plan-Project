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

        <h1 class="text-5xl font-bold text-white mb-3 tracking-tight">Explore Provinces</h1>
        <p class="text-slate-300 text-lg mb-10">Discover all 25 provinces of Cambodia — from coast to highlands</p>
        
        <div class="flex justify-center">
          <div class="relative w-full max-w-xl">
            <div class="relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" stroke-width="2"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35" />
              </svg>
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Search by province name..."
                class="w-full bg-white px-12 py-3.5 pr-32 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 placeholder-slate-400 shadow-xl"
              />
              <button class="absolute right-1.5 top-1/2 -translate-y-1/2 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-bold tracking-wide transition shadow-md">
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
            v-for="filter in filters" 
            :key="filter"
            @click="activeFilter = filter"
            :class="[
              'px-4 py-3 whitespace-nowrap text-sm font-medium transition-all',
              activeFilter === filter 
                ? 'text-green-700 border-b-2 border-green-700' 
                : 'text-slate-500 hover:text-slate-700 border-b-2 border-transparent'
            ]"
          >
            {{ filter }}
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-10">
      <div class="flex justify-between items-center mb-8">
        <p class="text-slate-600 font-medium">Showing <span class="font-bold text-slate-800">{{ filteredProvinces.length }}</span> provinces in Cambodia</p>
        <div class="flex items-center gap-2 cursor-pointer group">
          <span class="text-sm text-slate-600 group-hover:text-slate-800 transition">Sort by: <span class="font-semibold">Popularity</span></span>
          <svg class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="province in filteredProvinces" 
          :key="province.id"
          class="group cursor-pointer"
          @click="openProvince(province.name)"
        >
          <div class="relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 bg-white border border-slate-100">
            <div class="relative h-48 overflow-hidden">
              <img 
                :src="province.image" 
                :alt="province.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
        
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

            
              <div class="absolute bottom-3 left-3 right-3">
                <h3 class="text-white font-bold text-lg mb-0.5">{{ province.name }}</h3>
                <p class="text-white/70 text-xs font-medium">{{ province.region }}</p>
              </div>

              
              <div class="absolute top-3 right-3 flex flex-col gap-2">
                
                <div class="flex items-center gap-1.5 bg-green-700/95 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-md font-bold shadow-lg">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {{ province.visits }}
                </div>
                <div class="flex items-center gap-1.5 bg-amber-500/95 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-md font-bold shadow-lg">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {{ province.rating }}
                </div>
              </div>
            </div>

            <div class="p-4 flex items-center justify-between bg-white">
              <span class="inline-flex items-center bg-indigo-50 text-indigo-700 text-xs px-3 py-1.5 rounded-full font-semibold uppercase tracking-wide">
                {{ province.category }}
              </span>
              <svg class="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredProvinces.length === 0" class="text-center py-20">
        <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 class="text-xl font-semibold text-slate-700 mb-2">No provinces found</h3>
        <p class="text-slate-500">Try adjusting your search or filter</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const searchQuery = ref<string>('')
const activeFilter = ref<string>('ALL')
const filters = ['ALL', 'BEACH', 'MOUNTAIN', 'CULTURAL', 'FOOD', 'NATURE', 'CITY', 'OFF THE BEATEN PATH']

const provinces = [
  { id: 1, name: 'Siem Reap', region: 'ខេត្ត', image: 'https://plus.unsplash.com/premium_photo-1661963188432-5de8a11f21a7?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', visits: '42', rating: '4.9', category: 'TEMPLES' },
  { id: 2, name: 'Phnom Penh', region: 'រាជធានី', image: 'https://cdn.sanity.io/images/nxpteyfv/goguides/3c2447e05a60250ab155fef9820230dc20a5c86b-1600x1066.jpg', visits: '38', rating: '4.7', category: 'CITY' },
  { id: 3, name: 'Sihanoukville', region: 'ខេត្ត', image: 'https://thebettercambodia.com/wp-content/uploads/2025/05/Koh-Rong-Island-Sihanoukville-860x484.jpg', visits: '27', rating: '4.8', category: 'BEACH' },
  { id: 4, name: 'Koh Kong', region: 'ខេត្ត', image: 'https://www.guidingcambodia.com/wp-content/uploads/2023/11/Koh-Andet-Eco-Resort-01-453x340-1.jpg', visits: '19', rating: '4.9', category: 'NATURE' },
  { id: 5, name: 'Kampot', region: 'ខេត្ត', image: 'https://cambodia-images.com/wp-content/uploads/2016/08/bokor_pagoda_pano_01-1024x683.jpg', visits: '22', rating: '4.8', category: 'RIVER' },
  { id: 6, name: 'Ratanakiri', region: 'ខេត្ត', image: 'https://www.mondulkiriproject.org/wp-content/uploads/2019/06/Ratanakiri.jpg', visits: '14', rating: '4.9', category: 'HIGHLAND' },
  { id: 7, name: 'Mondulkiri', region: 'ខេត្ត', image: 'https://www.asiakingtravel.com/cuploads/files/Mondulkiri-2.jpg', visits: '11', rating: '4.8', category: 'FOREST' },
  { id: 8, name: 'Battambang', region: 'ខេត្ត', image: 'https://scckampongthom.wordpress.com/wp-content/uploads/2015/10/battambang-61.jpg', visits: '20', rating: '4.9', category: 'CULTURAL' },
  { id: 9, name: 'Kratie', region: 'ខេត្ត', image: 'https://www.mrlinhadventure.com/UserFiles/image/New%20Country%20Guide/Kratie_Traditional-House.jpg', visits: '9', rating: '4.9', category: 'RIVER' },
  { id: 10, name: 'Kep', region: 'ខេត្ត', image: 'https://www.novo-monde.com/app/uploads/2023/07/kep-cambodia-2-1024x683.jpg', visits: '8', rating: '4.8', category: 'BEACH' },
  { id: 11, name: 'Preah Vihear', region: 'ខេត្ត', image: 'https://pressocm.gov.kh/wp-content/uploads/2017/07/site_1224_0017-750-0-20130711145029.jpg', visits: '7', rating: '4.9', category: 'TEMPLE' },
  { id: 12, name: 'Takeo', region: 'ខេត្ត', image: 'https://thebettercambodia.com/wp-content/uploads/2025/06/Takeo-Province.jpg', visits: '12', rating: '4.8', category: 'CULTURAL' }
]

const filteredProvinces = computed(() => {
  let result = provinces

  if (searchQuery.value) {
    result = result.filter(p => p.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  }

  if (activeFilter.value !== 'ALL') {
    result = result.filter(p => p.category === activeFilter.value)
  }

  return result
})

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function openProvince(name: string) {
  router.push(`/province/${toSlug(name)}`)
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