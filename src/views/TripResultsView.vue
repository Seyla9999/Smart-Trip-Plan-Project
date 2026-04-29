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
            <h2>Explore {{ destinationName }}</h2>
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

          <!-- Interactive Map -->
          <div class="map-container">
            <div class="map-canvas">
              <!-- Background -->
              <svg class="map-background" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f0f0f0" stroke-width="1"/>
                  </pattern>
                </defs>
                <rect width="800" height="500" fill="#e8f5e9"/>
                <rect width="800" height="500" fill="url(#grid)"/>
                <!-- Roads -->
                <line x1="0" y1="250" x2="800" y2="250" stroke="#d4a574" stroke-width="20"/>
                <line x1="400" y1="0" x2="400" y2="500" stroke="#d4a574" stroke-width="20"/>
              </svg>

              <!-- Center Marker -->
              <div class="map-center-marker">📍 {{ destinationName }}</div>

              <!-- POI Markers -->
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
              </div>
            </div>

            <!-- Map Legend -->
            <div class="map-legend">
              <div class="legend-title">Available Services</div>
              <div class="legend-items">
                <div v-for="filter in filters" :key="filter.id" class="legend-item">
                  <span class="legend-icon">{{ filter.icon }}</span>
                  <span>{{ filter.label }}</span>
                  <span class="legend-count">({{ getCountByType(filter.id) }})</span>
                </div>
              </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

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

const route = useRoute()
const hoveredPOI = ref<number | null>(null)
const showShareModal = ref(false)
const tripSaved = ref(false)
const copiedText = ref('📋 Copy')
const selectedDay = ref(1)

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

const originName = computed(() => provinceNames[origin.value] || origin.value)
const destinationName = computed(() => provinceNames[destination.value] || destination.value)

