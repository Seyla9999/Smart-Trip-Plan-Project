<script setup lang="ts">
type ViewMode = "grid" | "list";
type SortOption = "recommended" | "top-rated" | "most-popular";

defineProps<{
  provinceName: string;
  totalResults: number;
  selectedTravelType: string;
  displayDateRange: string;
  categoryFilters: { name: string; checked: boolean }[];
  discoveryFilters: { name: string; checked: boolean }[];
  viewMode: ViewMode;
  sortOption: SortOption;
}>();

const emit = defineEmits<{
  (e: "set-view-mode", value: ViewMode): void;
  (e: "set-sort-option", value: SortOption): void;
}>();

function onSortChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit("set-sort-option", target.value as SortOption);
}
</script>

<template>
  <div class="content-top">
    <div>
      <h1>{{ provinceName }} attractions</h1>

      <p class="results-text">
        {{ totalResults }} results · {{ selectedTravelType }} trip ·
        {{ displayDateRange }}
      </p>

      <div class="tag-row">
        <span class="filter-tag">{{ selectedTravelType }}</span>

        <span
          v-for="item in categoryFilters.filter((i) => i.checked)"
          :key="item.name"
          class="filter-tag"
        >
          {{ item.name }}
        </span>

        <span
          v-for="item in discoveryFilters.filter((i) => i.checked)"
          :key="item.name"
          class="filter-tag"
        >
          {{ item.name }}
        </span>
      </div>
    </div>

    <div class="top-actions">
      <button
        class="view-btn"
        :class="{ active: viewMode === 'grid' }"
        @click="$emit('set-view-mode', 'grid')"
      >
        ▦
      </button>

      <button
        class="view-btn"
        :class="{ active: viewMode === 'list' }"
        @click="$emit('set-view-mode', 'list')"
      >
        ☰
      </button>

      <select :value="sortOption" class="sort-select" @change="onSortChange">
        <option value="recommended">Recommended</option>
        <option value="top-rated">Top Rated</option>
        <option value="most-popular">Most Popular</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.content-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 28px;
}

h1 {
  margin: 0 0 8px;
  color: #15543f;
  font-size: 54px;
  line-height: 1.1;
  font-family: Georgia, "Times New Roman", serif;
}

.results-text {
  color: #82889a;
  margin-bottom: 20px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: #edf3ef;
  color: #15543f;
  font-size: 14px;
  font-weight: 600;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.view-btn,
.sort-select {
  border: 1px solid #e4e7ee;
  background: #fff;
  border-radius: 10px;
  padding: 12px 14px;
}

.view-btn {
  cursor: pointer;
}

.view-btn.active {
  color: #15543f;
  font-weight: 700;
  border-color: #15543f;
}

@media (max-width: 1024px) {
  .content-top {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  h1 {
    font-size: 36px;
  }
}
</style>
