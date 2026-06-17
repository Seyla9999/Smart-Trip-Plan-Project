<template>
  <div class="sidebar-stack">
    <TrendingList :places="trendingPlaces" />
    <TopTravelers :travelers="travelers" />
    <PopularProvinces :provinces="provinces" />
  </div>
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
</script>

<style scoped>
.sidebar-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>