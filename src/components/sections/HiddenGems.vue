<template>
  <section class="section">
    <div class="section-head">
      <div>
        <h2 class="section-title">Hidden Gems</h2>
        <p class="section-sub">Off the beaten path secrets of Cambodia</p>
      </div>
      <a href="/discover?hidden=true" class="see-all">See All →</a>
    </div>

    <div v-if="loading" class="gems-grid">
      <div class="sk-tall"><div class="sk-box" style="height:100%;min-height:370px" /></div>
      <div v-for="i in 4" :key="i" class="sk-small"><div class="sk-box" style="height:175px" /></div>
    </div>

    <div v-else-if="gems.length > 0" class="gems-grid">

      <div class="gem tall" @click="$router.push(`/attraction/${gems[0].id}`)">
        <div
          class="gem-img"
          :style="{
            backgroundImage: `url(${getImage(gems[0])})`,
            backgroundColor: '#4A7C59',
          }"
        >
          <div class="gem-overlay" />
          <div class="gem-content">
            <span class="gem-badge">Hidden Gem</span>
            <div class="gem-name">{{ gems[0].name_en }}</div>
            <div class="gem-prov">📍 {{ gems[0].province?.name_en }}</div>
            <div class="gem-rating">{{ getStars(gems[0].average_rating) }}</div>
          </div>
        </div>
      </div>
      <div
        v-for="gem in gems.slice(1, 5)"
        :key="gem.id"
        class="gem"
        @click="$router.push(`/attraction/${gem.id}`)"
      >
        <div
          class="gem-img"
          :style="{
            backgroundImage: `url(${getImage(gem)})`,
            backgroundColor: '#2D6A4F',
          }"
        >
          <div class="gem-overlay" />
          <div class="gem-content">
            <span class="gem-badge">Hidden Gem</span>
            <div class="gem-name">{{ gem.name_en }}</div>
            <div class="gem-prov">📍 {{ gem.province?.name_en }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="gems-grid">
      <div class="gem tall">
        <div class="gem-img" style="background-image:url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=70');background-color:#6B4C3B">
          <div class="gem-overlay" />
          <div class="gem-content">
            <span class="gem-badge">Hidden Gem</span>
            <div class="gem-name">Banteay Chhmar</div>
            <div class="gem-prov">📍 Banteay Meanchey</div>
          </div>
        </div>
      </div>
      <div v-for="g in staticGems" :key="g.name" class="gem">
        <div class="gem-img" :style="{ backgroundImage:`url(${g.image})`, backgroundColor: g.color }">
          <div class="gem-overlay" />
          <div class="gem-content">
            <span class="gem-badge">Hidden Gem</span>
            <div class="gem-name">{{ g.name }}</div>
            <div class="gem-prov">📍 {{ g.province }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import type { Attraction } from '@/services/home.service'

const STAR_MAP = ['','★☆☆☆☆','★★☆☆☆','★★★☆☆','★★★★☆','★★★★★']

export default defineComponent({
  name: 'HiddenGems',
  props: {
    gems:    { type: Array as PropType<Attraction[]>, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  setup() {
    function getImage(gem: Attraction): string {
      return gem.image_url
          || gem.province?.main_image_url
          || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=70'
    }

    function getStars(rating: number): string {
      const r = Math.min(Math.round(Number(rating) || 0), 5)
      return STAR_MAP[r] || '★★★☆☆'
    }

    const staticGems = [
      { name: 'Preah Vihear',    province: 'Preah Vihear',  image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=70', color: '#5B5EA6' },
      { name: 'Yeak Laom Lake',  province: 'Ratanakiri',    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=70', color: '#6B4C3B' },
      { name: 'Tatai Waterfall', province: 'Koh Kong',      image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&q=70', color: '#2D6A8F' },
      { name: 'Koh Ta Kiev',     province: 'Sihanoukville', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70', color: '#2196A6' },
    ]

    return { getImage, getStars, staticGems }
  },
})
</script>

<style scoped>
.section { padding: 52px 48px; background: #fff; }
.section-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 22px; }
.section-title { font-family: 'Cinzel', serif; font-size: 24px; color: #12100E; font-weight: 700; margin-bottom: 3px; }
.section-sub   { font-size: 13px; color: #6B6B6B; }
.see-all { font-size: 13px; color: #2D6A4F; font-weight: 500; text-decoration: none; border-bottom: 1px solid #52B788; }
.gems-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 12px; }
.gem  { border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform .2s; }
.gem:hover { transform: translateY(-2px); }
.gem.tall { grid-row: span 2; }
.gem-img  { width: 100%; height: 175px; background-size: cover; background-position: center; display: flex; align-items: flex-end; padding: 14px; position: relative; }
.gem.tall .gem-img { height: 100%; min-height: 370px; }
.gem-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,.05) 50%, transparent 100%); }
.gem-content { position: relative; z-index: 1; }
.gem-badge { display: inline-block; background: rgba(200,146,42,.92); color: #fff; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 3px 9px; border-radius: 20px; margin-bottom: 6px; }
.gem-name  { font-family: 'Cinzel', serif; font-size: 14px; color: #fff; font-weight: 700; margin-bottom: 2px; }
.gem.tall .gem-name { font-size: 18px; }
.gem-prov  { font-size: 11px; color: rgba(255,255,255,.6); }
.gem-rating { font-size: 12px; color: #F4D58D; margin-top: 4px; }
.sk-tall  { grid-row: span 2; border-radius: 12px; overflow: hidden; }
.sk-small { border-radius: 12px; overflow: hidden; }
.sk-box   { background: linear-gradient(90deg, #E8E5E0 25%, #F0EDE8 50%, #E8E5E0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }
@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
@media (max-width: 768px) { .section { padding: 36px 20px; } .gems-grid { grid-template-columns: 1fr 1fr; } .gem.tall { grid-row: span 1; } }
</style>