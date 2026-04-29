<template>
  <section class="section">
    <div class="section-head">
      <div>
        <h2 class="section-title">Traveler Stories</h2>
        <p class="section-sub">Real experiences from our community</p>
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
              <div class="sk-line" style="width:40%;height:10px;margin-bottom:8px" />
              <div class="sk-line" style="width:90%;height:13px;margin-bottom:5px" />
              <div class="sk-line" style="width:70%;height:13px" />
            </div>
          </div>
        </template>

        <template v-else-if="stories.length > 0">
          <div
            v-for="s in stories"
            :key="s.id"
            class="scard"
            @click="$router.push(`/community/${s.id}`)"
          >

            <div
              class="scard-img"
              :style="{
                backgroundImage: s.attachments?.[0]?.url
                  ? `url(${s.attachments[0].url})`
                  : `url(https://images.unsplash.com/photo-1538964173425-93884e739ccd?w=400&q=70)`,
                backgroundColor: '#4A7C59',
              }"
            >
              <div class="scard-overlay" />
              <div class="scard-author">

                <div class="scard-av" :style="{ background: avatarColor(s.user_id) }">
                  <img v-if="s.user_avatar" :src="s.user_avatar" :alt="s.user_name" class="av-img" />
                  <span v-else>{{ initials(s.user_name) }}</span>
                </div>
                <span class="scard-aname">{{ s.user_name }}</span>
              </div>
            </div>
            <div class="scard-body">
              <div class="scard-date">{{ formatDate(s.created_at) }}</div>
              <div class="scard-title">{{ s.title }}</div>
            </div>
          </div>
        </template>

        <template v-else>
          <div
            v-for="s in staticStories"
            :key="s.title"
            class="scard"
            @click="$router.push('/community')"
          >
            <div class="scard-img" :style="{ backgroundImage:`url(${s.image})`, backgroundColor:s.color }">
              <div class="scard-overlay" />
              <div class="scard-author">
                <div class="scard-av" :style="{ background: s.avColor }">{{ s.initials }}</div>
                <span class="scard-aname">{{ s.author }}</span>
              </div>
            </div>
            <div class="scard-body">
              <div class="scard-date">{{ s.prov }}</div>
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

    function initials(name: string): string {
      return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
    }

    function formatDate(dateStr: string): string {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    }

    // Give each user a consistent color based on their id
    const colors = ['#1D3557','#C8922A','#5C4B8A','#2D6A4F','#AE2012','#3D5A80']
    function avatarColor(userId: string): string {
      const idx = userId?.charCodeAt(0) % colors.length || 0
      return colors[idx]
    }

    const staticStories = [
      { title:'A day at Siem Reap — more than just Angkor Wat', prov:'Siem Reap', author:'Sophea Ros', initials:'SR', avColor:'#C8922A', image:'https://images.unsplash.com/photo-1538964173425-93884e739ccd?w=400&q=70', color:'#4A7C59', rating:'★★★★★', likes:284 },
      { title:'Island hopping in Sihanoukville',                prov:'Sihanoukville', author:'Dara Noun', initials:'DN', avColor:'#1D3557', image:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70', color:'#2196A6', rating:'★★★★☆', likes:197 },
      { title:'Tatai Waterfall with friends — best trip ever',  prov:'Koh Kong',  author:'Lina Vong', initials:'LV', avColor:'#5C4B8A', image:'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&q=70', color:'#2D6A4F', rating:'★★★★★', likes:156 },
      { title:'Bokor Hill Station — misty roads and old ruins', prov:'Kampot',    author:'Kanha Sok', initials:'KS', avColor:'#2D6A4F', image:'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&q=70', color:'#5C7A3E', rating:'★★★★☆', likes:143 },
    ]

    return { track, scroll, initials, formatDate, avatarColor, staticStories }
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
.left{left:-14px;} .right{right:-14px;}
.scard { flex-shrink:0; width:235px; background:#fff; border-radius:12px; overflow:hidden; border:1px solid #E0DDD6; cursor:pointer; transition:transform .2s; scroll-snap-align:start; }
.scard:hover { transform:translateY(-2px); }
.scard-img { height:155px; background-size:cover; background-position:center; position:relative; display:flex; flex-direction:column; justify-content:flex-end; padding:10px; }
.scard-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,.62) 0%,transparent 50%); }
.scard-author { position:relative; z-index:1; display:flex; align-items:center; gap:7px; }
.scard-av { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#fff; border:2px solid rgba(255,255,255,.4); flex-shrink:0; overflow:hidden; }
.av-img   { width:100%; height:100%; object-fit:cover; }
.scard-aname { font-size:11.5px; color:#fff; font-weight:500; }
.scard-body  { padding:12px 14px; }
.scard-date  { font-size:10.5px; color:#6B6B6B; margin-bottom:5px; }
.scard-title { font-size:13px; font-weight:500; color:#1A1A1A; margin-bottom:8px; line-height:1.45; }
.scard-foot  { display:flex; justify-content:space-between; font-size:12px; }
.scard-rating { color:#C8922A; }
.scard-likes  { color:#6B6B6B; }

.skeleton .sk-img  { height:155px; background:linear-gradient(90deg,#E8E5E0 25%,#F0EDE8 50%,#E8E5E0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
.sk-line { border-radius:4px; background:linear-gradient(90deg,#E8E5E0 25%,#F0EDE8 50%,#E8E5E0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@media(max-width:768px) { .section{padding:36px 20px;} }
</style>