<template>
  <div class="min-h-screen bg-gray-50 px-5 py-10">

    <!-- Loading -->
    <div v-if="isPageLoading" class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div class="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
      <p class="text-gray-500 font-medium">Loading your trip...</p>
    </div>

    <!-- Error -->
    <div v-else-if="apiError" class="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div class="text-5xl">⚠️</div>
      <h2 class="text-xl font-bold text-gray-700">{{ apiError }}</h2>
      <router-link to="/trip"
        class="px-6 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition">
        ← Back to Search
      </router-link>
    </div>

    <template v-else>
      <!-- Page header -->
      <div class="max-w-7xl mx-auto mb-10 flex flex-wrap justify-between items-start gap-5">
        <div>
          <h1 class="text-3xl font-extrabold text-green-800 mb-2">Your Trip Plan</h1>
          <p class="flex flex-wrap items-center gap-3 text-gray-500">
            <span class="font-medium text-gray-700">{{ originName }} → {{ destinationName }}</span>
            <span class="text-sm text-gray-400">{{ displayDateRange }}</span>
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button @click="savePlan" :disabled="isSaving"
            class="px-4 py-2.5 bg-green-700 text-white rounded-lg text-sm font-semibold
                   hover:bg-green-800 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-sm flex items-center gap-2">
            <span v-if="isSaving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ saveLabel }}
          </button>
          <button @click="showShareModal = true"
            class="px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition shadow-sm">
            🔗 Invite Friends
          </button>
          <router-link to="/trip"
            class="px-4 py-2.5 border border-gray-300 bg-white text-green-800 rounded-lg text-sm font-semibold
                   hover:bg-gray-50 hover:border-green-700 transition">
            ← New Search
          </router-link>
        </div>
      </div>

      <!-- Save notification -->
      <Teleport to="body">
        <transition name="toast">
          <div v-if="toastMsg"
            class="fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2"
            :class="toastType === 'success' ? 'bg-green-700 text-white' : 'bg-red-500 text-white'">
            {{ toastMsg }}
          </div>
        </transition>
      </Teleport>

      <!-- Share Modal -->
      <Teleport to="body">
        <div v-if="showShareModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click.self="showShareModal = false">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div class="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <h3 class="text-lg font-bold text-green-800">Invite Friends</h3>
              <button @click="showShareModal = false" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div class="p-6 flex flex-col gap-5">
              <p class="text-sm text-gray-500">Share this trip with your friends</p>
              <div class="flex gap-2">
                <input :value="shareLink" readonly @focus="($event.target as HTMLInputElement).select()"
                  class="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50" />
                <button @click="copyToClipboard"
                  class="px-4 py-2.5 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800 transition whitespace-nowrap">
                  {{ copiedText }}
                </button>
              </div>
              <div class="flex gap-3">
                <button @click="shareToWhatsApp" class="flex-1 py-2.5 bg-[#25D366] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition">💬 WhatsApp</button>
                <button @click="shareToEmail"    class="flex-1 py-2.5 bg-red-500    text-white rounded-lg text-sm font-semibold hover:opacity-90 transition">📧 Email</button>
                <button @click="shareToFacebook" class="flex-1 py-2.5 bg-[#1877f2] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition">👍 Facebook</button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Main grid -->
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-7 items-start">

        <!-- ─── Sidebar ─────────────────────────────────────────────────────── -->
        <aside class="flex flex-col gap-5 lg:sticky lg:top-5">

          <!-- Trip details -->
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <h3 class="text-xs font-bold text-green-800 uppercase tracking-wide mb-4">Trip Details</h3>
            <div class="divide-y divide-gray-50">
              <div class="flex justify-between py-2.5 text-sm"><span class="text-gray-400">From</span><span class="font-semibold text-gray-700">{{ originName }}</span></div>
              <div class="flex justify-between py-2.5 text-sm"><span class="text-gray-400">To</span><span class="font-semibold text-gray-700">{{ destinationName }}</span></div>
              <div class="flex justify-between py-2.5 text-sm"><span class="text-gray-400">Duration</span><span class="font-semibold text-gray-700">{{ daysCount }} days</span></div>
              <div class="flex justify-between py-2.5 text-sm"><span class="text-gray-400">Travel Type</span><span class="font-semibold text-gray-700 capitalize">{{ travelType }}</span></div>
            </div>
          </div>

          <!-- ── Per-Day Weather ─────────────────────────────────────────────── -->
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-bold text-green-800 uppercase tracking-wide">Weather Forecast</h3>
              <span v-if="weatherLoading" class="w-4 h-4 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin"></span>
            </div>

            <!-- Day tabs -->
            <div class="flex gap-1.5 flex-wrap mb-4">
              <button v-for="(day, idx) in weatherForecast" :key="idx"
                @click="selectedWeatherDay = idx"
                :class="selectedWeatherDay === idx
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-green-400'"
                class="px-2.5 py-1 rounded-full border text-xs font-semibold transition">
                Day {{ idx + 1 }}
              </button>
            </div>

            <!-- Weather card for selected day -->
            <template v-if="weatherForecast.length">
              <div class="flex items-center gap-4 mb-3">
                <span class="text-4xl">{{ weatherForecast[selectedWeatherDay]?.icon }}</span>
                <div>
                  <div class="text-xs text-gray-400 mb-0.5">{{ weatherForecast[selectedWeatherDay]?.dateLabel }}</div>
                  <div class="text-2xl font-bold text-green-800">
                    {{ weatherForecast[selectedWeatherDay]?.tempMax }}° / {{ weatherForecast[selectedWeatherDay]?.tempMin }}°C
                  </div>
                  <div class="text-sm text-gray-500">{{ weatherForecast[selectedWeatherDay]?.condition }}</div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div class="bg-gray-50 rounded-lg px-3 py-2">💧 Rain: {{ weatherForecast[selectedWeatherDay]?.rain }} mm</div>
                <div class="bg-gray-50 rounded-lg px-3 py-2">💨 Wind: {{ weatherForecast[selectedWeatherDay]?.wind }} km/h</div>
                <div class="bg-gray-50 rounded-lg px-3 py-2">☀️ UV: {{ weatherForecast[selectedWeatherDay]?.uv }}</div>
                <div class="bg-gray-50 rounded-lg px-3 py-2">🌅 Sunrise: {{ weatherForecast[selectedWeatherDay]?.sunrise }}</div>
              </div>
            </template>
            <div v-else-if="!weatherLoading" class="text-xs text-gray-400 text-center py-4">Weather unavailable</div>
          </div>

          <!-- ── Daily Schedule (editable) ──────────────────────────────────── -->
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-bold text-green-800 uppercase tracking-wide">Daily Schedule</h3>
              <button v-if="schedule[selectedDay]?.length"
                @click="clearDay(selectedDay)"
                class="text-xs text-red-400 hover:text-red-600 transition">Clear</button>
            </div>

            <!-- Day selector -->
            <div class="flex flex-wrap gap-2 mb-4">
              <button v-for="day in daysCount" :key="day" @click="selectedDay = day"
                :class="selectedDay === day ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-500 border-gray-200 hover:border-green-400'"
                class="px-3 py-1 rounded-full border text-xs font-semibold transition">
                Day {{ day }}
              </button>
            </div>

            <!-- Schedule items -->
            <div class="flex flex-col gap-2 min-h-[80px]">
              <div v-if="!schedule[selectedDay]?.length" class="flex flex-col items-center justify-center h-20 text-gray-300 text-xs text-center border-2 border-dashed border-gray-200 rounded-xl">
                <span class="text-2xl mb-1">📋</span>
                Click "+ Add to Day {{ selectedDay }}" on any attraction
              </div>
              <div v-for="(item, i) in schedule[selectedDay]" :key="item.placeId"
                class="p-3 bg-green-50 rounded-lg border border-green-100 flex items-start gap-2">
                <span class="text-lg flex-shrink-0">{{ item.icon }}</span>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold text-green-800 truncate">{{ item.name }}</div>
                  <div class="text-xs text-gray-400 truncate">{{ item.vicinity }}</div>
                </div>
                <button @click="removeFromSchedule(selectedDay, i)"
                  class="text-gray-300 hover:text-red-400 transition flex-shrink-0 text-lg leading-none">×</button>
              </div>
            </div>
          </div>

          <!-- Packing list -->
          <div v-if="tripData?.packing_list?.length" class="bg-white rounded-xl p-5 shadow-sm">
            <h3 class="text-xs font-bold text-green-800 uppercase tracking-wide mb-4">Packing List</h3>
            <div class="flex flex-col gap-2">
              <div v-for="item in tripData.packing_list" :key="item.id" class="flex items-center gap-3 text-sm">
                <div @click="togglePacking(item.id)"
                  :class="item.packed ? 'bg-green-600 border-green-600' : 'border-gray-300'"
                  class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition">
                  <span v-if="item.packed" class="text-white text-[10px] font-bold">✓</span>
                </div>
                <span :class="item.packed ? 'line-through text-gray-400' : 'text-gray-700'">
                  {{ item.name }}<span v-if="item.quantity > 1" class="text-gray-400 text-xs"> ×{{ item.quantity }}</span>
                </span>
              </div>
            </div>
          </div>

        </aside>

        <!-- ─── Right column ──────────────────────────────────────────────────── -->
        <main class="flex flex-col gap-7">

          <!-- Map -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 class="text-xl font-bold text-green-800">Route Map</h2>
              <div class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-sm font-semibold">
                <span class="text-green-700">{{ originName }}</span>
                <span class="text-gray-400">→</span>
                <span class="text-blue-600">{{ destinationName }}</span>
              </div>
            </div>

            <!-- Filter chips -->
            <div class="flex flex-wrap gap-2.5 mb-4">
              <label v-for="f in filters" :key="f.id"
                :class="f.active ? 'bg-green-700 text-white border-green-800' : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'"
                class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border cursor-pointer text-sm font-medium transition select-none">
                <input type="checkbox" :checked="f.active" @change="toggleFilter(f.id)" class="hidden" />
                {{ f.icon }} {{ f.label }}
              </label>
            </div>

            <div class="flex flex-col md:flex-row gap-5">
              <div class="relative flex-1 rounded-xl overflow-hidden border border-gray-200 min-h-[460px]">
                <div ref="mapContainer" class="w-full h-full min-h-[460px]"></div>
                <div v-if="isLoadingRoute"
                  class="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-3 pointer-events-none z-[500]">
                  <div class="w-9 h-9 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <span class="text-sm font-semibold text-green-800">Loading route...</span>
                </div>
              </div>
              <div class="w-full md:w-44 flex-shrink-0">
                <p class="text-xs font-bold text-green-800 uppercase tracking-wide mb-2">Services</p>
                <div class="flex flex-col gap-1.5 mb-4">
                  <div v-for="f in filters" :key="f.id" class="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-2.5 py-2">
                    <span class="text-base">{{ f.icon }}</span><span class="text-gray-600">{{ f.label }}</span>
                    <span class="ml-auto text-gray-400">({{ getCountByType(f.id) }})</span>
                  </div>
                </div>
                <p class="text-xs font-bold text-green-800 uppercase tracking-wide mb-2">Map Key</p>
                <div class="flex flex-col gap-2 text-xs text-gray-600">
                  <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-green-700 ring-2 ring-green-700 ring-offset-1 flex-shrink-0"></span>Start</div>
                  <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-500 ring-offset-1 flex-shrink-0"></span>Destination</div>
                  <div class="flex items-center gap-2"><span class="inline-block w-6 h-1 bg-blue-500 rounded flex-shrink-0"></span>Route</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Real Attractions from Google Places ────────────────────────── -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-2xl font-bold text-green-800">Attractions Along Route</h2>
              <span v-if="attractionsLoading" class="w-5 h-5 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin"></span>
            </div>
            <p class="text-sm text-gray-400 mb-5">Click "+ Add" to add attractions to your daily schedule</p>

            <!-- Category filter tabs -->
            <div class="flex gap-2 flex-wrap mb-5">
              <button v-for="cat in attractionCategories" :key="cat.type"
                @click="selectedAttractionCategory = cat.type"
                :class="selectedAttractionCategory === cat.type
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-green-400'"
                class="px-3 py-1 rounded-full border text-xs font-semibold transition">
                {{ cat.icon }} {{ cat.label }}
              </button>
            </div>

            <div v-if="attractionsLoading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <div v-for="n in 6" :key="n" class="animate-pulse bg-gray-100 rounded-xl h-56"></div>
            </div>

            <div v-else-if="filteredAttractions.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <div v-for="place in filteredAttractions" :key="place.id"
                class="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col">

                <!-- Photo -->
                <div class="relative h-40 overflow-hidden bg-gray-100">
                  <img v-if="place.image_url || place.images?.[0]?.url"
                    :src="place.image_url ?? place.images?.[0]?.url" :alt="place.name"
                    class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-4xl">
                    {{ attractionCategories.find(c => c.type.toLowerCase() === (place.category ?? '').toLowerCase())?.icon ?? '🏛️' }}
                  </div>
                  <span class="absolute top-3 right-3 bg-green-800/90 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {{ place.category ?? 'Attraction' }}
                  </span>
                  <span v-if="isAddedToAnyDay(String(place.id))"
                    class="absolute top-3 left-3 bg-yellow-400 text-gray-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    ✓ Added
                  </span>
                </div>

                <!-- Info -->
                <div class="p-4 flex flex-col flex-1">
                  <h3 class="font-bold text-green-800 mb-0.5 leading-tight">{{ place.name }}</h3>
                  <p class="text-xs text-gray-400 mb-1">📍 {{ place.province ?? '' }}</p>
                  <p v-if="place.description" class="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">{{ place.description }}</p>
                  <div class="flex items-center gap-2 mb-3">
                    <span class="text-sm font-bold text-amber-500">⭐ {{ place.rating?.toFixed(1) ?? 'N/A' }}</span>
                  </div>

                  <!-- Add to Day selector -->
                  <div class="mt-auto flex items-center gap-2">
                    <select v-model="addToDayMap[String(place.id)]"
                      class="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500">
                      <option v-for="d in daysCount" :key="d" :value="d">Day {{ d }}</option>
                    </select>
                    <button @click="addToSchedule(place)"
                      class="px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-800 transition whitespace-nowrap">
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="py-12 text-center text-gray-400 text-sm">
              No attractions found for this area.
            </div>
          </div>

          <!-- Nearby POIs (Services) -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-2xl font-bold text-green-800">Nearby Services</h2>
              <span v-if="poisLoading" class="w-5 h-5 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin"></span>
            </div>

            <!-- Skeleton while loading -->
            <div v-if="poisLoading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <div v-for="n in 6" :key="n" class="animate-pulse bg-gray-100 rounded-xl h-32"></div>
            </div>

            <div v-else-if="filteredPOIs.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <div v-for="poi in filteredPOIs" :key="poi.id"
                class="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-green-600 hover:shadow-md transition">
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-2xl">
                    {{ filters.find(f => (poi.type ?? '').toLowerCase().includes(f.id))?.icon ?? '📍' }}
                  </span>
                  <span class="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded capitalize">
                    {{ poi.type }}
                  </span>
                </div>
                <h3 class="text-sm font-bold text-green-800 mb-1">{{ poi.name }}</h3>
                <p v-if="poi.description" class="text-xs text-gray-500 mb-3">{{ poi.description }}</p>
                <span v-if="poi.distance" class="text-xs text-gray-400">📍 {{ poi.distance }}</span>
              </div>
            </div>

            <div v-else-if="!poisLoading" class="py-12 text-center text-gray-400 text-sm">
              <div class="text-3xl mb-3">🔍</div>
              <p v-if="allPOIs.length === 0">No services data available for this destination yet.</p>
              <p v-else>Toggle the filters above to show nearby services</p>
            </div>
          </div>

        </main>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick, reactive } from 'vue'
import { useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// ─── Types ────────────────────────────────────────────────────────────────────
interface ItineraryItem  { id: string; title: string; description: string; location: string; start_time: string; day_index: number }
interface PackingItem    { id: string; name: string; quantity: number; packed: boolean }
interface TripMember     { id: string; user_id: string; role: string }
interface TripData       { id: string; title: string; destination: string; start_date: string; end_date: string; owner_id: string; invite_token: string; members: TripMember[]; itinerary_items: ItineraryItem[]; packing_list: PackingItem[] }
interface Filter        { id: string; label: string; icon: string; active: boolean }
interface DayWeather   { dateLabel: string; icon: string; condition: string; tempMax: number; tempMin: number; rain: number; wind: number; uv: number; sunrise: string }
// Matches your NestJS /api/attractions response
interface Attraction   { id: string | number; name: string; description?: string; province?: string; province_id?: string; image_url?: string; images?: { url: string }[]; rating?: number; category?: string; latitude?: number; longitude?: number }
// Matches your NestJS /api/points-of-interest response
interface POI          { id: string | number; name: string; type: string; icon?: string; description?: string; distance?: string; latitude?: number; longitude?: number }
interface ScheduleItem { placeId: string; name: string; vicinity: string; icon: string }

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// ─── Province data ────────────────────────────────────────────────────────────
const provinceCoords: Record<string, [number, number]> = {
  'phnom-penh':      [11.5564, 104.9282], 'siem-reap':       [13.3671, 103.8448],
  'koh-kong':        [11.6144, 103.0066], 'kampot':          [10.6089, 104.1812],
  'kep':             [10.4843, 104.2993], 'battambang':      [13.1022, 103.1987],
  'mondulkiri':      [12.4573, 107.1883], 'kompong-thom':    [12.6861, 104.8888],
  'kratie':          [12.4889, 106.0186], 'pursat':          [12.5387, 103.9188],
  'kompong-chhnang': [12.2503, 104.6644],
}
const provinceNames: Record<string, string> = {
  'phnom-penh': 'Phnom Penh', 'siem-reap': 'Siem Reap', 'koh-kong': 'Koh Kong',
  'kampot': 'Kampot', 'kep': 'Kep', 'battambang': 'Battambang', 'mondulkiri': 'Mondulkiri',
  'kompong-thom': 'Kompong Thom', 'kratie': 'Kratie', 'pursat': 'Pursat',
  'kompong-chhnang': 'Kompong Chhnang',
}

// ─── State ────────────────────────────────────────────────────────────────────
const vueRoute          = useRoute()
const tripData          = ref<TripData | null>(null)
const isPageLoading     = ref(false)
const apiError          = ref<string | null>(null)
const isLoadingRoute    = ref(false)
const showShareModal    = ref(false)
const isSaving          = ref(false)
const saveLabel         = ref('💾 Save Plan')
const copiedText        = ref('📋 Copy')
const selectedDay       = ref(1)
const mapContainer      = ref<HTMLElement | null>(null)
const toastMsg          = ref('')
const toastType         = ref<'success' | 'error'>('success')

// Weather
const weatherForecast   = ref<DayWeather[]>([])
const weatherLoading    = ref(false)
const selectedWeatherDay = ref(0)

// Attractions — fetched from your backend /api/attractions
const allAttractions             = ref<Attraction[]>([])
const attractionsLoading         = ref(false)
const selectedAttractionCategory = ref('all')
const addToDayMap                = reactive<Record<string, number>>({})

// POIs — fetched from your backend /api/points-of-interest
const allPOIs      = ref<POI[]>([])
const poisLoading  = ref(false)

// Schedule: day → list of ScheduleItems
const schedule = ref<Record<number, ScheduleItem[]>>({})

let leafletMap:    L.Map        | null = null
let poiLayerGroup: L.LayerGroup | null = null

// ─── Derived ──────────────────────────────────────────────────────────────────
const tripId      = computed(() => vueRoute.params.id      as string || '')
const qOrigin     = computed(() => vueRoute.query.origin   as string || '')
const qDest = computed(() => (vueRoute.query.dest as string) || (vueRoute.query.destination as string) || '')
const qStart      = computed(() => vueRoute.query.from     as string || '')
const qEnd        = computed(() => vueRoute.query.to       as string || '')
const travelType  = computed(() => vueRoute.query.type     as string || 'friends')

const origin      = computed(() => tripData.value?.destination?.split('→')[0]?.trim() || qOrigin.value)
const destination = computed(() => tripData.value?.destination?.split('→')[1]?.trim() || qDest.value)
const startDate   = computed(() => tripData.value?.start_date || qStart.value)
const endDate     = computed(() => tripData.value?.end_date   || qEnd.value)

const originName      = computed(() => provinceNames[origin.value]      || origin.value      || 'Starting Point')
const destinationName = computed(() => provinceNames[destination.value] || destination.value || 'Destination')

const displayDateRange = computed(() => {
  if (!startDate.value || !endDate.value) return 'Select dates'
  const s = new Date(startDate.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const e = new Date(endDate.value).toLocaleDateString('en-US',   { month: 'short', day: 'numeric', year: 'numeric' })
  return `${s} – ${e}`
})

const daysCount = computed(() => {
  if (!startDate.value || !endDate.value) return 3
  return Math.max(1, Math.ceil((new Date(endDate.value).getTime() - new Date(startDate.value).getTime()) / 86_400_000))
})

// ─── Weather — Open-Meteo (free, no key needed) ───────────────────────────────
const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0:  { label: 'Clear Sky',        icon: '☀️' },
  1:  { label: 'Mainly Clear',     icon: '🌤️' },
  2:  { label: 'Partly Cloudy',    icon: '⛅' },
  3:  { label: 'Overcast',         icon: '☁️' },
  45: { label: 'Foggy',            icon: '🌫️' },
  48: { label: 'Icy Fog',          icon: '🌫️' },
  51: { label: 'Light Drizzle',    icon: '🌦️' },
  61: { label: 'Slight Rain',      icon: '🌧️' },
  63: { label: 'Moderate Rain',    icon: '🌧️' },
  65: { label: 'Heavy Rain',       icon: '🌧️' },
  80: { label: 'Showers',          icon: '🌦️' },
  95: { label: 'Thunderstorm',     icon: '⛈️' },
}

const fetchWeather = async () => {
  const coords = provinceCoords[destination.value]
  if (!coords || !startDate.value) return
  weatherLoading.value = true
  try {
    const [lat, lon] = coords
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
      + `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,uv_index_max,sunrise`
      + `&timezone=Asia%2FPhnom_Penh&forecast_days=14`
    const res  = await fetch(url)
    const data = await res.json()

    const { daily } = data
    const start = new Date(startDate.value)

    // Match forecast dates to trip days
    const days: DayWeather[] = []
    for (let d = 0; d < daysCount.value; d++) {
      const tripDate = new Date(start)
      tripDate.setDate(start.getDate() + d)
      const iso = tripDate.toISOString().split('T')[0]
      const idx = daily.time.indexOf(iso)

      if (idx === -1) {
        // Date outside 14-day forecast window — use a seasonal estimate
        days.push({
          dateLabel: tripDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          icon: '🌤️', condition: 'Forecast unavailable',
          tempMax: 32, tempMin: 25, rain: 0, wind: 12, uv: 8, sunrise: '06:00',
        })
      } else {
        const code = daily.weathercode[idx] as number
        const meta = WMO_CODES[code] ?? { label: 'Unknown', icon: '🌤️' }
        const sunriseRaw: string = daily.sunrise?.[idx] ?? ''
        const sunriseTime = sunriseRaw ? sunriseRaw.split('T')[1]?.slice(0, 5) : 'N/A'
        days.push({
          dateLabel: tripDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          icon: meta.icon,
          condition: meta.label,
          tempMax: Math.round(daily.temperature_2m_max[idx]),
          tempMin: Math.round(daily.temperature_2m_min[idx]),
          rain:    Math.round((daily.precipitation_sum[idx] ?? 0) * 10) / 10,
          wind:    Math.round(daily.windspeed_10m_max[idx] ?? 0),
          uv:      Math.round(daily.uv_index_max[idx] ?? 0),
          sunrise: sunriseTime,
        })
      }
    }
    weatherForecast.value = days
  } catch (e) {
    console.error('Weather fetch failed', e)
  } finally {
    weatherLoading.value = false
  }
}

// ─── Attractions — fetched from YOUR backend ──────────────────────────────────
const attractionCategories = [
  { type: 'all',       label: 'All',        icon: '🗺️' },
  { type: 'Cultural',  label: 'Cultural',   icon: '🏛️' },
  { type: 'Nature',    label: 'Nature',     icon: '🌿' },
  { type: 'Adventure', label: 'Adventure',  icon: '🧗' },
  { type: 'Food',      label: 'Food',       icon: '🍽️' },
  { type: 'History',   label: 'History',    icon: '🏺' },
]

const fetchAttractions = async () => {
  if (!destination.value) return
  attractionsLoading.value = true
  allAttractions.value = []
  try {
    const token = localStorage.getItem('access_token')
    // Call your existing attractions endpoint, filtered by destination province
    const res = await fetch(
      `${API_BASE}/api/attractions?province=${destination.value}&limit=20`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) throw new Error(`Attractions API error ${res.status}`)
    const data = await res.json()
    // Handle both { data: [] } and plain [] response shapes
    allAttractions.value = Array.isArray(data) ? data : (data.data ?? data.attractions ?? [])
  } catch (e) {
    console.error('fetchAttractions failed:', e)
  } finally {
    attractionsLoading.value = false
  }
}

const filteredAttractions = computed(() => {
  if (selectedAttractionCategory.value === 'all') return allAttractions.value
  return allAttractions.value.filter(a =>
    (a.category ?? '').toLowerCase() === selectedAttractionCategory.value.toLowerCase()
  )
})

// ─── Schedule management ──────────────────────────────────────────────────────
const addToSchedule = (attraction: Attraction) => {
  const key = String(attraction.id)
  const day = addToDayMap[key] ?? selectedDay.value
  if (!schedule.value[day]) schedule.value[day] = []

  if (schedule.value[day].find(s => s.placeId === key)) {
    showToast('Already added to Day ' + day, 'error')
    return
  }
  const categoryIcon = attractionCategories.find(c =>
    c.type.toLowerCase() === (attraction.category ?? '').toLowerCase()
  )?.icon ?? '📍'

  schedule.value[day].push({
    placeId:  key,
    name:     attraction.name,
    vicinity: attraction.province ?? '',
    icon:     categoryIcon,
  })
  selectedDay.value = day
  showToast(`Added to Day ${day}: ${attraction.name}`, 'success')
}

const removeFromSchedule = (day: number, idx: number) => {
  schedule.value[day]?.splice(idx, 1)
}

const clearDay = (day: number) => {
  schedule.value[day] = []
}

const isAddedToAnyDay = (id: string) =>
  Object.values(schedule.value).some(items => items.some(i => i.placeId === id))

// ─── Save plan to backend ─────────────────────────────────────────────────────
// Backend endpoint: POST /api/trips/:id/itinerary   (or POST /api/trips if new)
// Payload: { origin, destination, startDate, endDate, travelType, schedule }
const savePlan = async () => {
  isSaving.value = true
  try {
    const token = localStorage.getItem('access_token')

    // Build itinerary items from schedule
    const itineraryItems = Object.entries(schedule.value).flatMap(([day, items]) =>
      items.map((item, idx) => ({
        day_index:   parseInt(day) - 1,
        title:       item.name,
        location:    item.vicinity,
        description: '',
        start_time:  '',
        sort_order:  idx,
        place_id:    item.placeId,
      }))
    )

    const payload = {
      origin:        origin.value,
      destination:   destination.value,
      start_date:    startDate.value,
      end_date:      endDate.value,
      travel_type:   travelType.value,
      itinerary_items: itineraryItems,
    }

    // If we have a tripId, update; otherwise create new
    const endpoint = tripId.value
      ? `${API_BASE}/api/trips/${tripId.value}/itinerary`
      : `${API_BASE}/api/trips`
    const method = tripId.value ? 'PUT' : 'POST'

    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `Error ${res.status}`)
    }

    saveLabel.value = '✓ Saved!'
    showToast('Trip plan saved successfully!', 'success')
    setTimeout(() => { saveLabel.value = '💾 Save Plan' }, 3000)
  } catch (err: any) {
    showToast(err.message || 'Failed to save. Please try again.', 'error')
  } finally {
    isSaving.value = false
  }
}

