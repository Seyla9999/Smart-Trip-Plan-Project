<template>
  <div class="map-page">
    <!-- Filter bar -->
    <div class="filter-bar">
      <button
        v-for="cat in categories"
        :key="cat"
        :class="['filter-chip', { active: selectedCategory === cat }]"
        @click="applyFilter(cat)"
      >{{ cat }}</button>

      <div class="filter-divider" />

      <button
        :class="['filter-chip', 'near-me-chip', { active: nearMeActive }]"
        @click="toggleNearMe"
      >📍 Near Me</button>

      <button
        v-if="nearMeActive"
        class="filter-chip refresh-chip"
        @click="refreshLocation"
        title="Refresh my location"
      >🔄</button>

    </div>

    <!-- Body -->
    <div class="map-body">
      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Search box -->
        <div class="sidebar-search">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            class="search-input"
            placeholder="Search attractions…"
            autocomplete="off"
            @input="buildMarkers"
          />
          <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''; buildMarkers()">✕</button>
        </div>

        <p class="sidebar-count">
          <span v-if="loading">Loading…</span>
          <span v-else-if="nearMeActive">{{ filteredAttractions.length }} within 50 km</span>
          <span v-else-if="searchQuery">{{ filteredAttractions.length }} results for "{{ searchQuery }}"</span>
          <span v-else>{{ filteredAttractions.length }} attractions</span>
        </p>
        <div
          v-for="a in filteredAttractions"
          :key="a.id"
          class="sidebar-card"
          @click="panToAttraction(a)"
        >
          <img :src="a.hero_image || fallback" :alt="a.name_en" class="sidebar-img" />
          <div class="sidebar-info">
            <p class="sidebar-name">{{ a.name_en }}</p>
            <p class="sidebar-cat">{{ a.category || 'Attraction' }}</p>
            <p class="sidebar-rating" v-html="renderStars(Number(a.average_rating))"></p>
          </div>
        </div>
        <p v-if="!loading && filteredAttractions.length === 0" class="sidebar-empty">
          <span v-if="searchQuery">No attractions match "{{ searchQuery }}".</span>
          <span v-else-if="nearMeActive">No attractions within 50 km of your location.</span>
          <span v-else>No attractions in this category.</span>
        </p>
      </aside>

      <!-- Map -->
      <div ref="mapEl" class="map-container"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import API from '@/api/axios'

const fallback = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Angkor_Wat_from_the_air.JPG/800px-Angkor_Wat_from_the_air.JPG'
const NEAR_ME_KM = 50

const categories = [
  'All', 'Nature', 'Culture', 'Adventure', 'Historical',
  'Religious', 'Urban', 'Beach', 'Culinary', 'Eco-Tourism',
]

const attractions      = ref<any[]>([])
const selectedCategory = ref('All')
const searchQuery      = ref('')
const loading          = ref(true)
const mapEl            = ref<HTMLElement | null>(null)
const nearMeActive     = ref(false)
const userLocation     = ref<{ lat: number; lng: number } | null>(null)

let leafletMap: any        = null
let userMarker: any        = null
let radiusCircle: any      = null
let watchId: number | null = null
const activeMarkers   = new Map<string, any>()

// ── Haversine distance (km) ───────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R    = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a    = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Star rating renderer ──────────────────────────────────────────────
function renderStars(rating: number): string {
  let html = '<span style="letter-spacing:2px">'
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      html += '<span style="color:#C8922A">★</span>'
    } else if (rating >= i - 0.5) {
      html += '<span style="position:relative;display:inline-block">' +
              '<span style="color:#ddd">★</span>' +
              '<span style="position:absolute;left:0;top:0;overflow:hidden;width:50%;color:#C8922A">★</span>' +
              '</span>'
    } else {
      html += '<span style="color:#ddd">★</span>'
    }
  }
  html += '</span>'
  return html
}

