<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";

import ProvinceTopSearch from "@/components/province-detail/ProvinceTopSearch.vue";
import ProvinceInfoBar from "@/components/province-detail/ProvinceInfoBar.vue";
import ProvinceFilters from "@/components/province-detail/ProvinceFilters.vue";
import FeaturedPlaceCard from "@/components/province-detail/FeaturedPlaceCard.vue";
import PlaceCard from "@/components/province-detail/PlaceCard.vue";
import PlacePagination from "@/components/province-detail/PlacePagination.vue";
import {
  mockProvinces,
  mockProvinceAttractions,
  mockWeather,
} from "@/data/mockProvinces";

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
  reviewCount: number | string;
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

function normalizeProvince(raw: any): ProvinceApi | null {
  if (!raw) return null;

  const id = Number(raw.id ?? raw.province_id ?? raw.provinceId);
  const nameEn = String(raw.nameEn ?? raw.name_en ?? raw.name ?? "");

  if (!id || !nameEn) return null;

  return {
    id,
    nameEn,
    nameKh: String(raw.nameKh ?? raw.name_kh ?? ""),
    description: raw.description ?? null,
    mainImageUrl: raw.mainImageUrl ?? raw.main_image_url ?? null,
  };
}

function normalizeAttraction(raw: any): AttractionApi | null {
  if (!raw) return null;

  const id = String(raw.id ?? raw.attraction_id ?? "");
  if (!id) return null;

  return {
    id,
    provinceId: Number(raw.provinceId ?? raw.province_id ?? 0),
    nameEn: String(raw.nameEn ?? raw.name_en ?? raw.name ?? ""),
    nameKh: raw.nameKh ?? raw.name_kh ?? null,
    category: raw.category ?? raw.main_category ?? null,
    description: raw.description ?? null,
    location: raw.location ?? raw.address ?? null,
    isHiddenGem: Boolean(raw.isHiddenGem ?? raw.is_hidden_gem ?? false),
    averageRating: raw.averageRating ?? raw.average_rating ?? raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? raw.review_count ?? 0,
  };
}

const route = useRoute();
const router = useRouter();

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

