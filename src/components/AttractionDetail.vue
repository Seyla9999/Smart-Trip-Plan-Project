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
            <a
              :href="`https://www.openstreetmap.org/?mlat=${mapCoords.lat}&mlon=${mapCoords.lng}#map=14/${mapCoords.lat}/${mapCoords.lng}`"
              target="_blank"
              rel="noopener"
              class="map-link"
            >Open in OpenStreetMap Ã¢â€ â€”</a>
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
          <div v-if="isLoggedIn" class="review-form">
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
            <textarea v-model="newReview.comment" class="review-textarea" placeholder="Share your experienceÃ¢â‚¬Â¦" rows="4" maxlength="2000"></textarea>
            <div class="review-form-footer">
              <span v-if="reviewSuccess" class="review-success">Ã¢Å“â€œ Review submitted!</span>
              <button
                class="btn-submit-review"
                :disabled="submittingReview || !newReview.comment.trim()"
                @click="submitReview"
              >{{ submittingReview ? 'SubmittingÃ¢â‚¬Â¦' : 'Submit Review' }}</button>
            </div>
          </div>
          <div v-else class="review-login-prompt">
            Please <span class="review-login-link" @click="$router.push('/login')">log in</span> to leave a review.
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

          <button class="btn-add-trip">
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
            {{ savingFavorite ? 'SavingÃ¢â‚¬Â¦' : isFavorited ? 'Favorited' : 'Save to favorites' }}
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
                <p class="info-value">{{ attraction.info?.duration || '2Ã¢â‚¬â€œ4 hours' }}</p>
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
            <button class="btn-cta" @click="$router.push('/register')">Sign up to save Ã¢â€ â€™</button>
          </div>
        </div>
      </aside>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import API from '../api/axios'

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

const isLoggedIn = computed(() => !!localStorage.getItem('auth_token'))

const provinceNameById = ref<Record<number, string>>({})
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
  const provinceSlug = (data.province?.name_en || '')
    .toLowerCase()
    .replace(/\s+/g, '-')

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
      const name = item?.name ?? item?.title ?? `Nearby Place ${index + 1}`
      return {
        name,
        slug: item?.slug ?? toSlug(name),
        location: item?.location ?? provinceName.toUpperCase(),
        image: item?.image ?? item?.image_url ?? item?.url ?? '',
      }
    })
    .filter((item: any) => Boolean(item.name))
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

