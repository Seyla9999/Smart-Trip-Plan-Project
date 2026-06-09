<template>
  <div v-if="loading" class="loading-state">
    <div class="spinner"></div>
    <p>Loading attraction details...</p>
  </div>

  <div v-else-if="error" class="error-state">
    <h2>Error</h2>
    <p>{{ error }}</p>
    <router-link to="/" class="back-home">Return to Home</router-link>
  </div>

  <div v-else-if="attraction" class="attraction-page">

    <!-- Hero -->
    <div class="hero" :style="{ backgroundImage: `url(${heroImage})` }">
      <div class="hero-overlay" />
      <div class="hero-content">
        <div class="hero-badges">
          <span v-for="badge in attraction.badges" :key="badge" class="badge">{{ badge }}</span>
        </div>
        <h1 class="hero-title">{{ attraction.name }}</h1>
        <div class="hero-meta">
          <span class="meta-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ attraction.province?.nameEn || attraction.province }}
          </span>
          <span class="meta-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            {{ attraction.rating }} <span class="reviews">({{ reviews.length || attraction.reviewCount || 0 }} reviews)</span>
          </span>
        </div>
      </div>
      <div class="breadcrumb">
        <router-link to="/">HOME</router-link>
        <span> / {{ (attraction.province?.nameEn || '').toUpperCase() }} / {{ (attraction.name || '').toUpperCase() }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-wrapper">
      <div class="content-area">

        <div class="tags-row">
          <span v-for="tag in attraction.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <!-- About -->
        <section class="section">
          <h2>About this attraction</h2>
          <p v-for="(para, i) in attraction.about" :key="i">{{ para }}</p>
        </section>

        <!-- Photos -->
        <section class="section" v-if="attraction.photos?.length">
          <div class="section-header">
            <h2>Photos</h2>
          </div>
          <div class="photo-grid">
            <div v-for="(photo, i) in attraction.photos" :key="i" class="photo-item">
              <img :src="photo" :alt="`Photo ${Number(i) + 1}`" loading="lazy" />
            </div>
          </div>
        </section>

        <!-- Map -->
        <section class="section">
          <h2>Location & Nearby Services</h2>
          <div v-if="mapCoords" class="map-wrapper">
            <div ref="mapEl" class="map-iframe"></div>
            <div class="map-actions">
              <a
                :href="`https://www.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}`"
                target="_blank" rel="noopener"
                class="map-btn map-btn--google"
              >🗺️ Open in Google Maps</a>
            </div>
          </div>
          <div v-else class="map-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#C8922A" stroke="white" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white" stroke="#C8922A"/></svg>
            <p class="map-label">{{ attraction.name }}, {{ attraction.province?.nameEn }}</p>
            <p class="map-sub">Map coordinates not available for this attraction</p>
          </div>
        </section>

        <!-- Reviews -->
        <section class="section">
          <h2>Reviews{{ reviews.length ? ` (${reviews.length})` : '' }}</h2>

          <!-- Write a review -->
          <div v-if="!isLoggedIn" class="review-login-prompt">
            Please <span class="review-login-link" @click="$router.push('/login')">log in</span> to leave a review.
          </div>
          <div v-else-if="canReview === null" class="review-login-prompt">
            Checking eligibility…
          </div>
          <div v-else-if="canReview === false" class="review-locked">
            <div class="review-locked-icon">🔒</div>
            <p class="review-locked-title">Review Locked</p>
            <p class="review-locked-desc">
              Complete a trip that includes <strong>{{ attraction?.name }}</strong> to unlock the ability to leave a review.
            </p>
          </div>
          <div v-else class="review-form">
            <p class="review-form-title">Write a Review</p>
            <div class="star-picker">
              <span
                v-for="n in 5" :key="n"
                class="star-pick"
                :class="{ 'star-pick-active': n <= (hoverRating || newReview.rating) }"
                @mouseenter="hoverRating = n"
                @mouseleave="hoverRating = 0"
                @click="newReview.rating = n"
              >★</span>
              <span class="star-pick-label">{{ newReview.rating }}/5</span>
            </div>
            <p class="review-author-name">Reviewing as <strong>{{ currentUserName }}</strong></p>
            <input v-model="newReview.title" class="review-input" placeholder="Title (optional)" maxlength="200" />
            <textarea v-model="newReview.comment" class="review-textarea" placeholder="Share your experience…" rows="4" maxlength="2000"></textarea>
            <div class="review-form-footer">
              <span v-if="reviewSuccess" class="review-success">✓ Review submitted!</span>
              <button
                class="btn-submit-review"
                :disabled="submittingReview || !newReview.comment.trim()"
                @click="submitReview"
              >{{ submittingReview ? 'Submitting…' : 'Submit Review' }}</button>
            </div>
          </div>

          <div v-if="reviews.length" class="reviews-list" style="margin-top:1.5rem">
            <div v-for="review in displayedReviews" :key="review.id" class="review-card">
              <div class="review-header">
                <div class="review-avatar">{{ (review.author_name || 'A')[0].toUpperCase() }}</div>
                <div class="review-meta">
                  <strong>{{ review.author_name || 'Anonymous' }}</strong>
                  <div class="review-stars">
                    <span v-for="n in 5" :key="n" :class="n <= review.rating ? 'star-filled' : 'star-empty'">★</span>
                    <span class="review-score">{{ review.rating }}/5</span>
                  </div>
                </div>
              </div>
              <p v-if="review.title" class="review-title">{{ review.title }}</p>
              <p class="review-body">{{ review.comment }}</p>
            </div>
          </div>

          <button
            v-if="reviews.length > 3"
            class="btn-view-reviews"
            @click="showAllReviews = !showAllReviews"
          >
            {{ showAllReviews ? 'Show less' : `View all ${reviews.length} reviews` }}
          </button>
        </section>

        <!-- Nearby Attractions -->
        <section class="section" v-if="attraction.nearby?.length">
          <h2>Nearby attractions</h2>
          <div class="nearby-grid">
            <div
              v-for="place in attraction.nearby"
              :key="place.name"
              class="nearby-card"
              @click="$router.push(`/province/${attraction.provinceSlug}/${place.slug}`)"
            >
              <div class="nearby-img">
                <img :src="place.image" :alt="place.name" loading="lazy" />
              </div>
              <p class="nearby-name">{{ place.name }}</p>
              <p class="nearby-location">{{ place.location }}</p>
            </div>
          </div>
        </section>

      </div>

      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-card">
          <h3>Plan your visit</h3>
          <p class="sidebar-sub">Add this to your trip itinerary</p>

          <button class="btn-add-trip" @click="openTripModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Add to my trip
          </button>

          <button
            class="btn-favorite"
            :class="{ favorited: isFavorited }"
            :disabled="savingFavorite"
            @click="toggleFavorite"
          >
            <svg width="16" height="16" viewBox="0 0 24 24"
              :fill="isFavorited ? '#e53935' : 'none'"
              :stroke="isFavorited ? '#e53935' : 'currentColor'"
              stroke-width="2"
              style="transition: fill 0.2s, stroke 0.2s"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {{ savingFavorite ? 'Saving…' : isFavorited ? 'Favorited' : 'Save to favorites' }}
          </button>

          <div class="info-list">
            <div class="info-row">
              <div class="info-icon clock"></div>
              <div>
                <p class="info-label">BEST TIME</p>
                <p class="info-value">{{ attraction.info?.bestTime || 'Year-round' }}</p>
              </div>
            </div>
            <div class="info-row">
              <div class="info-icon duration"></div>
              <div>
                <p class="info-label">VISIT DURATION</p>
                <p class="info-value">{{ attraction.info?.duration || '2–4 hours' }}</p>
              </div>
            </div>
            <div class="info-row">
              <div class="info-icon difficulty"></div>
              <div>
                <p class="info-label">DIFFICULTY</p>
                <p class="info-value">{{ attraction.info?.difficulty || 'Moderate' }}</p>
              </div>
            </div>
            <div class="info-row">
              <div class="info-icon bestFor"></div>
              <div>
                <p class="info-label">BEST FOR</p>
                <p class="info-value">{{ attraction.info?.bestFor || 'All travelers' }}</p>
              </div>
            </div>
            <div class="info-row">
              <div class="info-icon province"></div>
              <div>
                <p class="info-label">PROVINCE</p>
                <p class="info-value">{{ attraction.province?.nameEn || attraction.province }}</p>
              </div>
            </div>
          </div>

          <div class="cta-box" v-if="!isLoggedIn">
            <p>Sign up free to save this to a trip and invite friends to join you.</p>
            <button class="btn-cta" @click="$router.push('/register')">Sign up to save</button>
          </div>
        </div>
      </aside>
    </div>

  <!-- ── Add to Trip Modal ─────────────────────────────────────────────────── -->
  <Teleport to="body">
    <div v-if="showTripModal" class="trip-modal-backdrop" @click.self="showTripModal = false">
      <div class="trip-modal">

        <!-- Header -->
        <div class="trip-modal-header">
          <div>
            <h3 class="trip-modal-title">Add to My Trip</h3>
            <p class="trip-modal-sub">{{ attraction?.name }}</p>
          </div>
          <button class="trip-modal-close" @click="showTripModal = false">✕</button>
        </div>

        <!-- Tabs -->
        <div class="trip-modal-tabs">
          <button :class="['trip-tab', { active: tripModalTab === 'new' }]"      @click="tripModalTab = 'new'">✈️ New Trip</button>
          <button :class="['trip-tab', { active: tripModalTab === 'existing' }]" @click="tripModalTab = 'existing'">📋 Existing Trip</button>
        </div>

        <!-- New Trip tab -->
        <div v-if="tripModalTab === 'new'" class="trip-modal-body">

          <!-- Route: origin → destination -->
          <div class="trip-route-row">
            <div class="trip-route-group" style="position:relative">
              <label>Starting from</label>
              <div
                class="trip-route-select"
                :class="{ open: showOriginDropdown }"
                tabindex="0"
                @click="showOriginDropdown = !showOriginDropdown"
                @blur="showOriginDropdown = false"
              >
                <span :style="newTripOrigin ? 'color:#1e293b' : 'color:#94a3b8'">
                  {{ newTripOrigin ? cambodiaProvinces.find(p => p.slug === newTripOrigin)?.name : 'Select province…' }}
                </span>
                <span class="trip-select-caret">▾</span>
                <div v-if="showOriginDropdown" class="trip-select-dropdown" @mousedown.prevent>
                  <div
                    v-for="p in cambodiaProvinces" :key="p.slug"
                    class="trip-select-option"
                    :class="{ selected: newTripOrigin === p.slug }"
                    @click.stop="newTripOrigin = p.slug; showOriginDropdown = false"
                  >{{ p.name }}</div>
                </div>
              </div>
            </div>
            <div class="trip-route-arrow">→</div>
            <div class="trip-route-group">
              <label>Destination</label>
              <div class="trip-destination-preset">{{ attraction?.province?.nameEn || '—' }}<span v-if="attraction?.name" style="color:#64748b;font-weight:400"> / {{ attraction.name }}</span></div>
            </div>
          </div>

          <!-- Dates -->
          <p class="trip-modal-hint">Dates are optional — skip them if you haven't decided yet.</p>
          <div class="trip-date-row">
            <div class="trip-date-group">
              <label>Start date</label>
              <input type="date" v-model="newTripStart" :min="today" />
            </div>
            <div class="trip-date-group">
              <label>End date</label>
              <input type="date" v-model="newTripEnd" :min="newTripStart || today" />
            </div>
          </div>

          <p v-if="tripModalError" class="trip-modal-error">{{ tripModalError }}</p>
          <button class="trip-modal-btn" :disabled="addingToTrip || !newTripOrigin" @click="createNewTrip">
            <span v-if="addingToTrip" class="trip-spinner"></span>
            {{ addingToTrip ? 'Creating…' : 'Create Trip & Go' }}
          </button>
          <p v-if="!newTripOrigin" style="font-size:11px;color:#aaa;text-align:center;margin-top:4px">Select a starting province to continue</p>
        </div>

        <!-- Existing Trip tab -->
        <div v-else class="trip-modal-body">
          <div v-if="userTrips.length === 0" class="trip-modal-empty">
            No saved trips yet. Create one first!
          </div>
          <template v-else>
            <div class="trip-list">
              <label v-for="trip in userTrips" :key="trip.id"
                :class="['trip-list-item', { selected: selectedTripId === trip.id }]"
                @click="selectedTripId = trip.id">
                <span class="trip-list-name">{{ trip.title }}</span>
                <span class="trip-list-dest">{{ trip.destination || '—' }}</span>
              </label>
            </div>
            <div class="trip-day-row">
              <label>Add to day</label>
              <select v-model="selectedDay">
                <option v-for="d in 14" :key="d" :value="d">Day {{ d }}</option>
              </select>
            </div>
            <p v-if="tripSuccess"    class="trip-modal-success">{{ tripSuccess }}</p>
            <p v-if="tripModalError" class="trip-modal-error">{{ tripModalError }}</p>
            <button class="trip-modal-btn" :disabled="addingToTrip || !selectedTripId" @click="addToExistingTrip">
              <span v-if="addingToTrip" class="trip-spinner"></span>
              {{ addingToTrip ? 'Adding…' : 'Add to Trip' }}
            </button>
          </template>
        </div>

      </div>
    </div>
  </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import API from '../api/axios'
import * as groupChatService from '@/services/group-chat.service'
import { getProvinces } from '../services/home.service'

function toSlug(value: string) {
  if (!value) return ''
  return value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

interface PlaceSummary {
  name: string
  category: string
  province: string
  rating: number
  reviews: number
  description: string
  image: string
  tags: string[]
}

const route  = useRoute()
const router = useRouter()

const attraction    = ref<any>(null)
const nearbyPOIs    = ref<any>(null)
const reviews          = ref<any[]>([])
const showAllReviews   = ref(false)
const newReview        = ref({ rating: 5, title: '', comment: '' })
const hoverRating      = ref(0)
const submittingReview = ref(false)
const reviewSuccess    = ref(false)
const displayedReviews = computed(() =>
  showAllReviews.value ? reviews.value : reviews.value.slice(0, 3)
)
const loading       = ref(true)
const error         = ref<string | null>(null)
const mapEl         = ref<HTMLElement | null>(null)
let   leafletMap: any = null

const isFavorited   = ref(false)
const bookmarkId    = ref<string | null>(null)
const savingFavorite = ref(false)

// null = not yet checked, true = allowed, false = not allowed
const canReview = ref<boolean | null>(null)

// ── Add to Trip modal ────────────────────────────────────────────────────────
const showTripModal  = ref(false)
const tripModalTab   = ref<'new' | 'existing'>('new')
const today          = new Date().toISOString().split('T')[0]
const newTripStart   = ref(today)
const newTripEnd     = ref('')
const newTripOrigin       = ref('')
const showOriginDropdown  = ref(false)
const userTrips           = ref<any[]>([])

const cambodiaProvinces = [
  { slug: 'phnom-penh',       name: 'Phnom Penh' },
  { slug: 'siem-reap',        name: 'Siem Reap' },
  { slug: 'battambang',       name: 'Battambang' },
  { slug: 'sihanoukville',    name: 'Sihanoukville' },
  { slug: 'kampot',           name: 'Kampot' },
  { slug: 'kep',              name: 'Kep' },
  { slug: 'koh-kong',         name: 'Koh Kong' },
  { slug: 'kratie',           name: 'Kratie' },
  { slug: 'mondulkiri',       name: 'Mondulkiri' },
  { slug: 'ratanakiri',       name: 'Ratanakiri' },
  { slug: 'kampong-cham',     name: 'Kampong Cham' },
  { slug: 'kampong-chhnang',  name: 'Kampong Chhnang' },
  { slug: 'kampong-speu',     name: 'Kampong Speu' },
  { slug: 'kampong-thom',     name: 'Kampong Thom' },
  { slug: 'kandal',           name: 'Kandal' },
  { slug: 'prey-veng',        name: 'Prey Veng' },
  { slug: 'svay-rieng',       name: 'Svay Rieng' },
  { slug: 'takeo',            name: 'Takeo' },
  { slug: 'pursat',           name: 'Pursat' },
  { slug: 'pailin',           name: 'Pailin' },
  { slug: 'preah-vihear',     name: 'Preah Vihear' },
  { slug: 'stung-treng',      name: 'Stung Treng' },
  { slug: 'oddar-meanchey',   name: 'Oddar Meanchey' },
  { slug: 'banteay-meanchey', name: 'Banteay Meanchey' },
  { slug: 'tboung-khmum',     name: 'Tboung Khmum' },
]

const selectedTripId = ref<string | null>(null)
const selectedDay    = ref(1)
const addingToTrip   = ref(false)
const tripModalError = ref<string | null>(null)
const tripSuccess    = ref<string | null>(null)
const provinceNameById = ref<Record<number, string>>({})

const isLoggedIn = computed(() => !!localStorage.getItem('auth_token'))

const currentUserName = computed(() => {
  const token = localStorage.getItem('auth_token')
  if (!token) return ''
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.full_name || payload.email || ''
  } catch { return '' }
})

const heroImage = computed(() =>
  attraction.value?.heroImage ||
  'https://www.asiakingtravel.com/cuploads/files/royalpalace-att-b.jpg'
)

const mapCoords = computed(() => {
  const loc = attraction.value?.location
  if (!loc) return null
  if (loc.coordinates?.length >= 2) return { lng: loc.coordinates[0], lat: loc.coordinates[1] }
  if (loc.x !== undefined && loc.y !== undefined) return { lng: loc.x, lat: loc.y }
  return null
})


// Normalise raw DB fields into the shape the template needs
function normalizeAttraction(data: any) {
  if (!data) return null
  return normalizeAttractionData(data, data.id || '')
}

function toProvinceObject(province: any) {
  if (!province) {
    return { nameEn: 'Unknown Province', name_en: 'Unknown Province' }
  }

  if (typeof province === 'string') {
    return { nameEn: province, name_en: province }
  }

  const name = province.nameEn ?? province.name_en ?? province.name ?? 'Unknown Province'
  return { ...province, nameEn: name, name_en: name }
}

function normalizeNearbyPlaces(nearbyPlaces: any, provinceName: string) {
  if (!Array.isArray(nearbyPlaces)) return []

  return nearbyPlaces
    .map((item: any, index: number) => {
      const name = item?.name ?? item?.title ?? null
      const image = item?.image ?? item?.image_url ?? null
      
      // Skip items without proper names or images
      if (!name || !image || name.startsWith('Nearby Place')) {
        return null
      }
      
      return {
        name,
        slug: item?.slug ?? toSlug(name),
        location: item?.location ?? provinceName.toUpperCase(),
        image: image,
      }
    })
    .filter((item: any) => Boolean(item))
}

function normalizeAttractionData(rawAttraction: any, attractionId: string) {
  const provinceId = Number(rawAttraction?.province_id ?? rawAttraction?.province?.id)
  const provinceNameFromId = Number.isFinite(provinceId)
    ? provinceNameById.value[provinceId]
    : undefined

  const province = toProvinceObject(
    rawAttraction?.province ??
      rawAttraction?.province_name_en ??
      rawAttraction?.province_name ??
      rawAttraction?.provinceName ??
      provinceNameFromId,
  )
  const provinceName = province.nameEn
  const attractionName =
    rawAttraction?.name ?? rawAttraction?.name_en ?? rawAttraction?.name_kh ?? 'Attraction'
  const primaryImage =
    rawAttraction?.heroImage ??
    rawAttraction?.hero_image ??
    rawAttraction?.image_url ??
    rawAttraction?.image ??
    'https://www.asiakingtravel.com/cuploads/files/royalpalace-att-b.jpg'

  const nearbyFromAttraction = normalizeNearbyPlaces(rawAttraction?.nearby, provinceName)
  const nearbyFromImages = normalizeNearbyPlaces(rawAttraction?.nearby_images, provinceName)
  const normalizedNearby = nearbyFromAttraction.length ? nearbyFromAttraction : nearbyFromImages
  const normalizedPhotos =
    Array.isArray(rawAttraction?.photos) && rawAttraction.photos.length
      ? rawAttraction.photos
      : [primaryImage, primaryImage, primaryImage]

  return {
    id: rawAttraction?.id ?? attractionId,
    name: attractionName,
    province,
    provinceSlug: rawAttraction?.provinceSlug ?? toSlug(provinceName),
    rating: Number(rawAttraction?.rating ?? rawAttraction?.average_rating ?? 0),
    reviews: Number(rawAttraction?.reviews ?? rawAttraction?.review_count ?? 0),
    heroImage: primaryImage,
    badges:
      Array.isArray(rawAttraction?.badges) && rawAttraction.badges.length
        ? rawAttraction.badges
        : [
            rawAttraction?.is_hidden_gem ? 'HIDDEN GEM' : 'ATTRACTION',
            String(rawAttraction?.category ?? 'Attraction').toUpperCase(),
            'TOP RATED',
          ],
    tags:
      Array.isArray(rawAttraction?.tags) && rawAttraction.tags.length
        ? rawAttraction.tags
        : [rawAttraction?.category ?? 'Attraction'],
    about:
      Array.isArray(rawAttraction?.about) && rawAttraction.about.length
        ? rawAttraction.about
        : [
            rawAttraction?.description ??
              `${attractionName} is one of the notable places to visit in ${provinceName}.`,
            `Explore more of ${provinceName} through nearby attractions and local experiences.`,
          ],
    photos: normalizedPhotos,
    info: {
      bestTime: rawAttraction?.info?.bestTime ?? 'Year-round',
      duration: rawAttraction?.info?.duration ?? '2-3 hours',
      difficulty: rawAttraction?.info?.difficulty ?? 'Moderate',
      bestFor: rawAttraction?.info?.bestFor ?? 'All travelers',
      province: provinceName,
    },
    nearby: normalizedNearby,
  }
}

async function loadProvinceNames() {
  if (Object.keys(provinceNameById.value).length > 0) return

  try {
    const provinces = await getProvinces()
    provinceNameById.value = Object.fromEntries(
      provinces.map((province) => [Number(province.id), province.name_en]),
    )
  } catch (err) {
    console.error('Failed to load provinces for attraction detail:', err)
  }
}

const provincePlaceMap: Record<string, PlaceSummary[]> = {
  'koh-kong': [
    { name: 'Tatai Waterfall', category: 'Nature', province: 'Koh Kong', rating: 4.9, reviews: 743, description: 'A two-tiered semi-natural waterfall in the heart of the jungle. Perfect for travelers seeking peace and nature.', image: 'https://www.asiakingtravel.com/cuploads/files/Tatai-waterfall-2.jpg', tags: ['Nature', 'Photography', 'Adventure'] },
    { name: 'Koh Kong Beach', category: 'Beach', province: 'Koh Kong', rating: 4.6, reviews: 352, description: 'A relaxing beach with soft sand and calm sea views, great for sunset walks.', image: 'https://merrytravelasia.com/wp-content/uploads/2023/06/Koh-Rong.jpg', tags: ['Beach', 'Relax', 'Sunset'] },
    { name: 'Mangrove Forest Kayaking', category: 'Adventure', province: 'Koh Kong', rating: 4.8, reviews: 286, description: 'Paddle through beautiful mangrove forests and enjoy peaceful eco-adventure moments.', image: 'https://kura2bus.com/blog/wp-content/uploads/2023/10/DSC_0887.jpg', tags: ['Nature', 'Adventure', 'Kayaking'] },
    { name: 'Peam Krasaop Wildlife Sanctuary', category: 'Nature', province: 'Koh Kong', rating: 4.7, reviews: 401, description: 'A protected natural area with boardwalks, birdlife, and lush coastal scenery.', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/%E1%9E%88%E1%9E%9A%E1%9E%96%E1%9E%B8%E1%9E%9B%E1%9E%BE%E1%9E%94%E1%9F%89%E1%9E%98%E1%9E%98%E1%9E%BE%E1%9E%9B%E1%9E%91%E1%9F%85%E1%9E%96%E1%9F%92%E1%9E%9A%E1%9F%83%E1%9E%80%E1%9F%84%E1%9E%84%E1%9E%80%E1%9E%B6%E1%9E%84_-_panoramio.jpg', tags: ['Nature', 'Wildlife', 'Photography'] },
    { name: 'Dong Tong Market', category: 'Food', province: 'Koh Kong', rating: 4.4, reviews: 198, description: 'A local market where you can try fresh seafood and discover daily Khmer life.', image: 'https://travelsetu.com/apps/uploads/new_destinations_photos/destination/2024/06/28/0dc327612f9e0a519a343ecc3329b2b3_1000x1000.jpg', tags: ['Food', 'Market', 'Local Life'] },
    { name: 'Chi Phat Eco Village', category: 'Nature', province: 'Koh Kong', rating: 4.9, reviews: 265, description: 'A community-based ecotourism destination surrounded by forests, rivers, and wildlife.', image: 'https://thealtruistictraveller.com/s/51524087023470235/blog/SAM_4897.jpg', tags: ['Nature', 'Eco Tour', 'Adventure'] },
  ],
  'siem-reap': [
    { name: 'Angkor Wat Sunrise', category: 'Cultural', province: 'Siem Reap', rating: 5, reviews: 1250, description: "Experience the breathtaking sunrise over Angkor Wat, Cambodia's most iconic temple.", image: 'https://toursbyjeeps.com/wp-content/uploads/2021/07/Untitled-1-2.jpg', tags: ['Temple', 'Sunrise', 'Photography'] },
    { name: 'Bayon Temple', category: 'Cultural', province: 'Siem Reap', rating: 4.9, reviews: 980, description: 'Famous for its giant smiling stone faces and rich Khmer architecture.', image: 'https://cambodiatravel.com/images/2020/12/intro-Bayon-Temple-Travel-Guide.jpg', tags: ['Temple', 'History', 'Architecture'] },
    { name: 'Ta Prohm', category: 'Nature', province: 'Siem Reap', rating: 4.8, reviews: 875, description: 'A temple beautifully wrapped by jungle roots and ancient stone walls.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRVuujeN6cK9EnoskxVGvkvPaKFnQo6HnjAQ&s', tags: ['Temple', 'Nature', 'Photography'] },
    { name: 'Phare Cambodian Circus', category: 'Cultural', province: 'Siem Reap', rating: 4.9, reviews: 620, description: 'A lively performance mixing theatre, music, and Cambodian storytelling.', image: 'https://www.siemreapshuttle.com/wp-content/uploads/2022/08/Phare-Circus-SiemreapShuttle.jpg', tags: ['Show', 'Culture', 'Family'] },
    { name: 'Pub Street Food Walk', category: 'Food', province: 'Siem Reap', rating: 4.5, reviews: 712, description: 'Taste local snacks, desserts, and street food in the center of the city.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmnSH7ICljEFXf4-k-vYqmnMW3LiyYanjy5g&s', tags: ['Food', 'Nightlife', 'Local Life'] },
    { name: 'Kulen Mountain Day Trip', category: 'Nature', province: 'Siem Reap', rating: 4.7, reviews: 430, description: 'Enjoy waterfalls, sacred sites, and mountain views outside the city.', image: 'https://www.siemreap.net/wp-content/uploads/2017/12/phnom-kulen-waterfall.jpg', tags: ['Nature', 'Waterfall', 'Adventure'] },
  ],
  'phnom-penh': [
    { name: 'Royal Palace', category: 'Cultural', province: 'Phnom Penh', rating: 4.8, reviews: 940, description: "Visit the majestic Royal Palace, one of Phnom Penh's most famous landmarks.", image: 'https://www.asiakingtravel.com/cuploads/files/royalpalace-att-b.jpg', tags: ['Palace', 'History', 'Photography'] },
    { name: 'National Museum of Cambodia', category: 'Cultural', province: 'Phnom Penh', rating: 4.7, reviews: 683, description: "Explore Khmer art, sculpture, and ancient history in Cambodia's leading museum.", image: 'https://image-tc.galaxy.tf/wijpeg-87c83dri3kglj836kubeiybcf/the-national-museum-3.jpg', tags: ['Museum', 'History', 'Culture'] },
    { name: 'Wat Phnom', category: 'Cultural', province: 'Phnom Penh', rating: 4.6, reviews: 510, description: 'A peaceful hilltop temple and one of the most symbolic places in Phnom Penh.', image: 'https://files.intocambodia.org/wp-content/uploads/2024/08/10143531/Wat-Phnom.jpg', tags: ['Temple', 'History', 'Photography'] },
    { name: 'Central Market', category: 'Food', province: 'Phnom Penh', rating: 4.5, reviews: 860, description: 'A popular local market known for food, souvenirs, clothes, and Khmer daily life.', image: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Aerial_view_of_Phnom_Penh%27s_Central_Market_%28September_2021%29.jpg', tags: ['Food', 'Market', 'Shopping'] },
    { name: 'Sisowath Riverside', category: 'Nature', province: 'Phnom Penh', rating: 4.6, reviews: 445, description: 'Walk along the riverfront with wide views, cafes, and a lively city atmosphere.', image: 'https://thumbs.dreamstime.com/b/busy-boulevard-sisowath-quay-along-phnom-penh-s-popular-riverside-area-cambodia-december-rd-alongside-tonle-sap-river-272947819.jpg', tags: ['River', 'Walk', 'Sunset'] },
    { name: 'Tuol Sleng Genocide Museum', category: 'Cultural', province: 'Phnom Penh', rating: 4.7, reviews: 799, description: "An important historical site for learning about Cambodia's recent past.", image: 'https://www.unesco.org/sites/default/files/styles/paragraph_medium_desktop/public/thumbnail_image.jpg.webp?itok=gSv1xJWw', tags: ['Museum', 'History', 'Education'] },
    { name: 'Independence Monument', category: 'Cultural', province: 'Phnom Penh', rating: 4.4, reviews: 320, description: 'A beautiful city landmark best seen in the evening with lights and open space around it.', image: 'https://www.novotelphnompenhbkk1.com/wp-content/uploads/sites/53/2023/08/Indepedence-monument-2200x1200.jpg', tags: ['Landmark', 'Photography', 'City'] },
    { name: 'Russian Market', category: 'Food', province: 'Phnom Penh', rating: 4.5, reviews: 570, description: 'A lively market famous for local food, clothes, souvenirs, and street shopping.', image: 'https://d122axpxm39woi.cloudfront.net/images/destinations/origin/64be1fb570dee.jpg', tags: ['Market', 'Food', 'Shopping'] },
    { name: 'Bassac Lane', category: 'Food', province: 'Phnom Penh', rating: 4.6, reviews: 265, description: 'A stylish small street filled with cafes, bars, and evening hangout spots.', image: 'https://ctp.r24k.app/wp-content/uploads/2025/03/vvTlcTqutrNFTxTyLETB.jpg', tags: ['Food', 'Nightlife', 'Friends'] },
  ],
}

function getPlaceFromRoute() {
  const provinceSlug = (route.params.slug as string) || 'koh-kong'
  const placeSlugFromRoute = (route.params.placeSlug as string) || (route.params.id as string)

  if (!placeSlugFromRoute) return null

  const provincePlaces = provincePlaceMap[provinceSlug] || []
  const byProvince = provincePlaces.find((item) => toSlug(item.name) === placeSlugFromRoute)
  if (byProvince) {
    return { place: byProvince, provinceSlug, placeSlug: placeSlugFromRoute }
  }

  for (const [mapProvinceSlug, mapPlaces] of Object.entries(provincePlaceMap)) {
    const found = mapPlaces.find((item) => toSlug(item.name) === placeSlugFromRoute)
    if (found) {
      return { place: found, provinceSlug: mapProvinceSlug, placeSlug: placeSlugFromRoute }
    }
  }

  return null
}

function buildGenericAttraction(place: any, provinceSlug: string, placeSlug: string) {
  const nearby = (provincePlaceMap[provinceSlug] || [])
    .filter((item) => toSlug(item.name) !== placeSlug)
    .slice(0, 5)
    .map((item) => ({
      name: item.name,
      slug: toSlug(item.name),
      location: place.province.toUpperCase(),
      image: item.image,
    }))

  return {
    id: placeSlug,
    slug: placeSlug,
    name: place.name,
    province: { nameEn: place.province },
    provinceSlug,
    rating: place.rating,
    reviewCount: place.reviews,
    heroImage: place.image,
    badges: ['ATTRACTION', place.category.toUpperCase()],
    tags: place.tags,
    about: [place.description],
    photos: [place.image],
    info: {
      bestTime:   'Year-round',
      duration:   '2–4 hours',
      difficulty: 'Moderate',
      bestFor:    'All travelers',
      province:   place.province || '',
    },
    nearby: nearby,
  }
}

async function loadAttraction() {
  loading.value    = true
  error.value      = null
  attraction.value = null
  nearbyPOIs.value = null
  reviews.value    = []
  isFavorited.value  = false
  bookmarkId.value   = null
  showAllReviews.value = false
  newReview.value    = { rating: 5, title: '', comment: '' }
  reviewSuccess.value = false

  await loadProvinceNames()

  // Support both /province/:slug/:placeSlug and /attraction/:id
  const identifier = (route.params.placeSlug as string) || (route.params.id as string)
  if (!identifier) {
    loading.value = false
    error.value = 'No attraction identifier provided'
    return
  }

  try {
    // Try the attraction API first
    let data: any = null
    try {
      const res = await API.get(`/attractions/${identifier}`)
      data = res.data
    } catch (apiErr: any) {
      // If API returns 404, try fallback from static provincePlaceMap
      if (apiErr.response?.status === 404) {
        const placeData = getPlaceFromRoute()
        if (placeData) {
          data = buildGenericAttraction(placeData.place, placeData.provinceSlug, placeData.placeSlug)
        } else {
          throw apiErr
        }
      } else {
        throw apiErr
      }
    }

    if (!data) {
      error.value = `Attraction "${identifier}" not found.`
      return
    }

    attraction.value = normalizeAttraction(data)
    nearbyPOIs.value = data.nearbyPOIs || null
    reviews.value    = data.reviews    || []

    // Replace UUID in URL with human-readable slug
    const isUuid = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(identifier)
    if (isUuid && attraction.value?.slug) {
      router.replace(`/attraction/${attraction.value.slug}`)
    }

    if (isLoggedIn.value) {
      checkBookmark(data.id)
      checkCanReview(data.id)
    } else {
      canReview.value = false
    }
  } catch (err: any) {
    console.error('Attraction load error:', err)
    if (err.response?.status === 404) {
      error.value = `Attraction "${identifier}" not found. Try browsing from the Discover page.`
    } else if (err.code === 'ERR_NETWORK') {
      error.value = 'Cannot connect to the backend. Make sure it is running on port 3000.'
    } else {
      error.value = err.response?.data?.message || 'Failed to load attraction details.'
    }
  } finally {
    loading.value = false
  }
}

// ── Trip modal functions ──────────────────────────────────────────────────────
async function openTripModal() {
  if (!isLoggedIn.value) { router.push('/login'); return }
  tripModalError.value = null
  tripSuccess.value    = null
  tripModalTab.value   = 'new'
  showTripModal.value  = true
  // Pre-load existing trips for the "existing" tab
  try {
    const { data } = await API.get('/api/trips')
    userTrips.value = Array.isArray(data) ? data : []
    if (userTrips.value.length) selectedTripId.value = userTrips.value[0].id
  } catch {
    userTrips.value = []
  }
}

async function createNewTrip() {
  if (!attraction.value || !newTripOrigin.value) return
  addingToTrip.value   = true
  tripModalError.value = null
  try {
    const destName   = attraction.value.province.nameEn
    const payload: any = {
      title:       `Trip to ${destName}`,
      origin:      newTripOrigin.value,
      destination: attraction.value.provinceSlug,
      itinerary_items: [{ attraction_id: attraction.value.id, day_number: 1 }],
    }
    if (newTripStart.value) payload.start_date = newTripStart.value
    if (newTripEnd.value)   payload.end_date   = newTripEnd.value

    const res = await API.post('/api/trips', payload)
    const tripId = String(res.data?.id ?? res.data?.trip?.id ?? res.data?.data?.id ?? '')
    if (tripId) {
      try {
        await groupChatService.getOrCreateGroupChat(tripId)
      } catch (chatError) {
        console.error('Failed to create group chat for new trip:', chatError)
      }
    }

    showTripModal.value = false
    newTripOrigin.value = ''
    router.push({ name: 'my-trips' })
  } catch (e: any) {
    tripModalError.value = e?.response?.data?.message || 'Failed to create trip'
  } finally {
    addingToTrip.value = false
  }
}

async function addToExistingTrip() {
  if (!attraction.value || !selectedTripId.value) return
  addingToTrip.value   = true
  tripModalError.value = null
  try {
    await API.post(`/api/trips/${selectedTripId.value}/itinerary-items`, {
      attraction_id: attraction.value.id,
      day_number:    selectedDay.value,
    })

    try {
      await groupChatService.getOrCreateGroupChat(selectedTripId.value)
    } catch (chatError) {
      console.error('Failed to ensure group chat for existing trip:', chatError)
    }

    tripSuccess.value = `Added to Day ${selectedDay.value}!`
    setTimeout(() => { showTripModal.value = false; tripSuccess.value = null }, 1500)
  } catch (e: any) {
    tripModalError.value = e?.response?.data?.message || 'Failed to add to trip'
  } finally {
    addingToTrip.value = false
  }
}

async function checkBookmark(attractionId: string) {
  try {
    const { data } = await API.get('/bookmarks')
    const bookmarks = Array.isArray(data) ? data : []
    const found = bookmarks.find((b: any) => b.entity_id === attractionId)
    if (found) {
      isFavorited.value = true
      bookmarkId.value  = found.id
    }
  } catch {
    // silent — heart stays empty if fetch fails
  }
}

async function checkCanReview(attractionId: string) {
  try {
    const { data } = await API.get(`/api/trips/can-review/${attractionId}`)
    canReview.value = data?.allowed === true
  } catch {
    canReview.value = false
  }
}

async function toggleFavorite() {
  if (savingFavorite.value) return
  if (!isLoggedIn.value) { router.push('/login'); return }

  // Optimistic update — flip state immediately so UI responds instantly
  const prevFavorited  = isFavorited.value
  const prevBookmarkId = bookmarkId.value
  isFavorited.value = !prevFavorited
  if (prevFavorited) bookmarkId.value = null

  savingFavorite.value = true
  try {
    if (prevFavorited && prevBookmarkId) {
      await API.delete(`/bookmarks/${prevBookmarkId}`)
    } else {
      const { data } = await API.post('/bookmarks', {
        entity_type: 'attraction',
        entity_id:   attraction.value.id,
      })
      bookmarkId.value = data.id
    }
  } catch (e: any) {
    // Revert on failure
    isFavorited.value = prevFavorited
    bookmarkId.value  = prevBookmarkId
  } finally {
    savingFavorite.value = false
  }
}


async function submitReview() {
  if (!newReview.value.comment.trim() || !newReview.value.rating) return
  submittingReview.value = true
  try {
    const { data } = await API.post('/reviews', {
      attraction_id: attraction.value.id,
      rating:        newReview.value.rating,
      comment:       newReview.value.comment,
      author_name:   currentUserName.value || 'Anonymous',
      title:         newReview.value.title || undefined,
    })
    // Normalise to snake_case so the review card renders the same as loaded reviews
    reviews.value.unshift({
      id:          data.id,
      rating:      Number(data.rating ?? data.rating),
      comment:     data.comment,
      author_name: data.author_name ?? data.authorName ?? currentUserName.value ?? 'Anonymous',
      title:       data.title ?? null,
      created_at:  data.created_at ?? data.createdAt ?? new Date().toISOString(),
    })
    newReview.value = { rating: 5, title: '', comment: '' }
    reviewSuccess.value = true
    setTimeout(() => { reviewSuccess.value = false }, 3000)
  } catch (e: any) {
    const msg = e?.response?.data?.message || 'Failed to submit review'
    alert(msg)
    console.error('Review error:', e?.response?.data || e)
  } finally {
    submittingReview.value = false
  }
}


function loadLeaflet(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).L) { resolve(); return }
    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link')
      css.id = 'leaflet-css'
      css.rel = 'stylesheet'
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(css)
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script')
      script.id = 'leaflet-js'
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => resolve()
      document.head.appendChild(script)
    } else {
      resolve()
    }
  })
}