const shouldShowTopSearch = computed(() => {
  return !!route.query.type || !!route.query.from || !!route.query.to;
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
    return `${formatQueryDate(fromDate.value)} â€“ ${formatQueryDate(toDate.value)}`;
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
  const rating = Number(attraction.averageRating || 0);
  const reviews = Number(attraction.reviewCount || 0);
  const discovery = reviews > 0 ? "Most popular" : "Hidden gems";

  return {
    id: attraction.id,
    name: attraction.nameEn,
    province: province.nameEn,
    category,
    discovery,
    rating,
    reviews,
    description: attraction.description || "No description available yet.",
    image: province.mainImageUrl || FALLBACK_IMAGE,
    tags: [category, discovery],
    featured: index === 0,
  };
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

async function loadProvinceDetail() {
  isLoading.value = true;
  errorMessage.value = "";
  backendProvinceId.value = null;
  backendProvince.value = null;
  allPlaces.value = [];
  weather.value = null;
  weatherAlerts.value = [];

  try {
    const localProvince = normalizeProvince(
      mockProvinces.find((province) => toSlug(province.nameEn) === slug.value),
    );

    if (localProvince) {
      backendProvinceId.value = localProvince.id;
      backendProvince.value = localProvince;

      const localAttractions =
        mockProvinceAttractions[
          localProvince.id as keyof typeof mockProvinceAttractions
        ] || [];

      allPlaces.value = localAttractions.map((attraction: any, index: number) =>
        mapAttractionToPlace(
          normalizeAttraction(attraction) as AttractionApi,
          localProvince,
          index,
        ),
      );
      updateFilterCounts(allPlaces.value);

      weather.value = mockWeather as WeatherApi;
      weatherAlerts.value = [];
    }

    let provinces: ProvinceApi[] = [];
    let usesMockData = false;

    try {
      const provincesResponse = await fetch(`${API_BASE}/provinces`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!provincesResponse.ok) {
        throw new Error("Failed to load provinces.");
      }

      const provincesData = await provincesResponse.json();
      const rawProvinces = Array.isArray(provincesData)
        ? provincesData
        : (provincesData?.provinces ?? provincesData?.data ?? []);

      provinces = rawProvinces
        .map(normalizeProvince)
        .filter(Boolean) as ProvinceApi[];
    } catch (error) {
      console.warn("Using mock province data (API unavailable)");
      provinces = mockProvinces as unknown as ProvinceApi[];
      usesMockData = true;
    }

    const matchedProvince = provinces.find(
      (province) => toSlug(province.nameEn) === slug.value,
    );

    const fallbackProvince =
      matchedProvince ||
      normalizeProvince(
        mockProvinces.find(
          (province) => toSlug(province.nameEn) === slug.value,
        ),
      );

    if (!fallbackProvince) {
      throw new Error("Province not found.");
    }

    backendProvinceId.value = fallbackProvince.id;
    backendProvince.value = fallbackProvince;

    let attractions: AttractionApi[] = [];
    try {
      const attractionsResponse = await fetch(
        `${API_BASE}/attractions/province/${fallbackProvince.id}`,
        { signal: AbortSignal.timeout(5000) },
      );

      if (attractionsResponse.ok) {
        const attractionsData = await attractionsResponse.json();
        const rawAttractions =
          attractionsData?.attractions ??
          attractionsData?.data ??
          attractionsData;

        attractions = Array.isArray(rawAttractions)
          ? (rawAttractions
              .map(normalizeAttraction)
              .filter(Boolean) as AttractionApi[])
          : [];
      }
    } catch (error) {
      console.warn("Using mock attractions data (API unavailable)");
    }

    if (attractions.length === 0) {
      const mockData =
        mockProvinceAttractions[
          fallbackProvince.id as keyof typeof mockProvinceAttractions
        ];
      attractions = (mockData || [])
        .map((item: any) => normalizeAttraction(item))
        .filter(Boolean) as AttractionApi[];
      usesMockData = true;
    }

    if (attractions.length > 0) {
      allPlaces.value = attractions.map((attraction, index) =>
        mapAttractionToPlace(attraction, fallbackProvince, index),
      );
      updateFilterCounts(allPlaces.value);
    } else {
      allPlaces.value = [];
      updateFilterCounts([]);
    }

    try {
      const weatherResponse = await fetch(
        `${API_BASE}/weather/${fallbackProvince.id}`,
        { signal: AbortSignal.timeout(5000) },
      );

      if (weatherResponse.ok) {
        const weatherData = await weatherResponse.json();
        weather.value = weatherData.weather || null;
        weatherAlerts.value = weatherData.alerts || [];
      } else {
        weather.value = mockWeather as WeatherApi;
      }
    } catch (error) {
      console.warn("Using mock weather data (API unavailable)");
      weather.value = mockWeather as WeatherApi;
      weatherAlerts.value = [];
    }

    if (usesMockData) {
      errorMessage.value = "Note: Using sample data (backend unavailable)";
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
    return list.sort((a, b) => b.rating * b.reviews - a.rating * a.reviews);
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

function openPlaceDetail(place: Place) {
  router.push(`/province/${slug.value}/${toSlug(place.name)}`);
}
</script>

<template>
  <main class="province-detail-page">
    <ProvinceTopSearch
      v-if="shouldShowTopSearch"
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
          <span>â€º</span>
          <RouterLink to="/discover" class="breadcrumb-link">
            DISCOVER
          </RouterLink>
          <span>â€º</span>
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
                  {{ totalResults }} results Â· {{ selectedTravelType }} trip Â·
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
                  â–¦
                </button>

                <button
                  class="view-btn"
                  :class="{ active: viewMode === 'list' }"
                  @click="viewMode = 'list'"
                >
                  â˜°
                </button>

                <select v-model="sortOption" class="sort-select">
                  <option value="recommended">Recommended</option>
                  <option value="top-rated">Top Rated</option>
                  <option value="most-popular">Most Popular</option>
                </select>
              </div>
            </div>

            <FeaturedPlaceCard
              v-if="featuredPlace"
              :place="featuredPlace"
              @select="openPlaceDetail"
            />

            <div
              class="cards-grid"
              :class="{ 'cards-list': viewMode === 'list' }"
            >
              <PlaceCard
                v-for="place in paginatedPlaces"
                :key="place.id"
                :place="place"
                @select="openPlaceDetail"
              />
            </div>

            <PlacePagination
              :current-page="currentPage"
              :total-pages="totalPages"
              @go-to-page="goToPage"
              @prev-page="prevPage"
              @next-page="nextPage"
            />
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
