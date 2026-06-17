<template>
  <section id="story-composer" class="composer">
    <div class="composer__head">
      <div class="composer__head-text">
        <span class="composer__eyebrow">
          <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#2A9D8F"/></svg>
          Connected to Supabase
        </span>
        <h2 class="composer__title">Share Your Experience</h2>
        <p class="composer__sub">
          Drop a quick recap, tag the place, and show people what made Cambodia memorable.
        </p>
      </div>
    </div>

    <div class="composer__fields">
      <input
        v-model="title"
        class="composer__input"
        type="text"
        maxlength="90"
        placeholder="Give your story a headline…"
        aria-label="Story title"
      />

      <textarea
        v-model="body"
        class="composer__textarea"
        rows="5"
        maxlength="340"
        placeholder="Share your experience, favourite moment, or any tips for the next traveler…"
        aria-label="Story description"
      />

      <div class="composer__meta">
        <div class="field-wrap">
          <label class="field-label">Category</label>
          <div class="select-wrap">
            <select v-model="category" class="composer__select" aria-label="Category">
              <option v-for="opt in categories" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <svg class="select-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div class="field-wrap">
          <label class="field-label">Location</label>
          <div class="input-icon-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <input
              v-model="location"
              class="composer__input icon-input"
              type="text"
              maxlength="60"
              placeholder="Province or landmark"
              aria-label="Location"
            />
          </div>
        </div>

        <div class="field-wrap">
          <label class="field-label">Rating</label>
          <div class="stars-row">
            <button
              v-for="n in 5"
              :key="n"
              class="star-btn"
              :class="{ on: n <= rating }"
              type="button"
              @click="rating = n"
              :aria-label="`Rate ${n} out of 5`"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" :fill="n <= rating ? '#C8922A' : 'none'" stroke="#C8922A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </button>
            <span class="rating-label">{{ rating }}/5</span>
          </div>
        </div>
      </div>

      <!-- Media row -->
      <div class="composer__media">
        <label class="media-btn" :class="{ uploading }">
          <input type="file" accept="image/*" :disabled="uploading" @change="handlePhotoChange" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span>{{ uploading ? 'Uploading…' : photoName || 'Add Photo' }}</span>
        </label>

        <label class="media-btn">
          <input type="file" accept="video/*" @change="handleVideoChange" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          <span>{{ videoName || 'Add Video' }}</span>
        </label>

        <div class="composer__spacer" />

        <button
          class="composer__submit"
          type="button"
          :disabled="!canSubmit"
          @click="submitStory"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Publish Story
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

const title    = ref('')
const body     = ref('')
const location = ref('')
const rating   = ref(5)
const category = ref<StoryCategory>(props.categories[0] ?? 'Natural')
const photoName = ref('')
const photoUrl  = ref<string | undefined>()
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
    const url = await uploadImage(file, 'story-images')
    photoUrl.value = url ?? undefined
  } catch {
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
    title:     title.value.trim(),
    body:      body.value.trim(),
    category:  category.value,
    location:  location.value.trim(),
    rating:    rating.value,
    photoName: photoName.value,
    photoUrl:  photoUrl.value,
    videoName: videoName.value,
  })
  title.value    = ''
  body.value     = ''
  location.value = ''
  rating.value   = 5
  category.value = props.categories[0] ?? 'Natural'
  photoName.value = ''
  photoUrl.value  = undefined
  videoName.value = ''
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Cinzel:wght@500;600&display=swap');

.composer {
  background: #ffffff;
  border: 1px solid #E8E2D6;
  border-radius: 16px;
  padding: 24px 26px 22px;
  box-shadow: 0 2px 12px rgba(26,26,46,0.07);
}

/* Head */
.composer__head { margin-bottom: 20px; }
.composer__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #2A9D8F;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.composer__title {
  margin: 0 0 4px;
  font-family: 'Cinzel', serif;
  font-size: 20px;
  font-weight: 600;
  color: #1A1A2E;
}
.composer__sub {
  margin: 0;
  color: #5A5A72;
  font-size: 13px;
  line-height: 1.6;
}

/* Fields */
.composer__fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.composer__input,
.composer__textarea,
.composer__select {
  width: 100%;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #1A1A2E;
  background: #F8F6F1;
  border: 1px solid #E8E2D6;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
  box-sizing: border-box;
}
.composer__input,
.composer__select {
  height: 44px;
  padding: 0 14px;
  border-radius: 10px;
}
.composer__textarea {
  padding: 12px 14px;
  border-radius: 10px;
  resize: vertical;
  min-height: 130px;
  line-height: 1.65;
}
.composer__input::placeholder,
.composer__textarea::placeholder { color: #9896A8; }
.composer__input:focus,
.composer__textarea:focus,
.composer__select:focus {
  border-color: #2A9D8F;
  box-shadow: 0 0 0 3px #E6F5F4;
  background: #fff;
}

/* Meta row */
.composer__meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 680px) {
  .composer__meta { grid-template-columns: 1fr; }
}

.field-wrap { display: flex; flex-direction: column; gap: 5px; }
.field-label {
  font-size: 11px;
  font-weight: 600;
  color: #9896A8;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

/* Select wrap */
.select-wrap { position: relative; }
.select-wrap .composer__select {
  appearance: none;
  padding-right: 32px;
  cursor: pointer;
}
.select-chevron {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9896A8;
  pointer-events: none;
}

/* Location input with icon */
.input-icon-wrap { position: relative; }
.input-icon-wrap svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9896A8;
  pointer-events: none;
}
.icon-input { padding-left: 34px !important; }

/* Stars */
.stars-row {
  display: flex;
  align-items: center;
  gap: 2px;
  padding-top: 6px;
}
.star-btn {
  background: none;
  border: none;
  padding: 1px;
  cursor: pointer;
  transition: transform 0.12s;
  line-height: 0;
}
.star-btn:hover { transform: scale(1.15); }
.rating-label {
  font-size: 12px;
  font-weight: 600;
  color: #C8922A;
  margin-left: 6px;
}

/* Media row */
.composer__media {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.composer__spacer { flex: 1; }

.media-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 16px;
  height: 40px;
  border: 1.5px dashed #D4CBBA;
  border-radius: 999px;
  background: transparent;
  color: #5A5A72;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
  max-width: 180px;
  overflow: hidden;
}
.media-btn span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.media-btn input { display: none; }
.media-btn:hover {
  border-color: #2A9D8F;
  color: #2A9D8F;
  background: #E6F5F4;
}
.media-btn.uploading {
  opacity: 0.6;
  cursor: wait;
}

.composer__submit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 22px;
  height: 42px;
  border: none;
  border-radius: 999px;
  background: #2A9D8F;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, transform 0.12s;
  white-space: nowrap;
  flex-shrink: 0;
}
.composer__submit:hover:not(:disabled) {
  background: #238577;
  transform: translateY(-1px);
}
.composer__submit:disabled {
  background: #D4CBBA;
  color: #9896A8;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 500px) {
  .composer { padding: 18px; }
  .composer__media { flex-direction: column; align-items: stretch; }
  .media-btn { max-width: 100%; }
  .composer__spacer { display: none; }
  .composer__submit { width: 100%; justify-content: center; }
}
</style>