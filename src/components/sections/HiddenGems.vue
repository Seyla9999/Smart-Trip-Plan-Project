<template>
  <section class="section">
    <div class="section-head">
      <div>
        <h2 class="section-title">Hidden Gems</h2>
        <p class="section-sub">Off the beaten path secrets of Cambodia</p>
      </div>
      <a href="/discover?filter=hidden-gems" class="see-all">See All →</a>
    </div>
    <div class="gems-grid">

      <div class="gem tall" @click="$router.push('/attractions/banteay-chhmar')">
        <div class="gem-img" style="background-image:url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=70');background-color:#6B4C3B">
          <div class="gem-overlay" />
          <div class="gem-content">
            <span class="gem-badge">Hidden Gem</span>
            <div class="gem-name">Banteay Chhmar</div>
            <div class="gem-prov">Banteay Meanchey Province</div>
          </div>
        </div>
      </div>

      <div v-for="g in smallGems" :key="g.name" class="gem" @click="$router.push(`/attractions/${g.slug}`)">
        <div class="gem-img" :style="{ backgroundImage: `url(${g.image})`, backgroundColor: g.color }">
          <div class="gem-overlay" />
          <div class="gem-content">
            <span class="gem-badge">Hidden Gem</span>
            <div class="gem-name">{{ g.name }}</div>
            <div class="gem-prov">{{ g.province }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
interface Gem { name: string; slug: string; province: string; image: string; color: string }
export default defineComponent({
  name: 'HiddenGems',
  setup() {
    const smallGems: Gem[] = [
      { name: 'Preah Vihear', slug: 'preah-vihear', province: 'Preah Vihear', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=70', color: '#5B5EA6' },
      { name: 'Chi Phat',     slug: 'chi-phat',     province: 'Koh Kong',     image: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&q=70', color: '#2D6A4F' },
      { name: 'Yeak Laom',    slug: 'yeak-laom',    province: 'Ratanakiri',   image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=70', color: '#6B4C3B' },
      { name: 'Cheay Thom',   slug: 'cheay-thom',   province: 'Kampong Speu', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70', color: '#3E6B47' },
    ]
    return { smallGems }
  }
})
</script>

<style scoped>
.section { padding: 52px 48px; background: #fff; }
.section-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 22px; }
.section-title { font-family: 'Cinzel',serif; font-size: 24px; color: #12100E; font-weight: 700; margin-bottom: 3px; }
.section-sub   { font-size: 13px; color: #6B6B6B; }
.see-all { font-size: 13px; color: #2D6A4F; font-weight: 500; text-decoration: none; border-bottom: 1px solid #52B788; padding-bottom: 1px; }
.gems-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 12px; }
.gem { border-radius: 12px; overflow: hidden; cursor: pointer; position: relative; transition: transform .2s; }
.gem:hover { transform: translateY(-2px); }
.gem.tall { grid-row: span 2; }
.gem-img { width: 100%; height: 175px; background-size: cover; background-position: center; display: flex; align-items: flex-end; padding: 14px; position: relative; }
.gem.tall .gem-img { height: 100%; min-height: 370px; }
.gem-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,.05) 50%, transparent 100%); }
.gem-content  { position: relative; z-index: 1; }
.gem-badge { display: inline-block; background: rgba(200,146,42,.92); color: #fff; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 3px 9px; border-radius: 20px; margin-bottom: 6px; }
.gem-name  { font-family: 'Cinzel',serif; font-size: 14px; color: #fff; font-weight: 700; margin-bottom: 2px; }
.gem.tall .gem-name { font-size: 18px; }
.gem-prov  { font-size: 11px; color: rgba(255,255,255,.6); }
@media (max-width: 768px) { .section { padding: 36px 20px; } .gems-grid { grid-template-columns: 1fr 1fr; } .gem.tall { grid-row: span 1; } }
</style>