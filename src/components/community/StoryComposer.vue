<template>
  <section id="story-composer" class="composer">
    <div class="composer__head">
      <div>
        <h2 class="composer__title">Share your experience</h2>
        <p class="composer__sub">
          Drop a quick recap, tag the place, and show people what made the trip memorable.
        </p>
      </div>
      <span class="composer__badge">Connected to Supabase</span>
    </div>

    <div class="composer__fields">
      <input
        v-model="title"
        class="composer__input"
        type="text"
        maxlength="90"
        placeholder="Story title"
        aria-label="Story title"
      />

      <textarea
        v-model="body"
        class="composer__textarea"
        rows="5"
        maxlength="340"
        placeholder="Share your experience, favorite moment, and any tips for the next traveler."
        aria-label="Story description"
      />

      <div class="composer__meta">
        <select v-model="category" class="composer__select" aria-label="Story category">
          <option v-for="option in categories" :key="option" :value="option">{{ option }}</option>
        </select>

        <input
          v-model="location"
          class="composer__input"
          type="text"
          maxlength="60"
          placeholder="Tag a place"
          aria-label="Story location"
        />

        <select v-model.number="rating" class="composer__select" aria-label="Story rating">
          <option :value="5">Rate trip: 5/5</option>
          <option :value="4">Rate trip: 4/5</option>
          <option :value="3">Rate trip: 3/5</option>
          <option :value="2">Rate trip: 2/5</option>
          <option :value="1">Rate trip: 1/5</option>
        </select>
      </div>

      <div class="composer__actions">
        <label class="composer__upload">
          <input type="file" accept="image/*" :disabled="uploading" @change="handlePhotoChange" />
          <span>Photo</span>
          <small>{{ uploading ? 'Uploading…' : photoName || 'Add cover image' }}</small>
        </label>

        <label class="composer__upload">
          <input type="file" accept="video/*" @change="handleVideoChange" />
          <span>Video</span>
          <small>{{ videoName || 'Attach clip' }}</small>
        </label>

        <button
          class="composer__submit"
          type="button"
          :disabled="!canSubmit"
          @click="submitStory"
        >
          Publish story
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ComposerSubmission, StoryCategory } from '@/data/community'
import { uploadImage } from '@/lib/supabase'

const props = defineProps<{
  categories: StoryCategory[]
}>()

const emit = defineEmits<{
  submit: [payload: ComposerSubmission]
}>()

const title = ref('')
const body = ref('')
const location = ref('')
const rating = ref(5)
const category = ref<StoryCategory>(props.categories[0] ?? 'Natural')
const photoName = ref('')
const photoUrl = ref<string | undefined>()
const videoName = ref('')
const uploading = ref(false)

const canSubmit = computed(
  () => title.value.trim().length > 0 && body.value.trim().length > 0 && !uploading.value,
)

async function handlePhotoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  photoName.value = file.name
  uploading.value = true

  try {
    // Upload directly to Supabase Storage and get back the public URL
    const url = await uploadImage(file, 'story-images')
    photoUrl.value = url ?? undefined
  } catch {
    // Fallback: use a local object URL if Supabase Storage is unavailable
    photoUrl.value = URL.createObjectURL(file)
  } finally {
    uploading.value = false
  }
}

function handleVideoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  videoName.value = file.name
}

function submitStory() {
  if (!canSubmit.value) return

  emit('submit', {
    title: title.value.trim(),
    body: body.value.trim(),
    category: category.value,
    location: location.value.trim(),
    rating: rating.value,
    photoName: photoName.value,
    photoUrl: photoUrl.value,
    videoName: videoName.value,
  })

  title.value = ''
  body.value = ''
  location.value = ''
  rating.value = 5
  category.value = props.categories[0] ?? 'Natural'
  photoName.value = ''
  photoUrl.value = undefined
  videoName.value = ''
}
</script>

<style scoped>
.composer {
  padding: 24px;
  border: 1px solid rgba(13, 19, 33, 0.08);
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 247, 239, 0.94));
  box-shadow: 0 24px 70px rgba(18, 26, 47, 0.08);
}

.composer__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.composer__title {
  margin: 0 0 4px;
  color: #111827;
  font-family: 'Cinzel', serif;
  font-size: 24px;
}

.composer__sub {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.composer__badge {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(45, 106, 79, 0.08);
  color: #2d6a4f;
  font-size: 12px;
  font-weight: 700;
}

.composer__fields {
  display: grid;
  gap: 14px;
}

.composer__input,
.composer__textarea,
.composer__select {
  width: 100%;
  border: 1px solid #e6e1d5;
  border-radius: 16px;
  background: #fff;
  color: #111827;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.composer__input,
.composer__select {
  min-height: 50px;
  padding: 0 16px;
}

.composer__textarea {
  padding: 14px 16px;
  resize: vertical;
  min-height: 150px;
}

.composer__input:focus,
.composer__textarea:focus,
.composer__select:focus {
  border-color: rgba(200, 146, 42, 0.8);
  box-shadow: 0 0 0 4px rgba(200, 146, 42, 0.12);
}

.composer__meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.composer__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.composer__upload {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  justify-content: center;
  min-height: 64px;
  padding: 12px 16px;
  border: 1px dashed #c9bea8;
  border-radius: 18px;
  background: rgba(244, 213, 141, 0.08);
  cursor: pointer;
}

.composer__upload input {
  display: none;
}

.composer__upload span {
  color: #111827;
  font-size: 13px;
  font-weight: 700;
}

.composer__upload small {
  color: #6b7280;
  font-size: 12px;
}

.composer__submit {
  min-width: 180px;
  min-height: 64px;
  padding: 0 22px;
  border: none;
  border-radius: 18px;
  background: #1a2340;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.18s ease,
    transform 0.18s ease;
}

.composer__submit:hover:not(:disabled) {
  background: #2d6a4f;
  transform: translateY(-1px);
}

.composer__submit:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 768px) {
  .composer {
    padding: 20px;
  }

  .composer__meta {
    grid-template-columns: 1fr;
  }

  .composer__submit {
    width: 100%;
  }
}
</style>