// ── Filtered list (category + near-me) ───────────────────────────────
const filteredAttractions = computed(() => {
  let list = selectedCategory.value === 'All'
    ? attractions.value
    : attractions.value.filter(a => a.category === selectedCategory.value)

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(a =>
      (a.name_en ?? '').toLowerCase().includes(q) ||
      (a.name_kh ?? '').toLowerCase().includes(q) ||
      (a.category ?? '').toLowerCase().includes(q)
    )
  }

  if (nearMeActive.value && userLocation.value) {
    list = list.filter(a => {
      const coords = getCoords(a)
      if (!coords) return false
      return haversineKm(userLocation.value!.lat, userLocation.value!.lng, coords.lat, coords.lng) <= NEAR_ME_KM
    })
  }
  return list
})

function getCoords(a: any): { lat: number; lng: number } | null {
  const lat = Number(a.latitude ?? a.lat)
  const lng = Number(a.longitude ?? a.lng)
  if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
    return { lat, lng }
  }

  const loc = a.location
  if (!loc) return null

  if (typeof loc === 'string') {
    const match = loc.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/i)
    if (match) {
      const parsedLng = Number(match[1])
      const parsedLat = Number(match[2])
      if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) return { lat: parsedLat, lng: parsedLng }
    }
    return null
  }

  if (loc.coordinates?.length >= 2) return { lng: Number(loc.coordinates[0]), lat: Number(loc.coordinates[1]) }
  if (loc.longitude !== undefined && loc.latitude !== undefined) return { lng: Number(loc.longitude), lat: Number(loc.latitude) }
  if (loc.x !== undefined && loc.y !== undefined) return { lng: Number(loc.x), lat: Number(loc.y) }
  return null
}

function slugOrId(a: any) {
  return a.slug || a.name_en?.toLowerCase().replace(/\s+/g, '-') || a.id
}

function buildMarkers() {
  if (!leafletMap) return
  const L = (window as any).L

  activeMarkers.forEach(m => leafletMap.removeLayer(m))
  activeMarkers.clear()

  for (const a of filteredAttractions.value) {
    const coords = getCoords(a)
    if (!coords) continue

    const icon = L.divIcon({
      html: `<div class="map-pin-main"><span style="transform:rotate(45deg);display:block">★</span></div>`,
      className: 'map-icon-wrapper',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -34],
    })

    const imgHtml = a.hero_image
      ? `<img src="${a.hero_image}" alt="${a.name_en}"
             style="width:100%;height:110px;object-fit:cover;border-radius:6px;margin-bottom:8px;display:block">`
      : ''

    const marker = L.marker([coords.lat, coords.lng], { icon })
      .addTo(leafletMap)
      .bindPopup(`
        <div style="min-width:180px;max-width:200px">
          ${imgHtml}
          <b style="font-size:14px">${a.name_en}</b><br>
          <span style="color:#888;font-size:12px">${a.category || 'Attraction'}</span><br>
          <span style="font-size:13px">${renderStars(Number(a.average_rating))}</span><br>
          <a href="/attraction/${slugOrId(a)}"
             style="display:inline-block;margin-top:6px;color:#C8922A;font-weight:600;font-size:13px;text-decoration:none">
            View Details →
          </a>
        </div>
      `, { maxWidth: 220 })

    activeMarkers.set(a.id, marker)
  }
}

