<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ProvinceMapEmptyState from "./ProvinceMapEmptyState.vue";

type Place = {
  id: string | number;
  name: string;
  category: string;
  rating: number;
  location?:
    | string
    | {
        type?: string;
        coordinates?: [number, number];
      }
    | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

const props = defineProps<{
  provinceName: string;
  provinceSlug: string;
  places: Place[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const router = useRouter();

const mapContainer = ref<HTMLElement | null>(null);
const hasMapPoints = ref(true);

let leafletMap: L.Map | null = null;
let markerLayer: L.LayerGroup | null = null;

function closeMapView() {
  emit("close");
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function openPlaceDetail(place: Place) {
  router.push(`/province/${props.provinceSlug}/${toSlug(place.name)}`);
}

function getCoordinates(
  place:
    | {
        location?:
          | string
          | {
              type?: string;
              coordinates?: [number, number];
            }
          | null;
        latitude?: number | string | null;
        longitude?: number | string | null;
      }
    | null
    | undefined,
) {
  if (!place) return null;

  const lat = Number(place.latitude);
  const lng = Number(place.longitude);

  if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat && lng) {
    return { lat, lng };
  }

  const location = place.location;

  if (
    location &&
    typeof location === "object" &&
    Array.isArray(location.coordinates)
  ) {
    const [rawLng, rawLat] = location.coordinates;
    const parsedLat = Number(rawLat);
    const parsedLng = Number(rawLng);

    if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) {
      return { lat: parsedLat, lng: parsedLng };
    }
  }

  return null;
}

function getProvinceMapView(slugValue: string) {
  const provinceViews: Record<
    string,
    { center: [number, number]; zoom: number }
  > = {
    "koh-kong": { center: [11.617, 102.983], zoom: 9 },
    "siem-reap": { center: [13.367, 103.844], zoom: 9 },
    "phnom-penh": { center: [11.556, 104.928], zoom: 11 },
    kampot: { center: [10.61, 104.181], zoom: 10 },
    kep: { center: [10.482, 104.316], zoom: 11 },
    kratie: { center: [12.488, 106.018], zoom: 9 },
    mondulkiri: { center: [12.787, 107.201], zoom: 8 },
    "preah-vihear": { center: [13.792, 104.98], zoom: 8 },
    ratanakiri: { center: [13.739, 106.987], zoom: 8 },
    sihanoukville: { center: [10.625, 103.523], zoom: 10 },
    takeo: { center: [10.99, 104.785], zoom: 10 },
    battambang: { center: [13.095, 103.202], zoom: 9 },
  };

  return provinceViews[slugValue] || { center: [12.5657, 104.991], zoom: 7 };
}

function destroyMap() {
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }
  markerLayer = null;
}

function bindPopupButton(marker: L.Marker, place: Place) {
  marker.on("popupopen", () => {
    const button = document.getElementById(`view-detail-${place.id}`);
    if (button) {
      button.onclick = () => openPlaceDetail(place);
    }
  });
}

async function renderProvinceMap() {
  await nextTick();

  if (!mapContainer.value) return;

  destroyMap();

  const provinceView = getProvinceMapView(props.provinceSlug);

  leafletMap = L.map(mapContainer.value).setView(
    provinceView.center,
    provinceView.zoom,
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(leafletMap);

  markerLayer = L.layerGroup().addTo(leafletMap);

  const points = props.places
    .map((place) => {
      const coords = getCoordinates(place);
      if (!coords) return null;
      return {
        ...place,
        lat: coords.lat,
        lng: coords.lng,
      };
    })
    .filter(Boolean) as Array<Place & { lat: number; lng: number }>;

  hasMapPoints.value = points.length > 0;

  if (!points.length) {
    return;
  }

  const bounds = L.latLngBounds([]);

  points.forEach((point) => {
    const marker = L.marker([point.lat, point.lng]).bindPopup(`
      <div style="min-width: 180px;">
        <strong>${point.name}</strong><br />
        <span>${point.category}</span><br />
        <span>⭐ ${point.rating}</span><br /><br />
        <button
          id="view-detail-${point.id}"
          style="
            background:#15543f;
            color:white;
            border:none;
            border-radius:999px;
            padding:8px 12px;
            cursor:pointer;
            font-weight:700;
          "
        >
          View details
        </button>
      </div>
    `);

    bindPopupButton(marker, point);
    markerLayer?.addLayer(marker);
    bounds.extend([point.lat, point.lng]);
  });

  leafletMap.fitBounds(bounds, {
    padding: [30, 30],
    maxZoom: provinceView.zoom + 1,
  });
}

onMounted(() => {
  renderProvinceMap();
});

watch(
  () => props.places,
  async () => {
    await renderProvinceMap();
  },
  { deep: true },
);

watch(
  () => props.provinceSlug,
  async () => {
    await renderProvinceMap();
  },
);

onUnmounted(() => {
  destroyMap();
});
</script>

<template>
  <div class="map-view-panel">
    <div class="map-view-top">
      <div>
        <h1>{{ provinceName }} map</h1>
        <p class="results-text">Showing attraction points for this province</p>
      </div>

      <button class="close-map-btn" @click="closeMapView">Back to list</button>
    </div>

    <div ref="mapContainer" class="province-map-box"></div>

    <ProvinceMapEmptyState v-if="!hasMapPoints" :province-name="provinceName" />
  </div>
</template>

<style scoped>
.map-view-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.map-view-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

h1 {
  margin: 0 0 8px;
  color: #15543f;
  font-size: 54px;
  line-height: 1.1;
  font-family: Georgia, "Times New Roman", serif;
}

.results-text {
  color: #82889a;
  margin-bottom: 20px;
}

.close-map-btn {
  border: none;
  background: #15543f;
  color: white;
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.province-map-box {
  min-height: 500px;
  border-radius: 24px;
  border: 1px solid #d9dfeb;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .map-view-top {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  h1 {
    font-size: 36px;
  }
}
</style>
