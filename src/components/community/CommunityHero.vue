<template>
  <section class="community-hero">
    <div class="community-hero__inner">
      <div class="community-hero__copy">
        <span class="community-hero__eyebrow">Traveler stories from across Cambodia</span>
        <h1 class="community-hero__title">Community</h1>
        <p class="community-hero__subtitle">
          Explore honest trip notes, local tips, and favorite routes from travelers who are
          actually out there exploring. Then add your own experience to the feed.
        </p>

        <div class="community-hero__actions">
          <a href="#story-composer" class="community-hero__button">Share your story</a>
          <p class="community-hero__note">Fresh posts, practical tips, and places worth the detour.</p>
        </div>
      </div>

      <div class="community-hero__stats">
        <article v-for="stat in stats" :key="stat.label" class="community-hero__stat">
          <span class="community-hero__stat-label">{{ stat.label }}</span>
          <strong class="community-hero__stat-value">{{ stat.value }}</strong>
          <span class="community-hero__stat-hint">{{ stat.hint }}</span>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HeroStat } from '@/data/community'

defineProps<{
  stats: HeroStat[]
}>()
</script>

<style scoped>
.community-hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(200, 146, 42, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(45, 106, 79, 0.24), transparent 26%),
    linear-gradient(180deg, #0d1321 0%, #121a2f 100%);
  padding: 48px 40px 36px;
}

.community-hero__inner {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 420px);
  gap: 28px;
  align-items: end;
}

.community-hero__copy {
  max-width: 720px;
}

.community-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid rgba(244, 213, 141, 0.28);
  background: rgba(244, 213, 141, 0.08);
  color: #f4d58d;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.community-hero__title {
  margin: 18px 0 12px;
  color: #fff;
  font-family: 'Cinzel', serif;
  font-size: 52px;
  line-height: 1;
}

.community-hero__subtitle {
  margin: 0;
  max-width: 620px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 16px;
  line-height: 1.8;
}

.community-hero__actions {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.community-hero__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 24px;
  border-radius: 12px;
  background: #c8922a;
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.community-hero__button:hover {
  background: #b07820;
  transform: translateY(-1px);
}

.community-hero__note {
  margin: 0;
  color: rgba(255, 255, 255, 0.52);
  font-size: 13px;
}

.community-hero__stats {
  display: grid;
  gap: 12px;
}

.community-hero__stat {
  padding: 18px 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
}

.community-hero__stat-label {
  display: block;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.community-hero__stat-value {
  display: block;
  color: #fff;
  font-family: 'Cinzel', serif;
  font-size: 30px;
  line-height: 1;
}

.community-hero__stat-hint {
  display: block;
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 960px) {
  .community-hero__inner {
    grid-template-columns: 1fr;
  }

  .community-hero__title {
    font-size: 40px;
  }
}

@media (max-width: 640px) {
  .community-hero {
    padding: 36px 20px 28px;
  }

  .community-hero__title {
    font-size: 32px;
  }

  .community-hero__subtitle {
    font-size: 14px;
  }
}
</style>
