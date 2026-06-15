<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";

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

type BookmarkItem = {
  id: string;
  entity_type: string;
  entity_id: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const props = defineProps<{
  place: Place;
}>();

const emit = defineEmits<{
  (e: "select", place: Place): void;
}>();

const isFavorite = ref(false);
const bookmarkId = ref<string | null>(null);
const bookmarkLoading = ref(false);

function getToken() {
  return localStorage.getItem("auth_token") || "";
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleSelect() {
  emit("select", props.place);
}

function shortDescription(text: string, max = 120) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function roundToHalf(value: number) {
  return Math.round(value * 2) / 2;
}

const starDisplay = computed(() => {
  const rounded = roundToHalf(props.place.rating);
  const full = Math.floor(rounded);
  const half = rounded % 1 !== 0 ? 1 : 0;
  const empty = 5 - full - half;

  return {
    full: "★".repeat(full),
    half: half ? "⯨" : "",
    empty: "☆".repeat(empty),
  };
});

async function loadBookmarkState() {
  try {
    const token = getToken();

    if (!token) {
      isFavorite.value = false;
      bookmarkId.value = null;
      return;
    }

    const response = await axios.get(`${API_BASE_URL}/bookmarks`, {
      headers: getAuthHeaders(),
    });

    const bookmarks: BookmarkItem[] = Array.isArray(response.data)
      ? response.data
      : [];

    const found = bookmarks.find(
      (item) =>
        item.entity_type === "attraction" &&
        String(item.entity_id) === String(props.place.id),
    );

    if (found) {
      isFavorite.value = true;
      bookmarkId.value = found.id;
    } else {
      isFavorite.value = false;
      bookmarkId.value = null;
    }
  } catch (error) {
    console.error("Failed to load bookmarks:", error);
    isFavorite.value = false;
    bookmarkId.value = null;
  }
}

async function toggleFavorite(event: MouseEvent) {
  event.stopPropagation();

  const token = getToken();

  if (!token) {
    alert("Please login first to save favorites.");
    return;
  }

  if (bookmarkLoading.value) return;

  bookmarkLoading.value = true;

  try {
    if (isFavorite.value && bookmarkId.value) {
      await axios.delete(`${API_BASE_URL}/bookmarks/${bookmarkId.value}`, {
        headers: getAuthHeaders(),
      });

      isFavorite.value = false;
      bookmarkId.value = null;
    } else {
      const response = await axios.post(
        `${API_BASE_URL}/bookmarks`,
        {
          entity_type: "attraction",
          entity_id: String(props.place.id),
        },
        {
          headers: getAuthHeaders(),
        },
      );

      isFavorite.value = true;
      bookmarkId.value = response.data?.id || null;
    }
  } catch (error: any) {
    console.error("Bookmark action failed:", error);

    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update favorite.";

    alert(message);
  } finally {
    bookmarkLoading.value = false;
  }
}

onMounted(() => {
  loadBookmarkState();
});

watch(
  () => props.place.id,
  () => {
    loadBookmarkState();
  },
);
</script>

<template>
  <article
    class="place-card"
    role="button"
    tabindex="0"
    @click="handleSelect"
    @keydown.enter.prevent="handleSelect"
    @keydown.space.prevent="handleSelect"
  >
    <div class="card-image-wrap">
      <img :src="place.image" :alt="place.name" class="card-image" />
      <span class="corner-badge">{{ place.category.toUpperCase() }}</span>
    </div>

    <div class="card-body">
      <div class="card-title-row">
        <h3>{{ place.name }}</h3>
        <div class="rating-wrap">
          <span class="rating-stars">
            {{ starDisplay.full }}{{ starDisplay.half }}{{ starDisplay.empty }}
          </span>
          <span class="rating-number">{{ place.rating.toFixed(1) }}</span>
        </div>
      </div>

      <p class="card-description">
        {{ shortDescription(place.description, 120) }}
      </p>

      <div class="card-footer">
        <span class="review-text">{{ place.reviews }} REVIEWS</span>

        <button
          class="heart-btn"
          type="button"
          :disabled="bookmarkLoading"
          @click="toggleFavorite"
        >
          {{ isFavorite ? "♥" : "♡" }}
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.place-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.place-card:hover,
.place-card:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.1);
}

.card-image-wrap {
  position: relative;
  height: 240px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.corner-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(255, 255, 255, 0.95);
  color: #15543f;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 11px;
  font-weight: 700;
}

.card-body {
  padding: 22px;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 10px;
}

.card-title-row h3 {
  margin: 0;
  color: #15543f;
  font-size: 30px;
  line-height: 1.2;
  font-family: Georgia, "Times New Roman", serif;
}

.rating-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.rating-stars {
  color: #c69214;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
}

.rating-number {
  color: #c69214;
  font-size: 14px;
  font-weight: 700;
}

.card-description {
  color: #8b90a0;
  font-size: 16px;
  line-height: 1.6;
  min-height: 72px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
}

.review-text {
  color: #7d8492;
  font-size: 13px;
  font-weight: 600;
}

.heart-btn {
  border: none;
  background: transparent;
  color: #15543f;
  font-size: 24px;
  cursor: pointer;
}

.heart-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
