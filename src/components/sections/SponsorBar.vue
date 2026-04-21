<template>
  <section class="sponsor-section">
    <div class="sponsor-wrap">
      <p class="sponsor-label">SUPPORTED BY</p>
      <div class="sponsor-logos">
        <div v-for="s in sponsors" :key="s.name" class="sponsor-logo">
          <div class="sponsor-icon" :style="{ background: s.bg, color: s.color }">{{ s.abbr }}</div>
          <div class="sponsor-name">{{ s.name }}</div>
          <div class="sponsor-type">{{ s.type }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'SponsorBar',
  setup() {
    const sponsors = [
      { name: 'Ministry of Tourism', abbr: 'MoT', type: 'Government',    bg: '#E8F5EE', color: '#2D6A4F' },
      { name: 'Angkor Hotels',       abbr: 'AH',  type: 'Accommodation', bg: '#E6F1FB', color: '#1D3557' },
      { name: 'Cambodia Airways',    abbr: 'CA',  type: 'Transport',     bg: '#FDF3E3', color: '#C8922A' },
      { name: 'Phnom Penh City',     abbr: 'PP',  type: 'Municipality',  bg: '#EAF3DE', color: '#2D6A4F' },
      { name: 'UNESCO',              abbr: 'UN',  type: 'Heritage',      bg: '#E6F1FB', color: '#1D3557' },
    ]
    return { sponsors }
  }
})
</script>

<style scoped>
.sponsor-section { background: #fff; padding: 28px 48px; border-top: 1px solid #E0DDD6; border-bottom: 1px solid #E0DDD6; }
.sponsor-wrap    { max-width: 1400px; margin: 0 auto; }
.sponsor-label   { text-align: center; font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #6B6B6B; margin-bottom: 20px; }
.sponsor-logos   { display: flex; align-items: center; justify-content: center; }
.sponsor-logo    { flex: 1; padding: 12px 20px; display: flex; flex-direction: column; align-items: center; gap: 7px; border-right: 1px solid #E0DDD6; cursor: pointer; transition: all .15s; }
.sponsor-logo:last-child { border-right: none; }
.sponsor-logo:hover { background: #F9F7F4; }
.sponsor-icon { width: 42px; height: 42px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
.sponsor-name { font-size: 12.5px; font-weight: 500; color: #1A1A1A; text-align: center; font-family: 'DM Sans',sans-serif; }
.sponsor-type { font-size: 11px; color: #6B6B6B; text-align: center; font-family: 'DM Sans',sans-serif; }
@media (max-width: 768px) { .sponsor-section { padding: 24px 20px; } .sponsor-logos { flex-wrap: wrap; } .sponsor-logo { min-width: 33%; border-right: none; border-bottom: 1px solid #E0DDD6; } }
</style>