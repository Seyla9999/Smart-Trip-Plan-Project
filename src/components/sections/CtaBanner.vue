<template>
  <section class="cta">
    <div class="cta-bg" />
    <div class="cta-overlay" />

    <div class="cta-content">
      <h2 class="cta-title">Ready to see it all?</h2>
      <p class="cta-sub">
        Create your account, build itineraries, discover secret gems,<br />
        and share your adventures across Cambodia.
      </p>
      <div class="cta-btns">
        <a href="/register" class="btn-white">Start Your Journey</a>
        <a href="/community" class="btn-outline">Watch Travel Guide</a>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({ name: 'CtaBanner' })
</script>

<style scoped>
.cta {
  position: relative;
  padding: 100px 48px;
  text-align: center;
  overflow: hidden;
}

.cta-bg {
  position: absolute;
  inset: 0;
  background-image: url('https://images.unsplash.com/photo-1598946329549-8ac25a6c2890?w=1600&q=85');
  background-size: cover;
  background-position: center;
}

.cta-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 20, 40, 0.80);
}

.cta-content {
  position: relative;
  z-index: 1;
}

.cta-title {
  font-family: 'Cinzel', serif;
  font-size: 42px;
  color: #fff;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 2px 20px rgba(0,0,0,0.4);
}

.cta-sub {
  font-size: 16px;
  color: rgba(255,255,255,0.62);
  line-height: 1.75;
  font-weight: 300;
  margin-bottom: 36px;
}

.cta-btns {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-white {
  padding: 14px 32px;
  background: #fff;
  border: none;
  color: #1a2340;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  text-decoration: none;
  transition: opacity 0.2s;
}
.btn-white:hover { opacity: 0.90; }

.btn-outline {
  padding: 14px 32px;
  background: transparent;
  border: 1.5px solid rgba(255,255,255,0.38);
  color: rgba(255,255,255,0.88);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-outline:hover { border-color: rgba(255,255,255,0.75); color: #fff; }

@media (max-width: 768px) {
  .cta { padding: 64px 20px; }
  .cta-title { font-size: 28px; }
  .cta-sub { font-size: 14px; }
  .cta-btns { flex-direction: column; align-items: center; }
}
</style>