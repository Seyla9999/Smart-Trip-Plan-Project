<template>
  <div class="invite-page">
    <div class="invite-shell">
      <div class="invite-card">

        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          <span class="spinner"></span>
          <span>Loading trip details…</span>
        </div>

        <!-- Error -->
        <div v-else-if="error && !trip" class="error-state">
          <div class="error-icon">⚠️</div>
          <h2>Invite link could not be opened</h2>
          <p>{{ error }}</p>
          <div class="actions">
            <button class="ghost" @click="goHome">Back Home</button>
          </div>
        </div>

        <!-- Trip loaded -->
        <template v-else>
          <!-- Header -->
          <div class="card-header">
            <p class="eyebrow">✈️ Trip Invitation</p>
            <h1>{{ trip?.title || 'Shared Trip' }}</h1>
            <p class="subtitle">You've been invited to join this trip plan!</p>
          </div>

          <!-- Trip overview banner -->
          <div class="trip-banner">
            <div class="banner-route">
              <div class="banner-place">
                <span class="place-label">From</span>
                <span class="place-name">{{ originLabel }}</span>
              </div>
              <span class="banner-arrow">→</span>
              <div class="banner-place">
                <span class="place-label">To</span>
                <span class="place-name">{{ destinationLabel }}</span>
              </div>
            </div>
            <div class="banner-meta">
              <span class="meta-chip">📅 {{ dateRange }}</span>
              <span class="meta-chip">🕐 {{ durationLabel }}</span>
              <span class="meta-chip">{{ travelTypeIcon }} {{ travelTypeLabel }}</span>
              <span class="meta-chip">📍 {{ stopCount }} stops</span>
            </div>
          </div>

          <!-- Itinerary per day -->
          <div v-if="groupedDays.length" class="itinerary-section">
            <h3 class="section-title">Trip Itinerary</h3>
            <div class="days-list">
              <div v-for="group in groupedDays" :key="group.day" class="day-block">
                <div class="day-header">
                  <span class="day-badge">Day {{ group.day }}</span>
                  <span class="day-date">{{ group.dateLabel }}</span>
                  <span class="day-count">{{ group.items.length }} stop{{ group.items.length !== 1 ? 's' : '' }}</span>
                </div>
                <div class="stops-list">
                  <div v-for="(item, idx) in group.items" :key="idx" class="stop-item">
                    <div class="stop-num">{{ idx + 1 }}</div>
                    <div class="stop-info">
                      <div class="stop-name">{{ item.name }}</div>
                      <div v-if="item.category" class="stop-cat">{{ categoryIcon(item.category) }} {{ item.category }}</div>
                      <div v-if="item.time" class="stop-time">🕐 {{ item.time }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-itinerary">
            <span>🗺️</span>
            <p>No itinerary items yet — join the trip to help plan it!</p>
          </div>

          <!-- Actions -->
          <div class="actions">
            <button
              v-if="isAuthenticated && !alreadyMember"
              class="primary"
              :disabled="joining"
              @click="joinTrip"
            >
              <span v-if="joining" class="spinner small"></span>
              {{ joining ? 'Joining…' : '✅ Join This Trip' }}
            </button>

            <button
              v-else-if="isAuthenticated && alreadyMember"
              class="primary"
              @click="goToTrip"
            >
              📋 View Trip Plan
            </button>

            <button
              v-else-if="!isAuthenticated"
              class="primary"
              @click="goToRegister"
            >
              🚀 Register to Join
            </button>

            <button
              v-if="!isAuthenticated"
              class="secondary"
              @click="goToLogin"
            >
              Sign in
            </button>

            <button class="ghost" @click="goHome">Back Home</button>
          </div>

          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
          <p v-if="error && trip" class="error-inline">{{ error }}</p>

          <p class="helper-text">
            {{ isAuthenticated
              ? (alreadyMember ? 'You are already a member of this trip.' : 'You can join this trip right away.')
              : 'Create a free account or sign in to accept the invite.' }}
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import API from '../api/axios'
import * as groupChatService from '../services/group-chat.service'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ItineraryItem {
  id?: string
  day_number?: number
  day_index?: number
  title?: string
  notes?: string
  start_time?: string
  end_time?: string
  attraction?: {
    id?: string
    name_en?: string
    name?: string
    category?: string
  }
}

interface TripPreview {
  id?: string
  title?: string
  origin?: string
  destination?: string
  start_date?: string
  end_date?: string
  travel_type?: string
  itinerary_items?: ItineraryItem[]
  members?: { user_id: string }[]
}

// ─── Setup ────────────────────────────────────────────────────────────────────
const route = useRoute()
const router = useRouter()

const token = computed(() => String(route.params.token ?? ''))
const isAuthenticated = computed(() => !!localStorage.getItem('auth_token'))
const currentUserId = computed(() => localStorage.getItem('user_id') ?? '')
const currentRedirect = computed(() => `/trip/join/${encodeURIComponent(token.value)}`)

const joinQueryMode = computed(() => String(route.query.mode ?? ''))
const joinQueryAttractionId = computed(() => String(route.query.attractionId ?? ''))
const joinQueryAttractionName = computed(() => String(route.query.attractionName ?? ''))

const loading = ref(true)
const joining = ref(false)
const error = ref('')
const successMessage = ref('')
const trip = ref<TripPreview | null>(null)
const alreadyMember = ref(false)

// ─── Computed display values ──────────────────────────────────────────────────
const originLabel = computed(() => {
  const raw = trip.value?.origin ?? ''
  return raw ? raw.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Starting point'
})

const destinationLabel = computed(() => {
  if (joinQueryMode.value === 'attraction' && joinQueryAttractionName.value) {
    return `${joinQueryAttractionName.value} (${trip.value?.destination ?? ''})`
  }
  const raw = trip.value?.destination ?? ''
  return raw ? raw.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Destination'
})

const stopCount = computed(() => trip.value?.itinerary_items?.length ?? 0)

const dateRange = computed(() => {
  if (!trip.value?.start_date || !trip.value?.end_date) return 'Dates not set'
  const start = new Date(trip.value.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const end   = new Date(trip.value.end_date).toLocaleDateString('en-US',   { month: 'short', day: 'numeric', year: 'numeric' })
  return `${start} – ${end}`
})

const durationLabel = computed(() => {
  if (!trip.value?.start_date || !trip.value?.end_date) return ''
  const diff = Math.ceil(
    (new Date(trip.value.end_date).getTime() - new Date(trip.value.start_date).getTime()) / 86_400_000
  )
  return `${diff} day${diff !== 1 ? 's' : ''}`
})

const travelTypeLabel = computed(() => {
  const raw = String(trip.value?.travel_type ?? '').trim()
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Trip'
})

const travelTypeIcon = computed(() => {
  switch ((trip.value?.travel_type ?? '').toLowerCase()) {
    case 'solo':   return '🧳'
    case 'couple': return '💑'
    case 'family': return '👨‍👩‍👧‍👦'
    default:       return '👥'
  }
})

function categoryIcon(cat?: string) {
  switch ((cat ?? '').toLowerCase()) {
    case 'historical': return '🏛️'
    case 'nature':     return '🌿'
    case 'beach':      return '🏖️'
    case 'adventure':  return '🧗'
    case 'culture':    return '🎭'
    case 'culinary':   return '🍽️'
    default:           return '📍'
  }
}

// ─── Group itinerary items by day ─────────────────────────────────────────────
const groupedDays = computed(() => {
  const items = trip.value?.itinerary_items ?? []
  if (!items.length) return []

  const map = new Map<number, { name: string; category?: string; time?: string }[]>()

  for (const item of items) {
    const day = item.day_number ?? (item.day_index != null ? item.day_index + 1 : 1)
    if (!map.has(day)) map.set(day, [])

    const name = item.attraction?.name_en
              ?? item.attraction?.name
              ?? item.title
              ?? item.notes
              ?? 'Unnamed stop'

    const time = item.start_time
      ? (item.end_time ? `${item.start_time} – ${item.end_time}` : item.start_time)
      : undefined

    map.get(day)!.push({
      name,
      category: item.attraction?.category,
      time,
    })
  }

  const startDate = trip.value?.start_date

  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([day, dayItems]) => {
      let dateLabel = ''
      if (startDate) {
        const d = new Date(startDate)
        d.setDate(d.getDate() + day - 1)
        dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      }
      return { day, dateLabel, items: dayItems }
    })
})

// ─── API helpers ──────────────────────────────────────────────────────────────
function normalizeTripResponse(payload: any): TripPreview | null {
  if (!payload) return null
  if (payload.data?.id || payload.data?.title) return payload.data as TripPreview
  if (payload.trip?.id || payload.trip?.title) return payload.trip as TripPreview
  if (payload.id || payload.title) return payload as TripPreview
  return null
}

function checkAlreadyMember(resolved: TripPreview) {
  const uid = currentUserId.value
  if (!uid || !resolved.members?.length) return false
  return resolved.members.some(m => String(m.user_id) === String(uid))
}

// ─── Load invite preview ──────────────────────────────────────────────────────
async function loadInvitePreview() {
  loading.value = true
  error.value = ''

  const endpoints = [
    `/trips/join/${token.value}`,
    `/trips/invite/${token.value}`,
    `/trips/share/${token.value}`,
    `/trips/token/${token.value}`,
    // Some backends expose public preview under /public
    `/trips/public/${token.value}`,
    `/trips/preview/${token.value}`,
  ]

  let resolved: TripPreview | null = null

  for (const url of endpoints) {
    try {
      const res = await API.get(url)
      resolved = normalizeTripResponse(res.data)
      if (resolved?.id) break
    } catch { /* try next */ }
  }

  // If the invite endpoints returned nothing useful, try fetching by ID directly
  // This handles cases where the token IS the trip UUID
  if (!resolved?.id) {
    try {
      const res = await API.get(`/trips/${token.value}`)
      const candidate = normalizeTripResponse(res.data)
      if (candidate?.id) resolved = candidate
    } catch { /* not an ID */ }
  }

  trip.value = resolved

  if (resolved) {
    alreadyMember.value = checkAlreadyMember(resolved)
  } else {
    error.value = 'Could not load trip details. The invite link may be expired or invalid.'
  }

  loading.value = false
}

// ─── Join trip ────────────────────────────────────────────────────────────────
async function joinTrip() {
  if (!isAuthenticated.value) { goToRegister(); return }

  joining.value = true
  error.value = ''
  successMessage.value = ''

  const joinEndpoints = [
    `/trips/join/${token.value}`,
    `/trips/invite/${token.value}`,
    `/trips/share/${token.value}`,
    `/trips/token/${token.value}`,
  ]

  try {
    let joined: TripPreview | null = null

    for (const url of joinEndpoints) {
      try {
        const res = await API.post(url, { token: token.value })
        joined = normalizeTripResponse(res.data)
        if (joined) break
      } catch { /* try next */ }
    }

    const resolvedId = joined?.id ?? trip.value?.id
    if (resolvedId) {
      // Auto-join the group chat for this trip
      try {
        await groupChatService.getOrCreateGroupChat(resolvedId)
      } catch (err) {
        console.error('Error joining group chat:', err)
        // Don't block trip join if group chat fails
      }

      successMessage.value = '🎉 Joined successfully! Opening trip plan…'
      setTimeout(() => {
        router.replace({ name: 'trip-results', params: { id: resolvedId } })
      }, 800)
      return
    }
    throw new Error('Join did not return a trip id.')
  } catch (err: any) {
    error.value = err?.message || 'Could not join trip. Please try again.'
  } finally {
    joining.value = false
  }
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function goToTrip() {
  const id = trip.value?.id
  if (id) router.push({ name: 'trip-results', params: { id } })
  else router.push('/my-trips')
}
function goToLogin()    { router.push({ path: '/login',    query: { redirect: currentRedirect.value } }) }
function goToRegister() { router.push({ path: '/register', query: { redirect: currentRedirect.value } }) }
function goHome()       { router.push('/') }

onMounted(() => { void loadInvitePreview() })
</script>

<style scoped>
.invite-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left,  rgba(21,128,61,.14), transparent 30%),
    radial-gradient(circle at bottom right, rgba(59,130,246,.10), transparent 28%),
    linear-gradient(180deg, #f8faf9 0%, #eef7f0 100%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px 60px;
}

.invite-shell {
  width: 100%;
  max-width: 720px;
}

.invite-card {
  background: rgba(255,255,255,.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(21,128,61,.12);
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(15,23,42,.12);
  padding: 36px 40px;
}

/* ── Loading / Error states ──────────────────────────────── */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: #6b7280;
  font-size: 15px;
}

.error-state {
  text-align: center;
  padding: 40px 0;
}
.error-icon { font-size: 48px; margin-bottom: 12px; }
.error-state h2 { font-size: 20px; font-weight: 800; color: #0f2417; margin: 0 0 8px; }
.error-state p  { color: #6b7280; margin: 0 0 24px; }

/* ── Header ──────────────────────────────────────────────── */
.card-header { margin-bottom: 24px; }

.eyebrow {
  margin: 0 0 8px;
  color: #15803d;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .16em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 800;
  color: #0f2417;
  letter-spacing: -.03em;
  line-height: 1.1;
}

.subtitle {
  margin: 0;
  color: #4b5563;
  font-size: 15px;
}

/* ── Trip banner ─────────────────────────────────────────── */
.trip-banner {
  background: linear-gradient(135deg, #f0fdf4, #e0f2fe);
  border: 1.5px solid #bbf7d0;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 28px;
}

.banner-route {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.banner-place {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.place-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #9ca3af;
}

.place-name {
  font-size: 18px;
  font-weight: 800;
  color: #0f2417;
}

.banner-arrow {
  font-size: 20px;
  color: #15803d;
  font-weight: 700;
  flex-shrink: 0;
}

.banner-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-chip {
  background: white;
  border: 1px solid #d1fae5;
  color: #065f46;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
}

/* ── Itinerary section ───────────────────────────────────── */
.itinerary-section { margin-bottom: 28px; }

.section-title {
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #15803d;
  margin: 0 0 14px;
}

.days-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day-block {
  border: 1.5px solid #e9ede8;
  border-radius: 14px;
  overflow: hidden;
}

.day-header {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f9fafb;
  padding: 10px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.day-badge {
  background: #15803d;
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.day-date {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  flex: 1;
}

.day-count {
  font-size: 11px;
  color: #9ca3af;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 999px;
}

.stops-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.stop-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
}
.stop-item:last-child { border-bottom: none; }

.stop-num {
  width: 24px;
  height: 24px;
  background: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: #15803d;
  flex-shrink: 0;
  margin-top: 1px;
}

.stop-info { flex: 1; min-width: 0; }

.stop-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f2417;
  line-height: 1.3;
}

.stop-cat {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
  text-transform: capitalize;
}

.stop-time {
  font-size: 11px;
  color: #0369a1;
  font-weight: 600;
  margin-top: 3px;
}

/* ── No itinerary ────────────────────────────────────────── */
.no-itinerary {
  text-align: center;
  padding: 24px;
  border: 2px dashed #e5e7eb;
  border-radius: 14px;
  color: #9ca3af;
  font-size: 13px;
  margin-bottom: 24px;
}
.no-itinerary span { font-size: 28px; display: block; margin-bottom: 6px; }

/* ── Actions ─────────────────────────────────────────────── */
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

button {
  border: 0;
  cursor: pointer;
  border-radius: 999px;
  padding: 13px 22px;
  font-weight: 700;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform .18s, box-shadow .18s, opacity .18s;
}
button:hover:not(:disabled) { transform: translateY(-1px); }
button:disabled { cursor: not-allowed; opacity: .7; }

.primary {
  background: linear-gradient(135deg,#15803d,#0f766e);
  color: white;
  box-shadow: 0 8px 24px rgba(21,128,61,.28);
}

.secondary {
  background: #e0f2fe;
  color: #075985;
}

.ghost {
  background: #f3f4f6;
  color: #374151;
}

/* ── Messages ────────────────────────────────────────────── */
.success-message {
  margin: 0 0 8px;
  color: #15803d;
  font-weight: 700;
  font-size: 14px;
}

.error-inline {
  margin: 0 0 8px;
  color: #dc2626;
  font-size: 13px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 8px 12px;
  border-radius: 8px;
}

.helper-text {
  margin: 0;
  color: #9ca3af;
  font-size: 12px;
}

/* ── Spinner ─────────────────────────────────────────────── */
.spinner {
  display: inline-block;
  width: 18px; height: 18px;
  border-radius: 50%;
  border: 2.5px solid rgba(255,255,255,.3);
  border-top-color: white;
  animation: spin .7s linear infinite;
  flex-shrink: 0;
}
.spinner.small { width: 14px; height: 14px; }

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 640px) {
  .invite-card { padding: 24px 20px; }
  h1 { font-size: 26px; }
  .banner-route { gap: 10px; }
  .place-name { font-size: 15px; }
}
</style>