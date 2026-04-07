<template>
  <section class="section">
    <div class="section-head-center">
      <h2 class="section-title">How It Works</h2>
    </div>
    <div class="steps">
      <div v-for="(step, i) in steps" :key="i" class="step">
        <div class="step-num">{{ i + 1 }}</div>
        <div class="step-icon">{{ step.icon }}</div>
        <div class="step-title">{{ step.title }}</div>
        <div class="step-desc">{{ step.desc }}</div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'HowItWorks',
  setup() {
    const steps = [
      { icon: '📍', title: 'Choose Location',       desc: 'Pick your dream province and discover attractions, nature, and culture waiting for you.' },
      { icon: '🏨', title: 'Book Accommodation',    desc: 'Find the best hostels and stays near your destinations through our trusted partners.' },
      { icon: '🗺️', title: 'Plan Activities',       desc: 'Build a day-by-day itinerary using our smart planner and community recommendations.' },
      { icon: '🌿', title: 'Go Explore',            desc: 'Set off on your journey, upload photos, and share your story with the community.' },
    ]
    return { steps }
  }
})
</script>

<style scoped>
.section { padding: 52px 48px; background: #fff; }
.section-head-center { text-align: center; margin-bottom: 36px; }
.section-title { font-family: 'Cinzel',serif; font-size: 26px; color: #12100E; font-weight: 700; }
.steps { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; position: relative; }
.steps::before { content: ''; position: absolute; top: 26px; left: 12%; right: 12%; height: 1px; background: #E0DDD6; z-index: 0; }
.step { text-align: center; padding: 8px; position: relative; z-index: 1; }
.step-num {
  width: 52px; height: 52px; border-radius: 50%;
  background: #2D6A4F; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Cinzel',serif; font-size: 20px; font-weight: 700;
  margin: 0 auto 14px;
}
.step-icon  { font-size: 24px; margin-bottom: 10px; }
.step-title { font-size: 15px; font-weight: 500; color: #1A1A1A; margin-bottom: 8px; font-family: 'DM Sans',sans-serif; }
.step-desc  { font-size: 13px; color: #6B6B6B; line-height: 1.65; font-family: 'DM Sans',sans-serif; }
@media (max-width: 768px) { .section { padding: 36px 20px; } .steps { grid-template-columns: 1fr 1fr; } .steps::before { display: none; } }
</style>