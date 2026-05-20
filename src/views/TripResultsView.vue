<template>
  <div class="min-h-screen bg-gray-50 px-5 py-10">

    <!-- Loading -->
    <div v-if="isPageLoading" class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div class="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
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
      <!-- ── Page header ──────────────────────────────────────────────────── -->
      <div class="max-w-7xl mx-auto mb-10 flex flex-wrap justify-between items-start gap-5">
        <div>
          <h1 class="text-3xl font-extrabold text-green-800 mb-2">Your Trip Plan</h1>
          <p class="flex flex-wrap items-center gap-3 text-gray-500">
            <span class="font-medium text-gray-700">{{ originName }} → {{ destinationName }}</span>
            <span class="text-sm text-gray-400">{{ displayDateRange }}</span>
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button @click="saveTrip" :disabled="tripSaved"
            class="px-4 py-2.5 bg-green-700 text-white rounded-lg text-sm font-semibold
                   hover:bg-green-800 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-sm">
            {{ tripSaved ? '✓ Saved' : '💾 Save Trip' }}
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

      <!-- ── Share Modal ──────────────────────────────────────────────────── -->
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

      <!-- ── Main grid ────────────────────────────────────────────────────── -->
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-7 items-start">

        <!-- Sidebar -->
        <aside class="flex flex-col gap-5 lg:sticky lg:top-5">

          <!-- Trip details -->
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <h3 class="text-xs font-bold text-green-800 uppercase tracking-wide mb-4">Trip Details</h3>
            <div class="divide-y divide-gray-50">
              <div class="flex justify-between py-2.5 text-sm"><span class="text-gray-400">From</span><span class="font-semibold text-gray-700">{{ originName }}</span></div>
              <div class="flex justify-between py-2.5 text-sm"><span class="text-gray-400">To</span><span class="font-semibold text-gray-700">{{ destinationName }}</span></div>
              <div class="flex justify-between py-2.5 text-sm"><span class="text-gray-400">Duration</span><span class="font-semibold text-gray-700">{{ daysCount }} days</span></div>
              <div class="flex justify-between py-2.5 text-sm"><span class="text-gray-400">Travel Type</span><span class="font-semibold text-gray-700 capitalize">{{ travelType }}</span></div>
              <div v-if="tripData?.members?.length" class="flex justify-between py-2.5 text-sm">
                <span class="text-gray-400">Members</span>
                <span class="font-semibold text-gray-700">{{ tripData.members.length }}</span>
              </div>
            </div>
          </div>

          <!-- Weather -->
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <h3 class="text-xs font-bold text-green-800 uppercase tracking-wide mb-4">Weather</h3>
            <div class="flex items-center gap-4">
              <span class="text-5xl">{{ weatherIcon }}</span>
              <div>
                <div class="text-2xl font-bold text-green-800">{{ weather.temperature }}°C</div>
                <div class="text-sm text-gray-500">{{ weather.condition }}</div>
                <div class="text-xs text-gray-400 mt-0.5">💧 {{ weather.humidity }}%</div>
              </div>
            </div>
          </div>

          <!-- Daily schedule -->
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <h3 class="text-xs font-bold text-green-800 uppercase tracking-wide mb-4">Daily Schedule</h3>
            <div class="flex flex-wrap gap-2 mb-4">
              <button v-for="day in daysCount" :key="day" @click="selectedDay = day"
                :class="selectedDay === day ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-500 border-gray-200 hover:border-green-400'"
                class="px-3 py-1 rounded-full border text-xs font-semibold transition">
                Day {{ day }}
              </button>
            </div>
            <div class="flex flex-col gap-2">
              <template v-if="dayItinerary.length">
                <div v-for="item in dayItinerary" :key="item.id" class="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div class="text-xs font-bold text-green-700 mb-1">{{ item.start_time || '🕐' }} {{ item.title }}</div>
                  <p v-if="item.description" class="text-xs text-gray-500">{{ item.description }}</p>
                  <p v-if="item.location"    class="text-xs text-gray-400 mt-1">📍 {{ item.location }}</p>
                </div>
              </template>
              <template v-else>
                <div class="p-3 bg-gray-50 rounded-lg border border-gray-100"><div class="text-xs font-bold text-green-700 mb-1">🌅 Morning</div><p class="text-xs text-gray-500">Arrival and check-in</p></div>
                <div class="p-3 bg-gray-50 rounded-lg border border-gray-100"><div class="text-xs font-bold text-green-700 mb-1">☀️ Afternoon</div><p class="text-xs text-gray-500">Explore local attractions</p></div>
                <div class="p-3 bg-gray-50 rounded-lg border border-gray-100"><div class="text-xs font-bold text-green-700 mb-1">🌙 Evening</div><p class="text-xs text-gray-500">Dinner and local experiences</p></div>
              </template>
            </div>
          </div>

          <!-- Packing list (API data) -->
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

        <!-- Right column -->
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
              <!-- Leaflet canvas -->
              <div class="relative flex-1 rounded-xl overflow-hidden border border-gray-200 min-h-[460px]">
                <div ref="mapContainer" class="w-full h-full min-h-[460px]"></div>
                <div v-if="isLoadingRoute"
                  class="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-3 pointer-events-none z-[500]">
                  <div class="w-9 h-9 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <span class="text-sm font-semibold text-green-800">Loading route...</span>
                </div>
              </div>
              <!-- Legend -->
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
                  <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-green-700 ring-2 ring-green-700 ring-offset-1 flex-shrink-0"></span>Starting Point</div>
                  <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-500 ring-offset-1 flex-shrink-0"></span>Destination</div>
                  <div class="flex items-center gap-2"><span class="inline-block w-6 h-1 bg-blue-500 rounded flex-shrink-0"></span>Route</div>
                </div>
              </div>
            </div>
          </div>

          <!-- POI section -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h2 class="text-2xl font-bold text-green-800 mb-5">Nearby Services & Attractions</h2>
            <div v-if="filteredPOIs.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <div v-for="poi in filteredPOIs" :key="poi.id"
                class="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-green-600 hover:shadow-md transition">
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-2xl">{{ poi.icon }}</span>
                  <span class="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded">{{ poi.type }}</span>
                </div>
                <h3 class="text-sm font-bold text-green-800 mb-1">{{ poi.name }}</h3>
                <p class="text-xs text-gray-500 mb-3">{{ poi.description }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-400">{{ poi.distance }}</span>
                  <button class="px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-800 transition">Details</button>
                </div>
              </div>
            </div>
            <div v-else class="py-12 text-center text-gray-400 text-sm">Select a filter above to see nearby services</div>
          </div>

          <!-- Attractions -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h2 class="text-2xl font-bold text-green-800 mb-1">Recommended Attractions</h2>
            <p class="text-sm text-gray-400 mb-6">Must-see places based on your travel preferences</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <div v-for="a in attractions" :key="a.id"
                class="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <div class="relative h-44 overflow-hidden">
                  <img :src="a.image" :alt="a.name" class="w-full h-full object-cover" />
                  <span class="absolute top-3 right-3 bg-green-800/90 text-white text-xs font-bold px-3 py-1 rounded-full">{{ a.category }}</span>
                  <span :class="a.attractionType === 'destination' ? 'bg-green-800/90 text-white' : 'bg-yellow-400/90 text-gray-800'"
                    class="absolute bottom-3 left-3 text-xs font-bold px-3 py-1 rounded-full">
                    {{ a.attractionType === 'destination' ? '📍 Destination' : '🛣️ Along Route' }}
                  </span>
                </div>
                <div class="p-4">
                  <h3 class="font-bold text-green-800 mb-0.5">{{ a.name }}</h3>
                  <p class="text-xs text-gray-400 mb-2 capitalize">{{ provinceNames[a.locationProvince] || a.locationProvince }}</p>
                  <p class="text-xs text-gray-500 leading-relaxed mb-3">{{ a.description }}</p>
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-bold text-green-800">⭐ {{ a.rating }}</span>
                    <button class="px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-800 transition">+ Add</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
interface ItineraryItem { id: string; title: string; description: string; location: string; start_time: string; day_index: number }
interface PackingItem   { id: string; name: string; quantity: number; packed: boolean }
interface TripMember    { id: string; user_id: string; role: string }
interface TripData      { id: string; title: string; destination: string; start_date: string; end_date: string; owner_id: string; invite_token: string; members: TripMember[]; itinerary_items: ItineraryItem[]; packing_list: PackingItem[] }
interface Attraction    { id: number; name: string; category: string; description: string; image: string; rating: number; locationProvince: string; attractionType: 'destination' | 'route' }
interface POI           { id: number; name: string; type: string; icon: string; description: string; distance: string }
interface Filter        { id: string; label: string; icon: string; active: boolean }
interface Weather       { temperature: number; condition: string; humidity: number }

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const provinceCoords: Record<string, [number, number]> = {
  'phnom-penh': [11.5564, 104.9282], 'siem-reap': [13.3671, 103.8448],
  'koh-kong': [11.6144, 103.0066],   'kampot': [10.6089, 104.1812],
  'kep': [10.4843, 104.2993],        'battambang': [13.1022, 103.1987],
  'mondulkiri': [12.4573, 107.1883], 'kompong-thom': [12.6861, 104.8888],
  'kratie': [12.4889, 106.0186],     'pursat': [12.5387, 103.9188],
  'kompong-chhnang': [12.2503, 104.6644],
}

const provinceNames: Record<string, string> = {
  'phnom-penh': 'Phnom Penh', 'siem-reap': 'Siem Reap', 'koh-kong': 'Koh Kong',
  'kampot': 'Kampot', 'kep': 'Kep', 'battambang': 'Battambang', 'mondulkiri': 'Mondulkiri',
  'kompong-thom': 'Kompong Thom', 'kratie': 'Kratie', 'pursat': 'Pursat',
  'kompong-chhnang': 'Kompong Chhnang',
}

// ─── State ────────────────────────────────────────────────────────────────────
const vueRoute       = useRoute()
const tripData       = ref<TripData | null>(null)
const isPageLoading  = ref(false)
const apiError       = ref<string | null>(null)
const isLoadingRoute = ref(false)
const showShareModal = ref(false)
const tripSaved      = ref(false)
const copiedText     = ref('📋 Copy')
const selectedDay    = ref(1)
const mapContainer   = ref<HTMLElement | null>(null)

let leafletMap:    L.Map        | null = null
let poiLayerGroup: L.LayerGroup | null = null

// ─── Derived values ───────────────────────────────────────────────────────────
const tripId      = computed(() => vueRoute.params.id      as string || '')
const qOrigin     = computed(() => vueRoute.query.origin   as string || '')
const qDest       = computed(() => vueRoute.query.destination as string || '')
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

const dayItinerary = computed(() =>
  (tripData.value?.itinerary_items ?? []).filter(i => i.day_index === selectedDay.value - 1)
)

// ─── API ──────────────────────────────────────────────────────────────────────
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

// ─── Weather ──────────────────────────────────────────────────────────────────
const weatherData: Record<string, Weather> = {
  'phnom-penh': { temperature: 32, condition: 'Sunny',         humidity: 70 },
  'siem-reap':  { temperature: 30, condition: 'Partly Cloudy', humidity: 65 },
  'koh-kong':   { temperature: 28, condition: 'Sunny',         humidity: 75 },
  'kampot':     { temperature: 29, condition: 'Sunny',         humidity: 72 },
  'kep':        { temperature: 27, condition: 'Partly Cloudy', humidity: 68 },
  'battambang': { temperature: 31, condition: 'Sunny',         humidity: 60 },
  'mondulkiri': { temperature: 25, condition: 'Cloudy',        humidity: 80 },
}
const weather     = computed<Weather>(() => weatherData[destination.value] ?? { temperature: 28, condition: 'Sunny', humidity: 65 })
const weatherIcon = computed(() => {
  const c = weather.value.condition.toLowerCase()
  return c.includes('sunny') ? '☀️' : c.includes('rain') ? '🌧️' : c.includes('cloud') ? '☁️' : c.includes('storm') ? '⛈️' : '🌤️'
})

// ─── Filters / POIs ───────────────────────────────────────────────────────────
const filters = ref<Filter[]>([
  { id: 'hospital',   label: 'Hospital',   icon: '🏥', active: false },
  { id: 'police',     label: 'Police',     icon: '🚔', active: false },
  { id: 'atm',        label: 'ATM',        icon: '💰', active: false },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️', active: false },
])
const pois: POI[] = [
  { id: 1, name: 'Central Hospital',    type: 'hospital',   icon: '🏥', description: 'Modern medical facility',  distance: '2.3 km' },
  { id: 2, name: 'City Police Station', type: 'police',     icon: '🚔', description: 'Main police office',       distance: '1.8 km' },
  { id: 3, name: 'ATM Bank Center',     type: 'atm',        icon: '💰', description: 'Multiple ATM machines',    distance: '0.5 km' },
  { id: 4, name: 'Khmer Restaurant',    type: 'restaurant', icon: '🍽️', description: 'Traditional cuisine',     distance: '1.2 km' },
  { id: 5, name: 'Italian Trattoria',   type: 'restaurant', icon: '🍽️', description: 'International dining',    distance: '2.1 km' },
  { id: 6, name: 'Regional Hospital',   type: 'hospital',   icon: '🏥', description: 'Emergency services',      distance: '3.5 km' },
  { id: 7, name: 'Community Police',    type: 'police',     icon: '🚔', description: 'Local station',           distance: '2.8 km' },
  { id: 8, name: 'Quick ATM',           type: 'atm',        icon: '💰', description: 'Convenient location',     distance: '1.5 km' },
]
const filteredPOIs   = computed(() => { const a = filters.value.filter(f => f.active).map(f => f.id); return a.length ? pois.filter(p => a.includes(p.type)) : [] })
const getCountByType = (type: string) => pois.filter(p => p.type === type).length
const toggleFilter   = (id: string) => { const f = filters.value.find(f => f.id === id); if (f) f.active = !f.active }

// ─── Attractions ──────────────────────────────────────────────────────────────
const routeMappings: Record<string, string[]> = {
  'phnom-penh-to-siem-reap': ['kompong-thom'], 'phnom-penh-to-koh-kong': ['kampot', 'kep'],
  'phnom-penh-to-battambang': ['pursat', 'kompong-chhnang'], 'siem-reap-to-koh-kong': ['battambang', 'pursat'],
}
const attractionDB: Attraction[] = [
  { id: 1,  name: 'Angkor Wat',              category: 'Cultural',  description: 'Iconic UNESCO temple complex.',          image: '/hero/hero1.jpg', rating: 4.9, locationProvince: 'siem-reap',  attractionType: 'destination' },
  { id: 2,  name: 'Angkor Thom',             category: 'Cultural',  description: 'Ancient walled city with Bayon temple.', image: '/hero/hero1.jpg', rating: 4.8, locationProvince: 'siem-reap',  attractionType: 'destination' },
  { id: 3,  name: 'Tatai Waterfall',         category: 'Nature',    description: 'Stunning multi-tiered jungle waterfall.',image: '/hero/hero1.jpg', rating: 4.8, locationProvince: 'koh-kong',   attractionType: 'destination' },
  { id: 4,  name: 'Royal Palace',            category: 'Cultural',  description: 'Stunning royal residence.',              image: '/hero/hero1.jpg', rating: 4.7, locationProvince: 'phnom-penh', attractionType: 'destination' },
  { id: 5,  name: 'Wat Phnom',              category: 'Cultural',  description: 'Historic hilltop temple.',               image: '/hero/hero1.jpg', rating: 4.5, locationProvince: 'phnom-penh', attractionType: 'destination' },
  { id: 6,  name: 'Bokor National Park',     category: 'Nature',    description: 'Mountain landscapes & abandoned ruins.', image: '/hero/hero1.jpg', rating: 4.6, locationProvince: 'kampot',     attractionType: 'route' },
  { id: 7,  name: 'Bamboo Train',            category: 'Adventure', description: 'Unique bamboo train ride.',              image: '/hero/hero1.jpg', rating: 4.6, locationProvince: 'battambang', attractionType: 'route' },
  { id: 8,  name: 'Elephant Valley Project', category: 'Nature',    description: 'Sanctuary for rescued elephants.',       image: '/hero/hero1.jpg', rating: 4.8, locationProvince: 'mondulkiri', attractionType: 'destination' },
]
const attractions = computed<Attraction[]>(() => {
  const dest = destination.value, orig = origin.value
  const provinces = routeMappings[`${orig}-to-${dest}`] || routeMappings[`${dest}-to-${orig}`] || []
  return [
    ...attractionDB.filter(a => a.locationProvince === dest  && a.attractionType === 'destination').slice(0, 4),
    ...attractionDB.filter(a => provinces.includes(a.locationProvince) && a.attractionType === 'route').slice(0, 4),
  ].slice(0, 8)
})

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
  leafletMap.fitBounds(L.latLngBounds([oC, dC]), { padding: [60,60] })

  poiLayerGroup = L.layerGroup().addTo(leafletMap)

  isLoadingRoute.value = true
  const coords = await fetchRoadRoute(oC, dC)
  isLoadingRoute.value = false
  if (!leafletMap) return

  const line = L.polyline(coords, { color: '#1a73e8', weight: 5, opacity: 0.9, lineJoin: 'round', lineCap: 'round' }).addTo(leafletMap)
  L.polyline(coords, { color: '#fff', weight: 2, opacity: 0.45, dashArray: '8 14', lineJoin: 'round' }).addTo(leafletMap)
  leafletMap.fitBounds(line.getBounds(), { padding: [60,60] })
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

watch(filteredPOIs, updatePoiMarkers, { deep: true })

onMounted(async () => { await fetchTrip(); await nextTick(); await initMap() })
onUnmounted(() => { leafletMap?.remove(); leafletMap = null })

// ─── Share / Save ─────────────────────────────────────────────────────────────
const shareLink = computed(() =>
  tripData.value?.invite_token
    ? `${window.location.origin}/trip/join/${tripData.value.invite_token}`
    : `${window.location.origin}/trip/results?origin=${origin.value}&destination=${destination.value}&from=${startDate.value}&to=${endDate.value}&type=${travelType.value}`
)
const saveTrip       = async () => { tripSaved.value = true; setTimeout(() => { tripSaved.value = false }, 2000) }
const copyToClipboard = async () => { await navigator.clipboard.writeText(shareLink.value).catch(()=>{}); copiedText.value = '✓ Copied!'; setTimeout(() => { copiedText.value = '📋 Copy' }, 2000) }
const shareToWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`My trip: ${originName.value} → ${destinationName.value} — ${shareLink.value}`)}`, '_blank')
const shareToEmail    = () => window.open(`mailto:?subject=${encodeURIComponent(`Trip: ${originName.value} → ${destinationName.value}`)}&body=${encodeURIComponent(shareLink.value)}`)
const shareToFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink.value)}`, '_blank')
</script>

<!-- Only Leaflet marker styles — must be global (injected outside Vue scope) -->
<style>
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
</style>