<template>
  <section class="sidebar-card">
    <div class="sidebar-card__head">
      <h3>Popular provinces</h3>
      <p>Places with the heaviest story activity this month.</p>
    </div>

    <div class="province-list">
      <article v-for="province in provinces" :key="province.id" class="province-item">
        <div class="province-item__image" :style="{ backgroundImage: `url(${province.image})` }" />
        <div class="province-item__body">
          <div class="province-item__row">
            <strong>{{ province.name }}</strong>
            <span>{{ province.storyCount }} posts</span>
          </div>
          <p>{{ province.descriptor }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PopularProvince } from '@/data/community'

defineProps<{
  provinces: PopularProvince[]
}>()
</script>

<style scoped>
.sidebar-card {
  padding: 22px;
  border: 1px solid rgba(13, 19, 33, 0.08);
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 18px 44px rgba(18, 26, 47, 0.08);
}

.sidebar-card__head {
  margin-bottom: 16px;
}

.sidebar-card__head h3 {
  margin: 0 0 4px;
  color: #111827;
  font-family: 'Cinzel', serif;
  font-size: 22px;
}

.sidebar-card__head p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.province-list {
  display: grid;
  gap: 14px;
}

.province-item {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.province-item__image {
  height: 78px;
  border-radius: 18px;
  background-size: cover;
  background-position: center;
}

.province-item__row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 4px;
}

.province-item__row strong {
  color: #111827;
  font-size: 14px;
}

.province-item__row span {
  color: #6b7280;
  font-size: 12px;
}

.province-item__body p {
  margin: 0;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.6;
}
</style>
