<template>
  <section class="section">
    <div class="section-head">
      <h2 class="section-title">Browse By Category</h2>
      <p class="section-sub">Find your next adventure by choosing across a broad collection of experiences</p>
    </div>

    <div class="cat-pills">
      <button
        v-for="cat in categories"
        :key="cat.name"
        class="cat-pill"
        :class="{ active: activeCat === cat.name }"
        @click="setCategory(cat.name)"
      >
        <span>{{ cat.icon }}</span> {{ cat.name }}
      </button>
    </div>

    <div class="prov-row">
      <span class="prov-label">Filter by province:</span>
      <button
        v-for="p in activeProvinces"
        :key="p"
        class="pf-pill"
        :class="{ active: activeProv === p }"
        @click="activeProv = p"
      >{{ p === 'All' ? 'All provinces' : p }}</button>
    </div>

    <div v-if="catLoading" class="results-grid">
      <div v-for="i in 4" :key="i" class="rc skeleton">
        <div class="sk-img" />
        <div class="rc-body">
          <div class="sk-line" style="width:60%;margin-bottom:8px" />
          <div class="sk-line" style="width:40%" />
        </div>
      </div>
    </div>

    <div v-else class="results-grid">
      <div
        v-for="item in displayItems"
        :key="item.id || item.name"
        class="rc"
        @click="item.id ? $router.push(`/attraction/${item.id}`) : $router.push(`/discover?category=${activeCat}`)"
      >
        <div
          class="rc-img"
          :style="{ backgroundImage: `url(${item.image})`, backgroundColor: item.color }"
        >
          <div class="rc-overlay" />
          <span class="rc-badge" :style="{ background: badgeColor(activeCat) }">{{ activeCat }}</span>
          <span class="rc-name">{{ item.name }}</span>
        </div>
        <div class="rc-body">
          <div class="rc-prov">📍 {{ item.province }}</div>
          <div class="rc-foot">
            <span class="rc-rating">{{ item.rating }} <span class="rc-cnt">({{ item.reviews }})</span></span>
            <button class="trip-btn" @click.stop="$router.push('/trip')">+ Trip</button>
          </div>
        </div>
      </div>
    </div>

    <div class="see-all-row">
      <a :href="`/discover?category=${activeCat}`" class="see-all-link">
      See all {{ activeCat }} attractions →
</a>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, PropType, onMounted } from 'vue'
import type { Attraction } from '@/services/home.service'

interface DisplayItem {
  id?: string
  name: string
  province: string
  image: string
  color: string
  rating: string
  reviews: number
}

const STAR_MAP = [0,'★☆☆☆☆','★★☆☆☆','★★★☆☆','★★★★☆','★★★★★']

