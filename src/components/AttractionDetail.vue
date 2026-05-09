<template>
  <div v-if="loading" class="loading-state">
    <div class="spinner"></div>
    <p>Loading attraction details...</p>
  </div>

  <div v-else-if="!attraction" class="error-state">
    <h2>Not Found</h2>
    <p>This attraction could not be found.</p>
    <router-link to="/" class="back-home">Return to Home</router-link>
  </div>

  <div v-else class="attraction-page">

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
            {{ displayRating }} <span class="reviews">({{ reviews.length || attraction.reviews || 0 }} reviews)</span>
          </span>
        </div>
      </div>
      <div class="breadcrumb">
        <router-link to="/">HOME</router-link>
        <span> / {{ attraction.province?.nameEn?.toUpperCase() || 'PROVINCE' }} / {{ attraction.name?.toUpperCase() }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-wrapper">
      <div class="content-area">

        <div class="tags-row">
          <span v-for="tag in attraction.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <section class="section">
          <h2>About this attraction</h2>
          <p v-for="(para, i) in attraction.about" :key="i">{{ para }}</p>
        </section>

        <section class="section">
          <div class="section-header">
            <h2>Photos</h2>
            <a href="#" class="view-all">View All Gallery</a>
          </div>
          <div class="photo-grid">
            <div v-for="(photo, i) in attraction.photos" :key="i" class="photo-item">
              <img :src="photo" :alt="`Photo ${Number(i) + 1}`" />
            </div>
          </div>
        </section>

        <!-- Nearby Points of Interest Section (from API) -->
        <section class="section" v-if="hasNearbyPOIs">
          <h2>Nearby Services & Amenities</h2>
          <div class="poi-grid">
            <div v-if="nearbyPOIs.hospitals?.length" class="poi-category">
              <h3>🏥 Hospitals ({{ nearbyPOIs.hospitals.length }})</h3>
              <ul>
                <li v-for="poi in nearbyPOIs.hospitals" :key="poi.id">
                  <strong>{{ poi.name }}</strong> - {{ poi.distance_meters }}m away
                  <span v-if="poi.isOpen24h" class="open-24h">(Open 24h)</span>
                </li>
              </ul>
            </div>
            <div v-if="nearbyPOIs.police?.length" class="poi-category">
              <h3>👮 Police ({{ nearbyPOIs.police.length }})</h3>
              <ul>
                <li v-for="poi in nearbyPOIs.police" :key="poi.id">
                  <strong>{{ poi.name }}</strong> - {{ poi.distance_meters }}m away
                </li>
              </ul>
            </div>
            <div v-if="nearbyPOIs.restaurants?.length" class="poi-category">
              <h3>🍽️ Restaurants ({{ nearbyPOIs.restaurants.length }})</h3>
              <ul>
                <li v-for="poi in nearbyPOIs.restaurants" :key="poi.id">
                  <strong>{{ poi.name }}</strong> - {{ poi.distance_meters }}m away
                </li>
              </ul>
            </div>
            <div v-if="nearbyPOIs.atms?.length" class="poi-category">
              <h3>🏧 ATMs ({{ nearbyPOIs.atms.length }})</h3>
              <ul>
                <li v-for="poi in nearbyPOIs.atms" :key="poi.id">
                  <strong>{{ poi.name }}</strong> - {{ poi.distance_meters }}m away
                </li>
              </ul>
            </div>
            <div v-if="nearbyPOIs.cafes?.length" class="poi-category">
              <h3>☕ Cafes ({{ nearbyPOIs.cafes.length }})</h3>
              <ul>
                <li v-for="poi in nearbyPOIs.cafes" :key="poi.id">
                  <strong>{{ poi.name }}</strong> - {{ poi.distance_meters }}m away
                </li>
              </ul>
            </div>
            <div v-if="nearbyPOIs.pharmacies?.length" class="poi-category">
              <h3>💊 Pharmacies ({{ nearbyPOIs.pharmacies.length }})</h3>
              <ul>
                <li v-for="poi in nearbyPOIs.pharmacies" :key="poi.id">
                  <strong>{{ poi.name }}</strong> - {{ poi.distance_meters }}m away
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- ===== REVIEWS SECTION (from Supabase) ===== -->
        <section class="section">
          <div class="section-header">
            <h2>Reviews</h2>
            <span class="review-count">{{ reviews.length }} review{{ reviews.length !== 1 ? 's' : '' }}</span>
          </div>

          <div v-if="reviewsLoading" class="reviews-loading">Loading reviews…</div>

          <div v-else>
            <!-- Existing reviews list -->
            <div v-if="reviews.length" class="reviews-list">
              <div v-for="review in reviews" :key="review.id" class="review-card">
                <div class="review-header">
                  <div class="review-avatar">{{ review.authorName?.charAt(0)?.toUpperCase() || 'A' }}</div>
                  <div class="review-meta">
                    <span class="review-author">{{ review.authorName }}</span>
                    <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                  </div>
                  <div class="review-stars">
                    <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= review.rating }">★</span>
                  </div>
                </div>
                <p v-if="review.title" class="review-title">{{ review.title }}</p>
                <p class="review-body">{{ review.comment }}</p>
              </div>
            </div>
            <p v-else class="no-reviews">Be the first to review this attraction!</p>

            <!-- Write a Review Form -->
            <div class="review-form-box">
              <h3>Write a Review</h3>
              <div class="form-group">
                <label>Your Name</label>
                <input v-model="newReview.authorName" type="text" placeholder="Your name" class="form-input" />
              </div>
              <div class="form-group">
                <label>Rating</label>
                <div class="star-picker">
                  <span
                    v-for="n in 5" :key="n"
                    class="star pick"
                    :class="{ filled: n <= newReview.rating }"
                    @click="newReview.rating = n"
                  >★</span>
                </div>
              </div>
              <div class="form-group">
                <label>Title (optional)</label>
                <input v-model="newReview.title" type="text" placeholder="Summary of your experience" class="form-input" />
              </div>
              <div class="form-group">
                <label>Your Review</label>
                <textarea v-model="newReview.comment" rows="4" placeholder="Share your experience…" class="form-textarea"></textarea>
              </div>
              <button
                class="btn-submit-review"
                :disabled="submittingReview || !newReview.comment.trim() || !newReview.authorName.trim()"
                @click="submitReview"
              >
                {{ submittingReview ? 'Submitting…' : 'Submit Review' }}
              </button>
              <p v-if="reviewSubmitSuccess" class="submit-success">✓ Review submitted successfully!</p>
            </div>
          </div>
        </section>
        <!-- ===== END REVIEWS SECTION ===== -->

        <section class="section">
          <h2>Location on map</h2>
          <MapWithPOI
            v-if="attraction.lat && attraction.lng"
            :lat="attraction.lat"
            :lng="attraction.lng"
            :name="attraction.name"
          />
          <div v-else class="map-placeholder">
            <p class="map-label">{{ attraction.name }}, {{ attraction.province?.nameEn || attraction.province }}</p>
            <p class="map-sub">Map not available</p>
          </div>
        </section>

        <section class="section">
          <h2>Nearby attractions</h2>
          <div class="nearby-grid">
            <div
              v-for="place in attraction.nearby"
              :key="place.name"
              class="nearby-card"
              @click="$router.push(`/province/${attraction.provinceSlug}/${place.slug}`)"
            >
              <div class="nearby-img">
                <img :src="nearbyImages[place.slug] || place.image" :alt="place.name" />
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
          <button class="btn-add-trip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Add to my trip
          </button>
          <button
            class="btn-favorite"
            :class="{ active: isFavorited }"
            :disabled="favLoading"
            @click="toggleFavorite"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" :fill="isFavorited ? '#C8922A' : 'none'" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {{ favLoading ? '…' : isFavorited ? 'Saved to favorites' : 'Save to favorites' }}
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
                <p class="info-value">{{ attraction.info?.duration || '2-3 hours' }}</p>
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

          <div class="cta-box">
            <p>Not logged in? Sign up free to save this to a trip and invite friends to join you.</p>
            <button class="btn-cta">Sign up to save →</button>
          </div>
        </div>
      </aside>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getReviewsBySlug, createReview } from '@/services/reviews.service'
