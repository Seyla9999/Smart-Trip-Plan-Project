<template>
  <section class="hero">
    <div
      v-for="(slide, i) in slides"
      :key="i"
      class="hero-bg"
      :class="{ active: i === current }"
      :style="{ backgroundImage: `url(${slide.image})` }"
    />

    <div class="hero-overlay" />
    <div class="hero-stats">
      <div class="stat-card">
        <div class="stat-num">25</div>
        <div class="stat-label">Provinces</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">400+</div>
        <div class="stat-label">Attractions</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">2.1k</div>
        <div class="stat-label">Travelers</div>
      </div>
    </div>

    <div class="hero-content">
      <span class="hero-tag">{{ slides[current].tag }}</span>
      <h1 class="hero-title">{{ slides[current].title }}</h1>
      <p class="hero-sub">{{ slides[current].subtitle }}</p>
    </div>

    <div class="hero-dots">
      <span
        v-for="(_, i) in slides"
        :key="i"
        class="dot"
        :class="{ active: i === current }"
        @click="current = i"
      />
    </div>

  </section>
  <div class="search-section">
    <div class="search-box">

      <div class="sf">
        <div class="sf-label">DESTINATION</div>
        <select v-model="destination" class="sf-sel">
          <option value="">Select Province...</option>
          <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>

      <div class="sf-div" />

      <div class="sf">
        <div class="sf-label">TRAVEL DATES</div>
        <input v-model="dates" type="text" class="sf-in" placeholder="Pick Date" />
        <div class="sf-opt">Optional</div>
      </div>

      <div class="sf-div" />

      <div class="sf">
        <div class="sf-label">TRAVEL TYPE</div>
        <select v-model="travelType" class="sf-sel">
          <option value="">Solo/Friends/Family</option>
          <option value="solo">Solo</option>
          <option value="friends">Friends</option>
          <option value="family">Family</option>
        </select>
        <div class="sf-opt">Optional</div>
      </div>

      <button class="search-btn" @click="doSearch">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Search
      </button>
    </div>

    <div class="quick-tags">
      <span class="q-label">QUICK SEARCH</span>
      <span v-for="tag in quickTags" :key="tag" class="q-tag" @click="quickSearch(tag)">{{ tag }}</span>
    </div>
    <p class="guest-note">
      Not logged in? Browse freely.
      <a href="/register">Sign up</a> to save trips &amp; invite friends.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted } from 'vue'

export default defineComponent({
  name: 'HeroSection',
  setup() {
    const current     = ref(0)
    const destination = ref('')
    const dates       = ref('')
    const travelType  = ref('')

    /*
      HOW TO USE YOUR OWN LOCAL PHOTOS:
      ─────────────────────────────────
      1. Create this folder structure inside your project:
           public/
           └── hero/
               ├── hero1.jpg   (main slide — e.g. Angkor Wat)
               ├── hero2.jpg   (second slide — e.g. beach)
               └── hero3.jpg   (third slide — e.g. jungle/mountain)

      2. Then change the image paths below to:
           image: '/hero/hero1.jpg'
           image: '/hero/hero2.jpg'
           image: '/hero/hero3.jpg'

      For province photos you can do the same:
           public/
           └── provinces/
               ├── siem-reap.jpg
               ├── phnom-penh.jpg
               └── koh-kong.jpg
      Then use: image: '/provinces/siem-reap.jpg'

      Files in /public are served directly — no import needed!
    */
    const slides = [
      {
        image:    '/hero/hero1.jpg',
        tag:      'Discover Cambodia',
        title:    'Explore Every Corner of Cambodia',
        subtitle: 'From the misty mountains of Mondulkiri to the pristine shores of Koh Rong, embark on a journey through the heart of the Kingdom of Wonder.',
      },
      {

        image:    '/hero/hero2.jpg',
        tag:      'Ancient Temples',
        title:    'Discover Siem Reap & Angkor Wat',
        subtitle: 'Walk through centuries of Khmer history among the world\'s most spectacular temple complexes.',
      },
      {
        image:    '/hero/hero3.jpg',
        tag:      'Beaches & Islands',
        title:    'Explore Hidden Coastal Gems',
        subtitle: 'Pristine beaches and untouched islands await you along Cambodia\'s beautiful coastline.',
      },
    ]

    const timer = setInterval(() => {
      current.value = (current.value + 1) % slides.length
    }, 5000)
    onUnmounted(() => clearInterval(timer))

    const provinces = [
      'Siem Reap','Phnom Penh','Koh Kong','Kampot','Sihanoukville',
      'Ratanakiri','Mondulkiri','Battambang','Kratié','Kep',
      'Preah Vihear','Takéo','Kandal','Kampong Cham','Stung Treng',
      'Prey Veng','Svay Rieng','Pursat','Pailin','Kampong Thom',
      'Kampong Chhnang','Kampong Speu','Banteay Meanchey','Oddar Meanchey','Tbong Khmum',
    ]

    const quickTags = ['Angkor Wat', 'Kampot', 'Koh Kong', 'Phnom Penh', 'Kampot river']

    function doSearch() {
      if (!destination.value) {
        alert('Please select a destination province first!')
        return
      }
      window.location.href = `/discover?province=${encodeURIComponent(destination.value)}&type=${travelType.value}`
    }

    function quickSearch(tag: string) {
      destination.value = tag
      window.location.href = `/discover?province=${encodeURIComponent(tag)}`
    }

    return { current, slides, destination, dates, travelType, provinces, quickTags, doSearch, quickSearch }
  }
})
</script>

