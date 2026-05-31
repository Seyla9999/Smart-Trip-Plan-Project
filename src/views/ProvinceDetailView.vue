<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import ProvinceTopSearch from "@/components/province-detail/ProvinceTopSearch.vue";
import ProvinceInfoBar from "@/components/province-detail/ProvinceInfoBar.vue";
import ProvinceFilters from "@/components/province-detail/ProvinceFilters.vue";
import ProvinceBreadcrumb from "@/components/province-detail/ProvinceBreadcrumb.vue";
import ProvinceContentHeader from "@/components/province-detail/ProvinceContentHeader.vue";
import ProvinceMapSection from "@/components/province-detail/ProvinceMapSection.vue";
import ProvinceStatusBox from "@/components/province-detail/ProvinceStatusBox.vue";
import FeaturedPlaceCard from "@/components/province-detail/FeaturedPlaceCard.vue";
import PlaceCard from "@/components/province-detail/PlaceCard.vue";
import PlacePagination from "@/components/province-detail/PlacePagination.vue";

import { useProvinceDetail, type Place } from "@/composables/useProvinceDetail";
import { useProvinceFilters } from "@/composables/useProvinceFilters";
import { useProvincePagination } from "@/composables/useProvincePagination";

type TravelType = "Solo" | "Friends" | "Family";
type ViewMode = "grid" | "list";
type SortOption = "recommended" | "top-rated" | "most-popular";

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
    return `${formatQueryDate(fromDate.value)} – ${formatQueryDate(toDate.value)}`;
  }

  if (fromDate.value) {
    return `From ${formatQueryDate(fromDate.value)}`;
  }

  return "Pick Date";
});

const selectedTravelType = ref<TravelType>("Friends");
const viewMode = ref<ViewMode>("grid");
const sortOption = ref<SortOption>("recommended");

const showMapView = computed(() => route.query.view === "map");

function openProvinceMapView() {
  router.replace({
    query: {
      ...route.query,
      view: "map",
    },
  });
}

function closeProvinceMapView() {
  const nextQuery = { ...route.query };
  delete nextQuery.view;

  router.replace({
    query: nextQuery,
  });
}

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

const {
  backendProvince,
  allPlaces,
  weather,
  weatherAlerts,
  isLoading,
  errorMessage,
  loadProvinceDetail,
} = useProvinceDetail();

const places = computed(() => allPlaces.value);

const {
  categoryFilters,
  discoveryFilters,
  activeCategories,
  activeDiscoveries,
  updateFilterCounts,
  clearAllFilters,
  toggleCategory,
  toggleDiscovery,
} = useProvinceFilters(() => places.value);

const featuredPlace = computed(() => {
  return (
    places.value.find((place) => place.featured) || places.value[0] || null
  );
});

const normalPlaces = computed(() => {
  if (!featuredPlace.value) return [];
  return places.value.filter((place) => place.id !== featuredPlace.value?.id);
});

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

const {
  currentPage,
  totalPages,
  paginatedItems,
  goToPage,
  nextPage,
  prevPage,
  resetPage,
} = useProvincePagination<Place>(() => sortedPlaces.value, 4);

const paginatedPlaces = computed(() => paginatedItems.value);

const totalResults = computed(() => {
  return featuredPlace.value
    ? filteredPlaces.value.length + 1
    : filteredPlaces.value.length;
});

watch(slug, async () => {
  await loadProvinceDetail(slug.value);
  updateFilterCounts();
  resetPage();
});

watch(
  places,
  () => {
    updateFilterCounts();
  },
  { deep: true },
);

watch([filteredPlaces, sortOption], () => {
  resetPage();
});

loadProvinceDetail(slug.value).then(() => {
  updateFilterCounts();
});

function setTravelType(value: TravelType) {
  selectedTravelType.value = value;
}

function setViewMode(value: ViewMode) {
  viewMode.value = value;
}

function setSortOption(value: SortOption) {
  sortOption.value = value;
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
      v-if="!showMapView"
      :province-name="backendProvince?.nameEn || provinceName"
      :total-places="places.length"
      @open-map="openProvinceMapView"
    />

    <section class="content-section">
      <div class="page-container">
        <ProvinceBreadcrumb
          :province-name="backendProvince?.nameEn || provinceName"
        />

        <ProvinceStatusBox
          v-if="isLoading"
          message="Loading province detail..."
        />

        <ProvinceStatusBox
          v-else-if="errorMessage"
          :message="errorMessage"
          type="error"
        />

        <div
          v-else
          class="content-layout"
          :class="{ 'map-mode-layout': showMapView }"
        >
          <ProvinceFilters
            v-if="!showMapView"
            :selected-travel-type="selectedTravelType"
            :category-filters="categoryFilters"
            :discovery-filters="discoveryFilters"
            @set-travel-type="setTravelType"
            @toggle-category="toggleCategory"
            @toggle-discovery="toggleDiscovery"
            @clear-all="clearAllFilters"
          />

          <section class="places-content">
            <template v-if="!showMapView">
              <ProvinceContentHeader
                :province-name="backendProvince?.nameEn || provinceName"
                :total-results="totalResults"
                :selected-travel-type="selectedTravelType"
                :display-date-range="displayDateRange"
                :category-filters="categoryFilters"
                :discovery-filters="discoveryFilters"
                :view-mode="viewMode"
                :sort-option="sortOption"
                @set-view-mode="setViewMode"
                @set-sort-option="setSortOption"
              />

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
            </template>

            <template v-else>
              <ProvinceMapSection
                :province-name="backendProvince?.nameEn || provinceName"
                :province-slug="slug"
                :places="places"
                @close="closeProvinceMapView"
              />
            </template>
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

.content-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 32px;
}

.map-mode-layout {
  grid-template-columns: 1fr;
}

.places-content {
  min-width: 0;
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
}
</style>
