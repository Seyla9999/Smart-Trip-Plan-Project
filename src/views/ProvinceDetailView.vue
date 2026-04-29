<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";

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
  id: number;
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

const provincePlaces: Record<string, Place[]> = {
  "koh-kong": [
    {
      id: 1,
      name: "Tatai Waterfall",
      province: "Koh Kong",
      category: "Waterfall",
      discovery: "Hidden gems",
      rating: 4.9,
      reviews: 743,
      description:
        "A two-tiered semi-natural waterfall in the heart of the jungle. Perfect for travelers seeking peace and nature.",
      image:
        "https://www.asiakingtravel.com/cuploads/files/Tatai-waterfall-2.jpg",
      tags: ["Nature", "Photography", "Adventure"],
      featured: true,
    },
    {
      id: 2,
      name: "Koh Kong Beach",
      province: "Koh Kong",
      category: "Beach",
      discovery: "Most popular",
      rating: 4.6,
      reviews: 352,
      description:
        "A relaxing beach with soft sand and calm sea views, great for sunset walks.",
      image:
        "https://merrytravelasia.com/wp-content/uploads/2023/06/Koh-Rong.jpg",
      tags: ["Beach", "Relax", "Sunset"],
    },
    {
      id: 3,
      name: "Mangrove Forest Kayaking",
      province: "Koh Kong",
      category: "Nature",
      discovery: "Hidden gems",
      rating: 4.8,
      reviews: 286,
      description:
        "Paddle through beautiful mangrove forests and enjoy peaceful eco-adventure moments.",
      image:
        "https://kura2bus.com/blog/wp-content/uploads/2023/10/DSC_0887.jpg",
      tags: ["Nature", "Adventure", "Kayaking"],
    },
    {
      id: 4,
      name: "Peam Krasaop Wildlife Sanctuary",
      province: "Koh Kong",
      category: "Nature",
      discovery: "Hidden gems",
      rating: 4.7,
      reviews: 401,
      description:
        "A protected natural area with boardwalks, birdlife, and lush coastal scenery.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/1/1e/%E1%9E%88%E1%9E%9A%E1%9E%96%E1%9E%B8%E1%9E%9B%E1%9E%BE%E1%9E%94%E1%9F%89%E1%9E%98%E1%9E%98%E1%9E%BE%E1%9E%9B%E1%9E%91%E1%9F%85%E1%9E%96%E1%9F%92%E1%9E%9A%E1%9F%83%E1%9E%80%E1%9F%84%E1%9E%84%E1%9E%80%E1%9E%B6%E1%9E%84_-_panoramio.jpg",
      tags: ["Nature", "Wildlife", "Photography"],
    },
    {
      id: 5,
      name: "Dong Tong Market",
      province: "Koh Kong",
      category: "Food",
      discovery: "Most popular",
      rating: 4.4,
      reviews: 198,
      description:
        "A local market where you can try fresh seafood and discover daily Khmer life.",
      image:
        "https://travelsetu.com/apps/uploads/new_destinations_photos/destination/2024/06/28/0dc327612f9e0a519a343ecc3329b2b3_1000x1000.jpg",
      tags: ["Food", "Market", "Local Life"],
    },
    {
      id: 6,
      name: "Chi Phat Eco Village",
      province: "Koh Kong",
      category: "Nature",
      discovery: "Hidden gems",
      rating: 4.9,
      reviews: 265,
      description:
        "A community-based ecotourism destination surrounded by forests, rivers, and wildlife.",
      image:
        "https://thealtruistictraveller.com/s/51524087023470235/blog/SAM_4897.jpg",
      tags: ["Nature", "Eco Tour", "Adventure"],
    },
  ],

  "siem-reap": [
    {
      id: 101,
      name: "Angkor Wat Sunrise",
      province: "Siem Reap",
      category: "Cultural",
      discovery: "Most popular",
      rating: 5.0,
      reviews: 1250,
      description:
        "Experience the breathtaking sunrise over Angkor Wat, Cambodia's most iconic temple.",
      image:
        "https://toursbyjeeps.com/wp-content/uploads/2021/07/Untitled-1-2.jpg",
      tags: ["Temple", "Sunrise", "Photography"],
      featured: true,
    },
    {
      id: 102,
      name: "Bayon Temple",
      province: "Siem Reap",
      category: "Cultural",
      discovery: "Most popular",
      rating: 4.9,
      reviews: 980,
      description:
        "Famous for its giant smiling stone faces and rich Khmer architecture.",
      image:
        "https://cambodiatravel.com/images/2020/12/intro-Bayon-Temple-Travel-Guide.jpg",
      tags: ["Temple", "History", "Architecture"],
    },
    {
      id: 103,
      name: "Ta Prohm",
      province: "Siem Reap",
      category: "Cultural",
      discovery: "Most popular",
      rating: 4.8,
      reviews: 875,
      description:
        "A temple beautifully wrapped by jungle roots and ancient stone walls.",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRVuujeN6cK9EnoskxVGvkvPaKFnQo6HnjAQ&s",
      tags: ["Temple", "Nature", "Photography"],
    },
    {
      id: 104,
      name: "Phare Cambodian Circus",
      province: "Siem Reap",
      category: "Cultural",
      discovery: "Hidden gems",
      rating: 4.9,
      reviews: 620,
      description:
        "A lively performance mixing theatre, music, and Cambodian storytelling.",
      image:
        "https://www.siemreapshuttle.com/wp-content/uploads/2022/08/Phare-Circus-SiemreapShuttle.jpg",
      tags: ["Show", "Culture", "Family"],
    },
    {
      id: 105,
      name: "Pub Street Food Walk",
      province: "Siem Reap",
      category: "Food",
      discovery: "Most popular",
      rating: 4.5,
      reviews: 712,
      description:
        "Taste local snacks, desserts, and street food in the center of the city.",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmnSH7ICljEFXf4-k-vYqmnMW3LiyYanjy5g&s",
      tags: ["Food", "Nightlife", "Local Life"],
    },
    {
      id: 106,
      name: "Kulen Mountain Day Trip",
      province: "Siem Reap",
      category: "Nature",
      discovery: "Hidden gems",
      rating: 4.7,
      reviews: 430,
      description:
        "Enjoy waterfalls, sacred sites, and mountain views outside the city.",
      image:
        "https://www.siemreap.net/wp-content/uploads/2017/12/phnom-kulen-waterfall.jpg",
      tags: ["Nature", "Waterfall", "Adventure"],
    },
  ],

  "phnom-penh": [
    {
      id: 201,
      name: "Royal Palace",
      province: "Phnom Penh",
      category: "Cultural",
      discovery: "Most popular",
      rating: 4.8,
      reviews: 940,
      description:
        "Visit the majestic Royal Palace, one of Phnom Penh's most famous landmarks.",
      image:
        "https://www.asiakingtravel.com/cuploads/files/royalpalace-att-b.jpg",
      tags: ["Palace", "History", "Photography"],
      featured: true,
    },
    {
      id: 202,
      name: "National Museum of Cambodia",
      province: "Phnom Penh",
      category: "Cultural",
      discovery: "Most popular",
      rating: 4.7,
      reviews: 683,
      description:
        "Explore Khmer art, sculpture, and ancient history in Cambodia's leading museum.",
      image:
        "https://image-tc.galaxy.tf/wijpeg-87c83dri3kglj836kubeiybcf/the-national-museum-3.jpg",
      tags: ["Museum", "History", "Culture"],
    },
    {
      id: 203,
      name: "Wat Phnom",
      province: "Phnom Penh",
      category: "Cultural",
      discovery: "Most popular",
      rating: 4.6,
      reviews: 510,
      description:
        "A peaceful hilltop temple and one of the most symbolic places in Phnom Penh.",
      image:
        "https://files.intocambodia.org/wp-content/uploads/2024/08/10143531/Wat-Phnom.jpg",
      tags: ["Temple", "History", "Photography"],
    },
    {
      id: 204,
      name: "Central Market",
      province: "Phnom Penh",
      category: "Food",
      discovery: "Most popular",
      rating: 4.5,
      reviews: 860,
      description:
        "A popular local market known for food, souvenirs, clothes, and Khmer daily life.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/2/26/Aerial_view_of_Phnom_Penh%27s_Central_Market_%28September_2021%29.jpg",
      tags: ["Food", "Market", "Shopping"],
    },
    {
      id: 205,
      name: "Sisowath Riverside",
      province: "Phnom Penh",
      category: "Nature",
      discovery: "Most popular",
      rating: 4.6,
      reviews: 445,
      description:
        "Walk along the riverfront with wide views, cafés, and a lively city atmosphere.",
      image:
        "https://thumbs.dreamstime.com/b/busy-boulevard-sisowath-quay-along-phnom-penh-s-popular-riverside-area-cambodia-december-rd-alongside-tonle-sap-river-272947819.jpg",
      tags: ["River", "Walk", "Sunset"],
    },
    {
      id: 206,
      name: "Tuol Sleng Genocide Museum",
      province: "Phnom Penh",
      category: "Cultural",
      discovery: "Hidden gems",
      rating: 4.7,
      reviews: 799,
      description:
        "An important historical site for learning about Cambodia's recent past.",
      image:
        "https://www.unesco.org/sites/default/files/styles/paragraph_medium_desktop/public/thumbnail_image.jpg.webp?itok=gSv1xJWw",
      tags: ["Museum", "History", "Education"],
    },
    {
      id: 207,
      name: "Independence Monument",
      province: "Phnom Penh",
      category: "Cultural",
      discovery: "Hidden gems",
      rating: 4.4,
      reviews: 320,
      description:
        "A beautiful city landmark best seen in the evening with lights and open space around it.",
      image:
        "https://www.novotelphnompenhbkk1.com/wp-content/uploads/sites/53/2023/08/Indepedence-monument-2200x1200.jpg",
      tags: ["Landmark", "Photography", "City"],
    },
    {
      id: 208,
      name: "Russian Market",
      province: "Phnom Penh",
      category: "Food",
      discovery: "Most popular",
      rating: 4.5,
      reviews: 570,
      description:
        "A lively market famous for local food, clothes, souvenirs, and street shopping.",
      image:
        "https://d122axpxm39woi.cloudfront.net/images/destinations/origin/64be1fb570dee.jpg",
      tags: ["Market", "Food", "Shopping"],
    },
    {
      id: 209,
      name: "Bassac Lane",
      province: "Phnom Penh",
      category: "Food",
      discovery: "Hidden gems",
      rating: 4.6,
      reviews: 265,
      description:
        "A stylish small street filled with cafés, bars, and evening hangout spots.",
      image:
        "https://ctp.r24k.app/wp-content/uploads/2025/03/vvTlcTqutrNFTxTyLETB.jpg",
      tags: ["Food", "Nightlife", "Friends"],
    },
  ],
};