import type { Review } from '@/services/reviews.service'
import { createBookmark, removeBookmark, checkIfBookmarked } from '@/services/bookmarks.service'
import { getNearbyImages } from '@/services/nearbyImages.service'
import API from '@/api/axios'
import MapWithPOI from '@/components/MapWithPOI.vue'


const route = useRoute()

// ── Attraction state ──────────────────────────────────────────
const attraction = ref<any>(null)
const nearbyPOIs = ref<any>(null)
const loading = ref(true)

// ── Reviews state (from Supabase) ─────────────────────────────
const reviews = ref<Review[]>([])
const reviewsLoading = ref(false)
const submittingReview = ref(false)
const reviewSubmitSuccess = ref(false)
const newReview = ref({ authorName: '', rating: 5, title: '', comment: '' })

// ── Favorites state ───────────────────────────────────────────
const isFavorited = ref(false)
const bookmarkId = ref<string | null>(null)
const favLoading = ref(false)

// ── Nearby images (from DB, keyed by place slug) ──────────────
const nearbyImages = ref<Record<string, string>>({})

const displayRating = computed(() => {
  if (reviews.value.length) {
    const avg = reviews.value.reduce((s, r) => s + r.rating, 0) / reviews.value.length
    return avg.toFixed(1)
  }
  return attraction.value?.rating ?? '—'
})

