<template>
  <div class="trip-results-container">
    <!-- Header with Actions -->
    <div class="results-header">
      <div class="results-info">
        <h1>Your Trip Plan</h1>
        <p class="results-summary">
          {{ originName }} → {{ destinationName }}
          <span class="results-dates">{{ displayDateRange }}</span>
        </p>
      </div>
      <div class="header-actions">
        <button class="btn-action btn-save" @click="saveTrip" :disabled="tripSaved">
          <span>{{ tripSaved ? '✓ Saved' : '💾 Save Trip' }}</span>
        </button>
        <button class="btn-action btn-share" @click="showShareModal = true">
          🔗 Invite Friends
        </button>
        <router-link to="/trip" class="btn-action btn-new-search">← New Search</router-link>
      </div>
    </div>

    <!-- Share Modal -->
    <div v-if="showShareModal" class="modal-overlay" @click="showShareModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Invite Friends</h3>
          <button class="modal-close" @click="showShareModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p>Share this trip with your friends</p>
          <div class="share-link-container">
            <input
              type="text"
              class="share-link-input"
              :value="shareLink"
              readonly
              @focus="($event.target as HTMLInputElement).select()"
            />
            <button class="btn-copy" @click="copyToClipboard">{{ copiedText }}</button>
          </div>
          <div class="share-options">
            <button class="share-btn whatsapp-btn" @click="shareToWhatsApp">
              💬 WhatsApp
            </button>
            <button class="share-btn email-btn" @click="shareToEmail">
              📧 Email
            </button>
            <button class="share-btn facebook-btn" @click="shareToFacebook">
              👍 Facebook
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="results-layout">
      <!-- Left: Daily Schedule -->
      <aside class="schedule-sidebar">
        <div class="trip-details-card">
          <h3>Trip Details</h3>
          <div class="detail-row">
            <span class="detail-label">From:</span>
            <span class="detail-value">{{ originName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">To:</span>
            <span class="detail-value">{{ destinationName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">{{ daysCount }} days</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Travel Type:</span>
            <span class="detail-value capitalize">{{ travelType }}</span>
          </div>
          <div v-if="budget" class="detail-row">
            <span class="detail-label">Budget:</span>
            <span class="detail-value capitalize">{{ budget }}</span>
          </div>
        </div>

        <div class="weather-card">
          <h3>Weather</h3>
          <div class="weather-display">
            <div class="weather-icon">{{ weatherIcon }}</div>
            <div class="weather-details">
              <div class="temperature">{{ weather.temperature }}°C</div>
              <div class="condition">{{ weather.condition }}</div>
              <div class="humidity">💧 {{ weather.humidity }}%</div>
            </div>
          </div>
        </div>

        <!-- Daily Schedule -->
        <div class="daily-schedule-card">
          <h3>Daily Schedule</h3>
          <div class="schedule-tabs">
            <button
              v-for="day in daysCount"
              :key="day"
              class="schedule-tab"
              :class="{ active: selectedDay === day }"
              @click="selectedDay = day"
            >
              Day {{ day }}
            </button>
          </div>
          <div class="schedule-content">
            <div class="schedule-item">
              <div class="schedule-time">🌅 Morning</div>
              <p>Arrival and check-in at accommodation</p>
            </div>
            <div class="schedule-item">
              <div class="schedule-time">☀️ Afternoon</div>
              <p>Explore local attractions</p>
            </div>
            <div class="schedule-item">
              <div class="schedule-time">🌙 Evening</div>
              <p>Dinner and local experiences</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Right: Map and Content -->
      <main class="results-main">
        <!-- Map Section -->
        <div class="map-section">
          <div class="map-header">
            <div class="map-title-row">
              <h2>Route Map</h2>
              <div class="route-badge">
                <span class="route-badge-origin">{{ originName }}</span>
                <span class="route-badge-arrow">→</span>
                <span class="route-badge-dest">{{ destinationName }}</span>
              </div>
            </div>
            <div class="map-controls">
              <label v-for="filter in filters" :key="filter.id" class="filter-chip" :class="{ active: filter.active }">
                <input
                  type="checkbox"
                  :checked="filter.active"
                  @change="toggleFilter(filter.id)"
                  hidden
                />
                <span>{{ filter.icon }} {{ filter.label }}</span>
              </label>
            </div>
          </div>

<<<<<<< HEAD
          <!-- Leaflet Map -->
          <div class="map-container">
            <div class="leaflet-map-wrapper">
              <div ref="mapContainer" class="leaflet-map-canvas"></div>
              <div v-if="isLoadingRoute" class="map-loading-overlay">
                <div class="map-loading-spinner"></div>
                <span>Loading route...</span>
=======
          <!-- Interactive Map -->
          <!-- <div class="map-container">
            <div class="map-canvas">
         
              <svg class="map-background" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f0f0f0" stroke-width="1"/>
                  </pattern>
                </defs>
                <rect width="800" height="500" fill="#e8f5e9"/>
                <rect width="800" height="500" fill="url(#grid)"/>
           
                <line x1="0" y1="250" x2="800" y2="250" stroke="#d4a574" stroke-width="20"/>
                <line x1="400" y1="0" x2="400" y2="500" stroke="#d4a574" stroke-width="20"/>
              </svg>

          
              <div class="map-center-marker">📍 {{ destinationName }}</div>

        
              <div
                v-for="poi in filteredPOIs"
                :key="poi.id"
                class="map-marker"
                :style="{ left: poi.x + '%', top: poi.y + '%' }"
                @mouseenter="hoveredPOI = poi.id"
                @mouseleave="hoveredPOI = null"
              >
                <div class="marker-icon">{{ poi.icon }}</div>
                <div v-if="hoveredPOI === poi.id" class="marker-tooltip">
                  <div class="tooltip-title">{{ poi.name }}</div>
                  <div class="tooltip-desc">{{ poi.description }}</div>
                  <div class="tooltip-distance">📍 {{ poi.distance }}</div>
                </div>
>>>>>>> 7897b74bfeae0cee94685c44811a8354658f725c
              </div>
            </div>

    
            <div class="map-legend">
              <div class="legend-title">Available Services</div>
              <div class="legend-items">
                <div v-for="filter in filters" :key="filter.id" class="legend-item">
                  <span class="legend-icon">{{ filter.icon }}</span>
                  <span>{{ filter.label }}</span>
                  <span class="legend-count">({{ getCountByType(filter.id) }})</span>
                </div>
              </div>
              <div class="legend-divider"></div>
              <div class="legend-title">Map Key</div>
              <div class="legend-items">
                <div class="legend-item">
                  <span class="legend-dot origin-dot"></span>
                  <span>Starting Point</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot dest-dot"></span>
                  <span>Destination</span>
                </div>
                <div class="legend-item">
                  <span class="legend-line-icon"></span>
                  <span>Route</span>
                </div>
              </div>
            </div>
          </div> -->

          <div class="map-container">
            <div class="map-canvas" style="border: none;">
              
              <GoogleMap
                :api-key="googleMapsApiKey"
                style="width: 100%; height: 100%; min-height: 400px; border-radius: 8px;"
                :center="mapCenter"
                :zoom="13"
              >
                <Marker :options="{ position: mapCenter, title: destinationName }" />
              </GoogleMap>

            </div>

            <div class="map-legend">
               </div>
          </div>
        </div>

        <!-- POI List Section -->
        <div class="poi-section">
          <h2>Nearby Services & Attractions</h2>
          <div v-if="filteredPOIs.length > 0" class="poi-grid">
            <div v-for="poi in filteredPOIs" :key="poi.id" class="poi-card">
              <div class="poi-card-header">
                <span class="poi-icon">{{ poi.icon }}</span>
                <span class="poi-type">{{ poi.type }}</span>
              </div>
              <h3>{{ poi.name }}</h3>
              <p>{{ poi.description }}</p>
              <div class="poi-footer">
                <span class="poi-distance">{{ poi.distance }}</span>
                <button class="poi-btn">Details</button>
              </div>
            </div>
          </div>
          <div v-else class="no-results">
            <p>Select filters to see nearby services and attractions</p>
          </div>
        </div>

        <!-- Attractions Section -->
        <div class="attractions-section">
          <h2>Recommended Attractions</h2>
          <p class="section-subtitle">Must-see places based on your travel preferences</p>

          <div v-if="attractions.length > 0" class="attractions-grid">
            <div v-for="attraction in attractions" :key="attraction.id" class="attraction-card">
              <div class="attraction-image">
                <img :src="attraction.image" :alt="attraction.name" />
                <span class="attraction-category">{{ attraction.category }}</span>
                <span
                  class="attraction-type-badge"
                  :class="attraction.attractionType === 'destination' ? 'destination' : 'route'"
                >
                  {{ attraction.attractionType === 'destination' ? '📍 Destination' : '🛣️ Along Route' }}
                </span>
              </div>
              <div class="attraction-info">
                <h3>{{ attraction.name }}</h3>
                <p class="attraction-location">{{ provinceNames[attraction.locationProvince] || attraction.locationProvince }}</p>
                <p>{{ attraction.description }}</p>
                <div class="attraction-footer">
                  <div class="rating">
                    <span class="stars">★</span>
                    {{ attraction.rating }}
                  </div>
                  <button class="btn-add-to-trip">+ Add</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
<<<<<<< HEAD
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon path issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})
=======
import { GoogleMap, Marker } from 'vue3-google-map';
>>>>>>> 7897b74bfeae0cee94685c44811a8354658f725c

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const provinceCoords: Record<string, { lat: number, lng: number }> = {
  'phnom-penh': { lat: 11.5564, lng: 104.9282 },
  'siem-reap': { lat: 13.3611, lng: 103.8595 },
  'koh-kong': { lat: 11.6155, lng: 102.9838 },
  'kampot': { lat: 10.6104, lng: 104.1814 },
  'kep': { lat: 10.4833, lng: 104.3167 },
  'battambang': { lat: 13.0957, lng: 103.2022 },
  'mondulkiri': { lat: 12.4558, lng: 107.1881 }
};

const mapCenter = computed(() => {
  return provinceCoords[destination.value] || { lat: 11.5564, lng: 104.9282 }; // Defaults to Phnom Penh
});
interface Attraction {
  id: number
  name: string
  category: string
  description: string
  image: string
  rating: number
  locationProvince: string
  attractionType: 'destination' | 'route'
}

interface POI {
  id: number
  name: string
  type: string
  icon: string
  description: string
  distance: string
  x: number
  y: number
}

interface Filter {
  id: string
  label: string
  icon: string
  active: boolean
}

interface Weather {
  temperature: number
  condition: string
  humidity: number
}

// Province coordinates [lat, lng]
const provinceCoords: Record<string, [number, number]> = {
  'phnom-penh':       [11.5564, 104.9282],
  'siem-reap':        [13.3671, 103.8448],
  'koh-kong':         [11.6144, 103.0066],
  'kampot':           [10.6089, 104.1812],
  'kep':              [10.4843, 104.2993],
  'battambang':       [13.1022, 103.1987],
  'mondulkiri':       [12.4573, 107.1883],
  'kompong-thom':     [12.6861, 104.8888],
  'kratie':           [12.4889, 106.0186],
  'pursat':           [12.5387, 103.9188],
  'kompong-chhnang':  [12.2503, 104.6644],
}

const route = useRoute()
const showShareModal = ref(false)
const tripSaved = ref(false)
const copiedText = ref('📋 Copy')
const selectedDay = ref(1)
const mapContainer = ref<HTMLElement | null>(null)

// Leaflet map instance (non-reactive, managed manually)
let leafletMap: L.Map | null = null
let poiLayerGroup: L.LayerGroup | null = null

const provinceNames: Record<string, string> = {
  'phnom-penh': 'Phnom Penh',
  'siem-reap': 'Siem Reap',
  'koh-kong': 'Koh Kong',
  'kampot': 'Kampot',
  'kep': 'Kep',
  'battambang': 'Battambang',
  'mondulkiri': 'Mondulkiri',
  'kompong-thom': 'Kompong Thom',
  'kratie': 'Kratie',
  'pursat': 'Pursat',
  'kompong-chhnang': 'Kompong Chhnang'
}

const origin = computed(() => route.query.origin as string || '')
const destination = computed(() => route.query.destination as string || '')
const startDate = computed(() => route.query.from as string || '')
const endDate = computed(() => route.query.to as string || '')
const travelType = computed(() => route.query.type as string || 'friends')
const budget = computed(() => route.query.budget as string || '')

const originName = computed(() => provinceNames[origin.value] || origin.value || 'Starting Point')
const destinationName = computed(() => provinceNames[destination.value] || destination.value || 'Destination')

const displayDateRange = computed(() => {
  if (!startDate.value || !endDate.value) return 'Select dates'
  const start = new Date(startDate.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const end = new Date(endDate.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${start} – ${end}`
})

const daysCount = computed(() => {
  if (!startDate.value || !endDate.value) return 0
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
})

const weather = ref<Weather>({ temperature: 28, condition: 'Sunny', humidity: 65 })

const weatherIcon = computed(() => {
  const c = weather.value.condition.toLowerCase()
  if (c.includes('sunny')) return '☀️'
  if (c.includes('rain')) return '🌧️'
  if (c.includes('cloud')) return '☁️'
  if (c.includes('storm')) return '⛈️'
  return '🌤️'
})

const filters = ref<Filter[]>([
  { id: 'hospital',   label: 'Hospital',   icon: '🏥', active: false },
  { id: 'police',     label: 'Police',     icon: '🚔', active: false },
  { id: 'atm',        label: 'ATM',        icon: '💰', active: false },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️', active: false }
])

const pois: POI[] = [
  { id: 1, name: 'Central Hospital',   type: 'hospital',   icon: '🏥', description: 'Modern medical facility',        distance: '2.3 km away', x: 25, y: 30 },
  { id: 2, name: 'City Police Station',type: 'police',     icon: '🚔', description: 'Main police office',             distance: '1.8 km away', x: 75, y: 25 },
  { id: 3, name: 'ATM Bank Center',    type: 'atm',        icon: '💰', description: 'Multiple ATM machines',          distance: '0.5 km away', x: 50, y: 50 },
  { id: 4, name: 'Khmer Restaurant',   type: 'restaurant', icon: '🍽️', description: 'Traditional cuisine',           distance: '1.2 km away', x: 30, y: 70 },
  { id: 5, name: 'Italian Trattoria',  type: 'restaurant', icon: '🍽️', description: 'International dining',          distance: '2.1 km away', x: 70, y: 65 },
  { id: 6, name: 'Regional Hospital',  type: 'hospital',   icon: '🏥', description: 'Emergency services',            distance: '3.5 km away', x: 80, y: 45 },
  { id: 7, name: 'Community Police',   type: 'police',     icon: '🚔', description: 'Local station',                 distance: '2.8 km away', x: 20, y: 65 },
  { id: 8, name: 'Quick ATM',          type: 'atm',        icon: '💰', description: 'Convenient location',           distance: '1.5 km away', x: 65, y: 35 }
]

const filteredPOIs = computed(() => {
  const active = filters.value.filter(f => f.active).map(f => f.id)
  if (active.length === 0) return []
  return pois.filter(poi => active.includes(poi.type))
})

const getCountByType = (type: string) => pois.filter(p => p.type === type).length

const toggleFilter = (filterId: string) => {
  const f = filters.value.find(f => f.id === filterId)
  if (f) f.active = !f.active
}

const weatherData: Record<string, Weather> = {
  'phnom-penh': { temperature: 32, condition: 'Sunny',         humidity: 70 },
  'siem-reap':  { temperature: 30, condition: 'Partly Cloudy', humidity: 65 },
  'koh-kong':   { temperature: 28, condition: 'Sunny',         humidity: 75 },
  'kampot':     { temperature: 29, condition: 'Sunny',         humidity: 72 },
  'kep':        { temperature: 27, condition: 'Partly Cloudy', humidity: 68 },
  'battambang': { temperature: 31, condition: 'Sunny',         humidity: 60 },
  'mondulkiri': { temperature: 25, condition: 'Cloudy',        humidity: 80 }
}

if (destination.value in weatherData) {
  weather.value = weatherData[destination.value]
}

const routeMappings: Record<string, string[]> = {
  'phnom-penh-to-siem-reap':  ['kompong-thom', 'kratie'],
  'phnom-penh-to-koh-kong':   ['kampot', 'kep'],
  'phnom-penh-to-battambang': ['pursat', 'kompong-chhnang'],
  'siem-reap-to-koh-kong':    ['battambang', 'pursat'],
  'siem-reap-to-kampot':      ['mondulkiri', 'kratie'],
  'battambang-to-koh-kong':   ['pursat'],
  'kampot-to-siem-reap':      ['mondulkiri'],
  'kep-to-siem-reap':         ['kampot', 'mondulkiri']
}

const attractionDatabase: Attraction[] = [
  { id: 1,  name: 'Angkor Wat',                  category: 'Cultural',  description: 'The iconic temple complex and UNESCO World Heritage site.',         image: '/hero/hero1.jpg', rating: 4.9, locationProvince: 'siem-reap',   attractionType: 'destination' },
  { id: 2,  name: 'Angkor Thom',                 category: 'Cultural',  description: 'Ancient walled city with the Bayon temple.',                        image: '/hero/hero1.jpg', rating: 4.8, locationProvince: 'siem-reap',   attractionType: 'destination' },
  { id: 3,  name: 'Tonle Sap Lake',              category: 'Nature',    description: "Southeast Asia's largest freshwater lake with floating villages.",   image: '/hero/hero1.jpg', rating: 4.7, locationProvince: 'siem-reap',   attractionType: 'destination' },
  { id: 4,  name: 'Tatai Waterfall',             category: 'Nature',    description: 'A stunning multi-tiered waterfall surrounded by lush jungle.',       image: '/hero/hero1.jpg', rating: 4.8, locationProvince: 'koh-kong',    attractionType: 'destination' },
  { id: 5,  name: 'Peam Krasop Sanctuary',       category: 'Nature',    description: 'Mangrove forest and wildlife reserve.',                             image: '/hero/hero1.jpg', rating: 4.6, locationProvince: 'koh-kong',    attractionType: 'destination' },
  { id: 6,  name: 'Koh Kood Island',             category: 'Beach',     description: 'Remote island paradise with pristine beaches.',                     image: '/hero/hero1.jpg', rating: 4.7, locationProvince: 'koh-kong',    attractionType: 'destination' },
  { id: 7,  name: 'Royal Palace',                category: 'Cultural',  description: 'Stunning royal residence with golden spires.',                      image: '/hero/hero1.jpg', rating: 4.7, locationProvince: 'phnom-penh',  attractionType: 'destination' },
  { id: 8,  name: 'Wat Phnom',                   category: 'Cultural',  description: 'Historic temple atop a hill overlooking the city.',                 image: '/hero/hero1.jpg', rating: 4.5, locationProvince: 'phnom-penh',  attractionType: 'destination' },
  { id: 9,  name: 'Mekong River Cruise',         category: 'Nature',    description: 'Scenic boat tour along the Mekong River.',                          image: '/hero/hero1.jpg', rating: 4.6, locationProvince: 'phnom-penh',  attractionType: 'destination' },
  { id: 10, name: 'Bokor National Park',         category: 'Nature',    description: 'Explore abandoned hillside buildings and lush mountain landscapes.', image: '/hero/hero1.jpg', rating: 4.6, locationProvince: 'kampot',      attractionType: 'route' },
  { id: 11, name: 'Kampot Pepper Farm',          category: 'Cultural',  description: 'Tour of famous black pepper plantations.',                          image: '/hero/hero1.jpg', rating: 4.4, locationProvince: 'kampot',      attractionType: 'route' },
  { id: 12, name: 'Kampot Town',                 category: 'Cultural',  description: 'Colonial charm with riverside restaurants and shops.',               image: '/hero/hero1.jpg', rating: 4.3, locationProvince: 'kampot',      attractionType: 'route' },
  { id: 13, name: 'Koh Rong Beach',              category: 'Beach',     description: 'Pristine white sand beaches with crystal clear waters.',            image: '/hero/hero1.jpg', rating: 4.7, locationProvince: 'kep',         attractionType: 'route' },
  { id: 14, name: 'Kep Crab Market',             category: 'Cultural',  description: 'Famous fresh seafood market and dining experience.',                 image: '/hero/hero1.jpg', rating: 4.5, locationProvince: 'kep',         attractionType: 'route' },
  { id: 15, name: 'Phnom Banan',                 category: 'Cultural',  description: 'Ancient Hindu shrine with panoramic views.',                        image: '/hero/hero1.jpg', rating: 4.5, locationProvince: 'battambang',  attractionType: 'route' },
  { id: 16, name: 'Bamboo Train',                category: 'Adventure', description: 'Unique ride on traditional bamboo train tracks.',                   image: '/hero/hero1.jpg', rating: 4.6, locationProvince: 'battambang',  attractionType: 'route' },
  { id: 17, name: 'Cardamom Mountains',          category: 'Nature',    description: 'Remote pristine wilderness area with hiking trails.',               image: '/hero/hero1.jpg', rating: 4.4, locationProvince: 'pursat',      attractionType: 'route' },
  { id: 18, name: 'Elephant Valley Project',     category: 'Nature',    description: 'Sanctuary for rescued Asian elephants.',                            image: '/hero/hero1.jpg', rating: 4.8, locationProvince: 'mondulkiri',  attractionType: 'route' },
  { id: 19, name: 'Waterfall in Mondulkiri',     category: 'Nature',    description: 'Beautiful natural waterfall in lush forests.',                      image: '/hero/hero1.jpg', rating: 4.5, locationProvince: 'mondulkiri',  attractionType: 'route' }
]

const getDestinationAttractions = (province: string): Attraction[] =>
  attractionDatabase.filter(a => a.locationProvince === province && a.attractionType === 'destination').slice(0, 4)

const getRouteAttractions = (orig: string, dest: string): Attraction[] => {
  const key = `${orig}-to-${dest}`
  const reverseKey = `${dest}-to-${orig}`
  const provinces = routeMappings[key] || routeMappings[reverseKey] || []
  return attractionDatabase.filter(a => provinces.includes(a.locationProvince) && a.attractionType === 'route').slice(0, 4)
}

const attractions = ref<Attraction[]>([])

// ─── OSRM road routing ────────────────────────────────────────────────────────

/**
 * Fetch the actual driving route between two coordinates from the free
 * OSRM demo server (OpenStreetMap-based, no API key required).
 * Returns an array of [lat, lng] pairs that follow real roads.
 * Falls back to a straight line if the request fails.
 */
const fetchRoadRoute = async (
  origin: [number, number],
  dest: [number, number]
): Promise<[number, number][]> => {
  try {
    // OSRM expects coordinates as lng,lat
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${origin[1]},${origin[0]};${dest[1]},${dest[0]}` +
      `?overview=full&geometries=geojson`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`OSRM error: ${res.status}`)

    const data = await res.json()
    if (!data.routes?.length) throw new Error('No route found')

    // GeoJSON coords are [lng, lat] — flip to Leaflet's [lat, lng]
    return data.routes[0].geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]] as [number, number]
    )
  } catch (err) {
    console.warn('Road routing failed, falling back to straight line:', err)
    return [origin, dest]
  }
}

