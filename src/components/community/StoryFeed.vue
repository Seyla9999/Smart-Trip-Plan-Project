<template>
  <section class="story-feed">
    <StoryComposer :categories="categories" @submit="emit('submitStory', $event)" />

    <div v-if="featuredStory" class="story-feed__section">
      <div class="story-feed__heading">
        <div>
          <h2>Featured story</h2>
          <p>The strongest match based on your current filters.</p>
        </div>
      </div>

      <StoryCard
        :id="featuredStory.id"
        :title="featuredStory.title"
        :image="featuredStory.image"
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

    <div class="story-feed__section">
      <div class="story-feed__heading">
        <div>
          <h2>Community posts</h2>
          <p>Recent journeys, quick reviews, and practical travel notes.</p>
        </div>
        <span class="story-feed__count">{{ stories.length }} stories</span>
      </div>

      <div v-if="stories.length" class="story-feed__grid">
        <StoryCard
          v-for="story in stories"
          :key="story.id"
          :id="story.id"
          :title="story.title"
          :image="story.image"
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
        <h3>No stories match this filter yet.</h3>
        <p>Try a different category, reset search, or publish the first post in this topic.</p>
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
  toggleLike: [id: string]
}>()
</script>

<style scoped>
.story-feed {
  display: grid;
  gap: 22px;
}

.story-feed__section {
  display: grid;
  gap: 16px;
}

.story-feed__heading {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 10px;
}

.story-feed__heading h2 {
  margin: 0 0 4px;
  color: #111827;
  font-family: 'Cinzel', serif;
  font-size: 24px;
}

.story-feed__heading p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.story-feed__count {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.story-feed__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.story-feed__empty {
  padding: 28px;
  border: 1px dashed rgba(17, 24, 39, 0.16);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  text-align: center;
}

.story-feed__empty h3 {
  margin: 0 0 8px;
  color: #111827;
  font-size: 18px;
}

.story-feed__empty p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

@media (max-width: 900px) {
  .story-feed__grid {
    grid-template-columns: 1fr;
  }
}
</style>
