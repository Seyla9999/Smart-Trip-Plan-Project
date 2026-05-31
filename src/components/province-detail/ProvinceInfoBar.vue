<script setup lang="ts">
defineProps<{
  provinceName: string;
  totalPlaces: number;
}>();

const emit = defineEmits<{
  (e: "open-map"): void;
}>();

function openMapView() {
  emit("open-map");
}
</script>

<template>
  <section class="info-strip">
    <div class="page-container info-row">
      <p>
        {{ totalPlaces }} attractions found in {{ provinceName }} — view them
        all on the map
      </p>

      <button class="map-link" type="button" @click="openMapView">
        OPEN MAP VIEW →
      </button>
    </div>
  </section>
</template>

<style scoped>
.info-strip {
  background: #566286;
  color: white;
  padding: 16px 0;
}

.page-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.map-link {
  color: #ffcb4d;
  background: transparent;
  border: none;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

@media (max-width: 640px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
