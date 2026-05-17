<script setup lang="ts">
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

const props = defineProps<{
  place: Place;
}>();

const emit = defineEmits<{
  (e: "select", place: Place): void;
}>();

function handleSelect() {
  emit("select", props.place);
}
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
        <span class="rating">★ {{ place.rating }}</span>
      </div>

      <p class="card-description">{{ place.description }}</p>

      <div class="card-footer">
        <span>{{ place.reviews }} REVIEWS</span>
        <button class="heart-btn">♡</button>
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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

.rating {
  color: #8f6a0f;
  font-size: 15px;
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
  color: #a0a6b5;
  font-size: 13px;
}

.heart-btn {
  border: none;
  background: transparent;
  color: #15543f;
  font-size: 24px;
  cursor: pointer;
}
</style>
