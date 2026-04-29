<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, RouterLink } from "vue-router";

import ProvinceTopSearch from "@/components/province-detail/ProvinceTopSearch.vue";
import ProvinceInfoBar from "@/components/province-detail/ProvinceInfoBar.vue";
import ProvinceFilters from "@/components/province-detail/ProvinceFilters.vue";
import FeaturedPlaceCard from "@/components/province-detail/FeaturedPlaceCard.vue";
import PlaceCard from "@/components/province-detail/PlaceCard.vue";
import PlacePagination from "@/components/province-detail/PlacePagination.vue";

type TravelType = "Solo" | "Friends" | "Family";
type ViewMode = "grid" | "list";
type SortOption = "recommended" | "top-rated" | "most-popular";

type Place = {
  id: string | number;
  name: string;
  province: string;
  category: string;
  discovery: string;
  rating: number;
  reviews: number;
  description: string;
  image: string;
  tags: string[];
  featured?: boolean;
};

type ProvinceApi = {
  id: number;
  nameEn: string;
  nameKh: string;
  description: string | null;
  mainImageUrl: string | null;
};

type AttractionApi = {
  id: string;
  provinceId: number;
  nameEn: string;
  nameKh: string | null;
  category: string | null;
  description: string | null;
  location: string | null;
  isHiddenGem: boolean;
  averageRating: number | string;
};

type WeatherApi = {
  id: string;
  provinceId: number;
  tempCelsius: number | string | null;
  conditionText: string | null;
  iconUrl: string | null;
  lastUpdated: string | null;
};

type WeatherAlertApi = {
  id: string;
  provinceId: number;
  alertType: string | null;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
};

const API_BASE = "http://localhost:3000";
const FALLBACK_IMAGE =
  "https://www.asiakingtravel.com/cuploads/files/royalpalace-att-b.jpg";

const route = useRoute();

const slug = computed(() => (route.params.slug as string) || "koh-kong");

const provinceName = computed(() => {
  return slug.value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
});

const selectedTypeFromQuery = computed(() => {
  return (route.query.type as string) || "friends";
});

const fromDate = computed(() => {
  return (route.query.from as string) || "";
});

const toDate = computed(() => {
  return (route.query.to as string) || "";
});