// ─── Toast helper ──────────────────────────────────────────────────────────────
const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
  toastMsg.value  = msg
  toastType.value = type
  setTimeout(() => { toastMsg.value = '' }, 3000)
}

// ─── Trip API fetch ────────────────────────────────────────────────────────────
const fetchTrip = async () => {
  if (!tripId.value) return
  isPageLoading.value = true
  apiError.value = null
  try {
    const token = localStorage.getItem('access_token')
    const res = await fetch(`${API_BASE}/trips/${tripId.value}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || `Error ${res.status}`) }
    tripData.value = await res.json()

    // Restore schedule from existing itinerary items
    if (tripData.value?.itinerary_items?.length) {
      const restored: Record<number, ScheduleItem[]> = {}
      for (const item of tripData.value.itinerary_items) {
        const day = (item.day_index ?? 0) + 1
        if (!restored[day]) restored[day] = []
        restored[day].push({ placeId: item.id, name: item.title, vicinity: item.location ?? '', icon: '📍' })
      }
      schedule.value = restored
    }
  } catch (err: any) {
    apiError.value = err.message || 'Failed to load trip'
  } finally {
    isPageLoading.value = false
  }
}

const togglePacking = async (itemId: string) => {
  if (!tripId.value) return
  const token = localStorage.getItem('access_token')
  await fetch(`${API_BASE}/trips/${tripId.value}/packing/${itemId}/toggle`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
  })
  const item = tripData.value?.packing_list.find(p => p.id === itemId)
  if (item) item.packed = !item.packed
}

// ─── Filters / POIs — fetched from YOUR backend ───────────────────────────────
const filters = ref<Filter[]>([
  { id: 'hospital',   label: 'Hospital',   icon: '🏥', active: false  },
  { id: 'police',     label: 'Police',     icon: '🚔', active: false  },
  { id: 'atm',        label: 'ATM',        icon: '💰', active: false  },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️', active: false },
])

const fetchPOIs = async () => {
  if (!destination.value) return
  poisLoading.value = true
  allPOIs.value = []
  try {
    const token = localStorage.getItem('access_token')
    const res = await fetch(
      `${API_BASE}/api/points-of-interest?province=${destination.value}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) throw new Error(`POI API error ${res.status}`)
    const data = await res.json()
    allPOIs.value = Array.isArray(data) ? data : (data.data ?? data.pois ?? [])
  } catch (e) {
    console.error('fetchPOIs failed:', e)
  } finally {
    poisLoading.value = false
  }
}