const fallbackPlaces = provincePlaces["koh-kong"];

const places = computed(() => {
  return provincePlaces[slug.value] || fallbackPlaces;
});

const categoryFilters = ref([
  { name: "Nature", count: 8, checked: true },
  { name: "Waterfall", count: 4, checked: true },
  { name: "Beach", count: 3, checked: false },
  { name: "Cultural", count: 6, checked: true },
  { name: "Food", count: 4, checked: false },
]);

const discoveryFilters = ref([
  { name: "Hidden gems", count: 6, checked: true },
  { name: "Most popular", count: 5, checked: false },
]);

const featuredPlace = computed(() => {
  return places.value.find((place) => place.featured) || places.value[0];
});

const normalPlaces = computed(() => {
  return places.value.filter((place) => !place.featured);
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
      :province-name="provinceName"
      :selected-travel-type="selectedTravelType"
      :from-date="fromDate"
      :to-date="toDate"
    />

    <ProvinceInfoBar
      :province-name="provinceName"
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
          <strong>{{ provinceName.toUpperCase() }}</strong>
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
                <h1>{{ provinceName }} attractions</h1>
                <p class="results-text">
                  {{ places.length }} results · {{ selectedTravelType }} trip ·
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
}

@media (max-width: 640px) {
  .places-content h1 {
    font-size: 36px;
  }
}
</style>