async function initMap() {
  if (!mapCoords.value || !mapEl.value) return
  await loadLeaflet()
  const L = (window as any).L

  if (leafletMap) { leafletMap.remove(); leafletMap = null }

  leafletMap = L.map(mapEl.value).setView([mapCoords.value.lat, mapCoords.value.lng], 14)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(leafletMap)

  // Main attraction pin
  const mainIcon = L.divIcon({
    html: `<div class="map-pin-main"><span style="transform:rotate(45deg);display:block">★</span></div>`,
    className: 'map-icon-wrapper',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  })
  L.marker([mapCoords.value.lat, mapCoords.value.lng], { icon: mainIcon })
    .addTo(leafletMap)
    .bindPopup(`<b>${attraction.value?.name}</b>`)
    .openPopup()

  // POI markers
  const categoryConfig: Record<string, { label: string; color: string; title: string }> = {
    hospitals:   { label: 'H', color: '#e74c3c', title: 'Hospital' },
    police:      { label: 'P', color: '#2980b9', title: 'Police' },
    restaurants: { label: 'R', color: '#e67e22', title: 'Restaurant' },
    atms:        { label: '$', color: '#27ae60', title: 'ATM' },
    cafes:       { label: 'C', color: '#8e44ad', title: 'Cafe' },
    pharmacies:  { label: 'Rx', color: '#16a085', title: 'Pharmacy' },
  }

  const pois = nearbyPOIs.value
  if (pois) {
    for (const [key, list] of Object.entries(pois)) {
      if (!Array.isArray(list)) continue
      const cfg = categoryConfig[key]
      if (!cfg) continue
      for (const poi of list as any[]) {
        if (poi.latitude == null || poi.longitude == null) continue
        const poiIcon = L.divIcon({
          html: `<div class="map-pin-poi" style="background:${cfg.color}">${cfg.label}</div>`,
          className: 'map-icon-wrapper',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        })
        L.marker([Number(poi.latitude), Number(poi.longitude)], { icon: poiIcon })
          .addTo(leafletMap)
          .bindPopup(
            `<b>${poi.name}</b><br><i>${cfg.title}</i><br>${Math.round(poi.distance_meters)}m away${poi.isOpen24h ? ' · Open 24h' : ''}`,
          )
      }
    }
  }
}

