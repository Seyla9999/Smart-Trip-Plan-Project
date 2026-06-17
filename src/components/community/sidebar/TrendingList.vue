<template>
  <div class="sidebar-card">
    <div class="sidebar-card__header">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
      <h4 class="sidebar-card__title">Trending Places</h4>
    </div>

    <ul class="trend-list">
      <li v-for="(place, idx) in places" :key="place.id" class="trend-item">
        <span class="trend-num">{{ String(idx + 1).padStart(2, '0') }}</span>
        <div class="trend-info">
          <span class="trend-name">{{ place.name }}</span>
          <span class="trend-cat">{{ place.category }}</span>
        </div>
        <div class="trend-bar-wrap">
          <div
            class="trend-bar"
            :style="{ width: barWidth(place.visits, maxVisits) + '%' }"
          />
        </div>
        <span class="trend-count">{{ formatCount(place.visits) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TrendingPlace } from '@/data/community'

const props = defineProps<{
  places: TrendingPlace[]
}>()

const maxVisits = computed(() => Math.max(...props.places.map(p => p.visits), 1))

function barWidth(visits: number, max: number) {
  return Math.round((visits / max) * 100)
}
function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toString()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Cinzel:wght@500;600&display=swap');

.sidebar-card {
  background: #fff;
  border: 1px solid #E8E2D6;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(26,26,46,0.07);
  overflow: hidden;
}

.sidebar-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 18px 12px;
  border-bottom: 1px solid #E8E2D6;
  color: #2A9D8F;
}

.sidebar-card__title {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 600;
  color: #1A1A2E;
  margin: 0;
  letter-spacing: 0.03em;
}

.trend-list {
  list-style: none;
  margin: 0;
  padding: 12px 0 6px;
}

.trend-item {
  display: grid;
  grid-template-columns: 24px 1fr auto auto;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  transition: background 0.15s;
}
.trend-item:hover { background: #F8F6F1; }

.trend-num {
  font-size: 11px;
  font-weight: 700;
  color: #9896A8;
  font-variant-numeric: tabular-nums;
}

.trend-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.trend-name {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A2E;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.trend-cat {
  font-size: 11px;
  color: #9896A8;
}

.trend-bar-wrap {
  width: 40px;
  height: 4px;
  background: #F0EDE8;
  border-radius: 99px;
  overflow: hidden;
}
.trend-bar {
  height: 100%;
  background: linear-gradient(90deg, #2A9D8F, #C8922A);
  border-radius: 99px;
  transition: width 0.6s ease;
  min-width: 8%;
}

.trend-count {
  font-size: 11px;
  font-weight: 600;
  color: #5A5A72;
  font-variant-numeric: tabular-nums;
  min-width: 28px;
  text-align: right;
}
</style>