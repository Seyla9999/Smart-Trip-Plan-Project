<template>
  <aside class="community-sidebar">
    <TrendingList :places="trendingPlaces" />
    <TopTravelers :travelers="travelers" @toggle-follow="emit('toggleFollow', $event)" />
    <PopularProvinces :provinces="provinces" />
  </aside>
</template>

<script setup lang="ts">
import PopularProvinces from '@/components/community/sidebar/PopularProvinces.vue'
import TopTravelers from '@/components/community/sidebar/TopTravelers.vue'
import TrendingList from '@/components/community/sidebar/TrendingList.vue'
import type {
  PopularProvince,
  TopTraveler,
  TrendingPlace,
} from '@/data/community'

defineProps<{
  trendingPlaces: TrendingPlace[]
  travelers: TopTraveler[]
  provinces: PopularProvince[]
}>()

const emit = defineEmits<{
  toggleFollow: [id: number]
}>()
</script>

<style scoped>
.community-sidebar {
  position: sticky;
  top: 128px;
  display: grid;
  gap: 18px;
}

@media (max-width: 1100px) {
  .community-sidebar {
    position: static;
  }
}
</style>