watch(
  () => [route.params.slug, route.params.placeSlug, route.params.id],
  () => {
    loadAttraction()
  },
)
// Initialise map once attraction data (and the map div) are ready
watch(
  () => [attraction.value, nearbyPOIs.value],
  async ([att]) => {
    if (att && mapCoords.value) {
      await nextTick()
      initMap()
    }
  },
)

onUnmounted(() => {
  if (leafletMap) { leafletMap.remove(); leafletMap = null }
})


watch(
  () => [route.params.slug, route.params.placeSlug, route.params.id],
  () => loadAttraction(),
  { immediate: true },
)
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.attraction-page { font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; background: #fff; }

/* Loading */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 60vh; gap: 20px;
}
.spinner {
  width: 50px; height: 50px;
  border: 4px solid #e0e0e0; border-top-color: #C8922A;
  border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state p { color: #666; font-size: 14px; }

/* Error */
.error-state {
  text-align: center; padding: 80px 20px; min-height: 60vh;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 16px;
}
.error-state h2 { font-size: 2rem; color: #e74c3c; }
.error-state p  { color: #666; margin-bottom: 20px; }
.back-home {
  display: inline-block; padding: 12px 24px;
  background: #C8922A; color: white; text-decoration: none;
  border-radius: 8px; font-weight: 500; transition: background 0.2s;
}
.back-home:hover { background: #b07820; }

/* Hero */
.hero {
  position: relative; height: 380px;
  background-size: cover; background-position: center;
  display: flex; flex-direction: column; justify-content: flex-end;
}
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%);
}
.breadcrumb {
  position: absolute; top: 16px; left: 1.5rem;
  color: rgba(255,255,255,0.7); font-size: 11px; letter-spacing: 0.08em; z-index: 2;
}
.breadcrumb a { color: rgba(255,255,255,0.7); text-decoration: none; }
.breadcrumb a:hover { color: #fff; }
.hero-content {
  position: relative; z-index: 2; padding: 0 1.5rem 2rem;
  max-width: 1200px; margin: 0 auto; width: 100%;
}
.hero-badges { display: flex; gap: 8px; margin-bottom: 10px; }
.badge { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; padding: 3px 8px; border-radius: 4px; background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
.hero-title { font-size: 2.6rem; font-weight: 700; color: #fff; margin-bottom: 8px; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.hero-meta { display: flex; align-items: center; gap: 1.5rem; }
.meta-location, .meta-rating { display: flex; align-items: center; gap: 5px; color: rgba(255,255,255,0.9); font-size: 14px; }
.reviews { color: rgba(255,255,255,0.65); }

/* Layout */
.main-wrapper {
  max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem;
  display: grid; grid-template-columns: 1fr 300px;
  gap: 2.5rem; align-items: start;
}

/* Tags */
.tags-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 2rem; }
.tag { padding: 5px 14px; border: 1px solid #ccc; border-radius: 20px; font-size: 13px; color: #444; cursor: pointer; transition: all 0.2s; }
.tag:hover { border-color: #C8922A; color: #C8922A; }

/* Sections */
.section { margin-bottom: 2.5rem; }
.section h2 { font-size: 1.3rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem; }
.section p  { font-size: 14px; color: #555; line-height: 1.75; margin-bottom: 0.75rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }

/* Photos */
.photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.photo-item { border-radius: 8px; overflow: hidden; aspect-ratio: 4/3; }
.photo-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.photo-item:hover img { transform: scale(1.05); }

/* POI */
.poi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.poi-category {
  background: #f8f9fa; border-radius: 12px; padding: 16px;
  border-left: 4px solid #C8922A;
}
.poi-category h3 { font-size: 15px; margin-bottom: 10px; color: #333; }
.poi-category ul  { list-style: none; padding: 0; margin: 0; }
.poi-category li  { padding: 7px 0; border-bottom: 1px solid #eee; font-size: 13px; }
.poi-category li:last-child { border-bottom: none; }
.poi-category strong { color: #C8922A; }
.open-24h {
  display: inline-block; background: #2ecc71; color: white;
  font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 8px;
}

/* Map */
.map-wrapper { position: relative; }
.map-iframe  { border-radius: 12px; border: 1px solid #e0e0e0; display: block; height: 420px; width: 100%; }
.map-actions      { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
.map-btn          { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
                    border-radius: 8px; font-size: 13px; font-weight: 600;
                    text-decoration: none; transition: opacity 0.2s; }
.map-btn:hover    { opacity: 0.82; }
.map-btn--google  { background: #4285F4; color: #fff; }
.map-placeholder {
  border: 2px dashed #d0d0d0; border-radius: 12px; padding: 3rem;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 8px; background: #f9f9f9; min-height: 180px;
}
.map-label { font-size: 14px; font-weight: 600; color: #333; }
.map-sub   { font-size: 12px; color: #888; }

/* Reviews */
.reviews-list { display: flex; flex-direction: column; gap: 16px; }
.review-card  { background: #f8f9fa; border-radius: 12px; padding: 16px; }
.review-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 10px;
}
.review-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: #C8922A; color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 16px; flex-shrink: 0;
}
.review-meta strong { display: block; font-size: 14px; }
.review-stars { display: flex; align-items: center; gap: 2px; margin-top: 3px; }
.star-filled  { color: #FFD700; font-size: 14px; }
.star-empty   { color: #ddd;    font-size: 14px; }
.review-score { font-size: 12px; color: #888; margin-left: 4px; }
.review-title { font-weight: 600; font-size: 14px; margin-bottom: 6px; color: #222; }
.review-body  { font-size: 13px; color: #555; line-height: 1.65; }
.btn-view-reviews {
  margin-top: 1rem; width: 100%; padding: 10px;
  background: #fff; border: 1px solid #C8922A; border-radius: 8px;
  color: #C8922A; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.btn-view-reviews:hover { background: #C8922A; color: #fff; }

/* Review form */
.review-form {
  background: #fff; border: 1px solid #e0e0e0; border-radius: 12px;
  padding: 1.25rem; margin-bottom: 1.5rem;
}
.review-form-title {
  font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 0.75rem;
}
.review-author-name {
  font-size: 13px; color: #888; margin-bottom: 0.75rem;
}
.review-author-name strong { color: #1a1a1a; }
.star-picker {
  display: flex; align-items: center; gap: 4px; margin-bottom: 0.75rem;
}
.star-pick {
  font-size: 28px; cursor: pointer; color: #ddd;
  transition: color 0.15s; line-height: 1; user-select: none;
}
.star-pick-active { color: #FFD700; }
.star-pick-label {
  font-size: 13px; color: #888; margin-left: 6px;
}
.review-input {
  display: block; width: 100%; padding: 9px 12px; margin-bottom: 8px;
  border: 1px solid #d0d0d0; border-radius: 8px; font-size: 14px;
  color: #222; outline: none; transition: border-color 0.2s;
  font-family: inherit;
}
.review-input:focus { border-color: #C8922A; }
.review-textarea {
  display: block; width: 100%; padding: 9px 12px; margin-bottom: 8px;
  border: 1px solid #d0d0d0; border-radius: 8px; font-size: 14px;
  color: #222; outline: none; resize: vertical; font-family: inherit;
  transition: border-color 0.2s;
}
.review-textarea:focus { border-color: #C8922A; }
.review-form-footer {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.btn-submit-review {
  padding: 10px 24px; background: #C8922A; color: #fff; border: none;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
  transition: background 0.2s; flex-shrink: 0;
}
.btn-submit-review:hover:not(:disabled) { background: #b07820; }
.btn-submit-review:disabled { opacity: 0.55; cursor: not-allowed; }
.review-success { font-size: 13px; color: #27ae60; font-weight: 600; }
.review-login-prompt {
  font-size: 14px; color: #888; margin-bottom: 1.5rem;
}
.review-login-link {
  color: #C8922A; cursor: pointer; font-weight: 600; text-decoration: underline;
}
.review-login-link:hover { color: #b07820; }

.review-locked {
  background: #f9fafb; border: 1.5px dashed #d1d5db;
  border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;
  text-align: center;
}
.review-locked-icon  { font-size: 28px; margin-bottom: 6px; }
.review-locked-title { font-size: 15px; font-weight: 700; color: #374151; margin-bottom: 6px; }
.review-locked-desc  { font-size: 13px; color: #6b7280; line-height: 1.6; }

/* Nearby */
.nearby-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px;
}
.nearby-card { cursor: pointer; border-radius: 10px; overflow: hidden; transition: transform 0.2s; }
.nearby-card:hover { transform: translateY(-2px); }
.nearby-img  { aspect-ratio: 4/3; overflow: hidden; }
.nearby-img img { width: 100%; height: 100%; object-fit: cover; }
.nearby-name { font-size: 13px; font-weight: 600; color: #222; margin: 8px 4px 2px; }
.nearby-location { font-size: 11px; color: #888; margin: 0 4px 8px; }


/* Sidebar */
.sidebar { position: sticky; top: 76px; }
.sidebar-card { border: 1px solid #e0e0e0; border-radius: 14px; padding: 1.25rem; background: #fff; }
.sidebar-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.sidebar-sub { font-size: 12px; color: #888; margin-bottom: 1rem; }
.btn-add-trip { display: flex; align-items: center; justify-content: center; gap: 7px; width: 100%; padding: 10px; background: #C8922A; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 8px; transition: background 0.2s; }
.btn-add-trip:hover { background: #b07820; }

.btn-favorite {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; padding: 10px; background: #fff; color: #333;
  border: 1px solid #ccc; border-radius: 8px; font-size: 14px;
  cursor: pointer; margin-bottom: 1.25rem; transition: all 0.2s;
}
.btn-favorite:hover      { border-color: #e53935; color: #e53935; }
.btn-favorite.favorited  { border-color: #e53935; color: #e53935; background: #fff5f5; }
.btn-favorite:disabled   { opacity: 0.7; cursor: not-allowed; }

.info-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 1.25rem; }
.info-row  { display: flex; align-items: center; gap: 10px; }
.info-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.clock      { background: #e8f5e9; }
.duration   { background: #e3f2fd; }
.difficulty { background: #fff3e0; }
.bestFor    { background: #fce4ec; }
.province   { background: #ede7f6; }
.info-label { font-size: 10px; letter-spacing: 0.08em; color: #aaa; margin-bottom: 1px; }
.info-value { font-size: 13px; font-weight: 600; color: #222; }
.cta-box { background: #fff8e1; border: 1px solid #ffe082; border-radius: 10px; padding: 12px; }
.cta-box p { font-size: 12px; color: #555; line-height: 1.5; margin-bottom: 8px; }
.btn-cta { width: 100%; padding: 8px; background: #C8922A; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-cta:hover { background: #b07820; }

/* Responsive */
@media (max-width: 900px) {
  .main-wrapper { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .photo-grid { grid-template-columns: repeat(2, 1fr); }
  .nearby-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 600px) {
  .hero-title { font-size: 1.8rem; }
  .photo-grid { grid-template-columns: 1fr; }
  .poi-grid   { grid-template-columns: 1fr; }
  .nearby-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

<!-- Leaflet icon overrides must be outside scoped so they apply to Leaflet's DOM -->
<style>
.map-icon-wrapper {
  background: transparent !important;
  border: none !important;
}
.map-pin-main {
  background: #C8922A;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 2px solid white;
  box-shadow: 0 3px 8px rgba(0,0,0,0.4);
}
.map-pin-main span { transform: rotate(45deg); display: block; }
.map-pin-poi {
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  font-family: sans-serif;
  box-shadow: 0 2px 6px rgba(0,0,0,0.35);
  border: 2px solid rgba(255,255,255,0.8);
}

/* ── Trip modal ─────────────────────────────────────────────────────────────── */
.trip-modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 16px;
}
.trip-modal {
  background: #fff; border-radius: 16px; width: 100%; max-width: 440px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25); overflow: hidden;
}
.trip-modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 20px 20px 0;
}
.trip-modal-title { font-size: 17px; font-weight: 700; color: #15543f; margin: 0 0 2px; }
.trip-modal-sub   { font-size: 12px; color: #888; margin: 0; }
.trip-modal-close {
  background: none; border: none; font-size: 18px; color: #aaa;
  cursor: pointer; padding: 0 4px; line-height: 1;
}
.trip-modal-close:hover { color: #333; }
.trip-modal-tabs {
  display: flex; gap: 0; padding: 16px 20px 0;
}
.trip-tab {
  flex: 1; padding: 8px 0; font-size: 13px; font-weight: 600;
  border: 1.5px solid #e2e8f0; background: #f8fafc; color: #64748b;
  cursor: pointer; transition: all 0.15s;
}
.trip-tab:first-child { border-radius: 8px 0 0 8px; }
.trip-tab:last-child  { border-radius: 0 8px 8px 0; border-left: none; }
.trip-tab.active { background: #15543f; color: #fff; border-color: #15543f; }
.trip-modal-body  { padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 12px; }
.trip-modal-hint  { font-size: 12px; color: #888; margin: 0; }
.trip-date-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.trip-date-group  { display: flex; flex-direction: column; gap: 4px; }
.trip-date-group label { font-size: 11px; font-weight: 600; color: #15543f; text-transform: uppercase; letter-spacing: 0.5px; }
.trip-date-group input {
  padding: 8px 10px; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 13px; font-family: inherit;
}
.trip-date-group input:focus { outline: none; border-color: #15543f; }
.trip-modal-btn {
  padding: 11px; background: #15543f; color: #fff; border: none;
  border-radius: 9999px; font-size: 14px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background 0.2s;
}
.trip-modal-btn:hover:not(:disabled) { background: #0f3d2c; }
.trip-modal-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.trip-modal-error   { font-size: 12px; color: #dc2626; margin: 0; }
.trip-modal-success { font-size: 12px; color: #16a34a; font-weight: 600; margin: 0; }
.trip-modal-empty   { font-size: 13px; color: #888; text-align: center; padding: 16px 0; }
.trip-spinner {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
}
.trip-list { display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto; }
.trip-list-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px;
  cursor: pointer; transition: all 0.15s;
}
.trip-list-item:hover    { border-color: #15543f; }
.trip-list-item.selected { border-color: #15543f; background: #f0fdf4; }
.trip-list-name { font-size: 13px; font-weight: 600; color: #1e293b; }
.trip-list-dest { font-size: 11px; color: #888; }
.trip-day-row { display: flex; align-items: center; gap: 10px; }
.trip-day-row label { font-size: 12px; font-weight: 600; color: #15543f; white-space: nowrap; }
.trip-day-row select {
  flex: 1; padding: 7px 10px; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 13px; font-family: inherit;
}
.trip-day-row select:focus { outline: none; border-color: #15543f; }

/* Route row (origin → destination) */
.trip-route-row {
  display: flex; align-items: flex-end; gap: 8px;
}
.trip-route-group {
  flex: 1; display: flex; flex-direction: column; gap: 4px;
}
.trip-route-group label {
  font-size: 11px; font-weight: 600; color: #15543f;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.trip-route-select {
  padding: 8px 10px; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 13px; background: #fff; cursor: pointer; width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  user-select: none; outline: none;
}
.trip-route-select:focus,
.trip-route-select.open { border-color: #15543f; }
.trip-select-caret { font-size: 11px; color: #94a3b8; flex-shrink: 0; margin-left: 4px; }
.trip-select-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: #fff; border: 1.5px solid #e2e8f0; border-radius: 8px;
  max-height: 200px; overflow-y: auto; z-index: 9999;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
}
.trip-select-option {
  padding: 9px 12px; font-size: 13px; cursor: pointer; color: #1e293b;
}
.trip-select-option:hover    { background: #f0fdf4; color: #15543f; }
.trip-select-option.selected { font-weight: 700; color: #15543f; }
.trip-route-arrow {
  font-size: 18px; color: #94a3b8; font-weight: 700;
  padding-bottom: 10px; flex-shrink: 0;
}
.trip-destination-preset {
  padding: 8px 10px; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 13px; font-weight: 600; color: #15543f;
  background: #f0fdf4; cursor: default;
}
</style>
