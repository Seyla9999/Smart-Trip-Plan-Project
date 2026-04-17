<script setup lang="ts">
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

defineProps<{
  place: Place;
}>();
</script>

<template>
  <article class="featured-card">
    <div class="featured-image-wrap">
      <img :src="place.image" :alt="place.name" class="featured-image" />
      <div class="badge-stack">
        <span class="place-badge gold">HIDDEN GEM</span>
        <span class="place-badge green">TOP RATED</span>
      </div>
    </div>

    <div class="featured-info">
      <p class="reviews">★★★★★ {{ place.reviews }} REVIEWS</p>
      <h2>{{ place.name }}</h2>
      <p class="featured-description">“{{ place.description }}”</p>

      <div class="place-tags">
        <span v-for="tag in place.tags" :key="tag" class="place-tag">
          {{ tag }}
        </span>
      </div>

      <button class="trip-btn">＋ Add to my trip</button>
    </div>
  </article>
</template>

<style scoped>
.featured-card {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  background: white;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
  margin-bottom: 34px;
}

.featured-image-wrap {
  position: relative;
  min-height: 380px;
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.badge-stack {
  position: absolute;
  top: 18px;
  left: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.place-badge {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 999px;
  color: white;
  font-size: 12px;
  font-weight: 700;
}

.place-badge.gold {
  background: #b38318;
}

.place-badge.green {
  background: #1f8a53;
}

.featured-info {
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.reviews {
  color: #80879b;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 16px;
}

.featured-info h2 {
  font-size: 42px;
  line-height: 1.15;
  color: #15543f;
  margin: 0 0 18px;
  font-family: Georgia, "Times New Roman", serif;
}

.featured-description {
  color: #737a89;
  font-size: 20px;
  line-height: 1.7;
  margin-bottom: 24px;
}

.place-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 34px;
}

.place-tag {
  background: #edf3ef;
  color: #68806f;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
}

.trip-btn {
  background: #15543f;
  color: white;
  border: none;
  border-radius: 999px;
  padding: 18px 28px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .featured-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .featured-info h2 {
    font-size: 30px;
  }

  .featured-description {
    font-size: 15px;
  }
}
</style>
