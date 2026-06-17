<template>
  <div class="sidebar-card">
    <div class="sidebar-card__header">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <h4 class="sidebar-card__title">Active Writers</h4>
    </div>

    <div v-if="loading" class="writers-loading">
      <div class="skeleton-row" v-for="n in 3" :key="n">
        <div class="sk sk-av" />
        <div class="sk-lines">
          <div class="sk sk-name" />
          <div class="sk sk-sub" />
        </div>
      </div>
    </div>

    <ul v-else class="writers-list">
      <li v-for="(traveler, idx) in travelers" :key="traveler.id" class="writer-row">
        <span class="writer-rank">{{ idx + 1 }}</span>
        <div class="writer-av">
          <img v-if="traveler.avatar" :src="traveler.avatar" :alt="traveler.name" class="writer-av-img" />
          <span v-else class="writer-av-fallback" :style="{ background: avatarColor(traveler.name) }">
            {{ initials(traveler.name) }}
          </span>
        </div>
        <div class="writer-info">
          <span class="writer-name">{{ traveler.name }}</span>
          <span class="writer-meta">{{ traveler.stories }} {{ traveler.stories === 1 ? 'story' : 'stories' }}</span>
        </div>
        <div class="writer-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#C8922A" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TopTraveler } from '@/data/community'

defineProps<{
  travelers: TopTraveler[]
}>()

const loading = ref(false)

const COLORS = ['#1D3557', '#2A9D8F', '#C8922A', '#5C4B8A', '#2D6A4F', '#AE2012', '#6B4C3B']

function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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

.writers-list {
  list-style: none;
  margin: 0;
  padding: 10px 0;
}

.writer-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 18px;
  transition: background 0.15s;
  cursor: default;
}
.writer-row:hover {
  background: #F8F6F1;
}

.writer-rank {
  width: 18px;
  font-size: 12px;
  font-weight: 700;
  color: #9896A8;
  text-align: center;
  flex-shrink: 0;
}

.writer-av {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #E8E2D6;
}
.writer-av-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.writer-av-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.writer-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.writer-name {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A2E;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.writer-meta {
  font-size: 11px;
  color: #9896A8;
}

.writer-badge {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

/* Skeleton */
.writers-loading { padding: 12px 18px; display: flex; flex-direction: column; gap: 14px; }
.skeleton-row { display: flex; align-items: center; gap: 10px; }
.sk {
  background: linear-gradient(90deg, #f0ede8 25%, #e8e2d6 50%, #f0ede8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 6px;
}
@keyframes shimmer { to { background-position: -200% 0; } }
.sk-av { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk-name { height: 12px; width: 65%; }
.sk-sub  { height: 10px; width: 40%; }
</style>