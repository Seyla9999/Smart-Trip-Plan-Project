<template>
  <section class="sponsor-section">
    <div class="sponsor-wrap">
      <p class="sponsor-label">SUPPORTED BY</p>

      <div v-if="loading" class="sponsor-logos">
        <div v-for="i in 4" :key="i" class="sponsor-logo skeleton">
          <div class="sk-icon" />
          <div class="sk-line" style="width:80px;margin-top:8px" />
          <div class="sk-line" style="width:55px;margin-top:5px" />
        </div>
      </div>

      <div v-else-if="sponsors.length > 0" class="sponsor-logos">
        <a
          v-for="s in sponsors"
          :key="s.id"
          class="sponsor-logo"
          :href="s.website_url || '#'"
          target="_blank"
          rel="noopener"
        >
          <img
            v-if="s.logo_url"
            :src="s.logo_url"
            :alt="s.name"
            class="sponsor-img"
          />
          <div
            v-else
            class="sponsor-icon"
            :style="{ background: tierColor(s.tier).bg, color: tierColor(s.tier).text }"
          >
            {{ abbr(s.name) }}
          </div>
          <div class="sponsor-name">{{ s.name }}</div>
          <div class="sponsor-type sponsor-tier" :class="`tier-${s.tier}`">{{ s.tier }}</div>
        </a>
      </div>

      <div v-else class="sponsor-logos">
        <div v-for="s in staticSponsors" :key="s.name" class="sponsor-logo">
          <div class="sponsor-icon" :style="{ background: s.bg, color: s.color }">{{ s.abbr }}</div>
          <div class="sponsor-name">{{ s.name }}</div>
          <div class="sponsor-type">{{ s.type }}</div>
        </div>
      </div>

    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import type { Sponsor } from '@/services/home.service'

export default defineComponent({
  name: 'SponsorBar',
  props: {
    sponsors: { type: Array as PropType<Sponsor[]>, default: () => [] },
    loading:  { type: Boolean, default: false },
  },
  setup() {

    function abbr(name: string): string {
      if (!name) return '?'
      const words = name.trim().split(/\s+/)
      if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
      return (words[0][0] + words[1][0]).toUpperCase()
    }

    function tierColor(tier: string): { bg: string; text: string } {
      if (tier === 'gold')   return { bg: '#FDF3E3', text: '#C8922A' }
      if (tier === 'silver') return { bg: '#F0F4F8', text: '#4A6580' }
      return                        { bg: '#E8F5EE', text: '#2D6A4F' } 
    }

    const staticSponsors = [
      { name: 'Ministry of Tourism', abbr: 'MoT', type: 'Government',    bg: '#E8F5EE', color: '#2D6A4F' },
      { name: 'Angkor Hotels',       abbr: 'AH',  type: 'Accommodation', bg: '#E6F1FB', color: '#1D3557' },
      { name: 'Cambodia Airways',    abbr: 'CA',  type: 'Transport',     bg: '#FDF3E3', color: '#C8922A' },
      { name: 'Phnom Penh City',     abbr: 'PP',  type: 'Municipality',  bg: '#EAF3DE', color: '#2D6A4F' },
      { name: 'UNESCO',              abbr: 'UN',  type: 'Heritage',      bg: '#E6F1FB', color: '#1D3557' },
    ]

    return { abbr, tierColor, staticSponsors }
  }
})
</script>

<style scoped>
.sponsor-section { background: #fff; padding: 28px 48px; border-top: 1px solid #E0DDD6; border-bottom: 1px solid #E0DDD6; }
.sponsor-wrap    { max-width: 1400px; margin: 0 auto; }
.sponsor-label   { text-align: center; font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #6B6B6B; margin-bottom: 20px; }
.sponsor-logos   { display: flex; align-items: center; justify-content: center; }
.sponsor-logo    { flex: 1; padding: 12px 20px; display: flex; flex-direction: column; align-items: center; gap: 7px; border-right: 1px solid #E0DDD6; cursor: pointer; transition: all .15s; text-decoration: none; }
.sponsor-logo:last-child { border-right: none; }
.sponsor-logo:hover { background: #F9F7F4; }
.sponsor-icon { width: 42px; height: 42px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
.sponsor-img  { width: 42px; height: 42px; object-fit: contain; border-radius: 9px; }
.sponsor-name { font-size: 12.5px; font-weight: 500; color: #1A1A1A; text-align: center; font-family: 'DM Sans', sans-serif; }
.sponsor-type { font-size: 11px; color: #6B6B6B; text-align: center; font-family: 'DM Sans', sans-serif; }
.sponsor-tier { text-transform: capitalize; font-weight: 600; }
.tier-gold   { color: #C8922A; }
.tier-silver { color: #4A6580; }
.tier-bronze { color: #2D6A4F; }

.skeleton { pointer-events: none; }
.sk-icon { width: 42px; height: 42px; border-radius: 9px; background: linear-gradient(90deg, #E8E5E0 25%, #F0EDE8 50%, #E8E5E0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.sk-line { height: 10px; border-radius: 4px; background: linear-gradient(90deg, #E8E5E0 25%, #F0EDE8 50%, #E8E5E0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }

@media (max-width: 768px) { .sponsor-section { padding: 24px 20px; } .sponsor-logos { flex-wrap: wrap; } .sponsor-logo { min-width: 33%; border-right: none; border-bottom: 1px solid #E0DDD6; } }
</style>