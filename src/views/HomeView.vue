<template>
  <div>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner" />
      <p class="loading-text">Loading Cambodia...</p>
    </div>
    <HeroSection :provinces="provinces" />

    <ProvinceScroll
      :provinces="provinces"
      :weather="weather"
      :loading="isLoading"
    />

    <BrowseCategory
      :fetch-attractions="fetchAttractions"
    />

    <HiddenGems
      :gems="hiddenGems"
      :loading="isLoading"
    />

    <TravelerStories
      :stories="stories"
      :loading="isLoading"
    />

    <HowItWorks />

    <SponsorBar
      :sponsors="sponsors"
      :loading="isLoading"
    />

    <CtaBanner />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

import HeroSection     from '@/components/sections/HeroSection.vue'
import ProvinceScroll  from '@/components/sections/ProvinceScroll.vue'
import BrowseCategory  from '@/components/sections/BrowseCategory.vue'
import HiddenGems      from '@/components/sections/HiddenGems.vue'
import TravelerStories from '@/components/sections/TravelerStories.vue'
import HowItWorks      from '@/components/sections/HowItWorks.vue'
import SponsorBar      from '@/components/sections/SponsorBar.vue'
import CtaBanner       from '@/components/sections/CtaBanner.vue'

import {
  loadHomePage,
  getAttractionsByCategory,
  type Province,
  type Attraction,
  type Story,
  type Sponsor,
  type Weather,
} from '@/services/home.service'

export default defineComponent({
  name: 'HomeView',
  components: {
    HeroSection, ProvinceScroll, BrowseCategory,
    HiddenGems, TravelerStories, HowItWorks,
    SponsorBar, CtaBanner,
  },
  setup() {
    const isLoading  = ref(true)
    const provinces  = ref<Province[]>([])
    const hiddenGems = ref<Attraction[]>([])
    const stories    = ref<Story[]>([])
    const sponsors   = ref<Sponsor[]>([])
    const weather    = ref<Record<number, Weather>>({})

    onMounted(async () => {
      try {
        const data       = await loadHomePage()
        provinces.value  = data.provinces
        hiddenGems.value = data.hiddenGems
        stories.value    = data.stories
        sponsors.value   = data.sponsors
        weather.value    = data.weather
      } catch (err) {
        console.error('Homepage load failed:', err)
      } finally {
        isLoading.value = false
      }
    })

    async function fetchAttractions(category: string, province?: string) {
      return getAttractionsByCategory(category, province, 4)
    }

    return {
      isLoading, provinces, hiddenGems,
      stories, sponsors, weather,
      fetchAttractions,
    }
  },
})
</script>

<style scoped>
.loading-overlay {
  position: fixed; inset: 0;
  background: rgba(26,35,64,0.88);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  z-index: 9999;
}
.loading-spinner {
  width: 48px; height: 48px;
  border: 3px solid rgba(255,255,255,0.15);
  border-top-color: #C8922A;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text {
  font-family: 'Cinzel', serif;
  font-size: 16px; color: rgba(255,255,255,0.65);
}
</style>