// ─── Leaflet map initialisation ───────────────────────────────────────────────

const isLoadingRoute = ref(false)

const initMap = async () => {
  if (!mapContainer.value) return

  const originCoords: [number, number] = provinceCoords[origin.value] || [11.5564, 104.9282]
  const destCoords:   [number, number] = provinceCoords[destination.value] || [13.3671, 103.8448]

  leafletMap = L.map(mapContainer.value, {
    zoomControl: true,
    scrollWheelZoom: true,
    attributionControl: true,
  })

  // Tile layer — OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(leafletMap)

  // Show both markers right away while the route loads
  const originIcon = L.divIcon({
    html: `
      <div class="lf-marker lf-marker-origin">
        <div class="lf-marker-pin origin-pin"></div>
        <div class="lf-marker-label">${originName.value}</div>
      </div>`,
    className: '',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })

  const destIcon = L.divIcon({
    html: `
      <div class="lf-marker lf-marker-dest">
        <div class="lf-marker-pin dest-pin"></div>
        <div class="lf-marker-label">${destinationName.value}</div>
      </div>`,
    className: '',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })

  L.marker(originCoords, { icon: originIcon }).addTo(leafletMap)
  L.marker(destCoords,   { icon: destIcon   }).addTo(leafletMap)

  // Fit map to the two endpoints immediately
  leafletMap.fitBounds(L.latLngBounds([originCoords, destCoords]), { padding: [60, 60] })

  // ── POI layer group ──────────────────────────────────────────────────────────
  poiLayerGroup = L.layerGroup().addTo(leafletMap)

  // ── Fetch road route and draw polyline ──────────────────────────────────────
  isLoadingRoute.value = true
  const routeCoords = await fetchRoadRoute(originCoords, destCoords)
  isLoadingRoute.value = false

  if (!leafletMap) return  // component may have unmounted while fetching

  // Blue road-following polyline
  const routeLine = L.polyline(routeCoords, {
    color: '#1a73e8',
    weight: 5,
    opacity: 0.9,
    lineJoin: 'round',
    lineCap: 'round',
  }).addTo(leafletMap)

  // White dashed overlay for a polished look
  L.polyline(routeCoords, {
    color: '#ffffff',
    weight: 2,
    opacity: 0.45,
    dashArray: '8 14',
    lineJoin: 'round',
  }).addTo(leafletMap)

  // Re-fit to the actual road route (may differ from straight-line bounds)
  leafletMap.fitBounds(routeLine.getBounds(), { padding: [60, 60] })
}