const displayDateRange = computed(() => {
  if (!startDate.value || !endDate.value) return 'Select dates'

  const start = new Date(startDate.value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
  const end = new Date(endDate.value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return `${start} – ${end}`
})

const daysCount = computed(() => {
  if (!startDate.value || !endDate.value) return 0

  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
})

const weather = ref<Weather>({
  temperature: 28,
  condition: 'Sunny',
  humidity: 65
})

const weatherIcon = computed(() => {
  const condition = weather.value.condition.toLowerCase()
  if (condition.includes('sunny')) return '☀️'
  if (condition.includes('rain')) return '🌧️'
  if (condition.includes('cloud')) return '☁️'
  if (condition.includes('storm')) return '⛈️'
  return '🌤️'
})

const filters = ref<Filter[]>([
  { id: 'hospital', label: 'Hospital', icon: '🏥', active: false },
  { id: 'police', label: 'Police', icon: '🚔', active: false },
  { id: 'atm', label: 'ATM', icon: '💰', active: false },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️', active: false }
])

const pois: POI[] = [
  { id: 1, name: 'Central Hospital', type: 'hospital', icon: '🏥', description: 'Modern medical facility', distance: '2.3 km away', x: 25, y: 30 },
  { id: 2, name: 'City Police Station', type: 'police', icon: '🚔', description: 'Main police office', distance: '1.8 km away', x: 75, y: 25 },
  { id: 3, name: 'ATM Bank Center', type: 'atm', icon: '💰', description: 'Multiple ATM machines', distance: '0.5 km away', x: 50, y: 50 },
  { id: 4, name: 'Khmer Restaurant', type: 'restaurant', icon: '🍽️', description: 'Traditional cuisine', distance: '1.2 km away', x: 30, y: 70 },
  { id: 5, name: 'Italian Trattoria', type: 'restaurant', icon: '🍽️', description: 'International dining', distance: '2.1 km away', x: 70, y: 65 },
  { id: 6, name: 'Regional Hospital', type: 'hospital', icon: '🏥', description: 'Emergency services', distance: '3.5 km away', x: 80, y: 45 },
  { id: 7, name: 'Community Police', type: 'police', icon: '🚔', description: 'Local station', distance: '2.8 km away', x: 20, y: 65 },
  { id: 8, name: 'Quick ATM', type: 'atm', icon: '💰', description: 'Convenient location', distance: '1.5 km away', x: 65, y: 35 }
]

const filteredPOIs = computed(() => {
  const activeFilters = filters.value.filter(f => f.active).map(f => f.id)
  
  if (activeFilters.length === 0) return []
  
  return pois.filter(poi => activeFilters.includes(poi.type))
})

const getCountByType = (type: string) => {
  return pois.filter(poi => poi.type === type).length
}

const toggleFilter = (filterId: string) => {
  const filter = filters.value.find(f => f.id === filterId)
  if (filter) {
    filter.active = !filter.active
  }
}

const weatherData: Record<string, Weather> = {
  'phnom-penh': { temperature: 32, condition: 'Sunny', humidity: 70 },
  'siem-reap': { temperature: 30, condition: 'Partly Cloudy', humidity: 65 },
  'koh-kong': { temperature: 28, condition: 'Sunny', humidity: 75 },
  'kampot': { temperature: 29, condition: 'Sunny', humidity: 72 },
  'kep': { temperature: 27, condition: 'Partly Cloudy', humidity: 68 },
  'battambang': { temperature: 31, condition: 'Sunny', humidity: 60 },
  'mondulkiri': { temperature: 25, condition: 'Cloudy', humidity: 80 }
}

if (destination.value in weatherData) {
  weather.value = weatherData[destination.value]
}

// Route mapping for Cambodia - provinces along common routes
const routeMappings: Record<string, string[]> = {
  'phnom-penh-to-siem-reap': ['kompong-thom', 'kratie'],
  'phnom-penh-to-koh-kong': ['kampot', 'kep'],
  'phnom-penh-to-battambang': ['pursat', 'kompong-chhnang'],
  'siem-reap-to-koh-kong': ['battambang', 'pursat'],
  'siem-reap-to-kampot': ['mondulkiri', 'kratie'],
  'battambang-to-koh-kong': ['pursat'],
  'kampot-to-siem-reap': ['mondulkiri'],
  'kep-to-siem-reap': ['kampot', 'mondulkiri']
}

// Comprehensive attraction database with locations
const attractionDatabase: Attraction[] = [
  // Siem Reap attractions
  { id: 1, name: 'Angkor Wat', category: 'Cultural', description: 'The iconic temple complex and UNESCO World Heritage site.', image: '/hero/hero1.jpg', rating: 4.9, locationProvince: 'siem-reap', attractionType: 'destination' },
  { id: 2, name: 'Angkor Thom', category: 'Cultural', description: 'Ancient walled city with the Bayon temple.', image: '/hero/hero1.jpg', rating: 4.8, locationProvince: 'siem-reap', attractionType: 'destination' },
  { id: 3, name: 'Tonle Sap Lake', category: 'Nature', description: 'Southeast Asia\'s largest freshwater lake with floating villages.', image: '/hero/hero1.jpg', rating: 4.7, locationProvince: 'siem-reap', attractionType: 'destination' },
  
  // Koh Kong attractions
  { id: 4, name: 'Tatai Waterfall', category: 'Nature', description: 'A stunning multi-tiered waterfall surrounded by lush jungle.', image: '/hero/hero1.jpg', rating: 4.8, locationProvince: 'koh-kong', attractionType: 'destination' },
  { id: 5, name: 'Peam Krasop Wildlife Sanctuary', category: 'Nature', description: 'Mangrove forest and wildlife reserve.', image: '/hero/hero1.jpg', rating: 4.6, locationProvince: 'koh-kong', attractionType: 'destination' },
  { id: 6, name: 'Koh Kood Island', category: 'Beach', description: 'Remote island paradise with pristine beaches.', image: '/hero/hero1.jpg', rating: 4.7, locationProvince: 'koh-kong', attractionType: 'destination' },
  
  // Phnom Penh attractions
  { id: 7, name: 'Royal Palace', category: 'Cultural', description: 'Stunning royal residence with golden spires.', image: '/hero/hero1.jpg', rating: 4.7, locationProvince: 'phnom-penh', attractionType: 'destination' },
  { id: 8, name: 'Wat Phnom', category: 'Cultural', description: 'Historic temple atop a hill overlooking the city.', image: '/hero/hero1.jpg', rating: 4.5, locationProvince: 'phnom-penh', attractionType: 'destination' },
  { id: 9, name: 'Mekong River Cruise', category: 'Nature', description: 'Scenic boat tour along the Mekong River.', image: '/hero/hero1.jpg', rating: 4.6, locationProvince: 'phnom-penh', attractionType: 'destination' },
  
  // Kampot attractions
  { id: 10, name: 'Bokor National Park', category: 'Nature', description: 'Explore abandoned hillside buildings and lush mountain landscapes.', image: '/hero/hero1.jpg', rating: 4.6, locationProvince: 'kampot', attractionType: 'route' },
  { id: 11, name: 'Kampot Pepper Farm', category: 'Cultural', description: 'Tour of famous black pepper plantations.', image: '/hero/hero1.jpg', rating: 4.4, locationProvince: 'kampot', attractionType: 'route' },
  { id: 12, name: 'Kampot Town', category: 'Cultural', description: 'Colonial charm with riverside restaurants and shops.', image: '/hero/hero1.jpg', rating: 4.3, locationProvince: 'kampot', attractionType: 'route' },
  
  // Kep attractions
  { id: 13, name: 'Koh Rong Beach', category: 'Beach', description: 'Pristine white sand beaches with crystal clear waters.', image: '/hero/hero1.jpg', rating: 4.7, locationProvince: 'kep', attractionType: 'route' },
  { id: 14, name: 'Kep Crab Market', category: 'Cultural', description: 'Famous fresh seafood market and dining experience.', image: '/hero/hero1.jpg', rating: 4.5, locationProvince: 'kep', attractionType: 'route' },
  
  // Battambang attractions
  { id: 15, name: 'Phnom Banan', category: 'Cultural', description: 'Ancient Hindu shrine with panoramic views.', image: '/hero/hero1.jpg', rating: 4.5, locationProvince: 'battambang', attractionType: 'route' },
  { id: 16, name: 'Bamboo Train', category: 'Adventure', description: 'Unique ride on traditional bamboo train tracks.', image: '/hero/hero1.jpg', rating: 4.6, locationProvince: 'battambang', attractionType: 'route' },
  
  // Pursat attractions
  { id: 17, name: 'Cardamom Mountains', category: 'Nature', description: 'Remote pristine wilderness area with hiking trails.', image: '/hero/hero1.jpg', rating: 4.4, locationProvince: 'pursat', attractionType: 'route' },
  
  // Mondulkiri attractions
  { id: 18, name: 'Elephant Valley Project', category: 'Nature', description: 'Sanctuary for rescued Asian elephants.', image: '/hero/hero1.jpg', rating: 4.8, locationProvince: 'mondulkiri', attractionType: 'route' },
  { id: 19, name: 'Waterfall in Mondulkiri', category: 'Nature', description: 'Beautiful natural waterfall in lush forests.', image: '/hero/hero1.jpg', rating: 4.5, locationProvince: 'mondulkiri', attractionType: 'route' }
]

// Function to get route key
const getRouteKey = (orig: string, dest: string): string => {
  return `${orig}-to-${dest}`
}

// Function to get attractions for destination province
const getDestinationAttractions = (province: string): Attraction[] => {
  return attractionDatabase.filter(a => a.locationProvince === province && a.attractionType === 'destination').slice(0, 4)
}

// Function to get attractions along the route
const getRouteAttractions = (orig: string, dest: string): Attraction[] => {
  const routeKey = getRouteKey(orig, dest)
  const reverseRouteKey = getRouteKey(dest, orig)
  
  let routeProvinces: string[] = []
  if (routeKey in routeMappings) {
    routeProvinces = routeMappings[routeKey]
  } else if (reverseRouteKey in routeMappings) {
    routeProvinces = routeMappings[reverseRouteKey]
  }
  
  const routeAttractions = attractionDatabase.filter(a => 
    routeProvinces.includes(a.locationProvince) && a.attractionType === 'route'
  )
  
  return routeAttractions.slice(0, 4)
}

// Merge destination and route attractions
const attractions = ref<Attraction[]>([])

// Load attractions on component mount
onMounted(() => {
  const destAttractions = getDestinationAttractions(destination.value)
  const routeAttracts = getRouteAttractions(origin.value, destination.value)
  
  // Combine attractions, prioritizing destination attractions
  attractions.value = [...destAttractions, ...routeAttracts].slice(0, 8)
})

// Generate share link
const shareLink = computed(() => {
  const params = new URLSearchParams({
    origin: origin.value,
    destination: destination.value,
    from: startDate.value,
    to: endDate.value,
    type: travelType.value,
    budget: budget.value || ''
  })
  
  // Generate a short trip ID
  const tripId = Math.random().toString(36).substring(7)
  return `${window.location.origin}/trip/view/${tripId}?${params.toString()}`
})

// Save trip function
const saveTrip = () => {
  // In a real app, this would save to backend
  const tripData = {
    origin: origin.value,
    destination: destination.value,
    startDate: startDate.value,
    endDate: endDate.value,
    travelType: travelType.value,
    budget: budget.value,
    attractions: attractions.value,
    createdAt: new Date().toISOString()
  }
  
  // Save to localStorage for demo
  const trips = JSON.parse(localStorage.getItem('savedTrips') || '[]')
  trips.push(tripData)
  localStorage.setItem('savedTrips', JSON.stringify(trips))
  
  tripSaved.value = true
  setTimeout(() => {
    tripSaved.value = false
  }, 2000)
}

// Copy to clipboard function
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value)
    copiedText.value = '✓ Copied!'
    setTimeout(() => {
      copiedText.value = '📋 Copy'
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Share functions
const shareToWhatsApp = () => {
  const text = `Check out my trip plan: ${originName.value} → ${destinationName.value}! ${shareLink.value}`
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}

const shareToEmail = () => {
  const subject = `Trip Plan: ${originName.value} → ${destinationName.value}`
  const body = `I've planned a trip for you! Check it out: ${shareLink.value}`
  const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.open(url)
}

const shareToFacebook = () => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink.value)}`
  window.open(url, '_blank')
}
</script>

<style scoped>
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

.btn-save {
  background: #097445;
  color: white;
  border-color: #0a5a35;
}

.btn-save:hover:not(:disabled) {
  background: #0a5a35;
  box-shadow: 0 4px 12px rgba(9, 116, 69, 0.3);
}

.btn-save:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.btn-share {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
}

.btn-share:hover {
  background: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-new-search {
  background: white;
  border-color: #d8dce6;
  color: #15543f;
}

.btn-new-search:hover {
  background: #f0f0f0;
  border-color: #15543f;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #15543f;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #15543f;
}

.modal-body {
  padding: 24px;
}

.modal-body > p {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
}

.share-link-container {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.share-link-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #d8dce6;
  border-radius: 6px;
  font-size: 13px;
  font-family: monospace;
  background: #f9fafb;
  color: #15543f;
}

.share-link-input:focus {
  outline: none;
  border-color: #15543f;
  background: white;
}

.btn-copy {
  padding: 10px 16px;
  background: #15543f;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-copy:hover {
  background: #0d3a2e;
}

.share-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.share-btn {
  flex: 1;
  min-width: 120px;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.share-btn:hover {
  border-color: #d8dce6;
  background: white;
}

.whatsapp-btn:hover {
  color: #25d366;
  border-color: #25d366;
}

.email-btn:hover {
  color: #d32f2f;
  border-color: #d32f2f;
}

.facebook-btn:hover {
  color: #1877f2;
  border-color: #1877f2;
}

.results-layout {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
}

.schedule-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: fit-content;
  position: sticky;
  top: 100px;
}

.trip-details-card,
.weather-card,
.daily-schedule-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.trip-details-card h3,
.weather-card h3,
.daily-schedule-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #15543f;
  margin: 0 0 16px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 14px;
}

.detail-label {
  color: #999;
  font-weight: 500;
}

.detail-value {
  color: #15543f;
  font-weight: 600;
}

.weather-display {
  display: flex;
  align-items: center;
  gap: 20px;
}

.weather-icon {
  font-size: 48px;
}

.weather-details {
  flex: 1;
}

.temperature {
  font-size: 28px;
  font-weight: 700;
  color: #15543f;
}

.condition {
  font-size: 14px;
  color: #666;
  margin: 4px 0;
}

.humidity {
  font-size: 13px;
  color: #999;
}

/* Daily Schedule Styles */
.schedule-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.schedule-tab {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 2px solid transparent;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.schedule-tab:hover {
  background: #e0e0e0;
}

.schedule-tab.active {
  background: #097445;
  color: white;
  border-color: #0a5a35;
}

.schedule-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-item {
  padding: 12px;
  background: #f9fafb;
  border-left: 3px solid #097445;
  border-radius: 4px;
}

.schedule-time {
  font-weight: 600;
  color: #15543f;
  font-size: 13px;
  margin-bottom: 4px;
}

.schedule-item p {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.results-main {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.map-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.map-header {
  margin-bottom: 20px;
}

.map-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #15543f;
  margin: 0 0 16px 0;
}

.map-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f0f0f0;
  border: 2px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.filter-chip:hover {
  background: #e0e0e0;
}

.filter-chip.active {
  background: #097445;
  color: white;
  border-color: #0a5a35;
}

.map-container {
  display: flex;
  gap: 24px;
}

.map-canvas {
  flex: 1;
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  min-height: 400px;
  border: 1px solid #e5e7eb;
}

.map-background {
  width: 100%;
  height: 100%;
  display: block;
}

.map-center-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 20px;
  font-weight: 600;
  color: #15543f;
  background: white;
  padding: 10px 14px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  pointer-events: none;
}

.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 20;
}

.marker-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: transform 0.2s;
}

.map-marker:hover .marker-icon {
  transform: scale(1.2);
}

.marker-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1a;
  color: white;
  padding: 12px 14px;
  border-radius: 6px;
  white-space: nowrap;
  font-size: 12px;
  margin-bottom: 8px;
  z-index: 30;
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.tooltip-desc {
  font-size: 11px;
  opacity: 0.8;
}

.tooltip-distance {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.7;
}

.map-legend {
  width: 200px;
}

.legend-title {
  font-size: 14px;
  font-weight: 600;
  color: #15543f;
  margin-bottom: 12px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 8px 12px;
  background: #f0f0f0;
  border-radius: 6px;
}

.legend-icon {
  font-size: 16px;
}

.legend-count {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}

.poi-section,
.attractions-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.poi-section h2,
.attractions-section h2 {
  font-size: 24px;
  font-weight: 700;
  color: #15543f;
  margin: 0 0 20px 0;
}

.section-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0 0 24px 0;
}

.poi-grid,
.attractions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.poi-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.poi-card:hover {
  border-color: #15543f;
  box-shadow: 0 4px 12px rgba(21, 84, 63, 0.1);
}

.poi-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.poi-icon {
  font-size: 24px;
}

.poi-type {
  font-size: 12px;
  background: #e8f5e9;
  color: #15543f;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.poi-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #15543f;
  margin: 0 0 8px 0;
}

.poi-card p {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
}

.poi-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.poi-distance {
  font-size: 12px;
  color: #999;
}

.poi-btn {
  padding: 6px 12px;
  background: #15543f;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.poi-btn:hover {
  background: #0d3a2e;
}

.attraction-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.attraction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.attraction-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.attraction-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attraction-category {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(21, 84, 63, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.attraction-type-badge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.95);
  color: #15543f;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.attraction-type-badge.destination {
  background: rgba(21, 84, 63, 0.95);
  color: white;
}

.attraction-type-badge.route {
  background: rgba(255, 193, 7, 0.95);
  color: #333;
}

.attraction-info {
  padding: 16px;
}

.attraction-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #15543f;
  margin: 0 0 8px 0;
}

.attraction-location {
  font-size: 12px;
  color: #999;
  margin: 0 0 8px 0;
  font-weight: 500;
  text-transform: capitalize;
}

.attraction-info p {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.attraction-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating {
  font-size: 14px;
  color: #15543f;
  font-weight: 600;
}

.stars {
  color: #fbbf24;
  margin-right: 4px;
}

.btn-add-to-trip {
  padding: 6px 12px;
  background: #15543f;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add-to-trip:hover {
  background: #0d3a2e;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #999;
}

.capitalize {
  text-transform: capitalize;
}

@media (max-width: 1024px) {
  .results-layout {
    grid-template-columns: 1fr;
  }

  .results-sidebar {
    position: relative;
    top: 0;
  }

  .map-container {
    flex-direction: column;
  }

  .map-legend {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .trip-results-container {
    padding: 20px 12px;
  }

  .results-header {
    flex-direction: column;
    gap: 12px;
  }

  .results-summary {
    flex-direction: column;
    gap: 4px;
  }

  .poi-grid,
  .attractions-grid {
    grid-template-columns: 1fr;
  }

  .map-canvas {
    min-height: 300px;
  }

  .map-controls {
    flex-wrap: wrap;
  }
}
</style>