const FALLBACK_DATA: Record<string, DisplayItem[]> = {
  Sea: [
    { name: 'Long Beach',        province: 'Koh Kong',      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80', color: '#2196A6', rating: '★★★★★', reviews: 312 },
    { name: 'Koh Ta Kiev',       province: 'Sihanoukville', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=80', color: '#1A7A8A', rating: '★★★★☆', reviews: 198 },
    { name: 'Koh Rong Island',   province: 'Sihanoukville', image: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=500&q=80', color: '#2D6A4F', rating: '★★★★☆', reviews: 145 },
    { name: 'Koh Kong Island',   province: 'Koh Kong',      image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=500&q=80', color: '#3E6B47', rating: '★★★★☆', reviews: 87  },
  ],
  Waterfall: [
    { name: 'Tatai Waterfall',   province: 'Koh Kong',      image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=500&q=80', color: '#2D6A8F', rating: '★★★★★', reviews: 743 },
    { name: 'Bou Sra Waterfall', province: 'Mondulkiri',    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80', color: '#3E6B47', rating: '★★★★☆', reviews: 421 },
    { name: 'Popokvil Falls',    province: 'Kampot',        image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=500&q=80', color: '#5C7A3E', rating: '★★★★☆', reviews: 287 },
    { name: 'Kbal Chhay',        province: 'Sihanoukville', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80', color: '#2196A6', rating: '★★★☆☆', reviews: 183 },
  ],
  Temple: [
    { name: 'Angkor Wat',        province: 'Siem Reap',     image: 'https://images.unsplash.com/photo-1538964173425-93884e739ccd?w=500&q=80', color: '#4A7C59', rating: '★★★★★', reviews: 2341 },
    { name: 'Bayon Temple',      province: 'Siem Reap',     image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80', color: '#5B5EA6', rating: '★★★★★', reviews: 1654 },
    { name: 'Ta Prohm',          province: 'Siem Reap',     image: 'https://images.unsplash.com/photo-1538964173425-93884e739ccd?w=500&q=80', color: '#6B4C3B', rating: '★★★★★', reviews: 543  },
    { name: 'Preah Vihear',      province: 'Preah Vihear',  image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80', color: '#7A6030', rating: '★★★★☆', reviews: 876  },
  ],
  Nature: [
    { name: 'Yeak Laom Lake',     province: 'Ratanakiri',   image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&q=80', color: '#6B4C3B', rating: '★★★★★', reviews: 512 },
    { name: 'Cardamom Mountains', province: 'Koh Kong',     image: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=500&q=80', color: '#2D6A4F', rating: '★★★★☆', reviews: 398 },
    { name: 'Elephant Valley',    province: 'Mondulkiri',   image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80', color: '#5C7A3E', rating: '★★★★★', reviews: 445 },
    { name: 'Virachey Park',      province: 'Ratanakiri',   image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&q=80', color: '#3E6B47', rating: '★★★★☆', reviews: 198 },
  ],
  Food: [
    { name: 'Kep Crab Market',    province: 'Kep',          image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80', color: '#3D8B8B', rating: '★★★★★', reviews: 654 },
    { name: 'Phsar Thmei',        province: 'Phnom Penh',   image: 'https://images.unsplash.com/photo-1598946329549-8ac25a6c2890?w=500&q=80', color: '#3D5A80', rating: '★★★★☆', reviews: 421 },
    { name: 'Old Market SR',      province: 'Siem Reap',    image: 'https://images.unsplash.com/photo-1538964173425-93884e739ccd?w=500&q=80', color: '#4A7C59', rating: '★★★★☆', reviews: 387 },
    { name: 'Night Market Kampot',province: 'Kampot',       image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=500&q=80', color: '#5C7A3E', rating: '★★★★☆', reviews: 276 },
  ],
  Pagoda: [
    { name: 'Silver Pagoda',      province: 'Phnom Penh',   image: 'https://images.unsplash.com/photo-1598946329549-8ac25a6c2890?w=500&q=80', color: '#3D5A80', rating: '★★★★★', reviews: 987 },
    { name: 'Wat Phnom',          province: 'Phnom Penh',   image: 'https://images.unsplash.com/photo-1598946329549-8ac25a6c2890?w=500&q=80', color: '#5B5EA6', rating: '★★★★☆', reviews: 765 },
    { name: 'Phnom Sampov',       province: 'Battambang',   image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80', color: '#7A6030', rating: '★★★★☆', reviews: 312 },
    { name: 'Wat Banan',          province: 'Battambang',   image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80', color: '#6B7C3E', rating: '★★★☆☆', reviews: 156 },
  ],
  Culture: [
    { name: 'Royal Palace',       province: 'Phnom Penh',   image: 'https://images.unsplash.com/photo-1598946329549-8ac25a6c2890?w=500&q=80', color: '#3D5A80', rating: '★★★★★', reviews: 1876 },
    { name: 'Killing Fields',     province: 'Phnom Penh',   image: 'https://images.unsplash.com/photo-1598946329549-8ac25a6c2890?w=500&q=80', color: '#6B4C3B', rating: '★★★★☆', reviews: 1234 },
    { name: 'Apsara Dance Show',  province: 'Siem Reap',    image: 'https://images.unsplash.com/photo-1538964173425-93884e739ccd?w=500&q=80', color: '#4A7C59', rating: '★★★★★', reviews: 987  },
    { name: 'Phare Circus',       province: 'Battambang',   image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80', color: '#2196A6', rating: '★★★★★', reviews: 432  },
  ],
}

const BADGE_COLORS: Record<string, string> = {
  Sea: 'rgba(33,150,166,.9)', Waterfall: 'rgba(45,106,143,.9)', Temple: 'rgba(107,80,40,.9)',
  Nature: 'rgba(45,106,79,.9)', Food: 'rgba(150,100,30,.9)', Pagoda: 'rgba(91,94,166,.9)', Culture: 'rgba(107,76,59,.9)',
}

export default defineComponent({
  name: 'BrowseCategory',
  props: {
    fetchAttractions: {
      type: Function as PropType<(category: string, province?: string) => Promise<Attraction[]>>,
      default: null,
    },
  },
  setup(props) {
    const activeCat  = ref('Sea')
    const activeProv = ref('All')
    const catLoading = ref(false)
    const liveItems  = ref<DisplayItem[]>([])

    const categories = [
      { name: 'Sea',       icon: '🌊' },
      { name: 'Waterfall', icon: '💧' },
      { name: 'Temple',    icon: '🏛️' },
      { name: 'Nature',    icon: '🌿' },
      { name: 'Food',      icon: '🍜' },
      { name: 'Pagoda',    icon: '🕌' },
      { name: 'Culture',   icon: '🎎' },
    ]

    function getAttractionImage(a: Attraction): string {
      return a.image_url
          || a.province?.main_image_url
          || 'https://images.unsplash.com/photo-1538964173425-93884e739ccd?w=500&q=80'
    }

    function mapAttraction(a: Attraction): DisplayItem {
      const rating = Math.min(Math.round(Number(a.average_rating) || 0), 5)
      return {
        id:       a.id,
        name:     a.name_en,
        province: a.province?.name_en ?? '',
        image:    getAttractionImage(a),
        color:    '#4A7C59',
        rating:   STAR_MAP[rating] as string || '★★★☆☆',
        reviews:  (a as any).review_count || 0,
      }
    }

    async function fetchCategory(cat: string, prov?: string) {
      if (!props.fetchAttractions) { liveItems.value = []; return }
      catLoading.value = true
      try {
        const results = await props.fetchAttractions(cat, prov)
        liveItems.value = results.map(mapAttraction)
      } catch {
        liveItems.value = []
      } finally {
        catLoading.value = false
      }
    }

    const baseItems = computed<DisplayItem[]>(() =>
      liveItems.value.length > 0 ? liveItems.value : (FALLBACK_DATA[activeCat.value] ?? [])
    )

    const activeProvinces = computed(() => {
      const provs = [...new Set(baseItems.value.map(i => i.province).filter(Boolean))]
      return ['All', ...provs]
    })

    const displayItems = computed(() => {
      if (activeProv.value === 'All') return baseItems.value
      return baseItems.value.filter(i => i.province === activeProv.value)
    })

    function setCategory(cat: string) {
      activeCat.value  = cat
      activeProv.value = 'All'
      fetchCategory(cat)
    }

    function badgeColor(cat: string): string {
      return BADGE_COLORS[cat] ?? 'rgba(45,106,79,.9)'
    }

    onMounted(() => fetchCategory(activeCat.value))

    watch(activeProv, (prov) => {
      fetchCategory(activeCat.value, prov === 'All' ? undefined : prov)
    })

    return {
      categories, activeCat, activeProv, activeProvinces,
      displayItems, catLoading, setCategory, badgeColor,
    }
  },
})
</script>

<style scoped>
.section { background: #1a2340; padding: 56px 48px; }
.section-head { text-align: center; margin-bottom: 32px; }
.section-title { font-family: 'Cinzel', serif; font-size: 28px; color: #fff; font-weight: 700; margin-bottom: 8px; }
.section-sub { font-size: 13.5px; color: rgba(255,255,255,0.45); }
.cat-pills { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
.cat-pill { display: inline-flex; align-items: center; gap: 6px; padding: 9px 20px; border-radius: 24px; border: 1.5px solid rgba(255,255,255,0.20); background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.68); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.18s; font-family: 'DM Sans', sans-serif; }
.cat-pill:hover { border-color: rgba(255,255,255,0.45); color: #fff; background: rgba(255,255,255,0.10); }
.cat-pill.active { background: #C8922A; border-color: #C8922A; color: #fff; }
.prov-row { display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
.prov-label { font-size: 12px; color: rgba(255,255,255,0.40); font-family: 'DM Sans', sans-serif; }
.pf-pill { padding: 5px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.55); font-size: 12px; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
.pf-pill:hover  { color: #fff; border-color: rgba(255,255,255,0.35); }
.pf-pill.active { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.40); color: #fff; }
.results-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.rc { border-radius: 12px; overflow: hidden; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.10); cursor: pointer; transition: all 0.2s; }
.rc:hover { background: rgba(255,255,255,0.10); transform: translateY(-3px); }
.rc-img { height: 170px; background-size: cover; background-position: center; position: relative; display: flex; flex-direction: column; justify-content: space-between; padding: 10px; }
.rc-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.58) 0%, transparent 60%); }
.rc-badge { position: relative; z-index: 1; align-self: flex-start; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.04em; color: #fff; }
.rc-name  { position: relative; z-index: 1; font-size: 14px; font-weight: 500; color: #fff; align-self: flex-end; text-shadow: 0 1px 6px rgba(0,0,0,0.5); }
.rc-body { padding: 11px 13px; }
.rc-prov { font-size: 11.5px; color: rgba(255,255,255,0.45); margin-bottom: 7px; }
.rc-foot { display: flex; align-items: center; justify-content: space-between; }
.rc-rating { font-size: 12px; color: #F4D58D; }
.rc-cnt    { color: rgba(255,255,255,0.30); font-weight: 400; }
.trip-btn { font-size: 11.5px; color: rgba(255,255,255,0.60); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); padding: 4px 11px; border-radius: 20px; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
.trip-btn:hover { background: #2D6A4F; border-color: #2D6A4F; color: #fff; }
.see-all-row { text-align: center; margin-top: 28px; }
.see-all-link { font-size: 14px; color: #F4D58D; text-decoration: none; border-bottom: 1px solid rgba(244,213,141,0.40); padding-bottom: 2px; }
.see-all-link:hover { border-color: #F4D58D; }
.skeleton { pointer-events: none; }
.sk-img  { height: 170px; background: linear-gradient(90deg, rgba(255,255,255,.06) 25%, rgba(255,255,255,.12) 50%, rgba(255,255,255,.06) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.sk-line { height: 11px; border-radius: 4px; background: linear-gradient(90deg, rgba(255,255,255,.06) 25%, rgba(255,255,255,.12) 50%, rgba(255,255,255,.06) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
@media (max-width: 1024px) { .results-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 640px)  { .section { padding: 36px 20px; } .results-grid { grid-template-columns: repeat(2,1fr); gap: 10px; } .rc-img { height: 130px; } }
</style>