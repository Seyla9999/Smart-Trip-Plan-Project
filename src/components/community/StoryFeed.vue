<template>
  <section class="story-feed">

    <!-- Composer -->
    <StoryComposer :categories="categories" @submit="emit('submitStory', $event)" />

    <!-- Featured story -->
    <div v-if="featuredStory" class="story-feed__section">
      <div class="story-feed__heading">
        <div class="story-feed__heading-left">
          <span class="section-eyebrow">
            <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#C8922A"/></svg>
            Featured
          </span>
          <h2 class="section-title">Top Story</h2>
          <p class="section-sub">The strongest match based on your current filters.</p>
        </div>
      </div>

      <StoryCard
        :id="featuredStory.id"
        :title="featuredStory.title"
        :images="featuredStory.images"
        :category="featuredStory.category"
        :location="featuredStory.location"
        :likes="featuredStory.likes"
        :comments="featuredStory.comments"
        :author="featuredStory.author"
        :excerpt="featuredStory.excerpt"
        :rating="featuredStory.rating"
        :published-at="featuredStory.publishedAt"
        :liked="featuredStory.liked"
        featured
        @toggle-like="emit('toggleLike', $event)"
      />
    </div>

    <!-- Community posts grid -->
    <div class="story-feed__section">
      <div class="story-feed__heading">
        <div class="story-feed__heading-left">
          <span class="section-eyebrow">
            <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#2A9D8F"/></svg>
            Community
          </span>
          <h2 class="section-title">All Stories</h2>
          <p class="section-sub">Recent journeys, quick reviews, and practical travel notes.</p>
        </div>
        <span class="story-feed__count">{{ stories.length }} {{ stories.length === 1 ? 'story' : 'stories' }}</span>
      </div>

      <div v-if="stories.length" class="story-feed__grid">
        <StoryCard
          v-for="story in stories"
          :key="story.id"
          :id="story.id"
          :title="story.title"
          :images="story.images"
          :category="story.category"
          :location="story.location"
          :likes="story.likes"
          :comments="story.comments"
          :author="story.author"
          :excerpt="story.excerpt"
          :rating="story.rating"
          :published-at="story.publishedAt"
          :liked="story.liked"
          @toggle-like="emit('toggleLike', $event)"
        />
      </div>

      <div v-else class="story-feed__empty">
        <div class="empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <h3>No stories match this filter yet.</h3>
        <p>Try a different category, reset search, or be the first to post in this topic.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import StoryComposer from '@/components/community/StoryComposer.vue'
import StoryCard from '@/components/community/StoryCard.vue'
import type {
  CommunityStory,
  ComposerSubmission,
  StoryCategory,
} from '@/data/community'

defineProps<{
  featuredStory: CommunityStory | null
  stories: CommunityStory[]
  categories: StoryCategory[]
}>()

const emit = defineEmits<{
  submitStory: [payload: ComposerSubmission]
  toggleLike:  [id: string]
}>()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Cinzel:wght@500;600&display=swap');

.story-feed {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.story-feed__section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Heading row */
.story-feed__heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.story-feed__heading-left { display: flex; flex-direction: column; gap: 3px; }

.section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9896A8;
}

.section-title {
  font-family: 'Cinzel', serif;
  font-size: 20px;
  font-weight: 600;
  color: #1A1A2E;
  margin: 0;
}

.section-sub {
  font-size: 13px;
  color: #9896A8;
  margin: 0;
}

.story-feed__count {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 999px;
  background: #F8F6F1;
  border: 1px solid #E8E2D6;
  font-size: 12px;
  font-weight: 600;
  color: #5A5A72;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Grid */
.story-feed__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
@media (max-width: 760px) {
  .story-feed__grid { grid-template-columns: 1fr; }
}

/* Empty state */
.story-feed__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 52px 32px;
  border: 1.5px dashed #D4CBBA;
  border-radius: 16px;
  background: #FDFAF4;
  text-align: center;
}
.empty-icon {
  width: 60px; height: 60px;
  border-radius: 50%;
  background: #E6F5F4;
  border: 1.5px solid #2A9D8F;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2A9D8F;
  margin-bottom: 4px;
}
.story-feed__empty h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1A1A2E;
}
.story-feed__empty p {
  margin: 0;
  font-size: 13px;
  color: #9896A8;
  max-width: 300px;
  line-height: 1.6;
}
</style>