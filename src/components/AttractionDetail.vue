<template>
  <div v-if="loading" class="loading-state">
    <div class="spinner"></div>
    <p>Loading attraction details...</p>
  </div>
  
  <div v-else-if="error" class="error-state">
    <h2>⚠️ Error</h2>
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
            {{ attraction.rating }} <span class="reviews">({{ attraction.reviews || 0 }} reviews)</span>
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

        <section class="section">
          <h2>Location on map</h2>
          <div class="map-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#C8922A" stroke="white" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white" stroke="#C8922A"/></svg>
            <p class="map-label">{{ attraction.name }}, {{ attraction.province?.nameEn || attraction.province }}</p>
            <p class="map-sub">Interactive map will show here</p>
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
                <img :src="place.image" :alt="place.name" />
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
          <button class="btn-favorite">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Save to favorites
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
import { useRoute, useRouter } from 'vue-router'
import API from '@/api/axios'
import { mockAttractions } from '@/data/mockAttractions'
import { getProvinces } from '@/services/home.service'

// Local nearby images (if you have local images for nearby places)
// import tataiResortImg from '@/assets/images/nearby/tatai-resort.jpg'
// import peamKrasaopImg from '@/assets/images/nearby/peam-krasaop.jpg'

const route = useRoute()
const router = useRouter()

// State
const attraction = ref<any>(null)
const nearbyPOIs = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const provinceNameById = ref<Record<number, string>>({})

const heroImage = computed(() =>
  attraction.value?.heroImage ||
  attraction.value?.image ||
  attraction.value?.image_url ||
  'https://www.asiakingtravel.com/cuploads/files/royalpalace-att-b.jpg'
)

type PlaceSummary = {
  name: string
  province: string
  category: string
  rating: number
  reviews: number
  description: string
  image: string
  tags: string[]
}

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
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

  return {
    id: placeSlug,
    name: place.name,
    province: place.province,
    provinceSlug,
    rating: place.rating,
    reviews: place.reviews,
    heroImage: place.image,
    badges: ['HIDDEN GEM', (place.category || 'Attraction').toUpperCase(), 'TOP RATED'],
    tags: place.tags,
    about: [
      place.description,
      `Discover more of ${place.province} by exploring nearby attractions and building your itinerary based on travel type and season.`
    ],
    photos: [place.image, place.image, place.image, place.image, place.image, place.image],
    info: {
      bestTime: 'All year',
      duration: '2-4 hours',
      difficulty: 'Easy',
      bestFor: 'Solo, Friends, Family',
      province: place.province,
    },
    nearby,
  }
}