<style scoped>
.hero {
  position: relative;
  height: 90vh;
  min-height: 580px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
  z-index: 0;
}
.hero-bg.active {
  opacity: 1;
  z-index: 1;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(
    to bottom,
    rgba(10,20,40,0.05)  0%,
    rgba(10,20,40,0.00) 20%,
    rgba(10,20,40,0.45) 55%,
    rgba(10,20,40,0.93) 100%
  );
}

.hero-stats {
  position: absolute;
  top: 28px;
  right: 48px;
  z-index: 4;
  display: flex;
  gap: 10px;
}
.stat-card {
  background: rgba(0,0,0,0.42);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  padding: 10px 20px;
  text-align: center;
  backdrop-filter: blur(6px);
}
.stat-num   { font-family:'Cinzel',serif; font-size:22px; color:#F4D58D; font-weight:700; line-height:1; }
.stat-label { font-size:10px; color:rgba(255,255,255,0.45); margin-top:3px; letter-spacing:.05em; text-transform:uppercase; }

.hero-content {
  position: relative;
  z-index: 4;
  padding: 0 60px 50px;
}
.hero-tag {
  display: inline-flex;
  align-items: center;
  background: rgba(200,146,42,0.20);
  border: 1px solid rgba(200,146,42,0.55);
  color: #F4D58D;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 18px;
}
.hero-title {
  font-family: 'Cinzel', serif;
  font-size: 54px;
  line-height: 1.12;
  color: #fff;
  margin: 0 0 16px;
  max-width: 680px;
  text-shadow: 0 2px 28px rgba(0,0,0,0.5);
}
.hero-sub {
  font-size: 16px;
  color: rgba(255,255,255,0.68);
  line-height: 1.75;
  font-weight: 300;
  max-width: 540px;
  margin: 0;
}
.hero-dots {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  gap: 8px;
  align-items: center;
}
.dot {
  width: 28px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255,255,255,0.32);
  cursor: pointer;
  transition: all .25s ease;
}
.dot.active { background: #C8922A; width: 42px; }
.search-section {
  background: linear-gradient(to bottom, rgba(10,20,40,0.97), rgba(10,20,40,0.90));
  padding: 26px 60px 30px;
}
.search-box {
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 12px;
  padding: 6px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.28);
}

.sf {
  flex: 1;                  
  display: flex;
  flex-direction: column;
  padding: 10px 20px;
  border-radius: 9px;
  min-width: 0;
  transition: background .15s;
}
.sf:hover { background: #F7F7F4; }

.sf-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: .10em;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 5px;
}
.sf-sel,
.sf-in {
  font-size: 14px;
  color: #1A1A1A;
  border: none;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  background: transparent;
  padding: 0;
  width: 100%;
  cursor: pointer;
}
.sf-opt { font-size: 10.5px; color: #C0BEB8; margin-top: 3px; }

.sf-div {
  width: 1px;
  background: #E8E8E8;
  margin: 12px 0;
  flex-shrink: 0;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  flex-shrink: 0;           
  background: #1a2340;
  color: #fff;
  border: none;
  border-radius: 9px;
  padding: 0 32px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin: 4px;
  transition: background .2s;
}
.search-btn:hover { background: #2D6A4F; }

.quick-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
}
.q-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
}
.q-tag {
  background: rgba(255,255,255,0.09);
  border: 1px solid rgba(255,255,255,0.20);
  color: rgba(255,255,255,0.70);
  font-size: 12px;
  padding: 5px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all .15s;
  font-family: 'DM Sans', sans-serif;
}
.q-tag:hover { background: rgba(255,255,255,0.18); color: #fff; }

.guest-note { font-size:11.5px; color:rgba(255,255,255,0.28); margin-top:10px; }
.guest-note a { color:#F4D58D; text-decoration:none; }
.guest-note a:hover { text-decoration:underline; }

@media (max-width: 1200px) {
  .hero-title { font-size: 40px; }
}
@media (max-width: 768px) {
  .hero          { height: 72vh; min-height: 460px; }
  .hero-title    { font-size: 28px; max-width: 100%; }
  .hero-content  { padding: 0 20px 40px; }
  .hero-stats    { top:12px; right:12px; gap:6px; }
  .stat-card     { padding:7px 11px; }
  .stat-num      { font-size:16px; }
  .search-section { padding:16px 20px 20px; }
  .search-box    { flex-direction: column; }
  .sf-div        { width:100%; height:1px; margin:0; }
  .search-btn    { margin:8px 4px 4px; padding:12px; justify-content:center; border-radius:8px; }
}
</style>