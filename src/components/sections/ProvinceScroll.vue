<template>
  <section class="section">
    <div class="section-head">
      <div>
        <h2 class="section-title">Explore Provinces</h2>
        <p class="section-sub">Discover Cambodia's 25 provinces</p>
      </div>
      <a href="/discover" class="see-all">View all 25 →</a>
    </div>

    <div class="scroll-wrap">
      <button class="arrow left" @click="scroll(-1)">‹</button>
      <div class="scroll-track" ref="track">

        <template v-if="loading">
          <div v-for="i in 6" :key="i" class="pcard skeleton">
            <div class="sk-img" />
            <div class="pcard-body">
              <div class="sk-line" style="width:60%" />
              <div class="sk-line" style="width:80%;margin-top:6px" />
            </div>
          </div>
        </template>

        <template v-else-if="provinces.length > 0">
          <div
            v-for="p in provinces"
            :key="p.id"
            class="pcard"
            @click="goToProvinceDetail(p.name_en)"
          >
            <div
              class="pcard-img"
              :style="{
                backgroundImage: p.main_image_url ? `url(${p.main_image_url})` : undefined,
                backgroundColor: '#4A7C59',
              }"
            >
              <div class="pcard-overlay" />

              <div v-if="weather && weather[p.id]" class="weather-badge">
                <span>{{ weather[p.id].icon_url }}</span>
                <span class="w-temp">{{ Math.round(weather[p.id].temp_celsius) }}°C</span>
              </div>
              <span class="pcard-name">{{ p.name_en }}</span>
              <span class="pcard-kh">{{ p.name_kh }}</span>
            </div>
            <div class="pcard-body">
              <div class="pcard-stats">
                <span class="pstat"><span class="dot green" />{{ p.attraction_count ?? 0 }} attractions</span>
                <span class="pstat"><span class="dot gold" />{{ p.accommodation_count ?? 0 }} hostels</span>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div
            v-for="p in fallback"
            :key="p.name"
            class="pcard"
            @click="goToProvinceDetail(p.name)"
          >
            <div class="pcard-img" :style="{ backgroundImage:`url(${p.img})`, backgroundColor: p.color }">
              <div class="pcard-overlay" />
              <span class="pcard-name">{{ p.name }}</span>
              <span class="pcard-kh">{{ p.kh }}</span>
            </div>
            <div class="pcard-body">
              <div class="pcard-stats">
                <span class="pstat"><span class="dot green" />{{ p.attr }} attractions</span>
                <span class="pstat"><span class="dot gold" />{{ p.host }} hostels</span>
              </div>
            </div>
          </div>
        </template>

      </div>
      <button class="arrow right" @click="scroll(1)">›</button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import type { PropType } from 'vue'
import { useRouter } from 'vue-router'
import type { Province, Weather } from '@/services/home.service'

export default defineComponent({
  name: 'ProvinceScroll',
  props: {
    provinces: { type: Array as PropType<Province[]>, default: () => [] },
    weather:   { type: Object as PropType<Record<number, Weather>>, default: () => ({}) },
    loading:   { type: Boolean, default: false },
  },
  setup() {
    const router = useRouter()
    const track = ref<HTMLElement | null>(null)
    function scroll(dir: number) {
      track.value?.scrollBy({ left: dir * 420, behavior: 'smooth' })
    }

    function toSlug(value: string) {
      return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
    }

    function goToProvinceDetail(provinceName: string) {
      router.push(`/province/${toSlug(provinceName)}`)
    }

    const fallback = [
      { name:'Siem Reap',     kh:'សៀមរាប',   img:'https://images.unsplash.com/photo-1538964173425-93884e739ccd?w=400&q=70', color:'#4A7C59', attr:42, host:18 },
      { name:'Phnom Penh',    kh:'ភ្នំពេញ',   img:'https://images.unsplash.com/photo-1598946329549-8ac25a6c2890?w=400&q=70', color:'#3D5A80', attr:38, host:24 },
      { name:'Koh Kong',      kh:'កោះកុង',   img:'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&q=70', color:'#2D6A4F', attr:19, host:8  },
      { name:'Kampot',        kh:'កំពត',      img:'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&q=70', color:'#5C7A3E', attr:22, host:12 },
      { name:'Sihanoukville', kh:'ព្រះសីហនុ', img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70', color:'#2196A6', attr:27, host:21 },
      { name:'Ratanakiri',    kh:'រតនគិរី',   img:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=70', color:'#6B4C3B', attr:14, host:5  },
    ]
    return { track, scroll, fallback, goToProvinceDetail }
  },
})
</script>

<style scoped>
.section { padding:52px 48px; background:#F5F3EE; }
.section-head { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:22px; }
.section-title { font-family:'Cinzel',serif; font-size:24px; color:#12100E; font-weight:700; margin-bottom:3px; }
.section-sub   { font-size:13px; color:#6B6B6B; }
.see-all { font-size:13px; color:#2D6A4F; font-weight:500; text-decoration:none; border-bottom:1px solid #52B788; }
.scroll-wrap  { position:relative; }
.scroll-track { display:flex; gap:14px; overflow-x:auto; padding-bottom:8px; scroll-snap-type:x mandatory; scrollbar-width:thin; scrollbar-color:#2D6A4F #E0DDD6; }
.scroll-track::-webkit-scrollbar { height:3px; }
.scroll-track::-webkit-scrollbar-thumb { background:#2D6A4F; border-radius:2px; }
.arrow { position:absolute; top:42%; transform:translateY(-50%); width:34px; height:34px; border-radius:50%; background:#fff; border:1px solid #E0DDD6; display:flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer; z-index:5; transition:all .15s; }
.arrow:hover { background:#2D6A4F; color:#fff; border-color:#2D6A4F; }
.left  { left:-14px; }
.right { right:-14px; }
.pcard { flex-shrink:0; width:190px; border-radius:12px; overflow:hidden; background:#fff; border:1px solid #E0DDD6; cursor:pointer; transition:transform .2s; scroll-snap-align:start; }
.pcard:hover { transform:translateY(-3px); }
.pcard-img { height:135px; background-size:cover; background-position:center; display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-end; padding:10px; position:relative; }
.pcard-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 55%); }
.weather-badge { position:absolute; top:8px; right:8px; z-index:2; background:rgba(0,0,0,.45); border:1px solid rgba(255,255,255,.2); border-radius:8px; padding:3px 8px; display:flex; align-items:center; gap:4px; }
.w-temp { font-size:11px; color:#fff; font-weight:600; }
.pcard-name { position:relative; z-index:1; font-family:'Cinzel',serif; font-size:13px; color:#fff; font-weight:700; display:block; }
.pcard-kh   { position:relative; z-index:1; font-size:10px; color:rgba(255,255,255,.65); display:block; margin-top:1px; }
.pcard-body { padding:9px 11px; }
.pcard-stats { display:flex; gap:8px; flex-wrap:wrap; }
.pstat { display:flex; align-items:center; gap:4px; font-size:11px; color:#6B6B6B; }
.dot   { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.green { background:#2D6A4F; }
.gold  { background:#C8922A; }

.skeleton .sk-img  { height:135px; background:linear-gradient(90deg,#E8E5E0 25%,#F0EDE8 50%,#E8E5E0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
.sk-line { height:11px; border-radius:4px; background:linear-gradient(90deg,#E8E5E0 25%,#F0EDE8 50%,#E8E5E0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@media(max-width:768px) { .section{padding:36px 20px;} }
</style>