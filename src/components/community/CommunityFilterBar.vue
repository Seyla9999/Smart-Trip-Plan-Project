<template>
  <div class="filter-bar">
    <div class="filter-bar__categories">
      <button
        v-for="cat in categories"
        :key="cat"
        class="cat-btn"
        :class="{ active: modelCategory === cat }"
        @click="$emit('update:modelCategory', cat)"
      >
        <span class="cat-dot" :class="'dot-' + catKey(cat)" />
        {{ cat }}
      </button>
    </div>

    <div class="filter-bar__right">
      <div class="sort-wrap">
        <svg class="sort-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="15" y2="18"/></svg>
        <select
          :value="modelSort"
          @change="handleSortChange"
          class="sort-select"
        >
          <option value="latest">Latest</option>
          <option value="popular">Most Liked</option>
          <option value="discussed">Most Discussed</option>
          <option value="top-rated">Top Rated</option>
        </select>
        <svg class="sort-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { communityCategories } from '@/data/community'
import type { CommunityCategory, CommunitySortOption } from '@/data/community'

defineProps<{
  modelCategory: CommunityCategory
  modelSort: CommunitySortOption
}>()

const emit = defineEmits<{
  (e: 'update:modelCategory', v: CommunityCategory): void
  (e: 'update:modelSort', v: CommunitySortOption): void
}>()

function handleSortChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value as CommunitySortOption
  emit('update:modelSort', value)
}

const categories = communityCategories

const CAT_MAP: Record<string, string> = {
  All: 'all', Natural: 'natural', Food: 'food', Sea: 'sea',
  Cultural: 'cultural', Waterfall: 'waterfall', Mountain: 'mountain', Forest: 'forest'
}
function catKey(c: string) { return CAT_MAP[c] ?? 'all' }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  background: #ffffff;
  border: 1px solid #E8E2D6;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(26,26,46,0.07);
  flex-wrap: wrap;
}

.filter-bar__categories {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cat-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1.5px solid #E8E2D6;
  border-radius: 999px;
  background: transparent;
  color: #5A5A72;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
}
.cat-btn:hover {
  border-color: #2A9D8F;
  color: #2A9D8F;
  background: #E6F5F4;
}
.cat-btn.active {
  border-color: #2A9D8F;
  background: #2A9D8F;
  color: #fff;
}
.cat-btn.active .cat-dot {
  background: rgba(255,255,255,0.7);
}

/* Category color dots */
.cat-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-all       { background: #9896A8; }
.dot-natural   { background: #2A9D8F; }
.dot-food      { background: #C8922A; }
.dot-sea       { background: #1D6FA4; }
.dot-cultural  { background: #7B5EA7; }
.dot-waterfall { background: #4361ee; }
.dot-mountain  { background: #5C4B8A; }
.dot-forest    { background: #2D6A4F; }

/* Sort */
.filter-bar__right {
  flex-shrink: 0;
}

.sort-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #F8F6F1;
  border: 1px solid #E8E2D6;
  border-radius: 999px;
  padding: 0 14px 0 10px;
  height: 36px;
  transition: border-color 0.15s;
}
.sort-wrap:focus-within {
  border-color: #2A9D8F;
  box-shadow: 0 0 0 3px #E6F5F4;
}

.sort-icon { color: #9896A8; flex-shrink: 0; }

.sort-select {
  border: none;
  background: transparent;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #1A1A2E;
  cursor: pointer;
  appearance: none;
  padding-right: 4px;
}

.sort-chevron { color: #9896A8; flex-shrink: 0; pointer-events: none; }
</style>