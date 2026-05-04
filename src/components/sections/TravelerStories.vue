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
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="scard skeleton">
            <div class="sk-img" />
            <div class="scard-body">
              <div class="sk-line" style="width:50%;margin-bottom:8px" />
              <div class="sk-line" style="width:90%;margin-bottom:6px" />
              <div class="sk-line" style="width:70%" />
            </div>
          </div>
        </template>

        <template v-else-if="stories.length > 0">
          <div
            v-for="s in stories"
            :key="s.id"
            class="scard"
            @click="$router.push('/community')"
          >
        
            <div
              class="scard-img"
              :style="{
                backgroundImage: getStoryImage(s),
                backgroundColor: '#4A7C59',
              }"
            >
              <div class="scard-overlay" />
              <div class="scard-author">
                <div class="scard-av" :style="{ background: getAvatarColor(s.user_name) }">
                  {{ getInitials(s.user_name) }}
                </div>
                <span class="scard-aname">{{ s.user_name || 'Traveler' }}</span>
              </div>
            </div>
            <div class="scard-body">
              <div class="scard-date">{{ formatDate(s.created_at) }}</div>
              <div class="scard-title">{{ s.title }}</div>
              <div class="scard-preview">{{ truncate(s.content, 80) }}</div>
            </div>
          </div>
        </template>

        <!-- Fallback static cards when no data yet -->
        <template v-else>
          <div v-for="s in staticStories" :key="s.title" class="scard" @click="$router.push('/community')">
            <div class="scard-img" :style="{ backgroundImage: `url(${s.image})`, backgroundColor: s.color }">
              <div class="scard-overlay" />
              <div class="scard-author">
                <div class="scard-av" :style="{ background: s.avColor }">{{ s.initials }}</div>
                <span class="scard-aname">{{ s.author }}</span>
              </div>
            </div>
            <div class="scard-body">
              <div class="scard-date">{{ s.province }}</div>
              <div class="scard-title">{{ s.title }}</div>
              <div class="scard-foot">
                <span class="scard-rating">{{ s.rating }}</span>
                <span class="scard-likes">♡ {{ s.likes }}</span>
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
import { defineComponent, ref, PropType } from 'vue'
import type { Story } from '@/services/home.service'

const AVATAR_COLORS = ['#1D3557','#C8922A','#2D6A4F','#5C4B8A','#AE2012','#2196A6','#6B4C3B']

export default defineComponent({
  name: 'TravelerStories',
  props: {
    stories: { type: Array as PropType<Story[]>, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  setup() {
    const track = ref<HTMLElement | null>(null)

    function scroll(dir: number) {
      track.value?.scrollBy({ left: dir * 420, behavior: 'smooth' })
    }

    function getStoryImage(s: Story): string {
      const photo = s.attachments?.find(a =>
        a.file_type?.startsWith('image') || a.url?.match(/\.(jpg|jpeg|png|webp)/i)
      )
      const url = photo?.url || 'https://images.unsplash.com/photo-1538964173425-93884e739ccd?w=400&q=70'
      return `url(${url})`
    }

    function getInitials(name: string): string {
      if (!name) return '?'
      return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    }

    function getAvatarColor(name: string): string {
      if (!name) return AVATAR_COLORS[0]
      const idx = name.charCodeAt(0) % AVATAR_COLORS.length
      return AVATAR_COLORS[idx]
    }

    function formatDate(dateStr: string): string {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    function truncate(text: string, max: number): string {
      if (!text) return ''
      return text.length > max ? text.slice(0, max) + '...' : text
    }

    const staticStories = [
      { title: 'Cycling through the temples of Angkor at dawn', province: 'Siem Reap', image: 'https://images.unsplash.com/photo-1538964173425-93884e739ccd?w=400&q=70', color: '#4A7C59', author: 'Dara Sok', initials: 'DS', avColor: '#1D3557', rating: '★★★★★', likes: 284 },
      { title: 'A week of solitude on Koh Kong Sandkem', province: 'Koh Kong', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70', color: '#2196A6', author: 'Sophea Ros', initials: 'SR', avColor: '#C8922A', rating: '★★★★★', likes: 197 },
      { title: "Tasting my way through Siem Reap's markets", province: 'Siem Reap', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=70', color: '#7A6030', author: 'Judy Afkar', initials: 'JA', avColor: '#5C4B8A', rating: '★★★★☆', likes: 156 },
      { title: 'Ethical elephant trekking in Mondulkiri', province: 'Mondulkiri', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70', color: '#3E6B47', author: 'Susan Park', initials: 'SP', avColor: '#2D6A4F', rating: '★★★★★', likes: 209 },
      { title: 'Bokor Hill Station — misty roads and old ruins', province: 'Kampot', image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&q=70', color: '#5C7A3E', author: 'Kanha Sok', initials: 'KS', avColor: '#AE2012', rating: '★★★★☆', likes: 143 },
    ]

    return { track, scroll, getStoryImage, getInitials, getAvatarColor, formatDate, truncate, staticStories }
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
.scard-img { height: 155px; background-size: cover; background-position: center; position: relative; display: flex; flex-direction: column; justify-content: flex-end; padding: 10px; }
.scard-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.62) 0%, transparent 50%); }
.scard-author { position: relative; z-index: 1; display: flex; align-items: center; gap: 7px; }
.scard-av     { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; border: 2px solid rgba(255,255,255,.4); flex-shrink: 0; }
.scard-aname  { font-size: 11.5px; color: #fff; font-weight: 500; }

.scard-body { padding: 12px 14px; }
.scard-date   { font-size: 10.5px; color: #6B6B6B; margin-bottom: 5px; font-weight: 500; text-transform: uppercase; letter-spacing: .04em; }
.scard-title  { font-size: 13px; font-weight: 500; color: #1A1A1A; margin-bottom: 6px; line-height: 1.45; }
.scard-preview { font-size: 11.5px; color: #888; line-height: 1.5; }
.scard-foot   { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
.scard-rating { font-size: 12px; color: #C8922A; }
.scard-likes  { font-size: 12px; color: #6B6B6B; }

.skeleton .sk-img  { height: 155px; background: linear-gradient(90deg, #E8E5E0 25%, #F0EDE8 50%, #E8E5E0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.sk-line { height: 11px; border-radius: 4px; background: linear-gradient(90deg, #E8E5E0 25%, #F0EDE8 50%, #E8E5E0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }

@media (max-width: 768px) { .section { padding: 36px 20px; } }
</style>