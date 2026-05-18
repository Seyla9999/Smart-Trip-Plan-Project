<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

type Province = {
  id: number;
  nameEn: string;
  nameKh?: string;
  description?: string | null;
  mainImageUrl?: string | null;
};

type Attraction = {
  id: string;
  provinceId: number;
  nameEn: string;
  nameKh?: string | null;
  category?: string | null;
  description?: string | null;
  location?: string | null;
  isHiddenGem?: boolean;
  averageRating?: number | string;
};

const API_BASE = "http://localhost:3000";

const route = useRoute();
const router = useRouter();

const provinceSlug = computed(() => String(route.query.province || ""));
const provinceName = computed(() =>
  provinceSlug.value
    ? provinceSlug.value
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Map View",
);

const isLoading = ref(false);
const errorMessage = ref("");
const selectedProvince = ref<Province | null>(null);
const attractions = ref<Attraction[]>([]);

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function loadMapData() {
  isLoading.value = true;
  errorMessage.value = "";
  selectedProvince.value = null;
  attractions.value = [];

  try {
    const provincesResponse = await fetch(`${API_BASE}/provinces`);
    if (!provincesResponse.ok) {
      throw new Error("Failed to load provinces.");
    }

    const provincesData = await provincesResponse.json();
    const provinces: Province[] = Array.isArray(provincesData)
      ? provincesData
      : provincesData?.provinces || provincesData?.data || [];

    const matchedProvince = provinces.find(
      (province) => toSlug(province.nameEn) === provinceSlug.value,
    );

    if (!matchedProvince) {
      throw new Error("Province not found for map view.");
    }

    selectedProvince.value = matchedProvince;

    const attractionsResponse = await fetch(
      `${API_BASE}/attractions/province/${matchedProvince.id}`,
    );

    if (!attractionsResponse.ok) {
      throw new Error("Failed to load attractions for map.");
    }

    const attractionsData = await attractionsResponse.json();
    attractions.value = Array.isArray(attractionsData)
      ? attractionsData
      : attractionsData?.data || attractionsData?.attractions || [];
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Failed to load map data.";
  } finally {
    isLoading.value = false;
  }
}

function backToProvince() {
  if (provinceSlug.value) {
    router.push(`/province/${provinceSlug.value}`);
    return;
  }

  router.push("/discover");
}

onMounted(() => {
  if (provinceSlug.value) {
    loadMapData();
  } else {
    errorMessage.value = "No province selected for map view.";
  }
});
</script>

<template>
  <main class="map-page">
    <div class="page-container">
      <div class="map-header">
        <div>
          <p class="eyebrow">MAP VIEW</p>
          <h1>{{ selectedProvince?.nameEn || provinceName }}</h1>
          <p class="subtext">
            {{ attractions.length }} places shown for this province
          </p>
        </div>

        <button class="back-btn" @click="backToProvince">Back</button>
      </div>

      <div v-if="isLoading" class="status-box">Loading map data...</div>
      <div v-else-if="errorMessage" class="status-box error-box">
        {{ errorMessage }}
      </div>
      <div v-else class="map-layout">
        <section class="map-placeholder">
          <div class="map-box">
            <p class="map-title">Map area</p>
            <p class="map-note">
              Replace this placeholder with your real map component later.
            </p>
          </div>
        </section>

        <aside class="place-list">
          <h2>Places</h2>

          <div v-if="!attractions.length" class="status-box">
            No places found for this province.
          </div>

          <div v-for="place in attractions" :key="place.id" class="place-item">
            <h3>{{ place.nameEn }}</h3>
            <p>{{ place.category || "Uncategorized" }}</p>
            <span>⭐ {{ place.averageRating || 0 }}</span>
          </div>
        </aside>
      </div>
    </div>
  </main>
</template>

<style scoped>
.map-page {
  min-height: 100vh;
  background: #f7f5f0;
  padding: 40px 0 60px;
}

.page-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #566286;
  font-weight: 700;
  letter-spacing: 0.08em;
}

h1 {
  margin: 0 0 8px;
  color: #15543f;
  font-size: 48px;
  line-height: 1.1;
  font-family: Georgia, "Times New Roman", serif;
}

.subtext {
  margin: 0;
  color: #6e7485;
}

.back-btn {
  border: 1px solid #d9dfeb;
  background: white;
  color: #15543f;
  border-radius: 10px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
}

.map-layout {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 24px;
}

.map-box {
  min-height: 520px;
  border-radius: 20px;
  border: 1px solid #d9dfeb;
  background: linear-gradient(180deg, #dfe8f2 0%, #eef3f8 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #566286;
  text-align: center;
  padding: 24px;
}

.map-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
}

.map-note {
  max-width: 320px;
  line-height: 1.6;
}

.place-list {
  background: white;
  border: 1px solid #e4e7ee;
  border-radius: 20px;
  padding: 20px;
}

.place-list h2 {
  margin: 0 0 16px;
  color: #15543f;
}

.place-item {
  padding: 14px 0;
  border-bottom: 1px solid #eef1f5;
}

.place-item:last-child {
  border-bottom: 0;
}

.place-item h3 {
  margin: 0 0 6px;
  color: #1f2430;
}

.place-item p {
  margin: 0 0 6px;
  color: #6e7485;
}

.place-item span {
  color: #15543f;
  font-weight: 700;
}

.status-box {
  padding: 18px 20px;
  background: #ffffff;
  border: 1px solid #e4e7ee;
  border-radius: 16px;
  color: #5f6678;
}

.error-box {
  color: #b42318;
  border-color: #f0c7c3;
  background: #fff7f6;
}

@media (max-width: 1024px) {
  .map-layout {
    grid-template-columns: 1fr;
  }

  .map-header {
    flex-direction: column;
  }

  h1 {
    font-size: 36px;
  }
}
</style>
