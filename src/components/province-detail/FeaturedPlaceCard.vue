<script setup lang="ts">
const props = defineProps<{
  place: {
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
}>();

const emit = defineEmits<{
  (e: "select", place: typeof props.place): void;
}>();

function handleSelect() {
  emit("select", props.place);
}

function shortDescription(text: string, max = 180) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}
</script>

<template>
  <article class="featured-card">
    <div class="featured-image-wrap" @click="handleSelect">
      <img :src="place.image" :alt="place.name" class="featured-image" />
      <div class="badge-stack">
        <span
          v-for="tag in place.tags.slice(0, 2)"
          :key="tag"
          class="badge"
          :class="{ gold: tag.toLowerCase().includes('hidden') }"
        >
          {{ tag.toUpperCase() }}
        </span>
      </div>
    </div>

    <div class="featured-content">
      <div class="featured-meta">
        <span class="rating"
          >★ {{ place.rating }} · {{ place.reviews }} REVIEWS</span
        >
      </div>

      <h2 class="featured-title" @click="handleSelect">
        {{ place.name }}
      </h2>

      <p class="featured-description">
        “{{ shortDescription(place.description, 180) }}”
      </p>

      <div class="tag-row">
        <span v-for="tag in place.tags" :key="tag" class="tag-pill">
          {{ tag }}
        </span>
      </div>

      <button class="trip-btn" type="button">+ Add to my trip</button>
    </div>
  </article>
</template>

<style scoped>
.featured-card {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
  margin-bottom: 28px;
}

.featured-image-wrap {
  position: relative;
  min-height: 420px;
  cursor: pointer;
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-stack {
  position: absolute;
  top: 18px;
  left: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 10px 16px;
  border-radius: 999px;
  background: #1e8a5a;
  color: white;
  font-size: 13px;
  font-weight: 700;
}

.badge.gold {
  background: #d39a1f;
}

.featured-content {
  padding: 34px 34px 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.featured-meta {
  margin-bottom: 16px;
}

.rating {
  color: #7f87a0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.featured-title {
  margin: 0 0 18px;
  color: #15543f;
  font-size: 34px;
  line-height: 1.2;
  font-family: Georgia, "Times New Roman", serif;
  cursor: pointer;
}

.featured-description {
  margin: 0 0 24px;
  color: #6f7487;
  font-size: 17px;
  line-height: 1.75;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 26px;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 999px;
  background: #eef4ef;
  color: #5d7966;
  font-size: 14px;
  font-weight: 600;
}

.trip-btn {
  align-self: flex-start;
  min-width: 220px;
  border: none;
  border-radius: 999px;
  padding: 18px 26px;
  background: #15543f;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .featured-card {
    grid-template-columns: 1fr;
  }

  .featured-image-wrap {
    min-height: 320px;
  }
}
</style>
