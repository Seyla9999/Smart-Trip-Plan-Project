<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps<{
  provinceName: string;
  totalPlaces: number;
}>();

const provinceSlug = computed(() =>
  props.provinceName.toLowerCase().trim().replace(/\s+/g, "-"),
);
</script>

<template>
  <section class="info-strip">
    <div class="page-container info-row">
      <p>
        {{ totalPlaces }} attractions found in {{ provinceName }} — view them
        all on the map
      </p>
      <RouterLink :to="`/map?province=${provinceSlug}`" class="map-link">
        OPEN MAP VIEW →
      </RouterLink>
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
  text-decoration: none;
  font-weight: 700;
}

@media (max-width: 640px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
