<template>
  <section class="sponsor-section">
    <div class="sponsor-wrap">
      <p class="sponsor-label">SUPPORTED BY OUR PARTNERS</p>

      <div v-if="loading" class="sponsor-track">
        <div v-for="i in 5" :key="i" class="sponsor-item skeleton">
          <div class="sk-logo" />
        </div>
      </div>
      <div v-else-if="sponsors.length > 0" class="sponsor-track">
        <a
          v-for="s in sponsors"
          :key="s.id"
          class="sponsor-item"
          :href="s.website_url || '#'"
          target="_blank"
          rel="noopener noreferrer"
          :title="s.name"
        >
          <img
            v-if="s.logo_url"
            :src="s.logo_url"
            :alt="s.name"
            class="sponsor-logo-img"
          />
          <div v-else class="sponsor-text-logo" :class="`tier-${s.tier}`">
            <div class="stl-abbr">{{ getAbbr(s.name) }}</div>
            <div class="stl-name">{{ s.name }}</div>
          </div>
        </a>
      </div>
      <div v-else class="sponsor-track">
        <div v-for="s in staticSponsors" :key="s.name" class="sponsor-item">
          <div class="sponsor-text-logo tier-gold">
            <div class="stl-abbr">{{ s.abbr }}</div>
            <div class="stl-name">{{ s.name }}</div>
          </div>
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
    function getAbbr(name: string): string {
      if (!name) return '?'
      const words = name.trim().split(/\s+/)
      if (words.length === 1) return words[0].slice(0, 3).toUpperCase()
      return words.slice(0, 2).map(w => w[0]).join('').toUpperCase()
    }

    const staticSponsors = [
      { name: 'Ministry of Tourism', abbr: 'MoT' },
      { name: 'UNESCO Cambodia',     abbr: 'UN'  },
      { name: 'Cambodia Airways',    abbr: 'CA'  },
      { name: 'Angkor Hotels',       abbr: 'AH'  },
      { name: 'Phnom Penh City',     abbr: 'PP'  },
    ]

    return { getAbbr, staticSponsors }
  },
})
</script>

<style scoped>
.sponsor-section {
  background: #fff;
  padding: 32px 48px;
  border-top: 1px solid #E0DDD6;
  border-bottom: 1px solid #E0DDD6;
}
.sponsor-wrap { max-width: 1200px; margin: 0 auto; }
.sponsor-label {
  text-align: center; font-size: 10px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: #9E9E9E; margin-bottom: 24px;
}

.sponsor-track {
  display: flex; align-items: center;
  justify-content: center; gap: 0;
}
.sponsor-item {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 12px 24px; border-right: 1px solid #E0DDD6;
  text-decoration: none; transition: all 0.2s; min-height: 70px;
  cursor: pointer; filter: grayscale(100%); opacity: 0.6;
}
.sponsor-item:last-child { border-right: none; }
.sponsor-item:hover { filter: grayscale(0%); opacity: 1; background: #F9F7F4; }

.sponsor-logo-img { max-height: 44px; max-width: 120px; object-fit: contain; }

.sponsor-text-logo { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.stl-abbr { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; line-height: 1; font-family: 'Cinzel', serif; }
.stl-name { font-size: 9px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #6B6B6B; text-align: center; line-height: 1.3; max-width: 90px; }
.tier-gold   .stl-abbr { color: #C8922A; }
.tier-silver .stl-abbr { color: #4A6580; }
.tier-bronze .stl-abbr { color: #2D6A4F; }

.skeleton { pointer-events: none; }
.sk-logo { width: 80px; height: 44px; border-radius: 6px; background: linear-gradient(90deg, #E8E5E0 25%, #F0EDE8 50%, #E8E5E0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }

@media (max-width: 768px) {
  .sponsor-section { padding: 24px 20px; }
  .sponsor-track { flex-wrap: wrap; }
  .sponsor-item { min-width: 33%; border-right: none; border-bottom: 1px solid #E0DDD6; }
}
</style>