function formatQueryDate(dateString: string) {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const displayDateRange = computed(() => {
  if (fromDate.value && toDate.value) {
    return `${formatQueryDate(fromDate.value)} – ${formatQueryDate(toDate.value)}`;
  }

  if (fromDate.value) {
    return `From ${formatQueryDate(fromDate.value)}`;
  }

  return "Pick Date";
});

const selectedTravelType = ref<TravelType>("Friends");

watch(
  selectedTypeFromQuery,
  (value) => {
    if (value === "solo") {
      selectedTravelType.value = "Solo";
    } else if (value === "family") {
      selectedTravelType.value = "Family";
    } else {
      selectedTravelType.value = "Friends";
    }
  },
  { immediate: true },
);

function toSlug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

const backendProvinceId = ref<number | null>(null);
const backendProvince = ref<ProvinceApi | null>(null);
const allPlaces = ref<Place[]>([]);
const weather = ref<WeatherApi | null>(null);
const weatherAlerts = ref<WeatherAlertApi[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");

const categoryFilters = ref([
  { name: "Nature", count: 0, checked: true },
  { name: "Waterfall", count: 0, checked: true },
  { name: "Beach", count: 0, checked: false },
  { name: "Cultural", count: 0, checked: true },
  { name: "Food", count: 0, checked: false },
]);

const discoveryFilters = ref([
  { name: "Hidden gems", count: 0, checked: true },
  { name: "Most popular", count: 0, checked: true },
]);

function updateFilterCounts(places: Place[]) {
  categoryFilters.value = categoryFilters.value.map((item) => ({
    ...item,
    count: places.filter((place) => place.category === item.name).length,
  }));

  discoveryFilters.value = discoveryFilters.value.map((item) => ({
    ...item,
    count: places.filter((place) => place.discovery === item.name).length,
  }));
}

function mapAttractionToPlace(
  attraction: AttractionApi,
  province: ProvinceApi,
  index: number,
): Place {
  const category = attraction.category || "Cultural";
  const discovery = attraction.isHiddenGem ? "Hidden gems" : "Most popular";
  const rating = Number(attraction.averageRating || 0);

  return {
    id: attraction.id,
    name: attraction.nameEn,
    province: province.nameEn,
    category,
    discovery,
    rating,
    reviews: 0,
    description: attraction.description || "No description available yet.",
    image: province.mainImageUrl || FALLBACK_IMAGE,
    tags: [category, discovery],
    featured: index === 0,
  };
}

async function loadProvinceDetail() {
  isLoading.value = true;
  errorMessage.value = "";
  backendProvinceId.value = null;
  backendProvince.value = null;
  allPlaces.value = [];
  weather.value = null;
  weatherAlerts.value = [];

  try {
    const provincesResponse = await fetch(`${API_BASE}/provinces`);
    if (!provincesResponse.ok) {
      throw new Error("Failed to load provinces.");
    }

    const provinces: ProvinceApi[] = await provincesResponse.json();

    const matchedProvince = provinces.find(
      (province) => toSlug(province.nameEn) === slug.value,
    );

    if (!matchedProvince) {
      throw new Error("Province not found in backend.");
    }

    backendProvinceId.value = matchedProvince.id;
    backendProvince.value = matchedProvince;

    const [attractionsResponse, weatherResponse] = await Promise.all([
      fetch(`${API_BASE}/provinces/${matchedProvince.id}/attractions`),
      fetch(`${API_BASE}/provinces/${matchedProvince.id}/weather`),
    ]);

    if (attractionsResponse.ok) {
      const attractionsData = await attractionsResponse.json();
      const attractions: AttractionApi[] = attractionsData.attractions || [];

      allPlaces.value = attractions.map((attraction, index) =>
        mapAttractionToPlace(attraction, matchedProvince, index),
      );
      updateFilterCounts(allPlaces.value);
    } else {
      allPlaces.value = [];
      updateFilterCounts([]);
    }

    if (weatherResponse.ok) {
      const weatherData = await weatherResponse.json();
      weather.value = weatherData.weather || null;
      weatherAlerts.value = weatherData.alerts || [];
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Failed to load province detail.";
    allPlaces.value = [];
    weather.value = null;
    weatherAlerts.value = [];
    updateFilterCounts([]);
  } finally {
    isLoading.value = false;
    currentPage.value = 1;
  }
}

onMounted(loadProvinceDetail);
watch(slug, loadProvinceDetail);

const places = computed(() => allPlaces.value);

const featuredPlace = computed(() => {
  return (
    places.value.find((place) => place.featured) || places.value[0] || null
  );
});

const normalPlaces = computed(() => {
  if (!featuredPlace.value) return [];
  return places.value.filter((place) => place.id !== featuredPlace.value?.id);
});

const activeCategories = computed(() =>
  categoryFilters.value.filter((item) => item.checked).map((item) => item.name),
);

const activeDiscoveries = computed(() =>
  discoveryFilters.value
    .filter((item) => item.checked)
    .map((item) => item.name),
);

const filteredPlaces = computed(() => {
  return normalPlaces.value.filter((place) => {
    const categoryMatch =
      activeCategories.value.length === 0 ||
      activeCategories.value.includes(place.category);

    const discoveryMatch =
      activeDiscoveries.value.length === 0 ||
      activeDiscoveries.value.includes(place.discovery);

    return categoryMatch && discoveryMatch;
  });
});

const viewMode = ref<ViewMode>("grid");
const sortOption = ref<SortOption>("recommended");

const sortedPlaces = computed(() => {
  const list = [...filteredPlaces.value];

  if (sortOption.value === "top-rated") {
    return list.sort((a, b) => b.rating - a.rating);
  }

  if (sortOption.value === "most-popular") {
    return list.sort((a, b) => b.reviews - a.reviews);
  }

  return list;
});

const currentPage = ref(1);
const itemsPerPage = 4;

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(sortedPlaces.value.length / itemsPerPage));
});

