<template>
  <section class="sidebar-card">
    <div class="sidebar-card__head">
      <h3>Top travelers</h3>
      <p>Creators sharing the most useful stories and route ideas.</p>
    </div>

    <div class="traveler-list">
      <article v-for="traveler in travelers" :key="traveler.id" class="traveler-item">
        <div class="traveler-item__profile">
          <span class="traveler-item__avatar" :style="{ background: traveler.avatarColor }">
            {{ traveler.initials }}
          </span>
          <div>
            <strong>{{ traveler.name }}</strong>
            <span>{{ traveler.handle }}</span>
            <small>{{ traveler.specialty }} · {{ traveler.trips }} trips</small>
          </div>
        </div>

        <button
          class="traveler-item__button"
          :class="{ active: traveler.followed }"
          type="button"
          @click="emit('toggleFollow', traveler.id)"
        >
          {{ traveler.followed ? 'Following' : 'Follow' }}
        </button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TopTraveler } from '@/data/community'

defineProps<{
  travelers: TopTraveler[]
}>()

const emit = defineEmits<{
  toggleFollow: [id: number]
}>()
</script>

<style scoped>
.sidebar-card {
  padding: 22px;
  border: 1px solid rgba(13, 19, 33, 0.08);
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 18px 44px rgba(18, 26, 47, 0.08);
}

.sidebar-card__head {
  margin-bottom: 16px;
}

.sidebar-card__head h3 {
  margin: 0 0 4px;
  color: #111827;
  font-family: 'Cinzel', serif;
  font-size: 22px;
}

.sidebar-card__head p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.traveler-list {
  display: grid;
  gap: 14px;
}

.traveler-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.traveler-item__profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.traveler-item__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.traveler-item__profile strong {
  display: block;
  color: #111827;
  font-size: 14px;
}

.traveler-item__profile span,
.traveler-item__profile small {
  display: block;
  color: #6b7280;
  font-size: 12px;
}

.traveler-item__button {
  min-width: 96px;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 999px;
  background: #f7f4ed;
  color: #111827;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
}

.traveler-item__button.active {
  background: rgba(45, 106, 79, 0.12);
  border-color: rgba(45, 106, 79, 0.2);
  color: #2d6a4f;
}
</style>