const filteredPOIs = computed(() => {
  const activeTypes = filters.value.filter(f => f.active).map(f => f.id)
  if (!activeTypes.length) return []
  return allPOIs.value.filter(p =>
    activeTypes.some(t => (p.type ?? '').toLowerCase().includes(t))
  )
})

const getCountByType = (type: string) =>
  allPOIs.value.filter(p => (p.type ?? '').toLowerCase().includes(type)).length

const toggleFilter = (id: string) => {
  const f = filters.value.find(f => f.id === id)
  if (f) f.active = !f.active
}

// ─── Map ──────────────────────────────────────────────────────────────────────
const fetchRoadRoute = async (o: [number, number], d: [number, number]): Promise<[number, number][]> => {
  try {
    const res  = await fetch(`https://router.project-osrm.org/route/v1/driving/${o[1]},${o[0]};${d[1]},${d[0]}?overview=full&geometries=geojson`)
    const data = await res.json()
    if (!data.routes?.length) throw new Error()
    return data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number])
  } catch { return [o, d] }
}

const initMap = async () => {
  if (!mapContainer.value) return
  const oC: [number, number] = provinceCoords[origin.value]      || [11.5564, 104.9282]
  const dC: [number, number] = provinceCoords[destination.value] || [13.3671, 103.8448]

  leafletMap = L.map(mapContainer.value, { zoomControl: true, scrollWheelZoom: true })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>', maxZoom: 18,
  }).addTo(leafletMap)

  const mkIcon = (html: string) => L.divIcon({ html, className: '', iconSize: [0,0], iconAnchor: [0,0] })
  L.marker(oC, { icon: mkIcon(`<div class="lf-marker lf-origin"><div class="lf-pin lf-pin-green"></div><div class="lf-label">${originName.value}</div></div>`) }).addTo(leafletMap)
  L.marker(dC, { icon: mkIcon(`<div class="lf-marker lf-dest"><div class="lf-pin lf-pin-blue"></div><div class="lf-label">${destinationName.value}</div></div>`) }).addTo(leafletMap)
  leafletMap.fitBounds(L.latLngBounds([oC, dC]), { padding: [60, 60] })

  poiLayerGroup = L.layerGroup().addTo(leafletMap)

  isLoadingRoute.value = true
  const coords = await fetchRoadRoute(oC, dC)
  isLoadingRoute.value = false
  if (!leafletMap) return

  const line = L.polyline(coords, { color: '#1a73e8', weight: 5, opacity: 0.9, lineJoin: 'round', lineCap: 'round' }).addTo(leafletMap)
  L.polyline(coords, { color: '#fff', weight: 2, opacity: 0.45, dashArray: '8 14', lineJoin: 'round' }).addTo(leafletMap)
  leafletMap.fitBounds(line.getBounds(), { padding: [60, 60] })
}