async function loadLeaflet(): Promise<void> {
  if ((window as any).L) return
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel   = 'stylesheet'
    link.href  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src     = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload  = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

async function initMap() {
  await loadLeaflet()
  await nextTick()
  if (!mapEl.value) return

  const L = (window as any).L
  if (leafletMap) { leafletMap.remove(); leafletMap = null }

  leafletMap = L.map(mapEl.value).setView([12.5657, 104.9910], 7)

  // ── Base layers (Task 4 — tile style) ──────────────────────────────
  const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  })
  const satelliteLayer = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: '© Esri — Source: Esri, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
      maxZoom: 19,
    }
  )
  const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
    maxZoom: 17,
  })
  streetLayer.addTo(leafletMap)

  // ── Province boundaries overlay (Task 3) ───────────────────────────
  let provincesLayer: any = null
  try {
    const res     = await fetch('https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/KHM/ADM1/geoBoundaries-KHM-ADM1.geojson')
    const geojson = await res.json()
    provincesLayer = L.geoJSON(geojson, {
      style: { color: '#C8922A', weight: 1.5, fillColor: '#C8922A', fillOpacity: 0.06 },
      onEachFeature: (feature: any, layer: any) => {
        if (feature.properties?.shapeName) {
          layer.bindTooltip(feature.properties.shapeName, { sticky: true, className: 'province-tooltip' })
        }
      },
    })
  } catch { /* skip province layer if CDN unavailable */ }

  // ── Layer control ───────────────────────────────────────────────────
  const baseLayers: any = {
    '🗺️ Street':    streetLayer,
    '🛰️ Satellite': satelliteLayer,
    '⛰️ Terrain':   terrainLayer,
  }
  const overlays: any = {}
  if (provincesLayer) overlays['🏛️ Province Boundaries'] = provincesLayer
  L.control.layers(baseLayers, overlays, { position: 'topright', collapsed: false }).addTo(leafletMap)

  buildMarkers()
}

function applyFilter(cat: string) {
  selectedCategory.value = cat
  buildMarkers()
}

function panToAttraction(a: any) {
  const coords = getCoords(a)
  if (!coords || !leafletMap) return
  leafletMap.flyTo([coords.lat, coords.lng], 13, { duration: 0.8 })
  const marker = activeMarkers.get(a.id)
  if (marker) setTimeout(() => marker.openPopup(), 850)
}

// ── Near Me helpers ───────────────────────────────────────────────────
function placeUserMarker(lat: number, lng: number, flyTo = false, accuracyM = 0) {
  const L = (window as any).L

  userLocation.value = { lat, lng }

  const accuracyTxt = accuracyM > 0
    ? (accuracyM < 1000 ? `±${Math.round(accuracyM)}m` : `±${(accuracyM / 1000).toFixed(1)}km`)
    : ''

  const popupHtml =
    `<b style="font-size:13px">📍 You are here</b><br>
     <span style="font-size:11px;color:#666">${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E</span><br>
     <span style="font-size:10px;color:#aaa">Accuracy: ${accuracyTxt || 'unknown'}</span>`

  if (userMarker) {
    // update in place — no flicker
    userMarker.setLatLng([lat, lng])
    userMarker.setPopupContent(popupHtml)
    radiusCircle.setLatLng([lat, lng])
  } else {
    userMarker = L.circleMarker([lat, lng], {
      radius: 10, color: '#1a73e8', fillColor: '#4a90e2', fillOpacity: 0.9, weight: 2,
    }).addTo(leafletMap)
      .bindPopup(popupHtml)
      .openPopup()

    radiusCircle = L.circle([lat, lng], {
      radius: NEAR_ME_KM * 1000,
      color: '#1a73e8', fillColor: '#4a90e2', fillOpacity: 0.07,
      weight: 1.5, dashArray: '6 4',
    }).addTo(leafletMap)
  }

  if (flyTo) leafletMap.flyTo([lat, lng], 9, { duration: 1 })
  buildMarkers()
}

const geoOptions = { maximumAge: 0, timeout: 15000, enableHighAccuracy: true }

function stopWatching() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
    watchId = null
  }
}

function toggleNearMe() {
  if (nearMeActive.value) {
    nearMeActive.value = false
    userLocation.value = null
    stopWatching()
    if (userMarker)   { leafletMap.removeLayer(userMarker);   userMarker   = null }
    if (radiusCircle) { leafletMap.removeLayer(radiusCircle); radiusCircle = null }
    buildMarkers()
    return
  }
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.')
    return
  }
  let firstFix = true
  watchId = navigator.geolocation.watchPosition(
    ({ coords }) => {
      nearMeActive.value = true
      placeUserMarker(coords.latitude, coords.longitude, firstFix, coords.accuracy)
      firstFix = false
    },
    (err) => {
      if (err.code === err.PERMISSION_DENIED) {
        alert('Location access denied. Please allow location in your browser settings.')
        nearMeActive.value = false
      }
    },
    geoOptions,
  )
}

