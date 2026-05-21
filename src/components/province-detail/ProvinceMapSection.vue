<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
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
let boundaryLayer: L.GeoJSON | null = null;

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

  if (typeof location === "string") {
    const match = location.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/i);
    if (match) {
      const parsedLng = Number(match[1]);
      const parsedLat = Number(match[2]);

      if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) {
        return { lat: parsedLat, lng: parsedLng };
      }
    }
  }

  return null;
}

const placesWithCoords = computed(() => {
  return props.places
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
});

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const provinceGeoJsonNames: Record<string, string[]> = {
  "koh-kong": ["Koh Kong", "KohKong"],
  "siem-reap": ["Siem Reap", "Siemreap", "Siem Reab", "Siemreab"],
  kampot: ["Kampot"],
  kratie: ["Kratie", "Kratie"],
  kep: ["Kep"],
  "preah-sihanouk": ["Preah Sihanouk", "Sihanoukville", "PreahSihanouk"],
  ratanakiri: ["Ratanakiri", "Ratanak Kiri"],
  mondulkiri: ["Mondulkiri", "Mondol Kiri"],
  battambang: ["Battambang"],
  "phnom-penh": ["Phnom Penh", "PhnomPenh"],
  "preah-vihear": ["Preah Vihear", "PreahVihear"],
  takeo: ["Takeo", "Takeo"],
  "kampong-speu": ["Kampong Speu", "KampongSpeu"],
};

function matchProvinceFeature(feature: any, slug: string) {
  const adm1 = feature?.properties?.ADM1_EN;
  if (!adm1) return false;

  const expectedNames = provinceGeoJsonNames[slug] || [slug];
  const normalizedAdm1 = normalizeName(String(adm1));

  return expectedNames.some((name) => normalizeName(name) === normalizedAdm1);
}

async function loadBoundaryGeoJson() {
  const response = await fetch("/geo/cambodia-provinces.geojson");
  if (!response.ok) {
    throw new Error(
      `Failed to load province boundary GeoJSON: ${response.status}`,
    );
  }
  return response.json();
}

async function addProvinceBoundary(slug: string) {
  if (!leafletMap) return false;

  try {
    const geojson = await loadBoundaryGeoJson();

    const matchedFeatures =
      geojson?.features?.filter((feature: any) =>
        matchProvinceFeature(feature, slug),
      ) || [];

    if (!matchedFeatures.length) {
      console.warn("No province boundary matched for slug:", slug);
      return false;
    }

    boundaryLayer = L.geoJSON(
      {
        type: "FeatureCollection",
        features: matchedFeatures,
      },
      {
        pane: "boundaryPane",
        interactive: false,
        style: {
          color: "#d9534f",
          weight: 4,
          opacity: 1,
          fillColor: "#d9534f",
          fillOpacity: 0.08,
        },
      },
    ).addTo(leafletMap);

    boundaryLayer.eachLayer((layer: any) => {
      if (layer.bringToFront) {
        layer.bringToFront();
      }
    });

    leafletMap.fitBounds(boundaryLayer.getBounds(), {
      padding: [20, 20],
    });

    return true;
  } catch (error) {
    console.error("Failed to draw province boundary:", error);
    return false;
  }
}

function getFallbackCenter() {
  if (placesWithCoords.value.length > 0) {
    return [placesWithCoords.value[0].lat, placesWithCoords.value[0].lng] as [
      number,
      number,
    ];
  }

  return [12.5657, 104.991] as [number, number];
}

function destroyMap() {
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }

  markerLayer = null;
  boundaryLayer = null;
}

function createNumberedIcon(number: number) {
  return L.divIcon({
    className: "custom-numbered-marker-wrapper",
    html: `
      <div class="custom-numbered-marker">
        <span>${number}</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30],
  });
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

  leafletMap = L.map(mapContainer.value, {
    zoomControl: true,
  }).setView(getFallbackCenter(), 10);

  leafletMap.createPane("boundaryPane");
  const boundaryPane = leafletMap.getPane("boundaryPane");
  if (boundaryPane) {
    boundaryPane.style.zIndex = "500";
  }

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(leafletMap);

  markerLayer = L.layerGroup().addTo(leafletMap);

  hasMapPoints.value = placesWithCoords.value.length > 0;

  const boundaryLoaded = await addProvinceBoundary(props.provinceSlug);

  placesWithCoords.value.forEach((point, index) => {
    const markerNumber = index + 1;

    const marker = L.marker([point.lat, point.lng], {
      icon: createNumberedIcon(markerNumber),
    }).bindPopup(`
      <div style="min-width: 190px;">
        <strong>${markerNumber}. ${point.name}</strong><br />
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
  });

  if (!boundaryLoaded) {
    if (placesWithCoords.value.length > 1) {
      const bounds = L.latLngBounds(
        placesWithCoords.value.map(
          (point) => [point.lat, point.lng] as [number, number],
        ),
      );
      leafletMap.fitBounds(bounds, { padding: [30, 30] });
    } else if (placesWithCoords.value.length === 1) {
      leafletMap.setView(
        [placesWithCoords.value[0].lat, placesWithCoords.value[0].lng],
        13,
      );
    } else {
      leafletMap.setView(getFallbackCenter(), 7);
    }
  }
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

    <div v-if="placesWithCoords.length" class="map-attraction-list">
      <h3>Attractions located on map</h3>

      <div class="map-attraction-items">
        <div
          v-for="(place, index) in placesWithCoords"
          :key="place.id"
          class="map-attraction-item"
          @click="openPlaceDetail(place)"
        >
          <div class="map-attraction-number">{{ index + 1 }}</div>

          <div class="map-attraction-content">
            <p class="map-attraction-name">{{ place.name }}</p>
            <p class="map-attraction-meta">
              {{ place.category }} · ⭐ {{ place.rating }}
            </p>
          </div>
        </div>
      </div>
    </div>
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

.map-attraction-list {
  background: #fff;
  border: 1px solid #e2e7f0;
  border-radius: 20px;
  padding: 22px;
}

.map-attraction-list h3 {
  margin: 0 0 16px;
  color: #15543f;
  font-size: 24px;
  font-family: Georgia, "Times New Roman", serif;
}

.map-attraction-items {
  display: grid;
  gap: 12px;
}

.map-attraction-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid #e7ebf2;
  border-radius: 16px;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.map-attraction-item:hover {
  transform: translateY(-1px);
  border-color: #d4dbe7;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
}

.map-attraction-number {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #15543f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.map-attraction-content {
  min-width: 0;
}

.map-attraction-name {
  margin: 0 0 4px;
  color: #183b31;
  font-weight: 700;
}

.map-attraction-meta {
  margin: 0;
  color: #7d8492;
  font-size: 14px;
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

<style>
.custom-numbered-marker-wrapper {
  background: transparent;
  border: none;
}

.custom-numbered-marker {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #15543f;
  color: #fff;
  border: 3px solid #fff;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}
</style>
