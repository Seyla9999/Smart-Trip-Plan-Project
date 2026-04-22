<script setup lang="ts">
type TravelType = "Solo" | "Friends" | "Family";

type FilterItem = {
  name: string;
  count: number;
  checked: boolean;
};

defineProps<{
  selectedTravelType: TravelType;
  categoryFilters: FilterItem[];
  discoveryFilters: FilterItem[];
}>();

const emit = defineEmits<{
  (e: "set-travel-type", value: TravelType): void;
  (e: "toggle-category", value: string): void;
  (e: "toggle-discovery", value: string): void;
  (e: "clear-all"): void;
}>();
</script>

<template>
  <aside class="filters-panel">
    <div class="filters-header">
      <h3>Filters</h3>
      <button class="clear-btn" @click="emit('clear-all')">CLEAR ALL</button>
    </div>

    <div class="filter-group">
      <p class="filter-title">TRAVEL TYPE</p>
      <div class="travel-type-buttons">
        <button
          :class="['travel-btn', { active: selectedTravelType === 'Solo' }]"
          @click="emit('set-travel-type', 'Solo')"
        >
          Solo
        </button>
        <button
          :class="['travel-btn', { active: selectedTravelType === 'Friends' }]"
          @click="emit('set-travel-type', 'Friends')"
        >
          Friends
        </button>
        <button
          :class="['travel-btn', { active: selectedTravelType === 'Family' }]"
          @click="emit('set-travel-type', 'Family')"
        >
          Family
        </button>
      </div>
    </div>

    <div class="filter-group">
      <p class="filter-title">CATEGORY</p>
      <label v-for="item in categoryFilters" :key="item.name" class="check-row">
        <div class="check-left">
          <input
            type="checkbox"
            :checked="item.checked"
            @change="emit('toggle-category', item.name)"
          />
          <span>{{ item.name }}</span>
        </div>
        <span class="count">{{ item.count }}</span>
      </label>
    </div>

    <div class="filter-group">
      <p class="filter-title">DISCOVERY</p>
      <label
        v-for="item in discoveryFilters"
        :key="item.name"
        class="check-row"
      >
        <div class="check-left">
          <input
            type="checkbox"
            :checked="item.checked"
            @change="emit('toggle-discovery', item.name)"
          />
          <span>{{ item.name }}</span>
        </div>
        <span class="count">{{ item.count }}</span>
      </label>
    </div>
  </aside>
</template>

<style scoped>
.filters-panel {
  background: #fff;
  border-radius: 18px;
  padding: 22px 18px;
  height: fit-content;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
}

.filters-header h3 {
  color: #15543f;
  font-size: 20px;
  margin: 0;
}

.clear-btn {
  border: none;
  background: transparent;
  color: #15543f;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.filter-group {
  margin-bottom: 28px;
}

.filter-title {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 14px;
}

.travel-type-buttons {
  display: flex;
  gap: 8px;
}

.travel-btn {
  flex: 1;
  border: 1px solid #d8dce6;
  background: #f7f7f7;
  color: #7c8395;
  padding: 14px 10px;
  border-radius: 12px;
  cursor: pointer;
}

.travel-btn.active {
  background: #15543f;
  color: white;
  border-color: #15543f;
}

.check-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  font-size: 15px;
  color: #3b3f46;
}

.check-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.count {
  color: #a2a8b7;
  font-size: 14px;
}

@media (max-width: 640px) {
  .travel-type-buttons {
    flex-direction: column;
  }
}
</style>
