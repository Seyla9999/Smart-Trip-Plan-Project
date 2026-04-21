<template>
  <div>
    <HeroSection />
    <ProvinceScroll />
    <BrowseCategory />
    <HiddenGems />
    <TravelerStories />
    <HowItWorks />
    <SponsorBar />
    <CtaBanner />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HeroSection     from '@/components/sections/HeroSection.vue'
import ProvinceScroll  from '@/components/sections/ProvinceScroll.vue'
import BrowseCategory  from '@/components/sections/BrowseCategory.vue'
import HiddenGems      from '@/components/sections/HiddenGems.vue'
import TravelerStories from '@/components/sections/TravelerStories.vue'
import HowItWorks      from '@/components/sections/HowItWorks.vue'
import SponsorBar      from '@/components/sections/SponsorBar.vue'
import CtaBanner       from '@/components/sections/CtaBanner.vue'

export default defineComponent({
  name: 'HomeView',
  components: {
    HeroSection,
    ProvinceScroll,
    BrowseCategory,
    HiddenGems,
    TravelerStories,
    HowItWorks,
    SponsorBar,
    CtaBanner,
  }
})
</script>