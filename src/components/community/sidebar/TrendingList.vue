<template>
  <section class="sidebar-card">
    <div class="sidebar-card__head">
      <h3>Trending places</h3>
      <p>Top spots travelers are talking about right now.</p>
    </div>

    <div class="trend-list">
      <article v-for="place in places" :key="place.id" class="trend-item">
        <div class="trend-item__rank">{{ place.id }}</div>
        <div class="trend-item__body">
          <div class="trend-item__row">
            <strong>{{ place.name }}</strong>
            <span>{{ place.mentions }} mentions</span>
          </div>
          <div class="trend-item__meta">{{ place.province }} · {{ place.category }}</div>
          <p>{{ place.summary }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TrendingPlace } from '@/data/community'

defineProps<{
  places: TrendingPlace[]
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

.trend-list {
  display: grid;
  gap: 14px;
}

.trend-item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 12px;
}

.trend-item__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: #1a2340;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.trend-item__row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 3px;
}

.trend-item__row strong {
  color: #111827;
  font-size: 14px;
}

.trend-item__row span,
.trend-item__meta {
  color: #6b7280;
  font-size: 12px;
}

.trend-item p {
  margin: 8px 0 0;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.6;
}
</style>