const updatePoiMarkers = () => {
  if (!leafletMap || !poiLayerGroup) return
  poiLayerGroup.clearLayers()
  const base: [number, number] = provinceCoords[destination.value] || [11.5564, 104.9282]
  const off: [number, number][] = [[-0.04,0.05],[0.06,-0.03],[-0.02,0.08],[0.05,0.06],[-0.07,-0.04],[0.03,-0.08],[0.08,0.01],[-0.05,0.07]]
  filteredPOIs.value.forEach((poi, i) => {
    const o = off[i % off.length]
    L.marker([base[0]+o[0], base[1]+o[1]], {
      icon: L.divIcon({ html: `<div class="lf-poi">${poi.icon}</div>`, className: '', iconSize: [36,36], iconAnchor: [18,18] })
    }).bindPopup(`<div class="lf-popup"><b>${poi.icon} ${poi.name}</b><br/><span style="color:#666;font-size:12px">${poi.description}</span><br/><span style="color:#999;font-size:11px">📍 ${poi.distance}</span></div>`, { maxWidth: 200 }).addTo(poiLayerGroup!)
  })
}

// Pin attraction markers on map when loaded
watch(allAttractions, (places) => {
  if (!leafletMap || !poiLayerGroup) return
  places.slice(0, 10).forEach(p => {
    if (!p.latitude || !p.longitude) return
    const catIcon = attractionCategories.find(c =>
      c.type.toLowerCase() === (p.category ?? '').toLowerCase()
    )?.icon ?? '📍'
    L.marker([p.latitude, p.longitude], {
      icon: L.divIcon({ html: `<div class="lf-poi">${catIcon}</div>`, className: '', iconSize: [36,36], iconAnchor: [18,18] })
    }).bindPopup(
      `<div class="lf-popup"><b>${catIcon} ${p.name}</b><br/>
       <span style="color:#666;font-size:12px">⭐ ${p.rating?.toFixed(1) ?? 'N/A'}</span><br/>
       <span style="color:#999;font-size:11px">📍 ${p.province ?? ''}</span></div>`,
      { maxWidth: 200 }
    ).addTo(poiLayerGroup!)
  })
})

