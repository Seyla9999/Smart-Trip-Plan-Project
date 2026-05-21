<template>
  <div class="map-wrapper">
    <div class="poi-toggles">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="poi-btn"
        :class="{ active: visibleLayers[cat.key] }"
        :style="visibleLayers[cat.key] ? { background: cat.color, borderColor: cat.color } : {}"
        @click="toggleLayer(cat.key)"
        :title="cat.label"
      >
        <span class="poi-icon">{{ cat.emoji }}</span>
        <span class="poi-label">{{ cat.label }}</span>
      </button>
    </div>
    <div ref="mapEl" class="map-container" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{ lat: number; lng: number; name: string }>()

const mapEl = ref<HTMLElement | null>(null)
let map: L.Map | null = null
const layers: Record<string, L.LayerGroup> = {}
const visibleLayers = ref<Record<string, boolean>>({})
const loading = ref(false)

const categories = [
  { key: 'hospital',   label: 'Hospitals',    emoji: '🏥', amenity: 'hospital',   color: '#e74c3c' },
  { key: 'police',     label: 'Police',       emoji: '🚓', amenity: 'police',     color: '#2980b9' },
  { key: 'restaurant', label: 'Restaurants',  emoji: '🍽️', amenity: 'restaurant', color: '#e67e22' },
  { key: 'atm',        label: 'ATMs',         emoji: '🏧', amenity: 'atm',        color: '#27ae60' },
  { key: 'cafe',       label: 'Cafes',        emoji: '☕', amenity: 'cafe',       color: '#8e44ad' },
  { key: 'pharmacy',   label: 'Pharmacies',   emoji: '💊', amenity: 'pharmacy',   color: '#16a085' },
]

function makeIcon(emoji: string, color: string) {
  return L.divIcon({
    html: `<div style="background:${color};border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:17px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35)">${emoji}</div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  })
}

async function fetchPOIs(amenity: string) {
  const query = `[out:json][timeout:25];node["amenity"="${amenity}"](around:5000,${props.lat},${props.lng});out body;`
  const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
  const data = await res.json()
  return (data.elements || []) as { lat: number; lon: number; tags?: Record<string, string> }[]
}

async function toggleLayer(key: string) {
  if (!map) return
  visibleLayers.value[key] = !visibleLayers.value[key]

  if (visibleLayers.value[key]) {
    // Fetch on first show if layer is still empty
    if (!layers[key]) {
      const cat = categories.find((c) => c.key === key)!
      layers[key] = L.layerGroup()
      loading.value = true
      try {
        const pois = await fetchPOIs(cat.amenity)
        pois.forEach((poi) => {
          if (poi.lat && poi.lon) {
            L.marker([poi.lat, poi.lon], { icon: makeIcon(cat.emoji, cat.color) })
              .bindPopup(`<b>${poi.tags?.name || cat.label}</b>${poi.tags?.['addr:street'] ? `<br>${poi.tags['addr:street']}` : ''}`)
              .addTo(layers[key])
          }
        })
      } catch { /* Overpass unavailable — show nothing */ }
      loading.value = false
    }
    layers[key].addTo(map)
  } else {
    layers[key]?.remove()
  }
}

onMounted(() => {
  if (!mapEl.value) return

  map = L.map(mapEl.value).setView([props.lat, props.lng], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  // Main attraction marker
  L.marker([props.lat, props.lng], { icon: makeIcon('📍', '#C8922A') })
    .addTo(map)
    .bindPopup(`<b>${props.name}</b>`)
    .openPopup()

  categories.forEach((cat) => {
    visibleLayers.value[cat.key] = false
  })
})

onUnmounted(() => {
  map?.remove()
  map = null
})
</script>

<style scoped>
.map-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.poi-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.poi-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1.5px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #444;
  transition: all 0.18s ease;
}

.poi-btn:hover {
  border-color: #aaa;
  background: #f5f5f5;
}

.poi-btn.active {
  color: #fff;
}

.poi-icon {
  font-size: 15px;
  line-height: 1;
}

.map-container {
  width: 100%;
  height: 340px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}
</style>