// ── Helpers ───────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Hero image ────────────────────────────────────────────────
const heroImage = computed(() => attraction.value?.heroImage || attraction.value?.image || '')

// ── Load attraction from Supabase via backend ─────────────────
async function loadAttraction() {
  loading.value = true
  const provinceSlug = (route.params.slug as string) || ''
  const placeSlug = (route.params.placeSlug as string) || (route.params.id as string)

  if (!placeSlug) { attraction.value = null; loading.value = false; return }

  try {
    const res = await API.get(`/attractions/${placeSlug}`)
    const db = res.data
    if (db) {
      attraction.value = {
        id: db.id || placeSlug,
        name: db.name,
        province: db.province,
        provinceSlug: db.provinceSlug || provinceSlug,
        rating: db.rating,
        reviews: db.review_count || db.reviews || 0,
        heroImage: db.heroImage || db.image_url || '',
        badges: db.badges || [(db.category || 'Attraction').toUpperCase(), 'TOP RATED'],
        tags: db.tags || db.amenities || [],
        about: db.about || (db.description ? [db.description] : []),
        photos: db.photos?.length ? db.photos : (db.image_url ? [db.image_url] : []),
        lat: db.lat,
        lng: db.lng,
        info: db.info || {
          bestTime: 'All year',
          duration: '2-4 hours',
          difficulty: 'Easy',
          bestFor: 'All travelers',
          province: typeof db.province === 'string' ? db.province : db.province?.nameEn,
        },
        nearby: db.nearby || db.nearbyImages || [],
      }
      loading.value = false
      return
    }
  } catch { /* not found */ }

  attraction.value = null
  loading.value = false
}

// ── Load reviews from Supabase via backend ────────────────────
async function loadReviews() {
  const placeSlug = (route.params.placeSlug as string) || (route.params.id as string)
  if (!placeSlug) return
  reviewsLoading.value = true
  try {
    reviews.value = await getReviewsBySlug(placeSlug)
  } catch {
    reviews.value = []
  } finally {
    reviewsLoading.value = false
  }
}

// ── Submit a new review ───────────────────────────────────────
async function submitReview() {
  if (submittingReview.value) return
  const placeSlug = (route.params.placeSlug as string) || (route.params.id as string)
  if (!placeSlug) return
  submittingReview.value = true
  try {
    const created = await createReview({
      attractionSlug: placeSlug,
      rating: newReview.value.rating,
      comment: newReview.value.comment,
      authorName: newReview.value.authorName,
      title: newReview.value.title || undefined,
    })
    reviews.value = [created, ...reviews.value]
    newReview.value = { authorName: '', rating: 5, title: '', comment: '' }
    reviewSubmitSuccess.value = true
    setTimeout(() => { reviewSubmitSuccess.value = false }, 3000)
  } catch (e) {
    console.error('Review submit error:', e)
  } finally {
    submittingReview.value = false
  }
}

// ── Favorites ─────────────────────────────────────────────────
async function loadFavoriteState() {
  const placeSlug = (route.params.placeSlug as string) || (route.params.id as string)
  if (!placeSlug) return
  const { bookmarked, bookmarkId: bid } = await checkIfBookmarked(placeSlug)
  isFavorited.value = bookmarked
  bookmarkId.value = bid
}

async function toggleFavorite() {
  const userData = localStorage.getItem('user_data')
  if (!userData) {
    alert('Please log in to save favorites.')
    return
  }
  const placeSlug = (route.params.placeSlug as string) || (route.params.id as string)
  if (!placeSlug || favLoading.value) return
  favLoading.value = true
  try {
    if (isFavorited.value && bookmarkId.value) {
      await removeBookmark(bookmarkId.value)
      isFavorited.value = false
      bookmarkId.value = null
    } else {
      const res = await createBookmark({
        place_id: placeSlug,
        place_name: attraction.value?.name,
        place_type: attraction.value?.category || 'Attraction',
        place_image_url: heroImage.value,
      })
      isFavorited.value = true
      bookmarkId.value = res.data.id
    }
  } catch {
    // silent fail
  } finally {
    favLoading.value = false
  }
}