watch(filteredPOIs, updatePoiMarkers, { deep: true })

// ─── Share ────────────────────────────────────────────────────────────────────
const shareLink = computed(() =>
  tripData.value?.invite_token
    ? `${window.location.origin}/trip/join/${tripData.value.invite_token}`
    : `${window.location.origin}/trip/results?origin=${origin.value}&destination=${destination.value}&from=${startDate.value}&to=${endDate.value}&type=${travelType.value}`
)
const copyToClipboard = async () => { await navigator.clipboard.writeText(shareLink.value).catch(()=>{}); copiedText.value = '✓ Copied!'; setTimeout(() => { copiedText.value = '📋 Copy' }, 2000) }
const shareToWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`My trip: ${originName.value} → ${destinationName.value} — ${shareLink.value}`)}`, '_blank')
const shareToEmail    = () => window.open(`mailto:?subject=${encodeURIComponent(`Trip: ${originName.value} → ${destinationName.value}`)}&body=${encodeURIComponent(shareLink.value)}`)
const shareToFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink.value)}`, '_blank')

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  await fetchTrip()
  await nextTick()
  await initMap()
  await Promise.all([fetchWeather(), fetchAttractions(), fetchPOIs()])
})
onUnmounted(() => { leafletMap?.remove(); leafletMap = null })
</script>

<style>
/* Leaflet markers — must be global */
.lf-marker     { display:flex; align-items:center; gap:7px; pointer-events:none; }
.lf-pin        { width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,.35); flex-shrink:0; }
.lf-pin-green  { background:#15803d; }
.lf-pin-blue   { background:#1a73e8; }
.lf-label      { background:white; font-size:12px; font-weight:700; padding:3px 9px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,.18); white-space:nowrap; }
.lf-origin .lf-label { border-left:3px solid #15803d; }
.lf-dest   .lf-label { border-left:3px solid #1a73e8; }
.lf-poi        { width:36px; height:36px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 3px 10px rgba(0,0,0,.25); border:2px solid #e5e7eb; cursor:pointer; transition:transform .15s; }
.lf-poi:hover  { transform:scale(1.15); }
.lf-popup      { font-size:13px; line-height:1.5; }
.leaflet-control-attribution { font-size:10px !important; }

/* Toast transition */
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
</style>