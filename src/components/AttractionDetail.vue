<template>
  <div v-if="loading" class="loading-state">
    <div class="spinner"></div>
    <p>Loading attraction details...</p>
  </div>
  
  <div v-else-if="error" class="error-state">
    <h2>⚠️ Error</h2>
    <p>{{ error }}</p>
    <router-link to="/" class="back-home">Return to Home</router-link>
  </div>
  
  <div v-else-if="attraction" class="attraction-page">

    <!-- Hero -->
    <div class="hero" :style="{ backgroundImage: `url(${heroImage})` }">
      <div class="hero-overlay" />
      <div class="hero-content">
        <div class="hero-badges">
          <span v-for="badge in attraction.badges" :key="badge" class="badge">{{ badge }}</span>
        </div>
        <h1 class="hero-title">{{ attraction.name }}</h1>
        <div class="hero-meta">
          <span class="meta-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ attraction.province?.nameEn || attraction.province }}
          </span>
          <span class="meta-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            {{ attraction.rating }} <span class="reviews">({{ attraction.reviews || 0 }} reviews)</span>
          </span>
        </div>
      </div>
      <div class="breadcrumb">
        <router-link to="/">HOME</router-link>
        <span> / {{ attraction.province?.nameEn?.toUpperCase() || 'PROVINCE' }} / {{ attraction.name?.toUpperCase() }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-wrapper">
      <div class="content-area">

        <div class="tags-row">
          <span v-for="tag in attraction.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <section class="section">
          <h2>About this attraction</h2>
          <p v-for="(para, i) in attraction.about" :key="i">{{ para }}</p>
        </section>

        <section class="section">
          <div class="section-header">
            <h2>Photos</h2>
            <a href="#" class="view-all">View All Gallery</a>
          </div>
          <div class="photo-grid">
            <div v-for="(photo, i) in displayPhotos" :key="i" class="photo-item">
              <img :src="photo" :alt="`Photo ${i + 1}`" />
            </div>
          </div>
        </section>

        <!-- Nearby Points of Interest Section (from API) -->
        <section class="section" v-if="hasNearbyPOIs">
          <h2>Nearby Services & Amenities</h2>
          <div class="poi-grid">
            <div v-if="nearbyPOIs.hospitals?.length" class="poi-category">
              <h3>🏥 Hospitals ({{ nearbyPOIs.hospitals.length }})</h3>
              <ul>
                <li v-for="poi in nearbyPOIs.hospitals" :key="poi.id">
                  <strong>{{ poi.name }}</strong> - {{ poi.distance_meters }}m away
                  <span v-if="poi.isOpen24h" class="open-24h">(Open 24h)</span>
                </li>
              </ul>
            </div>
            
            <div v-if="nearbyPOIs.police?.length" class="poi-category">
              <h3>👮 Police ({{ nearbyPOIs.police.length }})</h3>
              <ul>
                <li v-for="poi in nearbyPOIs.police" :key="poi.id">
                  <strong>{{ poi.name }}</strong> - {{ poi.distance_meters }}m away
                </li>
              </ul>
            </div>
            
            <div v-if="nearbyPOIs.restaurants?.length" class="poi-category">
              <h3>🍽️ Restaurants ({{ nearbyPOIs.restaurants.length }})</h3>
              <ul>
                <li v-for="poi in nearbyPOIs.restaurants" :key="poi.id">
                  <strong>{{ poi.name }}</strong> - {{ poi.distance_meters }}m away
                </li>
              </ul>
            </div>
            
            <div v-if="nearbyPOIs.atms?.length" class="poi-category">
              <h3>🏧 ATMs ({{ nearbyPOIs.atms.length }})</h3>
              <ul>
                <li v-for="poi in nearbyPOIs.atms" :key="poi.id">
                  <strong>{{ poi.name }}</strong> - {{ poi.distance_meters }}m away
                </li>
              </ul>
            </div>

            <div v-if="nearbyPOIs.cafes?.length" class="poi-category">
              <h3>☕ Cafes ({{ nearbyPOIs.cafes.length }})</h3>
              <ul>
                <li v-for="poi in nearbyPOIs.cafes" :key="poi.id">
                  <strong>{{ poi.name }}</strong> - {{ poi.distance_meters }}m away
                </li>
              </ul>
            </div>

            <div v-if="nearbyPOIs.pharmacies?.length" class="poi-category">
              <h3>💊 Pharmacies ({{ nearbyPOIs.pharmacies.length }})</h3>
              <ul>
                <li v-for="poi in nearbyPOIs.pharmacies" :key="poi.id">
                  <strong>{{ poi.name }}</strong> - {{ poi.distance_meters }}m away
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>Location on map</h2>
          <div class="map-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#C8922A" stroke="white" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white" stroke="#C8922A"/></svg>
            <p class="map-label">{{ attraction.name }}, {{ attraction.province?.nameEn || attraction.province }}</p>
            <p class="map-sub">Interactive map will show here</p>
          </div>
        </section>

      </div>

      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-card">
          <h3>Plan your visit</h3>
          <p class="sidebar-sub">Add this to your trip itinerary</p>
          <button class="btn-add-trip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Add to my trip
          </button>
          <button class="btn-favorite">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Save to favorites
          </button>

          <div class="info-list">
            <div class="info-row">
              <div class="info-icon clock"></div>
              <div>
                <p class="info-label">BEST TIME</p>
                <p class="info-value">{{ attraction.info?.bestTime || 'Year-round' }}</p>
              </div>
            </div>
            <div class="info-row">
              <div class="info-icon duration"></div>
              <div>
                <p class="info-label">VISIT DURATION</p>
                <p class="info-value">{{ attraction.info?.duration || '2-3 hours' }}</p>
              </div>
            </div>
            <div class="info-row">
              <div class="info-icon difficulty"></div>
              <div>
                <p class="info-label">DIFFICULTY</p>
                <p class="info-value">{{ attraction.info?.difficulty || 'Moderate' }}</p>
              </div>
            </div>
            <div class="info-row">
              <div class="info-icon bestFor"></div>
              <div>
                <p class="info-label">BEST FOR</p>
                <p class="info-value">{{ attraction.info?.bestFor || 'All travelers' }}</p>
              </div>
            </div>
            <div class="info-row">
              <div class="info-icon province"></div>
              <div>
                <p class="info-label">PROVINCE</p>
                <p class="info-value">{{ attraction.province?.nameEn || attraction.province }}</p>
              </div>
            </div>
          </div>

          <div class="cta-box">
            <p>Not logged in? Sign up free to save this to a trip and invite friends to join you.</p>
            <button class="btn-cta">Sign up to save →</button>
          </div>
        </div>
      </aside>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

// Local image imports (your existing images)
import photo1 from '@/assets/images/attractions/tatai-waterfall/boat.jpg'
import photo2 from '@/assets/images/attractions/tatai-waterfall/nature.jpg'
import photo3 from '@/assets/images/attractions/tatai-waterfall/resort.jpg'
import photo4 from '@/assets/images/attractions/tatai-waterfall/river.jpg'
import photo5 from '@/assets/images/attractions/tatai-waterfall/sunset.jpg'
import photo6 from '@/assets/images/attractions/tatai-waterfall/waterfall.jpg'

// Local nearby images (if you have local images for nearby places)
// import tataiResortImg from '@/assets/images/nearby/tatai-resort.jpg'
// import peamKrasaopImg from '@/assets/images/nearby/peam-krasaop.jpg'

const route = useRoute()
const router = useRouter()

// State
const attraction = ref<any>(null)
const nearbyPOIs = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Local photos array
const localPhotos = [photo1, photo2, photo3, photo4, photo5, photo6]

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Computed: hero image
const heroImage = computed(() => localPhotos[0])

// Computed: display photos
const displayPhotos = computed(() => localPhotos)

// Fallback nearby places with images (used if backend doesn't have nearby data)
const fallbackNearbyPlaces = [
  { 
    name: 'Tatai River Resort', 
    slug: 'tatai-river-resort', 
    location: 'KOH KONG', 
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200&q=80' 
  },
  { 
    name: 'Peam Krasaop', 
    slug: 'peam-krasaop', 
    location: 'KOH KONG', 
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&q=80' 
  },
  { 
    name: 'Koh Kong Beach', 
    slug: 'koh-kong-beach', 
    location: 'KOH KONG', 
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=80' 
  },
  { 
    name: 'Cardamom Trek', 
    slug: 'cardamom-trek', 
    location: 'KOH KONG', 
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=80' 
  },
  { 
    name: 'Chi Phut Village', 
    slug: 'chi-phut-village', 
    location: 'KOH KONG', 
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80' 
  }
]

// Computed: nearby places with images
const nearbyPlaces = computed(() => {
  // If backend has nearby data, use it with fallback images
  if (attraction.value?.nearby && attraction.value.nearby.length > 0) {
    return attraction.value.nearby.map((place: any) => ({
      ...place,
      image: place.image || fallbackNearbyPlaces.find(f => f.name === place.name)?.image || 'https://picsum.photos/200/150?random=1'
    }))
  }
  
  // Use fallback data
  return fallbackNearbyPlaces
})

// Computed: check if there are nearby POIs
const hasNearbyPOIs = computed(() => {
  return nearbyPOIs.value && (
    nearbyPOIs.value.hospitals?.length ||
    nearbyPOIs.value.police?.length ||
    nearbyPOIs.value.restaurants?.length ||
    nearbyPOIs.value.atms?.length ||
    nearbyPOIs.value.cafes?.length ||
    nearbyPOIs.value.pharmacies?.length
  )
})

// Fetch attraction data from backend
const fetchAttraction = async () => {
  try {
    loading.value = true
    error.value = null
    
    const attractionId = route.params.id as string
    
    console.log(`Fetching attraction: ${attractionId}`)
    
    const response = await axios.get(`${API_BASE_URL}/attractions/${attractionId}`)
    
    if (response.data) {
      attraction.value = response.data
      nearbyPOIs.value = response.data.nearbyPOIs || null
      
      console.log('Attraction loaded:', attraction.value.name)
    }
  } catch (err: any) {
    console.error('API Error:', err)
    
    if (err.response?.status === 404) {
      error.value = `Attraction "${route.params.id}" not found`
    } else if (err.code === 'ECONNREFUSED') {
      error.value = 'Cannot connect to backend server. Make sure it\'s running on port 3000'
    } else {
      error.value = err.response?.data?.message || 'Failed to load attraction details'
    }
    
    if (err.response?.status === 404) {
      setTimeout(() => {
        router.push('/')
      }, 3000)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAttraction()
})
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.attraction-page {
  font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
  color: #1a1a1a;
  background: #fff;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top-color: #C8922A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #666;
  font-size: 14px;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 80px 20px;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.error-state h2 {
  font-size: 2rem;
  color: #e74c3c;
}

.error-state p {
  color: #666;
  margin-bottom: 20px;
}

.back-home {
  display: inline-block;
  padding: 12px 24px;
  background: #C8922A;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
}

.back-home:hover {
  background: #b07820;
}

/* Hero Section */
.hero {
  position: relative;
  height: 380px;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%);
}
.breadcrumb {
  position: absolute;
  top: 16px;
  left: 1.5rem;
  color: rgba(255,255,255,0.7);
  font-size: 11px;
  letter-spacing: 0.08em;
  z-index: 2;
}
.breadcrumb a { color: rgba(255,255,255,0.7); text-decoration: none; }
.breadcrumb a:hover { color: #fff; }
.hero-content {
  position: relative;
  z-index: 2;
  padding: 0 1.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
.hero-badges { display: flex; gap: 8px; margin-bottom: 10px; }
.badge {
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
  padding: 3px 8px; border-radius: 4px;
  background: rgba(255,255,255,0.15); color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
}
.hero-title {
  font-size: 2.6rem; font-weight: 700; color: #fff;
  margin-bottom: 8px; text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.hero-meta { display: flex; align-items: center; gap: 1.5rem; }
.meta-location, .meta-rating {
  display: flex; align-items: center; gap: 5px;
  color: rgba(255,255,255,0.9); font-size: 14px;
}
.reviews { color: rgba(255,255,255,0.65); }

/* Main Content */
.main-wrapper {
  max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem;
  display: grid; grid-template-columns: 1fr 300px;
  gap: 2.5rem; align-items: start;
}

.tags-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 2rem; }
.tag {
  padding: 5px 14px; border: 1px solid #ccc; border-radius: 20px;
  font-size: 13px; color: #444; cursor: pointer; transition: all 0.2s;
}
.tag:hover { border-color: #C8922A; color: #C8922A; }

.section { margin-bottom: 2.5rem; }
.section h2 { font-size: 1.3rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem; }
.section p { font-size: 14px; color: #555; line-height: 1.75; margin-bottom: 0.75rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.view-all { font-size: 13px; color: #C8922A; text-decoration: none; font-weight: 500; }
.view-all:hover { text-decoration: underline; }

/* Photo Grid */
.photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.photo-item { border-radius: 8px; overflow: hidden; aspect-ratio: 4/3; }
.photo-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.photo-item:hover img { transform: scale(1.05); }

/* POI Grid */
.poi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.poi-category {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #C8922A;
}

.poi-category h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #333;
}

.poi-category ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.poi-category li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  font-size: 13px;
}

.poi-category li:last-child {
  border-bottom: none;
}

.poi-category strong {
  color: #C8922A;
}

.open-24h {
  display: inline-block;
  background: #2ecc71;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

/* Map */
.map-placeholder {
  border: 2px dashed #d0d0d0; border-radius: 12px; padding: 3rem;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 8px; background: #f9f9f9; min-height: 180px;
}
.map-label { font-size: 14px; font-weight: 600; color: #333; }
.map-sub { font-size: 12px; color: #888; }

/* Sidebar */
.sidebar { position: sticky; top: 76px; }
.sidebar-card { border: 1px solid #e0e0e0; border-radius: 14px; padding: 1.25rem; background: #fff; }
.sidebar-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.sidebar-sub { font-size: 12px; color: #888; margin-bottom: 1rem; }

.btn-add-trip {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; padding: 10px; background: #C8922A; color: #fff; border: none;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
  margin-bottom: 8px; transition: background 0.2s;
}
.btn-add-trip:hover { background: #b07820; }
.btn-favorite {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; padding: 10px; background: #fff; color: #333;
  border: 1px solid #ccc; border-radius: 8px; font-size: 14px;
  cursor: pointer; margin-bottom: 1.25rem; transition: all 0.2s;
}
.btn-favorite:hover { border-color: #C8922A; color: #C8922A; }

.info-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 1.25rem; }
.info-row { display: flex; align-items: center; gap: 10px; }
.info-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.clock { background: #e8f5e9; }
.duration { background: #e3f2fd; }
.difficulty { background: #fff3e0; }
.bestFor { background: #fce4ec; }
.province { background: #ede7f6; }
.info-label { font-size: 10px; letter-spacing: 0.08em; color: #aaa; margin-bottom: 1px; }
.info-value { font-size: 13px; font-weight: 600; color: #222; }

.cta-box { background: #fff8e1; border: 1px solid #ffe082; border-radius: 10px; padding: 12px; }
.cta-box p { font-size: 12px; color: #555; line-height: 1.5; margin-bottom: 8px; }
.btn-cta {
  width: 100%; padding: 8px; background: #C8922A; color: #fff; border: none;
  border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s;
}
.btn-cta:hover { background: #b07820; }

/* Responsive */
@media (max-width: 900px) {
  .main-wrapper { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .photo-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .hero-title { font-size: 1.8rem; }
  .photo-grid { grid-template-columns: 1fr; }
  .poi-grid { grid-template-columns: 1fr; }
}
</style>