function refreshLocation() {
  stopWatching()
  let firstFix = true
  watchId = navigator.geolocation.watchPosition(
    ({ coords }) => {
      placeUserMarker(coords.latitude, coords.longitude, firstFix, coords.accuracy)
      firstFix = false
    },
    () => alert('Could not get your location.'),
    geoOptions,
  )
}


onMounted(async () => {
  try {
    const { data } = await API.get('/attractions', { params: { limit: 200 } })
    const payload = data?.data ?? data?.attractions ?? data
    attractions.value = Array.isArray(payload) ? payload : []
  } catch (e) {
    console.error('Failed to load attractions:', e)
  } finally {
    loading.value = false
  }
  await initMap()
})

onUnmounted(() => {
  stopWatching()
  if (leafletMap) { leafletMap.remove(); leafletMap = null }
})
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.map-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
}

/* Filter bar */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  overflow-x: auto;
  flex-shrink: 0;
  scrollbar-width: none;
}
.filter-bar::-webkit-scrollbar { display: none; }

.filter-divider {
  width: 1px;
  height: 24px;
  background: #e0e0e0;
  flex-shrink: 0;
  margin: 0 4px;
}

.filter-chip {
  white-space: nowrap;
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid #d0d0d0;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #444;
  cursor: pointer;
  transition: all 0.18s;
  flex-shrink: 0;
}
.filter-chip:hover  { border-color: #C8922A; color: #C8922A; }
.filter-chip.active { background: #C8922A; border-color: #C8922A; color: #fff; }

.near-me-chip.active { background: #1a73e8; border-color: #1a73e8; color: #fff; }
.near-me-chip.active:hover { background: #1557b0; border-color: #1557b0; }

.refresh-chip { padding: 6px 12px; }
.refresh-chip:hover { border-color: #1a73e8; color: #1a73e8; }



/* Body */
.map-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 320px;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid #e8e8e8;
  background: #fafafa;
}

.sidebar-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #efefef;
  background: #fff;
}
.search-icon { color: #aaa; flex-shrink: 0; }
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  font-family: inherit;
  color: #1a1a1a;
  background: transparent;
}
.search-input::placeholder { color: #bbb; }
.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: #bbb;
  font-size: 13px;
  padding: 0 2px;
  line-height: 1;
  transition: color 0.15s;
  flex-shrink: 0;
}
.search-clear:hover { color: #666; }

.sidebar-count {
  padding: 12px 16px 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #888;
  text-transform: uppercase;
  border-bottom: 1px solid #efefef;
}

.sidebar-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #efefef;
  cursor: pointer;
  transition: background 0.15s;
}
.sidebar-card:hover { background: #fff3e0; }

.sidebar-img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.sidebar-info { flex: 1; min-width: 0; }
.sidebar-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sidebar-cat    { font-size: 11px; color: #888; margin-bottom: 4px; }
.sidebar-rating { font-size: 13px; color: #C8922A; font-weight: 600; }

.sidebar-empty {
  padding: 24px 16px;
  font-size: 13px;
  color: #aaa;
  text-align: center;
}

/* Map */
.map-container {
  flex: 1;
  height: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .map-page { height: auto; }
  .map-body  { flex-direction: column; }
  .sidebar   { width: 100%; height: 240px; border-right: none; border-bottom: 1px solid #e8e8e8; }
  .map-container { height: 60vh; }
}
</style>

<!-- Leaflet icon overrides must be global (not scoped) -->
<style>
.map-icon-wrapper {
  background: transparent !important;
  border: none !important;
}
.map-pin-main {
  background: #C8922A;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.35);
}
.map-pin-main span { transform: rotate(45deg); display: block; }

.province-tooltip {
  background: rgba(255,255,255,0.9);
  border: 1px solid #C8922A;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #C8922A;
  padding: 3px 8px;
}
</style>