// Update POI markers on the Leaflet map when filters change
const updatePoiMarkers = () => {
  if (!leafletMap || !poiLayerGroup) return

  poiLayerGroup.clearLayers()

  const destCoords: [number, number] = provinceCoords[destination.value] || [11.5564, 104.9282]

  // Spread POIs around the destination using small lat/lng offsets
  const offsets: [number, number][] = [
    [-0.04,  0.05], [ 0.06, -0.03], [-0.02,  0.08], [ 0.05,  0.06],
    [-0.07, -0.04], [ 0.03, -0.08], [ 0.08,  0.01], [-0.05,  0.07],
  ]

  filteredPOIs.value.forEach((poi, i) => {
    const off = offsets[i % offsets.length]
    const coords: [number, number] = [destCoords[0] + off[0], destCoords[1] + off[1]]

    const icon = L.divIcon({
      html: `
        <div class="lf-poi-marker">
          <div class="lf-poi-icon">${poi.icon}</div>
        </div>`,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    })

    L.marker(coords, { icon })
      .bindPopup(`
        <div class="lf-popup">
          <div class="lf-popup-title">${poi.icon} ${poi.name}</div>
          <div class="lf-popup-desc">${poi.description}</div>
          <div class="lf-popup-dist">📍 ${poi.distance}</div>
        </div>`, { maxWidth: 200 })
      .addTo(poiLayerGroup!)
  })
}