// ── Nearby images from DB ─────────────────────────────────────
async function loadNearbyImages() {
  const nearby = attraction.value?.nearby || []
  for (const place of nearby) {
    try {
      const res = await getNearbyImages(place.slug)
      const first = res.data.data?.[0]
      if (first?.imageUrl) nearbyImages.value[place.slug] = first.imageUrl
    } catch { /* keep hardcoded fallback */ }
  }
}

// ── Computed: check if there are nearby POIs ──────────────────
const hasNearbyPOIs = computed(() =>
  nearbyPOIs.value && (
    nearbyPOIs.value.hospitals?.length ||
    nearbyPOIs.value.police?.length ||
    nearbyPOIs.value.restaurants?.length ||
    nearbyPOIs.value.atms?.length ||
    nearbyPOIs.value.cafes?.length ||
    nearbyPOIs.value.pharmacies?.length
  ),
)

// ── Route watch ───────────────────────────────────────────────
async function initPage() {
  await loadAttraction()
  loadNearbyImages()
}

watch(
  () => [route.params.slug, route.params.placeSlug, route.params.id],
  () => { initPage(); loadReviews(); loadFavoriteState() },
  { immediate: true },
)
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.attraction-page { font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; background: #fff; }

/* Loading State */
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; }
.spinner { width: 50px; height: 50px; border: 4px solid #e0e0e0; border-top-color: #C8922A; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state p { color: #666; font-size: 14px; }

/* Error State */
.error-state { text-align: center; padding: 80px 20px; min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
.error-state h2 { font-size: 2rem; color: #e74c3c; }
.error-state p { color: #666; margin-bottom: 20px; }
.back-home { display: inline-block; padding: 12px 24px; background: #C8922A; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; transition: background 0.2s; }
.back-home:hover { background: #b07820; }

/* Hero Section */
.hero { position: relative; height: 380px; background-size: cover; background-position: center; display: flex; flex-direction: column; justify-content: flex-end; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%); }
.breadcrumb { position: absolute; top: 16px; left: 1.5rem; color: rgba(255,255,255,0.7); font-size: 11px; letter-spacing: 0.08em; z-index: 2; }
.breadcrumb a { color: rgba(255,255,255,0.7); text-decoration: none; }
.breadcrumb a:hover { color: #fff; }
.hero-content { position: relative; z-index: 2; padding: 0 1.5rem 2rem; max-width: 1200px; margin: 0 auto; width: 100%; }
.hero-badges { display: flex; gap: 8px; margin-bottom: 10px; }
.badge { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; padding: 3px 8px; border-radius: 4px; background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
.hero-title { font-size: 2.6rem; font-weight: 700; color: #fff; margin-bottom: 8px; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.hero-meta { display: flex; align-items: center; gap: 1.5rem; }
.meta-location, .meta-rating { display: flex; align-items: center; gap: 5px; color: rgba(255,255,255,0.9); font-size: 14px; }
.reviews { color: rgba(255,255,255,0.65); }

/* Main Content */
.main-wrapper { max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem; display: grid; grid-template-columns: 1fr 300px; gap: 2.5rem; align-items: start; }
.tags-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 2rem; }
.tag { padding: 5px 14px; border: 1px solid #ccc; border-radius: 20px; font-size: 13px; color: #444; cursor: pointer; transition: all 0.2s; }
.tag:hover { border-color: #C8922A; color: #C8922A; }
.section { margin-bottom: 2.5rem; }
.section h2 { font-size: 1.3rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem; }
.section p { font-size: 14px; color: #555; line-height: 1.75; margin-bottom: 0.75rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.view-all { font-size: 13px; color: #C8922A; text-decoration: none; font-weight: 500; }
.review-count { font-size: 13px; color: #888; }

/* Photo Grid */
.photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.photo-item { border-radius: 8px; overflow: hidden; aspect-ratio: 4/3; }
.photo-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.photo-item:hover img { transform: scale(1.05); }

/* POI Grid */
.poi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
.poi-category { background: #f8f9fa; border-radius: 12px; padding: 16px; border-left: 4px solid #C8922A; }
.poi-category h3 { font-size: 16px; margin-bottom: 12px; color: #333; }
.poi-category ul { list-style: none; padding: 0; margin: 0; }
.poi-category li { padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px; }
.poi-category li:last-child { border-bottom: none; }
.poi-category strong { color: #C8922A; }
.open-24h { display: inline-block; background: #2ecc71; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 8px; }

/* Reviews */
.reviews-loading { color: #888; font-size: 13px; margin-bottom: 1rem; }
.no-reviews { color: #aaa; font-size: 13px; font-style: italic; margin-bottom: 1.5rem; }
.reviews-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 2rem; }
.review-card { background: #f9f9f9; border-radius: 12px; padding: 16px; border: 1px solid #eee; }
.review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.review-avatar { width: 36px; height: 36px; border-radius: 50%; background: #C8922A; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
.review-meta { flex: 1; }
.review-author { font-weight: 600; font-size: 14px; color: #1a1a1a; display: block; }
.review-date { font-size: 11px; color: #aaa; }
.review-stars { display: flex; gap: 2px; }
.star { color: #ddd; font-size: 16px; }
.star.filled { color: #FFD700; }
.star.pick { cursor: pointer; transition: color 0.1s; }
.review-title { font-weight: 600; font-size: 14px; color: #333; margin-bottom: 4px; }
.review-body { font-size: 14px; color: #555; line-height: 1.6; }

/* Review Form */
.review-form-box { background: #fff; border: 1px solid #e0e0e0; border-radius: 14px; padding: 1.5rem; margin-top: 1.5rem; }
.review-form-box h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; color: #1a1a1a; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 12px; font-weight: 600; color: #666; margin-bottom: 4px; letter-spacing: 0.05em; text-transform: uppercase; }
.form-input, .form-textarea { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; font-family: inherit; transition: border-color 0.2s; }
.form-input:focus, .form-textarea:focus { outline: none; border-color: #C8922A; }
.form-textarea { resize: vertical; min-height: 100px; }
.star-picker { display: flex; gap: 4px; }
.btn-submit-review { padding: 10px 24px; background: #C8922A; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-submit-review:hover:not(:disabled) { background: #b07820; }
.btn-submit-review:disabled { opacity: 0.6; cursor: not-allowed; }
.submit-success { margin-top: 8px; font-size: 13px; color: #2ecc71; font-weight: 500; }

/* Map */
.map-frame { width: 100%; height: 320px; border: none; border-radius: 12px; display: block; }
.map-placeholder { border: 2px dashed #d0d0d0; border-radius: 12px; padding: 3rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; background: #f9f9f9; min-height: 180px; }
.map-label { font-size: 14px; font-weight: 600; color: #333; }
.map-sub { font-size: 12px; color: #888; }

/* Nearby */
.nearby-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.nearby-card { cursor: pointer; border-radius: 10px; overflow: hidden; transition: transform 0.2s; }
.nearby-card:hover { transform: translateY(-4px); }
.nearby-img { aspect-ratio: 4/3; overflow: hidden; }
.nearby-img img { width: 100%; height: 100%; object-fit: cover; }
.nearby-name { font-size: 12px; font-weight: 600; color: #1a1a1a; margin-top: 6px; padding: 0 4px; }
.nearby-location { font-size: 10px; color: #888; padding: 0 4px; letter-spacing: 0.05em; }

/* Sidebar */
.sidebar { position: sticky; top: 76px; }
.sidebar-card { border: 1px solid #e0e0e0; border-radius: 14px; padding: 1.25rem; background: #fff; }
.sidebar-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.sidebar-sub { font-size: 12px; color: #888; margin-bottom: 1rem; }
.btn-add-trip { display: flex; align-items: center; justify-content: center; gap: 7px; width: 100%; padding: 10px; background: #C8922A; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 8px; transition: background 0.2s; }
.btn-add-trip:hover { background: #b07820; }
.btn-favorite { display: flex; align-items: center; justify-content: center; gap: 7px; width: 100%; padding: 10px; background: #fff; color: #333; border: 1px solid #ccc; border-radius: 8px; font-size: 14px; cursor: pointer; margin-bottom: 1.25rem; transition: all 0.2s; }
.btn-favorite:hover { border-color: #C8922A; color: #C8922A; }
.btn-favorite.active { background: #fff8ed; border-color: #C8922A; color: #C8922A; }
.btn-favorite:disabled { opacity: 0.7; cursor: not-allowed; }
.info-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 1.25rem; }
.info-row { display: flex; align-items: center; gap: 10px; }
.info-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.clock { background: #e8f5e9; }
.duration { background: #e3f2fd; }
.difficulty { background: #fff3e0; }
.bestFor { background: #fce4ec; }
.province { background: #ede7f6; }
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
  .poi-grid { grid-template-columns: 1fr; }
  .nearby-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