const paginatedPlaces = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedPlaces.value.slice(start, end);
});

const totalResults = computed(() => {
  return featuredPlace.value
    ? filteredPlaces.value.length + 1
    : filteredPlaces.value.length;
});

const weatherSummary = computed(() => {
  if (!weather.value) return null;

  return {
    temp: weather.value.tempCelsius ?? "--",
    condition: weather.value.conditionText || "No weather data",
    icon: weather.value.iconUrl || "",
    updatedAt: weather.value.lastUpdated
      ? new Date(weather.value.lastUpdated).toLocaleString("en-GB")
      : "",
  };
});

watch([slug, filteredPlaces, sortOption], () => {
  currentPage.value = 1;
});

function goToPage(page: number) {
  currentPage.value = page;
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
  }
}

function clearAllFilters() {
  categoryFilters.value.forEach((item) => (item.checked = false));
  discoveryFilters.value.forEach((item) => (item.checked = false));
}

function toggleCategory(name: string) {
  const found = categoryFilters.value.find((item) => item.name === name);
  if (found) found.checked = !found.checked;
}

function toggleDiscovery(name: string) {
  const found = discoveryFilters.value.find((item) => item.name === name);
  if (found) found.checked = !found.checked;
}

function setTravelType(value: TravelType) {
  selectedTravelType.value = value;
}
</script>

<template>
  <main class="province-detail-page">
    <ProvinceTopSearch
      :province-name="backendProvince?.nameEn || provinceName"
      :selected-travel-type="selectedTravelType"
      :from-date="fromDate"
      :to-date="toDate"
    />

    <ProvinceInfoBar
      :province-name="backendProvince?.nameEn || provinceName"
      :total-places="places.length"
    />

    <section class="content-section">
      <div class="page-container">
        <div class="breadcrumb">
          <RouterLink to="/" class="breadcrumb-link">HOME</RouterLink>
          <span>›</span>
          <RouterLink to="/discover" class="breadcrumb-link">
            DISCOVER
          </RouterLink>
          <span>›</span>
          <strong>{{
            (backendProvince?.nameEn || provinceName).toUpperCase()
          }}</strong>
        </div>

        <div class="content-layout">
          <ProvinceFilters
            :selected-travel-type="selectedTravelType"
            :category-filters="categoryFilters"
            :discovery-filters="discoveryFilters"
            @set-travel-type="setTravelType"
            @toggle-category="toggleCategory"
            @toggle-discovery="toggleDiscovery"
            @clear-all="clearAllFilters"
          />

          <section class="places-content">
            <div class="content-top">
              <div>
                <h1>
                  {{ backendProvince?.nameEn || provinceName }} attractions
                </h1>
                <p class="results-text">
                  {{ totalResults }} results · {{ selectedTravelType }} trip ·
                  {{ displayDateRange }}
                </p>

                <div class="tag-row">
                  <span class="filter-tag">{{ selectedTravelType }}</span>

                  <span
                    v-for="item in categoryFilters.filter((i) => i.checked)"
                    :key="item.name"
                    class="filter-tag"
                  >
                    {{ item.name }}
                  </span>

                  <span
                    v-for="item in discoveryFilters.filter((i) => i.checked)"
                    :key="item.name"
                    class="filter-tag"
                  >
                    {{ item.name }}
                  </span>
                </div>
              </div>

              <div class="top-actions">
                <button
                  class="view-btn"
                  :class="{ active: viewMode === 'grid' }"
                  @click="viewMode = 'grid'"
                >
                  ▦
                </button>

                <button
                  class="view-btn"
                  :class="{ active: viewMode === 'list' }"
                  @click="viewMode = 'list'"
                >
                  ☰
                </button>

                <select v-model="sortOption" class="sort-select">
                  <option value="recommended">Recommended</option>
                  <option value="top-rated">Top Rated</option>
                  <option value="most-popular">Most Popular</option>
                </select>
              </div>
            </div>

            <div v-if="weatherSummary" class="weather-card">
              <div class="weather-left">
                <img
                  v-if="weatherSummary.icon"
                  :src="weatherSummary.icon"
                  alt="Weather icon"
                  class="weather-icon"
                />
                <div>
                  <p class="weather-temp">{{ weatherSummary.temp }}°C</p>
                  <p class="weather-condition">
                    {{ weatherSummary.condition }}
                  </p>
                </div>
              </div>
              <div class="weather-right">
                <p v-if="weatherSummary.updatedAt">
                  Updated: {{ weatherSummary.updatedAt }}
                </p>
                <p v-if="weatherAlerts.length">
                  Alerts: {{ weatherAlerts.length }}
                </p>
              </div>
            </div>

            <div v-if="isLoading" class="status-box">
              Loading province details...
            </div>
            <div v-else-if="errorMessage" class="status-box error-box">
              {{ errorMessage }}
            </div>
            <div v-else>
              <FeaturedPlaceCard v-if="featuredPlace" :place="featuredPlace" />

              <div
                v-if="paginatedPlaces.length"
                class="cards-grid"
                :class="{ 'cards-list': viewMode === 'list' }"
              >
                <PlaceCard
                  v-for="place in paginatedPlaces"
                  :key="place.id"
                  :place="place"
                />
              </div>

              <div v-else-if="!featuredPlace" class="status-box">
                No attractions found yet.
              </div>

              <PlacePagination
                v-if="paginatedPlaces.length"
                :current-page="currentPage"
                :total-pages="totalPages"
                @go-to-page="goToPage"
                @prev-page="prevPage"
                @next-page="nextPage"
              />
            </div>
          </section>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.province-detail-page {
  background: #f7f5f0;
  min-height: 100vh;
}