watch(filteredPOIs, () => {
  updatePoiMarkers()
}, { deep: true })

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(async () => {
  const destAttractions = getDestinationAttractions(destination.value)
  const routeAttracts   = getRouteAttractions(origin.value, destination.value)
  attractions.value     = [...destAttractions, ...routeAttracts].slice(0, 8)

  await nextTick()
  await initMap()
})

onUnmounted(() => {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
})

// ── Share / save helpers ──────────────────────────────────────────────────────

const shareLink = computed(() => {
  const params = new URLSearchParams({
    origin: origin.value, destination: destination.value,
    from: startDate.value, to: endDate.value,
    type: travelType.value, budget: budget.value || ''
  })
  const tripId = Math.random().toString(36).substring(7)
  return `${window.location.origin}/trip/view/${tripId}?${params.toString()}`
})

const saveTrip = () => {
  const tripData = {
    origin: origin.value, destination: destination.value,
    startDate: startDate.value, endDate: endDate.value,
    travelType: travelType.value, budget: budget.value,
    attractions: attractions.value, createdAt: new Date().toISOString()
  }
  const trips = JSON.parse(localStorage.getItem('savedTrips') || '[]')
  trips.push(tripData)
  localStorage.setItem('savedTrips', JSON.stringify(trips))
  tripSaved.value = true
  setTimeout(() => { tripSaved.value = false }, 2000)
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value)
    copiedText.value = '✓ Copied!'
    setTimeout(() => { copiedText.value = '📋 Copy' }, 2000)
  } catch (err) { console.error('Failed to copy:', err) }
}

