<template>
  <section class="filter-bar">
    <div class="filter-bar__inner">
      <div class="filter-bar__tabs" aria-label="Community categories">
        <button
          v-for="category in categories"
          :key="category"
          class="filter-bar__tab"
          :class="{ active: activeCategory === category }"
          type="button"
          @click="emit('changeCategory', category)"
        >
          {{ category }}
        </button>
      </div>

      <div class="filter-bar__controls">
        <label class="filter-bar__search">
          <span class="filter-bar__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            :value="searchQuery"
            type="search"
            placeholder="Search stories, places, or travelers"
            @input="emitSearch"
          />
        </label>

        <label class="filter-bar__sort">
          <span>Sort</span>
          <select :value="sortOption" @change="emitSort">
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  CommunityCategory,
  CommunitySortOption,
} from '@/data/community'

defineProps<{
  categories: CommunityCategory[]
  activeCategory: CommunityCategory
  searchQuery: string
  sortOption: CommunitySortOption
  sortOptions: Array<{
    label: string
    value: CommunitySortOption
  }>
}>()

const emit = defineEmits<{
  changeCategory: [category: CommunityCategory]
  'update:searchQuery': [value: string]
  'update:sortOption': [value: CommunitySortOption]
}>()

function emitSearch(event: Event) {
  emit('update:searchQuery', (event.target as HTMLInputElement).value)
}

function emitSort(event: Event) {
  emit('update:sortOption', (event.target as HTMLSelectElement).value as CommunitySortOption)
}
</script>

<style scoped>
.filter-bar {
  position: sticky;
  top: 64px;
  z-index: 40;
  padding: 0 40px 24px;
  background:
    linear-gradient(
      180deg,
      rgba(18, 26, 47, 0.98) 0%,
      rgba(18, 26, 47, 0.88) 70%,
      rgba(18, 26, 47, 0) 100%
    );
}

.filter-bar__inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 18px 50px rgba(5, 8, 15, 0.22);
}

.filter-bar__tabs {
  display: flex;
  gap: 10px;
  flex: 1 1 560px;
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-bar__tabs::-webkit-scrollbar {
  display: none;
}

.filter-bar__tab {
  flex-shrink: 0;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.68);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.filter-bar__tab:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.28);
}

.filter-bar__tab.active {
  background: #c8922a;
  border-color: #c8922a;
  color: #fff;
}

.filter-bar__controls {
  display: flex;
  flex: 1 1 380px;
  justify-content: flex-end;
  gap: 12px;
}

.filter-bar__search,
.filter-bar__sort {
  min-height: 46px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
}

.filter-bar__search {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 1 250px;
  padding: 0 14px;
}

.filter-bar__icon {
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.4);
}

.filter-bar__icon svg {
  width: 100%;
  height: 100%;
}

.filter-bar__search input,
.filter-bar__sort select {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
}

.filter-bar__search input::placeholder {
  color: rgba(255, 255, 255, 0.36);
}

.filter-bar__sort {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
  padding: 0 14px;
}

.filter-bar__sort span {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.filter-bar__sort select {
  cursor: pointer;
}

.filter-bar__sort option {
  color: #101827;
}

@media (max-width: 900px) {
  .filter-bar__controls {
    justify-content: stretch;
  }
}

@media (max-width: 640px) {
  .filter-bar {
    padding: 0 20px 20px;
  }

  .filter-bar__inner {
    padding: 16px;
  }

  .filter-bar__controls {
    flex-direction: column;
  }

  .filter-bar__sort {
    min-width: 0;
  }
}
</style>