.page-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

.content-section {
  padding: 36px 0 60px;
}

.breadcrumb {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 13px;
  color: #8c94a8;
  margin-bottom: 28px;
}

.breadcrumb-link {
  color: #8c94a8;
  text-decoration: none;
  font-weight: 500;
}

.breadcrumb-link:hover {
  color: #15543f;
}

.breadcrumb strong {
  color: #15543f;
}

.content-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 32px;
}

.places-content h1 {
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

.content-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 28px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: #edf3ef;
  color: #15543f;
  font-size: 14px;
  font-weight: 600;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.view-btn,
.sort-select {
  border: 1px solid #e4e7ee;
  background: #fff;
  border-radius: 10px;
  padding: 12px 14px;
}

.view-btn {
  cursor: pointer;
}

.view-btn.active {
  color: #15543f;
  font-weight: 700;
  border-color: #15543f;
}

.weather-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 18px 20px;
  background: #ffffff;
  border: 1px solid #e4e7ee;
  border-radius: 16px;
}

.weather-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.weather-icon {
  width: 54px;
  height: 54px;
  object-fit: contain;
}

.weather-temp {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #15543f;
}

.weather-condition {
  margin: 4px 0 0;
  color: #6e7485;
}

.weather-right {
  text-align: right;
  color: #6e7485;
  font-size: 14px;
}

.status-box {
  padding: 18px 20px;
  background: #ffffff;
  border: 1px solid #e4e7ee;
  border-radius: 16px;
  color: #5f6678;
  margin-bottom: 24px;
}

.error-box {
  color: #b42318;
  border-color: #f0c7c3;
  background: #fff7f6;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 26px;
}

.cards-list {
  grid-template-columns: 1fr;
}

@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .content-top {
    flex-direction: column;
  }

  .weather-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .weather-right {
    text-align: left;
  }
}

@media (max-width: 640px) {
  .places-content h1 {
    font-size: 36px;
  }
}
</style>