const shareToWhatsApp = () => {
  const text = `Check out my trip plan: ${originName.value} → ${destinationName.value}! ${shareLink.value}`
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}

const shareToEmail = () => {
  const subject = `Trip Plan: ${originName.value} → ${destinationName.value}`
  const body    = `I've planned a trip for you! Check it out: ${shareLink.value}`
  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
}

const shareToFacebook = () => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink.value)}`, '_blank')
}
</script>

<style scoped>
/* ─── Layout ─────────────────────────────────────────────────────────────────── */
.trip-results-container {
  width: 100%;
  padding: 40px 20px;
  background: #f9fafb;
  min-height: 100vh;
}

.results-header {
  max-width: 1400px;
  margin: 0 auto 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.results-info h1 {
  font-size: 32px;
  font-weight: 800;
  color: #15543f;
  margin: 0 0 8px 0;
}

.results-summary {
  font-size: 16px;
  color: #666;
  margin: 0;
  display: flex;
  gap: 12px;
  align-items: center;
}

.results-dates {
  color: #999;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-action {
  padding: 10px 18px;
  border: 1px solid #d8dce6;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  white-space: nowrap;
}

.btn-save { background: #097445; color: white; border-color: #0a5a35; }
.btn-save:hover:not(:disabled) { background: #0a5a35; box-shadow: 0 4px 12px rgba(9,116,69,.3); }
.btn-save:disabled { opacity: .8; cursor: not-allowed; }
.btn-share { background: #3b82f6; color: white; border-color: #2563eb; }
.btn-share:hover { background: #2563eb; box-shadow: 0 4px 12px rgba(59,130,246,.3); }
.btn-new-search { background: white; border-color: #d8dce6; color: #15543f; }
.btn-new-search:hover { background: #f0f0f0; border-color: #15543f; }

/* ─── Modal ───────────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,.3);
  padding: 0;
  width: 480px;
  max-width: 90vw;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 { margin: 0; font-size: 20px; font-weight: 700; color: #15543f; }
.modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: #666; padding: 4px; }
.modal-body { padding: 24px; }
.modal-body p { margin: 0 0 16px; color: #666; font-size: 14px; }

.share-link-container { display: flex; gap: 8px; margin-bottom: 20px; }
.share-link-input { flex: 1; padding: 10px 14px; border: 1px solid #d8dce6; border-radius: 8px; font-size: 13px; color: #666; }
.btn-copy { padding: 10px 16px; background: #097445; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-copy:hover { background: #0a5a35; }

.share-options { display: flex; gap: 12px; }
.share-btn { flex: 1; padding: 10px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; }
.whatsapp-btn { background: #25D366; color: white; }
.whatsapp-btn:hover { background: #1aaf52; }
.email-btn { background: #ea4335; color: white; }
.email-btn:hover { background: #c82717; }
.facebook-btn { background: #1877f2; color: white; }
.facebook-btn:hover { background: #0b5fcc; }

/* ─── Main grid ──────────────────────────────────────────────────────────────── */
.results-layout {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 28px;
  align-items: start;
}

/* ─── Sidebar cards ──────────────────────────────────────────────────────────── */
.schedule-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 20px;
}

.trip-details-card,
.weather-card,
.daily-schedule-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
}

.trip-details-card h3,
.weather-card h3,
.daily-schedule-card h3 {
  font-size: 16px;
  font-weight: 700;
  color: #15543f;
  margin: 0 0 16px;
}

.detail-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
.detail-row:last-child { border-bottom: none; }
.detail-label { font-size: 13px; color: #999; font-weight: 500; }
.detail-value { font-size: 13px; color: #333; font-weight: 600; }

.weather-display { display: flex; align-items: center; gap: 16px; }
.weather-icon { font-size: 48px; }
.temperature { font-size: 28px; font-weight: 700; color: #15543f; }
.condition { font-size: 14px; color: #666; margin: 4px 0; }
.humidity { font-size: 13px; color: #999; }

.schedule-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.schedule-tab { padding: 6px 14px; border: 1px solid #e5e7eb; border-radius: 20px; background: white; font-size: 13px; cursor: pointer; transition: all .2s; }
.schedule-tab.active { background: #15543f; color: white; border-color: #15543f; }
.schedule-item { padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.schedule-item:last-child { border-bottom: none; }
.schedule-time { font-size: 13px; font-weight: 600; color: #15543f; margin-bottom: 4px; }
.schedule-item p { font-size: 13px; color: #666; margin: 0; }

/* ─── Right column ───────────────────────────────────────────────────────────── */
.results-main { display: flex; flex-direction: column; gap: 28px; }

/* ─── Map section ────────────────────────────────────────────────────────────── */
.map-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
}

.map-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.map-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #15543f;
  margin: 0;
}

.route-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f9f4;
  border: 1px solid #c3e8d4;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
}

.route-badge-origin { color: #097445; }
.route-badge-arrow  { color: #999; }
.route-badge-dest   { color: #1a73e8; }

.map-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: #f3f4f6;
  border: 2px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all .2s;
  user-select: none;
}
.filter-chip:hover { background: #e5e7eb; }
.filter-chip.active { background: #097445; color: white; border-color: #0a5a35; }

.map-container {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

/* ── Leaflet map canvas ──────────────────────────────────────────────────────── */
.leaflet-map-wrapper {
  flex: 1;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  min-height: 460px;
}

.leaflet-map-canvas {
  width: 100%;
  height: 100%;
  min-height: 460px;
  z-index: 0;
}

.map-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 500;
  font-size: 14px;
  font-weight: 600;
  color: #15543f;
  pointer-events: none;
}

.map-loading-spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #e5e7eb;
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Map legend ─────────────────────────────────────────────────────────────── */
.map-legend {
  width: 180px;
  flex-shrink: 0;
}

.legend-title {
  font-size: 13px;
  font-weight: 700;
  color: #15543f;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.legend-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 14px 0;
}

.legend-items { display: flex; flex-direction: column; gap: 8px; }

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 7px 10px;
  background: #f9fafb;
  border-radius: 6px;
}

.legend-icon { font-size: 16px; }
.legend-count { color: #999; font-size: 12px; margin-left: auto; }

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}
.origin-dot { background: #097445; border: 2px solid white; box-shadow: 0 0 0 1.5px #097445; }
.dest-dot   { background: #1a73e8; border: 2px solid white; box-shadow: 0 0 0 1.5px #1a73e8; }

.legend-line-icon {
  display: inline-block;
  width: 24px;
  height: 4px;
  background: #1a73e8;
  border-radius: 2px;
  flex-shrink: 0;
}

/* ─── POI / Attractions ──────────────────────────────────────────────────────── */
.poi-section,
.attractions-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
}

.poi-section h2,
.attractions-section h2 {
  font-size: 24px;
  font-weight: 700;
  color: #15543f;
  margin: 0 0 20px;
}

.section-subtitle { font-size: 14px; color: #999; margin: 0 0 24px; }

.poi-grid,
.attractions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.poi-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; transition: all .2s; }
.poi-card:hover { border-color: #15543f; box-shadow: 0 4px 12px rgba(21,84,63,.1); }
.poi-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.poi-icon { font-size: 24px; }
.poi-type { font-size: 12px; background: #e8f5e9; color: #15543f; padding: 4px 8px; border-radius: 4px; font-weight: 500; }
.poi-card h3 { font-size: 16px; font-weight: 600; color: #15543f; margin: 0 0 8px; }
.poi-card p { font-size: 13px; color: #666; margin: 0 0 12px; }
.poi-footer { display: flex; justify-content: space-between; align-items: center; }
.poi-distance { font-size: 12px; color: #999; }
.poi-btn { padding: 6px 12px; background: #15543f; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
.poi-btn:hover { background: #0d3a2e; }

.attraction-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.05); transition: transform .2s, box-shadow .2s; }
.attraction-card:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0,0,0,.1); }
.attraction-image { position: relative; height: 180px; overflow: hidden; }
.attraction-image img { width: 100%; height: 100%; object-fit: cover; }
.attraction-category { position: absolute; top: 12px; right: 12px; background: rgba(21,84,63,.9); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.attraction-type-badge { position: absolute; bottom: 12px; left: 12px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: rgba(255,255,255,.95); color: #15543f; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
.attraction-type-badge.destination { background: rgba(21,84,63,.95); color: white; }
.attraction-type-badge.route       { background: rgba(255,193,7,.95); color: #333; }
.attraction-info { padding: 16px; }
.attraction-info h3 { font-size: 16px; font-weight: 600; color: #15543f; margin: 0 0 4px; }
.attraction-location { font-size: 12px; color: #999; margin: 0 0 8px; font-weight: 500; text-transform: capitalize; }
.attraction-info p { font-size: 13px; color: #666; margin: 0 0 12px; line-height: 1.4; }
.attraction-footer { display: flex; justify-content: space-between; align-items: center; }
.rating { font-size: 14px; color: #15543f; font-weight: 600; }
.stars { color: #fbbf24; margin-right: 4px; }
.btn-add-to-trip { padding: 6px 12px; background: #15543f; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
.btn-add-to-trip:hover { background: #0d3a2e; }

.no-results { text-align: center; padding: 40px; color: #999; }
.capitalize { text-transform: capitalize; }

/* ─── Responsive ─────────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .results-layout { grid-template-columns: 1fr; }
  .schedule-sidebar { position: relative; top: 0; }
  .map-container { flex-direction: column; }
  .map-legend { width: 100%; display: flex; gap: 24px; flex-wrap: wrap; }
  .legend-items { flex-direction: row; flex-wrap: wrap; }
}

@media (max-width: 768px) {
  .trip-results-container { padding: 20px 12px; }
  .results-header { flex-direction: column; gap: 12px; }
  .results-summary { flex-direction: column; gap: 4px; }
  .poi-grid, .attractions-grid { grid-template-columns: 1fr; }
  .leaflet-map-canvas { min-height: 320px; }
  .map-controls { flex-wrap: wrap; }
  .map-title-row { flex-direction: column; align-items: flex-start; }
}
</style>

<!--
  Global styles for Leaflet custom icons (not scoped — Leaflet injects these into
  the document body outside Vue's component scope).
-->
<style>
/* Origin marker */
.lf-marker { display: flex; align-items: center; gap: 8px; pointer-events: none; }

.lf-marker-pin {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,.35);
  flex-shrink: 0;
}

.origin-pin { background: #097445; }
.dest-pin   { background: #1a73e8; }

.lf-marker-label {
  background: white;
  color: #333;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,.2);
  white-space: nowrap;
}

.lf-marker-origin .lf-marker-label { border-left: 3px solid #097445; }
.lf-marker-dest   .lf-marker-label { border-left: 3px solid #1a73e8; }

/* POI markers */
.lf-poi-marker {
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(0,0,0,.25);
  border: 2px solid #e5e7eb;
  font-size: 18px;
  cursor: pointer;
  transition: transform .15s;
}
.lf-poi-marker:hover { transform: scale(1.15); }

/* Popup */
.lf-popup { min-width: 160px; }
.lf-popup-title { font-weight: 700; font-size: 13px; color: #15543f; margin-bottom: 4px; }
.lf-popup-desc  { font-size: 12px; color: #666; margin-bottom: 4px; }
.lf-popup-dist  { font-size: 11px; color: #999; }

/* Leaflet attribution tweak */
.leaflet-control-attribution { font-size: 10px !important; }
</style>