// Store all attraction data with local images
const attractionsData: Record<string, any> = {
  'koh-kong/tatai-waterfall': {
    id: 'tatai-waterfall',
    name: 'Tatai Waterfall',
    province: 'Koh Kong',
    provinceSlug: 'koh-kong',
    rating: 4.9,
    reviews: 743,
    heroImage: heroImage,
    badges: ['HIDDEN GEM', 'WATERFALL', 'TOP RATED'],
    tags: ['Waterfall', 'Nature', 'Friends', 'Trekking', 'Swimming', 'Hidden Gem'],
    about: [
      'Located in the heart of the Cardamom Mountains, the Tatai Waterfall is a spectacular natural landmark where the fresh water of the Tatai River meets the salty seawater. This multi-tiered cascade is renowned for its wide, curtain-like flow that spans over 30 meters, creating a thunderous yet serene atmosphere that captivates every visitor.',
      'Accessible only by a scenic boat ride through the lush mangrove forests or a challenging jungle trek, the journey to the falls is an adventure in itself. The best time to visit is during the rainy season (October to November) when the water volume is at its peak, transforming the landscape into a powerful display of nature\'s raw beauty and emerald-green vitality.'
    ],
    photos: [
      'https://www.asiakingtravel.com/cuploads/files/Tatai-waterfall-2.jpg',
      'https://kura2bus.com/blog/wp-content/uploads/2023/10/DSC_0887.jpg',
      'https://thealtruistictraveller.com/s/51524087023470235/blog/SAM_4897.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/1/1e/%E1%9E%88%E1%9E%9A%E1%9E%96%E1%9E%B8%E1%9E%9B%E1%9E%BE%E1%9E%94%E1%9F%89%E1%9E%98%E1%9E%98%E1%9E%BE%E1%9E%9B%E1%9E%91%E1%9F%85%E1%9E%96%E1%9F%92%E1%9E%9A%E1%9F%83%E1%9E%80%E1%9F%84%E1%9E%84%E1%9E%80%E1%9E%B6%E1%9E%84_-_panoramio.jpg',
      'https://travelsetu.com/apps/uploads/new_destinations_photos/destination/2024/06/28/0dc327612f9e0a519a343ecc3329b2b3_1000x1000.jpg',
      'https://merrytravelasia.com/wp-content/uploads/2023/06/Koh-Rong.jpg',
    ],
    info: {
      bestTime: 'Oct – Nov',
      duration: '3–5 hours',
      difficulty: 'Moderate',
      bestFor: 'Friends, Nature lovers',
      province: 'Koh Kong'
    },
    nearby: [
      { name: 'Tatai River Resort', slug: 'tatai-river-resort', location: 'KOH KONG', image: 'https://www.asiakingtravel.com/cuploads/files/Tatai-waterfall-2.jpg' },
      { name: 'Peam Krasaop', slug: 'peam-krasaop', location: 'KOH KONG', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/%E1%9E%88%E1%9E%9A%E1%9E%96%E1%9E%B8%E1%9E%9B%E1%9E%BE%E1%9E%94%E1%9F%89%E1%9E%98%E1%9E%98%E1%9E%BE%E1%9E%9B%E1%9E%91%E1%9F%85%E1%9E%96%E1%9F%92%E1%9E%9A%E1%9F%83%E1%9E%80%E1%9F%84%E1%9E%84%E1%9E%80%E1%9E%B6%E1%9E%84_-_panoramio.jpg' },
      { name: 'Koh Kong Beach', slug: 'koh-kong-beach', location: 'KOH KONG', image: 'https://merrytravelasia.com/wp-content/uploads/2023/06/Koh-Rong.jpg' },
      { name: 'Cardamom Trek', slug: 'cardamom-trek', location: 'KOH KONG', image: 'https://kura2bus.com/blog/wp-content/uploads/2023/10/DSC_0887.jpg' },
      { name: 'Chi Phut Village', slug: 'chi-phat-eco-village', location: 'KOH KONG', image: 'https://thealtruistictraveller.com/s/51524087023470235/blog/SAM_4897.jpg' },
    ]
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
    loading.value = false
    return
  }

  const detailedKey = `${provinceSlug}/${placeSlug}`
  if (attractionsData[detailedKey]) {
    attraction.value = attractionsData[detailedKey]
    loading.value = false
    return
  }

  const routePlace = getPlaceFromRoute()
  if (routePlace?.place) {
    attraction.value = buildGenericAttraction(routePlace.place, routePlace.provinceSlug, routePlace.placeSlug)
    loading.value = false
    return
  }

  attraction.value = null
  loading.value = false
  setTimeout(() => {
    router.push(`/province/${provinceSlug}`)
  }, 1200)
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

// Fetch attraction data from backend
const fetchAttraction = async () => {
  try {
    loading.value = true
    error.value = null
    
    const attractionId = route.params.id as string

    if (!attractionId) {
      return
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
    } else {
      error.value = err.response?.data?.message || 'Failed to load attraction details'
    }
    
    if (err.response?.status === 404) {
      setTimeout(() => {
        router.push('/')
      }, 3000)
    }
  } finally {
    loading.value = false
  }
}

watch(
  () => [route.params.slug, route.params.placeSlug, route.params.id],
  () => {
    loadAttraction()
  },
  { immediate: true },
)
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.attraction-page {
  font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
  color: #1a1a1a;
  background: #fff;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top-color: #C8922A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #666;
  font-size: 14px;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 80px 20px;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.error-state h2 {
  font-size: 2rem;
  color: #e74c3c;
}

.error-state p {
  color: #666;
  margin-bottom: 20px;
}

.back-home {
  display: inline-block;
  padding: 12px 24px;
  background: #C8922A;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
}

.back-home:hover {
  background: #b07820;
}

/* Hero Section */
.hero {
  position: relative;
  height: 380px;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%);
}
.breadcrumb {
  position: absolute;
  top: 16px;
  left: 1.5rem;
  color: rgba(255,255,255,0.7);
  font-size: 11px;
  letter-spacing: 0.08em;
  z-index: 2;
}
.breadcrumb a { color: rgba(255,255,255,0.7); text-decoration: none; }
.breadcrumb a:hover { color: #fff; }
.hero-content {
  position: relative;
  z-index: 2;
  padding: 0 1.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
.hero-badges { display: flex; gap: 8px; margin-bottom: 10px; }
.badge {
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
  padding: 3px 8px; border-radius: 4px;
  background: rgba(255,255,255,0.15); color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
}
.hero-title {
  font-size: 2.6rem; font-weight: 700; color: #fff;
  margin-bottom: 8px; text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.hero-meta { display: flex; align-items: center; gap: 1.5rem; }
.meta-location, .meta-rating {
  display: flex; align-items: center; gap: 5px;
  color: rgba(255,255,255,0.9); font-size: 14px;
}
.reviews { color: rgba(255,255,255,0.65); }

/* Main Content */
.main-wrapper {
  max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem;
  display: grid; grid-template-columns: 1fr 300px;
  gap: 2.5rem; align-items: start;
}

.tags-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 2rem; }
.tag {
  padding: 5px 14px; border: 1px solid #ccc; border-radius: 20px;
  font-size: 13px; color: #444; cursor: pointer; transition: all 0.2s;
}
.tag:hover { border-color: #C8922A; color: #C8922A; }

.section { margin-bottom: 2.5rem; }
.section h2 { font-size: 1.3rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem; }
.section p { font-size: 14px; color: #555; line-height: 1.75; margin-bottom: 0.75rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.view-all { font-size: 13px; color: #C8922A; text-decoration: none; font-weight: 500; }
.view-all:hover { text-decoration: underline; }

/* Photo Grid */
.photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.photo-item { border-radius: 8px; overflow: hidden; aspect-ratio: 4/3; }
.photo-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.photo-item:hover img { transform: scale(1.05); }

/* POI Grid */
.poi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.poi-category {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #C8922A;
}

.poi-category h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #333;
}

.poi-category ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.poi-category li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  font-size: 13px;
}

.poi-category li:last-child {
  border-bottom: none;
}

.poi-category strong {
  color: #C8922A;
}

.open-24h {
  display: inline-block;
  background: #2ecc71;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

/* Map */
.map-placeholder {
  border: 2px dashed #d0d0d0; border-radius: 12px; padding: 3rem;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 8px; background: #f9f9f9; min-height: 180px;
}
.map-label { font-size: 14px; font-weight: 600; color: #333; }
.map-sub { font-size: 12px; color: #888; }

/* Sidebar */
.sidebar { position: sticky; top: 76px; }
.sidebar-card { border: 1px solid #e0e0e0; border-radius: 14px; padding: 1.25rem; background: #fff; }
.sidebar-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.sidebar-sub { font-size: 12px; color: #888; margin-bottom: 1rem; }

.btn-add-trip {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; padding: 10px; background: #C8922A; color: #fff; border: none;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
  margin-bottom: 8px; transition: background 0.2s;
}
.btn-add-trip:hover { background: #b07820; }
.btn-favorite {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; padding: 10px; background: #fff; color: #333;
  border: 1px solid #ccc; border-radius: 8px; font-size: 14px;
  cursor: pointer; margin-bottom: 1.25rem; transition: all 0.2s;
}
.btn-favorite:hover { border-color: #C8922A; color: #C8922A; }

.info-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 1.25rem; }
.info-row { display: flex; align-items: center; gap: 10px; }
.info-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.clock { background: #e8f5e9; }
.duration { background: #e3f2fd; }
.difficulty { background: #fff3e0; }
.bestFor { background: #fce4ec; }
.province { background: #ede7f6; }
.info-label { font-size: 10px; letter-spacing: 0.08em; color: #aaa; margin-bottom: 1px; }
.info-value { font-size: 13px; font-weight: 600; color: #222; }

.cta-box { background: #fff8e1; border: 1px solid #ffe082; border-radius: 10px; padding: 12px; }
.cta-box p { font-size: 12px; color: #555; line-height: 1.5; margin-bottom: 8px; }
.btn-cta {
  width: 100%; padding: 8px; background: #C8922A; color: #fff; border: none;
  border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s;
}
.btn-cta:hover { background: #b07820; }

/* Responsive */
@media (max-width: 900px) {
  .main-wrapper { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .photo-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .hero-title { font-size: 1.8rem; }
  .photo-grid { grid-template-columns: 1fr; }
  .poi-grid { grid-template-columns: 1fr; }
}
</style>
