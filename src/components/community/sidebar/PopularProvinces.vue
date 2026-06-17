<template>
  <div class="sidebar-card">
    <div class="sidebar-card__header">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <h4 class="sidebar-card__title">Popular Provinces</h4>
    </div>

    <div class="provinces-grid">
      <a
        v-for="province in provinces"
        :key="province.id"
        :href="`/provinces/${province.slug}`"
        class="province-card"
      >
        <div class="province-card__img-wrap">
          <img
            v-if="province.image"
            :src="province.image"
            :alt="province.name"
            class="province-card__img"
            loading="lazy"
            @error="onImgError"
          />
          <div v-else class="province-card__placeholder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <div class="province-card__overlay">
            <span class="province-card__name">{{ province.name }}</span>
            <span class="province-card__count">{{ province.stories }} stories</span>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PopularProvince } from '@/data/community'

defineProps<{
  provinces: PopularProvince[]
}>()

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
  const placeholder = img.parentElement?.querySelector('.province-card__placeholder') as HTMLElement
  if (placeholder) placeholder.style.display = 'flex'
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

.provinces-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 14px;
}

.province-card {
  display: block;
  border-radius: 10px;
  overflow: hidden;
  text-decoration: none;
  position: relative;
  aspect-ratio: 4/3;
  transition: transform 0.2s, box-shadow 0.2s;
}
.province-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(26,26,46,0.14);
}

.province-card__img-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background: #E8E2D6;
}

.province-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s;
}
.province-card:hover .province-card__img {
  transform: scale(1.06);
}

.province-card__placeholder {
  display: none;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #E8E2D6, #F8F6F1);
  color: #9896A8;
}

.province-card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 10px 10px;
  background: linear-gradient(to top, rgba(10,10,26,0.75) 0%, transparent 100%);
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.province-card__name {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
}
.province-card__count {
  font-size: 10px;
  color: rgba(255,255,255,0.72);
}
</style>