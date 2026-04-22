<template>
  <section class="section">
    <div class="section-head">
      <div>
        <h2 class="section-title">Traveler Stories</h2>
        <p class="section-sub">Real experiences from our community of travelers</p>
      </div>
      <a href="/community" class="see-all">See All →</a>
    </div>
    <div class="scroll-wrap">
      <button class="arrow left" @click="scroll(-1)">‹</button>
      <div class="scroll-track" ref="track">
        <div v-for="s in stories" :key="s.title" class="scard" @click="$router.push('/community')">
          <div class="scard-img" :style="{ backgroundImage: `url(${s.image})`, backgroundColor: s.color }">
            <div class="scard-overlay" />
            <span class="scard-badge" :class="`bc-${s.category.toLowerCase()}`">{{ s.category }}</span>
            <div class="scard-author">
              <div class="scard-av" :style="{ background: s.avColor }">{{ s.initials }}</div>
              <span class="scard-aname">{{ s.author }}</span>
            </div>
          </div>
          <div class="scard-body">
            <div class="scard-prov">{{ s.province }}</div>
            <div class="scard-title">{{ s.title }}</div>
            <div class="scard-foot">
              <span class="scard-rating">{{ s.rating }}</span>
              <span class="scard-likes">♡ {{ s.likes }}</span>
            </div>
          </div>
        </div>
      </div>
      <button class="arrow right" @click="scroll(1)">›</button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
interface Story { title: string; province: string; image: string; color: string; category: string; author: string; initials: string; avColor: string; rating: string; likes: number }
export default defineComponent({
  name: 'TravelerStories',
  setup() {
    const track = ref<HTMLElement | null>(null)
    const stories: Story[] = [
      { title: 'Cycling through the temples of Angkor at dawn', province: 'Siem Reap', image: 'https://images.unsplash.com/photo-1538964173425-93884e739ccd?w=400&q=70', color: '#4A7C59', category: 'Cultural', author: 'Dara Sok', initials: 'DS', avColor: '#1D3557', rating: '★★★★★', likes: 284 },
      { title: 'A week of solitude on Koh Kong Sandkem', province: 'Koh Kong', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70', color: '#2196A6', category: 'Sea', author: 'Sophea Ros', initials: 'SR', avColor: '#C8922A', rating: '★★★★★', likes: 197 },
      { title: 'Tasting my way through Siem Reap\'s markets', province: 'Siem Reap', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=70', color: '#7A6030', category: 'Food', author: 'Judy Afkar', initials: 'JA', avColor: '#5C4B8A', rating: '★★★★☆', likes: 156 },
      { title: 'Ethical elephant trekking in Mondulkiri', province: 'Mondulkiri', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70', color: '#3E6B47', category: 'Nature', author: 'Susan Park', initials: 'SP', avColor: '#2D6A4F', rating: '★★★★★', likes: 209 },
      { title: 'Bokor Hill Station — misty roads and old ruins', province: 'Kampot', image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&q=70', color: '#5C7A3E', category: 'Mountain', author: 'Kanha Sok', initials: 'KS', avColor: '#AE2012', rating: '★★★★☆', likes: 143 },
      { title: 'Bokor Hill Station — misty roads and old ruins', province: 'Kampot', image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&q=70', color: '#5C7A3E', category: 'Mountain', author: 'Kanha Sok', initials: 'KS', avColor: '#AE2012', rating: '★★★★☆', likes: 143 },
    ]
    function scroll(dir: number) { if (track.value) track.value.scrollBy({ left: dir * 420, behavior: 'smooth' }) }
    return { track, stories, scroll }
  }
})
</script>

<style scoped>
.section { padding: 52px 48px; background: #F5F3EE; }
.section-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 22px; }
.section-title { font-family: 'Cinzel',serif; font-size: 24px; color: #12100E; font-weight: 700; margin-bottom: 3px; }
.section-sub   { font-size: 13px; color: #6B6B6B; }
.see-all { font-size: 13px; color: #2D6A4F; font-weight: 500; text-decoration: none; border-bottom: 1px solid #52B788; padding-bottom: 1px; }
.scroll-wrap { position: relative; }
.scroll-track { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: thin; scrollbar-color: #2D6A4F #E0DDD6; }
.scroll-track::-webkit-scrollbar { height: 3px; }
.scroll-track::-webkit-scrollbar-thumb { background: #2D6A4F; border-radius: 2px; }
.arrow { position: absolute; top: 42%; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 50%; background: #fff; border: 1px solid #E0DDD6; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; z-index: 5; box-shadow: 0 2px 8px rgba(0,0,0,.1); transition: all .15s; }
.arrow:hover { background: #2D6A4F; color: #fff; border-color: #2D6A4F; }
.left  { left: -14px; }
.right { right: -14px; }
.scard { flex-shrink: 0; width: 235px; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #E0DDD6; cursor: pointer; transition: transform .2s; scroll-snap-align: start; }
.scard:hover { transform: translateY(-2px); }
.scard-img { height: 155px; background-size: cover; background-position: center; position: relative; display: flex; flex-direction: column; justify-content: space-between; padding: 10px; }
.scard-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.62) 0%, transparent 50%); }
.scard-badge { align-self: flex-start; position: relative; z-index: 1; font-size: 10px; font-weight: 700; padding: 2px 9px; border-radius: 20px; text-transform: uppercase; letter-spacing: .04em; }
.bc-natural,.bc-nature  { background: rgba(45,106,79,.9);  color: #fff; }
.bc-sea                  { background: rgba(33,150,166,.9); color: #fff; }
.bc-waterfall            { background: rgba(45,106,143,.9); color: #fff; }
.bc-mountain             { background: rgba(107,76,59,.9);  color: #fff; }
.bc-cultural,.bc-culture { background: rgba(107,80,40,.9);  color: #fff; }
.bc-food                 { background: rgba(150,100,30,.9); color: #fff; }
.scard-author { position: relative; z-index: 1; display: flex; align-items: center; gap: 7px; align-self: flex-end; width: 100%; }
.scard-av     { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; border: 2px solid rgba(255,255,255,.4); flex-shrink: 0; }
.scard-aname  { font-size: 11.5px; color: #fff; font-weight: 500; }
.scard-body { padding: 12px 14px; }
.scard-prov  { font-size: 10.5px; color: #6B6B6B; margin-bottom: 5px; font-weight: 500; text-transform: uppercase; letter-spacing: .04em; }
.scard-title { font-size: 13px; font-weight: 500; color: #1A1A1A; margin-bottom: 8px; line-height: 1.45; }
.scard-foot  { display: flex; align-items: center; justify-content: space-between; }
.scard-rating { font-size: 12px; color: #C8922A; }
.scard-likes  { font-size: 12px; color: #6B6B6B; }
@media (max-width: 768px) { .section { padding: 36px 20px; } }
</style>