<template>
  <div class="hero">
    <div class="hero__bg">
      <!-- Decorative temple silhouette SVG -->
      <svg class="hero__silhouette" viewBox="0 0 1200 220" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice">
        <!-- Central tower (prasat) -->
        <path d="M580 220 L580 80 L570 70 L565 40 L575 20 L585 10 L595 20 L605 40 L600 70 L590 80 L590 220Z" fill="currentColor" opacity="0.18"/>
        <!-- Left tower -->
        <path d="M480 220 L480 110 L473 102 L469 80 L477 65 L485 55 L493 65 L501 80 L497 102 L490 110 L490 220Z" fill="currentColor" opacity="0.13"/>
        <!-- Right tower -->
        <path d="M700 220 L700 110 L693 102 L689 80 L697 65 L705 55 L713 65 L721 80 L717 102 L710 110 L710 220Z" fill="currentColor" opacity="0.13"/>
        <!-- Far left -->
        <path d="M360 220 L360 145 L355 138 L352 122 L358 112 L364 106 L370 112 L376 122 L373 138 L368 145 L368 220Z" fill="currentColor" opacity="0.09"/>
        <!-- Far right -->
        <path d="M820 220 L820 145 L815 138 L812 122 L818 112 L824 106 L830 112 L836 122 L833 138 L828 145 L828 220Z" fill="currentColor" opacity="0.09"/>
        <!-- Base platforms -->
        <rect x="550" y="170" width="80" height="8" rx="2" fill="currentColor" opacity="0.15"/>
        <rect x="540" y="178" width="100" height="8" rx="2" fill="currentColor" opacity="0.13"/>
        <rect x="530" y="186" width="120" height="34" rx="2" fill="currentColor" opacity="0.10"/>
        <rect x="450" y="190" width="80" height="30" rx="2" fill="currentColor" opacity="0.08"/>
        <rect x="660" y="190" width="80" height="30" rx="2" fill="currentColor" opacity="0.08"/>
        <!-- Ground steps -->
        <rect x="330" y="210" width="540" height="10" rx="1" fill="currentColor" opacity="0.06"/>
      </svg>
    </div>

    <div class="hero__content">
      <div class="hero__eyebrow">
        <span class="hero__eyebrow-line" />
        <span class="hero__eyebrow-text">Community Stories</span>
        <span class="hero__eyebrow-line" />
      </div>

      <h1 class="hero__title">
        Discover <span class="hero__title-accent">Cambodia</span><br />
        Through Every Traveler's Eyes
      </h1>

      <p class="hero__desc">
        Real stories, hidden gems, and honest reviews — shared by the community of travelers who've walked the same paths.
      </p>

      <div class="hero__stats">
        <div class="hero__stat">
          <span class="hero__stat-val">{{ totalStories.toLocaleString() }}</span>
          <span class="hero__stat-label">Stories</span>
        </div>
        <div class="hero__stat-div" />
        <div class="hero__stat">
          <span class="hero__stat-val">{{ activeWriters.toLocaleString() }}</span>
          <span class="hero__stat-label">Writers</span>
        </div>
        <div class="hero__stat-div" />
        <div class="hero__stat">
          <span class="hero__stat-val">25</span>
          <span class="hero__stat-label">Provinces</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalStories?: number
  activeWriters?: number
}>()

withDefaults(defineProps<{
  totalStories?: number
  activeWriters?: number
}>(), {
  totalStories: 0,
  activeWriters: 0,
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=Cinzel:wght@500;600;700&display=swap');

.hero {
  position: relative;
  background: linear-gradient(135deg, #0D1B2A 0%, #1D3557 55%, #2A4A6B 100%);
  border-radius: 20px;
  overflow: hidden;
  padding: 52px 48px 40px;
  min-height: 240px;
  display: flex;
  align-items: center;
  color: #fff;
}

.hero__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.hero__silhouette {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  min-width: 700px;
  color: #fff;
}

/* Subtle bokeh blobs */
.hero::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(200,146,42,0.18) 0%, transparent 65%);
  border-radius: 50%;
  pointer-events: none;
}
.hero::after {
  content: '';
  position: absolute;
  bottom: -80px;
  left: 10%;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(42,157,143,0.15) 0%, transparent 65%);
  border-radius: 50%;
  pointer-events: none;
}

.hero__content {
  position: relative;
  z-index: 1;
  max-width: 580px;
}

.hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.hero__eyebrow-line {
  flex: 0 0 28px;
  height: 1px;
  background: rgba(200,146,42,0.6);
}
.hero__eyebrow-text {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #C8922A;
}

.hero__title {
  font-family: 'Cinzel', serif;
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 700;
  color: #fff;
  line-height: 1.25;
  margin: 0 0 14px;
}
.hero__title-accent {
  color: #C8922A;
}

.hero__desc {
  font-size: 14px;
  font-weight: 300;
  font-style: italic;
  color: rgba(255,255,255,0.72);
  line-height: 1.65;
  margin: 0 0 24px;
  max-width: 460px;
}

.hero__stats {
  display: flex;
  align-items: center;
  gap: 20px;
}
.hero__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.hero__stat-val {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}
.hero__stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.5);
}
.hero__stat-div {
  width: 1px;
  height: 32px;
  background: rgba(255,255,255,0.15);
}

@media (max-width: 600px) {
  .hero {
    padding: 36px 24px 32px;
    border-radius: 16px;
  }
  .hero__title {
    font-size: 22px;
  }
}
</style>