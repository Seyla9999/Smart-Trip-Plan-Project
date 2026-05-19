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
    </div>

    <!-- Body -->
    <div class="map-body">
      <!-- Sidebar -->
      <aside class="sidebar">
        <p class="sidebar-count">
          <span v-if="loading">Loading…</span>
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
            <p class="sidebar-rating">★ {{ Number(a.average_rating).toFixed(1) }}</p>
          </div>
        </div>
        <p v-if="!loading && filteredAttractions.length === 0" class="sidebar-empty">
          No attractions in this category.
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

const fallback = 'https://www.asiakingtravel.com/cuploads/files/royalpalace-att-b.jpg'

const categories = [
  'All', 'Nature', 'Culture', 'Adventure', 'Historical',
  'Religious', 'Urban', 'Beach', 'Culinary', 'Eco-Tourism',
]

const attractions     = ref<any[]>([])
const selectedCategory = ref('All')
const loading         = ref(true)
const mapEl           = ref<HTMLElement | null>(null)

let leafletMap: any = null
const activeMarkers = new Map<string, any>()

const filteredAttractions = computed(() =>
  selectedCategory.value === 'All'
    ? attractions.value
    : attractions.value.filter(a => a.category === selectedCategory.value)
)

function getCoords(a: any): { lat: number; lng: number } | null {
  const loc = a.location
  if (!loc) return null
  if (loc.coordinates?.length >= 2) return { lng: loc.coordinates[0], lat: loc.coordinates[1] }
  if (loc.x !== undefined && loc.y !== undefined) return { lng: loc.x, lat: loc.y }
  return null
}

function slugOrId(a: any) {
  return a.slug || a.name_en?.toLowerCase().replace(/\s+/g, '-') || a.id
}

function buildMarkers() {
  if (!leafletMap) return
  const L = (window as any).L

  // Clear old markers
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

    const marker = L.marker([coords.lat, coords.lng], { icon })
      .addTo(leafletMap)
      .bindPopup(`
        <div style="min-width:160px">
          <b style="font-size:14px">${a.name_en}</b><br>
          <span style="color:#888;font-size:12px">${a.category || 'Attraction'}</span><br>
          <span style="color:#C8922A;font-size:13px">★ ${Number(a.average_rating).toFixed(1)}</span><br>
          <a href="/attraction/${slugOrId(a)}"
             style="display:inline-block;margin-top:6px;color:#C8922A;font-weight:600;font-size:13px;text-decoration:none">
            View Details →
          </a>
        </div>
      `)

    activeMarkers.set(a.id, marker)
  }
}

async function loadLeaflet(): Promise<void> {
  if ((window as any).L) return
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
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
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(leafletMap)

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

onMounted(async () => {
  try {
    const { data } = await API.get('/attractions', { params: { limit: 200 } })
    attractions.value = data.data ?? data
  } catch (e) {
    console.error('Failed to load attractions:', e)
  } finally {
    loading.value = false
  }
  await initMap()
})

onUnmounted(() => {
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
.sidebar-cat  { font-size: 11px; color: #888; margin-bottom: 4px; }
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

<!-- Leaflet icon override must be global (not scoped) -->
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
</style>