function buildGenericAttraction(place: PlaceSummary, provinceSlug: string, placeSlug: string) {
  const nearby = (provincePlaceMap[provinceSlug] || [])
    .filter((item) => toSlug(item.name) !== placeSlug)
    .slice(0, 5)
    .map((item) => ({
      name: item.name,
      slug: toSlug(item.name),
      location: place.province.toUpperCase(),
      image: item.image,
    }))
    .replace(/[^a-z0-9-]/g, '')

  const badges: string[] = []
  if (data.is_hidden_gem) badges.push('HIDDEN GEM')
  if (data.category)      badges.push(data.category.toUpperCase())
  if (Number(data.average_rating) >= 4.5) badges.push('TOP RATED')

  // Prefer curated nearby_images JSONB over the generic province query
  const nearby = data.nearby_images?.length
    ? data.nearby_images.map((n: any) => ({
        name:     n.name,
        slug:     n.slug || (n.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        location: n.location || '',
        image:    n.image,
      }))
    : (data.nearby || []).map((n: any) => ({
        name:     n.name_en,
        slug:     (n.name_en || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        location: (n.province?.name_en || '').toUpperCase(),
        image:    n.hero_image || '',
      }))

  const slug = (data.name_en || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  return {
    id:          data.id,
    slug,
    name:        data.name_en,
    name_kh:     data.name_kh,
    province:    {
      nameEn: data.province?.name_en || '',
      nameKh: data.province?.name_kh || '',
    },
    provinceSlug,
    rating:      Number(data.average_rating) || 0,
    reviewCount: data.reviews?.length || 0,
    heroImage:   data.hero_image,
    badges,
    tags:        data.category ? [data.category] : [],
    about:       data.description
      ? data.description.split('\n\n').filter(Boolean)
      : ['No description available yet.'],
    photos:      data.photos || [],
    location:    data.location,
    info: {
      bestTime:   'Year-round',
      duration:   '2Ã¢â‚¬â€œ4 hours',
      difficulty: 'Moderate',
      bestFor:    'All travelers',
      province:   data.province?.name_en || '',
    },
    nearby,
  }
}

function loadAttraction() {
  loading.value = true
  error.value = null

  const provinceSlug = (route.params.slug as string) || 'koh-kong'
  const placeSlug = (route.params.placeSlug as string) || (route.params.id as string)

  // Direct /attraction/:id routes should be resolved by the API fetch below.
  if (!route.params.placeSlug && route.params.id) {
    attraction.value = null
    nearbyPOIs.value = null
    void fetchAttraction()
    return
  }

  if (!placeSlug) {
    attraction.value = null
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

  // Support both /province/:slug/:placeSlug and /attraction/:id
  const identifier = (route.params.placeSlug as string) || (route.params.id as string)
  if (!identifier) {
    loading.value = false
    return
  }

  try {
    const { data } = await API.get(`/attractions/${identifier}`)
    attraction.value = normalizeAttraction(data)
    nearbyPOIs.value = data.nearbyPOIs || null
    reviews.value    = data.reviews    || []

    // Replace UUID in URL with human-readable slug
    const isUuid = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(identifier)
    if (isUuid && attraction.value.slug) {
      router.replace(`/attraction/${attraction.value.slug}`)
    }

    if (isLoggedIn.value) checkBookmark(data.id)
  } catch (err: any) {
    if (err.response?.status === 404) {
      error.value = `Attraction "${identifier}" not found.`
    } else if (err.code === 'ERR_NETWORK') {
      error.value = 'Cannot connect to the backend. Make sure it is running on port 3000.'
    } else {
      error.value = err.response?.data?.message || 'Failed to load attraction details.'
    }
  } finally {
    loading.value = false
  }
}

async function checkBookmark(attractionId: string) {
  try {
    const { data } = await API.get('/bookmarks')
    const found = (data || []).find((b: any) => b.entity_id === attractionId)
    if (found) {
      isFavorited.value = true
      bookmarkId.value  = found.id
    }
  } catch {
    // silently ignore Ã¢â‚¬â€ user may not be authenticated
  }
}

// Computed: check if there are nearby POIs
const hasNearbyPOIs = computed(() => {
  return nearbyPOIs.value && (
    nearbyPOIs.value.hospitals?.length ||
    nearbyPOIs.value.police?.length ||
    nearbyPOIs.value.restaurants?.length ||
    nearbyPOIs.value.atms?.length ||
    nearbyPOIs.value.cafes?.length ||
    nearbyPOIs.value.pharmacies?.length
  )
})
async function toggleFavorite() {
  if (savingFavorite.value) return
  if (!isLoggedIn.value) { router.push('/login'); return }

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

    await loadProvinceNames()

    const response = await API.get(`/attractions/${attractionId}`)
    const attractionPayload = response.data?.data ?? response.data
    
    if (attractionPayload) {
      attraction.value = normalizeAttractionData(attractionPayload, attractionId)
      nearbyPOIs.value = attractionPayload.nearbyPOIs || null
    }
  } catch (err: any) {
    console.error('API Error:', err)

    const fallbackAttraction = mockAttractions.find(
      (item) => String(item.id) === String(route.params.id),
    )
    if (fallbackAttraction) {
      attraction.value = normalizeAttractionData(fallbackAttraction, String(route.params.id || ''))
      nearbyPOIs.value = null
      error.value = null
      return
    }
    
    if (err.response?.status === 404) {
      error.value = `Attraction "${route.params.id}" not found`
    } else if (err.code === 'ECONNREFUSED') {
      error.value = 'Cannot connect to backend server. Make sure it\'s running on port 3000'
  } catch (e: any) {
    // Revert on failure
    isFavorited.value = prevFavorited
    bookmarkId.value  = prevBookmarkId
    console.error('Bookmark error:', e?.response?.data || e)
  } finally {
    savingFavorite.value = false
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Reviews Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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
    reviews.value.unshift(data)
    newReview.value = { rating: 5, title: '', comment: '' }
    reviewSuccess.value = true
    setTimeout(() => { reviewSuccess.value = false }, 3000)
  } catch (e: any) {
    console.error('Review error:', e?.response?.data || e)
  } finally {
    submittingReview.value = false
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Leaflet map Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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
    attribution: 'Ã‚Â© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
            `<b>${poi.name}</b><br><i>${cfg.title}</i><br>${Math.round(poi.distance_meters)}m away${poi.isOpen24h ? ' Ã‚Â· Open 24h' : ''}`,
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

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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
.map-link    {
  display: block; text-align: right; font-size: 12px;
  color: #C8922A; margin-top: 6px; text-decoration: none;
}
.map-link:hover { text-decoration: underline; }
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
</style>
