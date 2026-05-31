<template>
  <div class="my-trips-page">
    <!-- Background texture -->
    <div class="page-bg"></div>

    <div class="page-wrapper">

      <!-- ── Header ─────────────────────────────────────────────────────── -->
      <header class="page-header">
        <div class="header-left">
          <h1 class="page-title">My Trips</h1>
          <p class="page-sub">{{ totalTrips }} {{ totalTrips === 1 ? 'adventure' : 'adventures' }} planned</p>
        </div>
        <router-link to="/trip" class="btn-new">
          <span class="btn-new-icon">＋</span> Plan New Trip
        </router-link>
      </header>

      <!-- ── Loading ────────────────────────────────────────────────────── -->
      <div v-if="isLoading" class="loading-state">
        <div class="loader-ring"></div>
        <p>Loading your trips…</p>
      </div>

      <!-- ── Empty state ─────────────────────────────────────────────────── -->
      <div v-else-if="!isLoading && trips.length === 0" class="empty-state">
        <div class="empty-illustration">🗺️</div>
        <h2>No trips yet</h2>
        <p>Start planning your first Cambodian adventure</p>
        <router-link to="/trip" class="btn-new">＋ Plan a Trip</router-link>
      </div>

      <template v-else>

        <!-- ── Undated Trips ─────────────────────────────────────────────── -->
        <section v-if="undatedTrips.length" class="section">
          <div class="section-label">
            <span class="dot dot-gray"></span> No Date Set
          </div>
          <div class="trips-grid">
            <article
              v-for="trip in undatedTrips" :key="trip.id"
              class="trip-card"
              @click="goToTrip(trip)"
            >
              <div class="card-bar" :style="{ background: tripColor(trip.id) }"></div>
              <div class="card-body">
                <div class="card-title-row">
                  <h3 class="card-title">{{ trip.title }}</h3>
                  <span v-if="trip.status === 'completed'" class="completed-badge">✓ Completed</span>
                  <button class="btn-delete" @click.stop="confirmDelete(trip)" title="Delete trip">✕</button>
                </div>
                <div class="card-route">
                  <span class="route-from">{{ formatDestination(trip).from }}</span>
                  <span class="route-arrow">→</span>
                  <span class="route-to">{{ formatDestination(trip).to }}</span>
                </div>
                <div class="card-dates" style="color:#9ca3af;font-style:italic">
                  No dates scheduled yet
                </div>
                <div class="card-stats">
                  <div class="stat">
                    <span class="stat-num">{{ trip.itinerary_items?.length ?? 0 }}</span>
                    <span class="stat-label">places</span>
                  </div>
                  <div class="stat">
                    <span class="stat-num">{{ trip.members?.length ?? 1 }}</span>
                    <span class="stat-label">members</span>
                  </div>
                  <div class="stat">
                    <span class="stat-num">{{ trip.packing_list?.length ? `${trip.packing_list.filter(p => p.packed).length}/${trip.packing_list.length}` : '—' }}</span>
                    <span class="stat-label">packed</span>
                  </div>
                </div>
                <div class="card-actions">
                  <button class="btn-detail" @click.stop="viewPlanDetail(trip)">📋 Plan Detail</button>
                  <button class="btn-share" @click.stop="shareTrip(trip)">🔗 Share</button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- ── Upcoming Trips ────────────────────────────────────────────── -->
        <section v-if="upcomingTrips.length" class="section">
          <div class="section-label">
            <span class="dot dot-green"></span> Upcoming
          </div>

          <div class="trips-grid">
            <article
              v-for="trip in upcomingTrips" :key="trip.id"
              class="trip-card trip-card--upcoming"
            >
              <a class="card-overlay" :href="`/trip/results/${trip.id}`" @click.prevent="goToTrip(trip)" aria-hidden></a>
              <!-- Card top bar -->
              <div class="card-bar" :style="{ background: tripColor(trip.id) }"></div>

              <div class="card-body">
                <!-- Title row -->
                <div class="card-title-row">
                  <h3 class="card-title">{{ trip.title }}</h3>
                  <span v-if="trip.status === 'completed'" class="completed-badge">✓ Completed</span>
                  <button
                    class="btn-delete"
                    @click.stop="confirmDelete(trip)"
                    title="Delete trip"
                  >✕</button>
                </div>

                <!-- Route -->
                <div class="card-route">
                  <span class="route-from">{{ formatDestination(trip).from }}</span>
                  <span class="route-arrow">→</span>
                  <span class="route-to">{{ formatDestination(trip).to }}</span>
                </div>

                <!-- Dates -->
                <div class="card-dates">
                  <span class="date-icon">📅</span>
                  {{ formatDate(trip.start_date) }} – {{ formatDate(trip.end_date) }}
                  <span class="duration-badge">{{ tripDuration(trip) }}d</span>
                </div>

                <!-- ── Countdown ─────────────────────────────────────── -->
                <div class="countdown-block">
                  <div class="countdown-label">Trip starts in</div>
                  <div class="countdown-units">
                    <div class="countdown-unit">
                      <span class="countdown-num">{{ countdown(trip).days }}</span>
                      <span class="countdown-sub">days</span>
                    </div>
                    <div class="countdown-sep">:</div>
                    <div class="countdown-unit">
                      <span class="countdown-num">{{ countdown(trip).hours }}</span>
                      <span class="countdown-sub">hrs</span>
                    </div>
                    <div class="countdown-sep">:</div>
                    <div class="countdown-unit">
                      <span class="countdown-num">{{ countdown(trip).minutes }}</span>
                      <span class="countdown-sub">min</span>
                    </div>
                  </div>
                  <div class="countdown-progress-track">
                    <div
                      class="countdown-progress-fill"
                      :style="{ width: tripProgress(trip) + '%', background: tripColor(trip.id) }"
                    ></div>
                  </div>
                </div>

                <!-- Stats row -->
                <div class="card-stats">
                  <div class="stat">
                    <span class="stat-num">{{ trip.itinerary_items?.length ?? 0 }}</span>
                    <span class="stat-label">places</span>
                  </div>
                  <div class="stat">
                    <span class="stat-num">{{ trip.members?.length ?? 1 }}</span>
                    <span class="stat-label">members</span>
                  </div>
                  <div class="stat">
                    <span class="stat-num">{{ trip.packing_list?.length ? `${trip.packing_list.filter(p => p.packed).length}/${trip.packing_list.length}` : '—' }}</span>
                    <span class="stat-label">packed</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="card-actions">
                  <button class="btn-detail" @click.stop="viewPlanDetail(trip)">📋 Plan Detail</button>
                  <button class="btn-share" @click.stop="shareTrip(trip)">🔗 Share</button>
                </div>
              </div>
              
            </article>
          </div>
        </section>

        <!-- ── Ongoing Trips ─────────────────────────────────────────────── -->
        <section v-if="ongoingTrips.length" class="section">
          <div class="section-label">
            <span class="dot dot-amber"></span> Ongoing
          </div>
          <div class="trips-grid">
            <article
              v-for="trip in ongoingTrips" :key="trip.id"
              class="trip-card trip-card--ongoing"
            >
              <a class="card-overlay" :href="`/trip/results/${trip.id}`" @click.prevent="goToTrip(trip)" aria-hidden></a>
              <div class="card-bar" style="background: linear-gradient(90deg,#f59e0b,#f97316)"></div>
              <div class="card-body">
                <div class="card-title-row">
                  <h3 class="card-title">{{ trip.title }}</h3>
                  <span v-if="trip.status === 'completed'" class="completed-badge">✓ Completed</span>
                  <div v-else class="ongoing-badge">🟠 In Progress</div>
                  <button class="btn-delete" @click.stop="confirmDelete(trip)">✕</button>
                </div>
                <div class="card-route">
                  <span class="route-from">{{ formatDestination(trip).from }}</span>
                  <span class="route-arrow">→</span>
                  <span class="route-to">{{ formatDestination(trip).to }}</span>
                </div>
                <div class="card-dates">
                  <span class="date-icon">📅</span>
                  {{ formatDate(trip.start_date) }} – {{ formatDate(trip.end_date) }}
                  <span class="duration-badge" style="background:#fef3c7;color:#92400e">{{ tripDuration(trip) }}d</span>
                </div>
                <div class="countdown-block" style="border-color:#fef3c7">
                  <div class="countdown-label">Day {{ currentDay(trip) }} of {{ tripDuration(trip) }}</div>
                  <div class="countdown-progress-track">
                    <div class="countdown-progress-fill" :style="{ width: dayProgress(trip) + '%', background: 'linear-gradient(90deg,#f59e0b,#f97316)' }"></div>
                  </div>
                </div>
                <div class="card-stats">
                  <div class="stat"><span class="stat-num">{{ trip.itinerary_items?.length ?? 0 }}</span><span class="stat-label">places</span></div>
                  <div class="stat"><span class="stat-num">{{ trip.members?.length ?? 1 }}</span><span class="stat-label">members</span></div>
                  <div class="stat"><span class="stat-num">{{ trip.packing_list?.length ? `${trip.packing_list.filter(p => p.packed).length}/${trip.packing_list.length}` : '—' }}</span><span class="stat-label">packed</span></div>
                </div>
                <div class="card-actions">
                  <button class="btn-detail" @click.stop="viewPlanDetail(trip)">📋 Plan Detail</button>
                  <button class="btn-share" @click.stop="shareTrip(trip)">🔗 Share</button>
                </div>
              </div>
              
            </article>
          </div>
        </section>

        <!-- ── Past Trips (History) ──────────────────────────────────────── -->
        <section v-if="pastTrips.length" class="section">
          <div class="section-label">
            <span class="dot dot-gray"></span> History
          </div>

          <div class="history-list">
            <article
              v-for="trip in pastTrips" :key="trip.id"
              class="history-card"
            >
              <div class="history-bar" :style="{ background: tripColor(trip.id) }"></div>

              <div class="history-body">
                <div class="history-left">
                  <div class="history-icon">{{ destinationEmoji(trip) }}</div>
                  <div>
                    <h3 class="history-title">{{ trip.title }}</h3>
                    <div class="history-route">
                      {{ formatDestination(trip).from }} → {{ formatDestination(trip).to }}
                    </div>
                    <div class="history-meta">
                      📅 {{ formatDate(trip.start_date) }} – {{ formatDate(trip.end_date) }}
                      &nbsp;·&nbsp;
                      {{ tripDuration(trip) }} days
                      &nbsp;·&nbsp;
                      {{ trip.itinerary_items?.length ?? 0 }} places visited
                    </div>
                  </div>
                </div>

                <div class="history-right">
                  <span class="history-badge">Completed</span>
                  <button class="btn-detail-sm" @click="viewPlanDetail(trip)" title="View plan">📋</button>
                  <button class="btn-delete-sm" @click="confirmDelete(trip)" title="Delete">🗑️</button>
                </div>
              </div>
            </article>
          </div>
        </section>

      </template>
    </div>

    <!-- ── Delete Confirm Modal ──────────────────────────────────────────── -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="tripToDelete" class="modal-overlay" @click.self="tripToDelete = null">
          <div class="modal-box">
            <div class="modal-icon">🗑️</div>
            <h3 class="modal-title">Delete Trip?</h3>
            <p class="modal-desc">
              "<strong>{{ tripToDelete.title }}</strong>" will be permanently deleted.
              This cannot be undone.
            </p>
            <div class="modal-actions">
              <button class="btn-cancel" @click="tripToDelete = null">Cancel</button>
              <button class="btn-confirm-delete" :disabled="isDeleting" @click="deleteTrip">
                <span v-if="isDeleting" class="mini-spinner"></span>
                {{ isDeleting ? 'Deleting…' : 'Yes, Delete' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ── Share Modal ───────────────────────────────────────────────────── -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="tripToShare" class="modal-overlay" @click.self="tripToShare = null">
          <div class="modal-box">
            <div class="modal-icon">🔗</div>
            <h3 class="modal-title">Invite Friends</h3>
            <p class="modal-desc">Share this link so friends can join your trip</p>
            <div class="share-link-row">
              <input :value="shareLink" readonly class="share-input" @focus="selectInput($event)" />
              <button class="btn-copy" @click="copyLink">{{ copiedText }}</button>
            </div>
            <div class="share-buttons">
              <button class="share-btn share-wa"  @click="shareWhatsApp">💬 WhatsApp</button>
              <button class="share-btn share-em"  @click="shareEmail">📧 Email</button>
              <button class="share-btn share-fb"  @click="shareFacebook">👍 Facebook</button>
            </div>
            <button class="modal-close" @click="tripToShare = null">✕</button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ── Plan Detail Modal ───────────────────────────────────────────────── -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="tripToView" class="modal-overlay" @click.self="tripToView = null">
          <div class="plan-modal-box">
            <button class="modal-close" @click="tripToView = null">✕</button>

            <div class="plan-modal-header">
              <div class="plan-modal-icon">🗺️</div>
              <h3 class="plan-modal-title">{{ tripToView.title }}</h3>
              <div class="plan-modal-meta">
                <span v-if="tripToView.start_date">
                  📅 {{ formatDate(tripToView.start_date) }}
                  <template v-if="tripToView.end_date"> – {{ formatDate(tripToView.end_date) }}</template>
                </span>
                <span v-else style="color:#9ca3af;font-style:italic">No dates set</span>
                <span class="plan-meta-dot">·</span>
                <span>{{ tripToView.itinerary_items?.length ?? 0 }} places</span>
              </div>
            </div>

            <div class="plan-modal-body">
              <div v-if="!groupedItinerary.length" class="plan-empty">
                <div style="font-size:40px;margin-bottom:8px">📭</div>
                <p>No itinerary items added yet.</p>
                <p style="font-size:12px;color:#9ca3af">Use the Trip Planner to build your schedule.</p>
              </div>
              <div v-else class="plan-days">
                <div v-for="group in groupedItinerary" :key="group.dayIndex" class="plan-day">
                  <div class="plan-day-label">Day {{ group.dayIndex + 1 }}</div>
                  <div class="plan-items">
                    <div v-for="item in group.items" :key="item.id" class="plan-item">
                      <div class="plan-item-icon">{{ categoryIcon(item.attraction?.category) }}</div>
                      <div class="plan-item-info">
                        <div class="plan-item-name">{{ item.attraction?.name_en ?? item.notes ?? 'Unnamed stop' }}</div>
                        <div v-if="item.attraction?.category" class="plan-item-cat">{{ item.attraction.category }}</div>
                        <div v-if="item.start_time || item.end_time" class="plan-item-time">
                          🕐 {{ item.start_time ?? '?' }}<template v-if="item.end_time"> – {{ item.end_time }}</template>
                        </div>
                        <div v-if="item.notes && item.attraction" class="plan-item-notes">{{ item.notes }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="plan-modal-footer">
              <button
                class="plan-finish-btn"
                :disabled="isFinishing || tripToView?.status === 'completed'"
                @click="finishTrip"
              >
                <span v-if="isFinishing" class="mini-spinner"></span>
                {{ isFinishing ? 'Saving…' : tripToView?.status === 'completed' ? '✓ Completed' : '✓ Finish Trip' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ── Review Prompt Modal ──────────────────────────────────────────────── -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showReviewPrompt" class="modal-overlay" @click.self="showReviewPrompt = false">
          <div class="modal-box">
            <div class="modal-icon">🎉</div>
            <h3 class="modal-title">Trip Completed!</h3>
            <p class="modal-desc">
              Congratulations on completing your trip!<br>
              Would you like to leave a review for the attractions you visited?
            </p>
            <div class="modal-actions">
              <button class="btn-cancel" @click="showReviewPrompt = false">Not Now</button>
              <button
                class="btn-confirm-delete"
                style="background:#15803d"
                :disabled="!finishedAttractions.length"
                @click="goToReview"
              >Leave a Review</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ── Toast ─────────────────────────────────────────────────────────── -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.msg" class="toast" :class="toast.type">{{ toast.msg }}</div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// ─── Types ────────────────────────────────────────────────────────────────────
interface PackingItem    { id: string; name: string; quantity: number; packed: boolean }
interface TripMember     { id: string; user_id: string; role: string }
interface ItineraryAttraction { id: string; name_en: string; name_kh?: string; category?: string }
interface ItineraryItem {
  id: string
  day_index: number
  sort_order?: number
  notes?: string
  start_time?: string
  end_time?: string
  attraction?: ItineraryAttraction
}
interface Trip {
  id:              string
  title:           string
  origin?:         string
  destination?:    string
  start_date:      string
  end_date:        string
  owner_id:        string
  invite_token?:   string
  status?:         string
  created_at:      string
  members?:        TripMember[]
  itinerary_items?: ItineraryItem[]
  packing_list?:   PackingItem[]
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const router   = useRouter()

// ─── State ────────────────────────────────────────────────────────────────────
const trips       = ref<Trip[]>([])
const isLoading   = ref(false)
const tripToDelete = ref<Trip | null>(null)
const tripToShare  = ref<Trip | null>(null)
const tripToView   = ref<Trip | null>(null)
const isDeleting  = ref(false)
const copiedText  = ref('📋 Copy')
const toast       = ref({ msg: '', type: 'success' })
const now         = ref(new Date())

let clockInterval: ReturnType<typeof setInterval> | null = null

// ─── Derived ─────────────────────────────────────────────────────────────────
const totalTrips = computed(() => trips.value.length)

const undatedTrips = computed(() =>
  trips.value.filter(t => !t.start_date || !t.end_date)
)
const upcomingTrips = computed(() =>
  trips.value.filter(t => t.start_date && t.end_date && new Date(t.start_date) > now.value)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
)
const ongoingTrips = computed(() =>
  trips.value.filter(t =>
    t.start_date && t.end_date &&
    new Date(t.start_date) <= now.value && new Date(t.end_date) >= now.value
  )
)
const pastTrips = computed(() =>
  trips.value.filter(t => t.start_date && t.end_date && new Date(t.end_date) < now.value)
    .sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const tripDuration = (trip: Trip) => {
  if (!trip.start_date || !trip.end_date) return 0
  return Math.max(1, Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / 86_400_000
  ))
}

function selectInput(e: Event) { try { (e.target as HTMLInputElement).select() } catch {} }

const slugToName = (slug: string) =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const formatDestination = (trip: Trip) => {
  if (trip.origin) {
    return { from: slugToName(trip.origin), to: trip.destination ? slugToName(trip.destination) : '?' }
  }
  const parts = (trip.destination ?? '').split('→').map(s => s.trim())
  return { from: parts[0] ? slugToName(parts[0]) : 'Unknown', to: parts[1] ? slugToName(parts[1]) : '?' }
}

const destinationEmoji = (trip: Trip) => {
  const to = formatDestination(trip).to.toLowerCase()
  if (to.includes('angkor') || to.includes('siem'))  return '🏛️'
  if (to.includes('phnom'))                           return '🏙️'
  if (to.includes('koh kong'))                        return '🌿'
  if (to.includes('kampot') || to.includes('kep'))   return '🌊'
  if (to.includes('mondulkiri'))                      return '🐘'
  return '✈️'
}

// Countdown (days, hours, minutes until start_date)
const countdown = (trip: Trip) => {
  const diff = new Date(trip.start_date).getTime() - now.value.getTime()
  if (diff <= 0) return { days: '00', hours: '00', minutes: '00' }
  const d = Math.floor(diff / 86_400_000)
  const h = Math.floor((diff % 86_400_000) / 3_600_000)
  const m = Math.floor((diff % 3_600_000)  / 60_000)
  return {
    days:    String(d).padStart(2, '0'),
    hours:   String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
  }
}

// % of time elapsed from trip creation → start date (for progress bar)
const tripProgress = (trip: Trip) => {
  const created  = new Date(trip.created_at).getTime()
  const start    = new Date(trip.start_date).getTime()
  const total    = start - created
  if (total <= 0) return 100
  const elapsed  = now.value.getTime() - created
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}

// Which day of the trip we're on (for ongoing)
const currentDay = (trip: Trip) => {
  const diff = now.value.getTime() - new Date(trip.start_date).getTime()
  return Math.min(tripDuration(trip), Math.max(1, Math.floor(diff / 86_400_000) + 1))
}

const dayProgress = (trip: Trip) =>
  Math.round((currentDay(trip) / tripDuration(trip)) * 100)

// Deterministic colour per trip id
const PALETTE = [
  'linear-gradient(90deg,#15803d,#16a34a)',
  'linear-gradient(90deg,#0369a1,#0284c7)',
  'linear-gradient(90deg,#7c3aed,#8b5cf6)',
  'linear-gradient(90deg,#be123c,#e11d48)',
  'linear-gradient(90deg,#0f766e,#0d9488)',
  'linear-gradient(90deg,#b45309,#d97706)',
]
const tripColor = (id: string) => {
  let hash = 0
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

// ─── API calls ────────────────────────────────────────────────────────────────
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('auth_token') ?? localStorage.getItem('access_token') ?? ''}`,
})

const fetchTrips = async () => {
  isLoading.value = true
  try {
    const res = await fetch(`${API_BASE}/api/trips`, { headers: authHeaders() })
    if (!res.ok) throw new Error(`${res.status}`)
    const data = await res.json()
    trips.value = Array.isArray(data) ? data : (data.data ?? data.trips ?? [])
  } catch (e) {
    showToast('Failed to load trips', 'error')
  } finally {
    isLoading.value = false
  }
}

const confirmDelete = (trip: Trip) => { tripToDelete.value = trip }

const deleteTrip = async () => {
  if (!tripToDelete.value) return
  isDeleting.value = true
  try {
    const res = await fetch(
      `${API_BASE}/api/trips/${tripToDelete.value.id}`,
      { method: 'DELETE', headers: authHeaders() }
    )
    if (!res.ok) throw new Error(`${res.status}`)
    trips.value = trips.value.filter(t => t.id !== tripToDelete.value!.id)
    showToast('Trip deleted', 'success')
    tripToDelete.value = null
  } catch {
    showToast('Failed to delete trip', 'error')
  } finally {
    isDeleting.value = false
  }
}

// ─── Plan detail ──────────────────────────────────────────────────────────────
const viewPlanDetail = (trip: Trip) => { tripToView.value = trip }

const groupedItinerary = computed(() => {
  if (!tripToView.value?.itinerary_items?.length) return []
  const map = new Map<number, ItineraryItem[]>()
  const sorted = [...tripToView.value.itinerary_items].sort(
    (a, b) => a.day_index - b.day_index || (a.sort_order ?? 0) - (b.sort_order ?? 0)
  )
  for (const item of sorted) {
    const day = item.day_index ?? 0
    if (!map.has(day)) map.set(day, [])
    map.get(day)!.push(item)
  }
  return [...map.entries()].map(([dayIndex, items]) => ({ dayIndex, items }))
})

const categoryIcon = (cat?: string) => {
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

// ─── Finish Trip / Review prompt ─────────────────────────────────────────────
const isFinishing = ref(false)
const showReviewPrompt  = ref(false)
const finishedAttractions = ref<Array<{ id: string; name: string; slug: string }>>([])

const finishTrip = async () => {
  if (!tripToView.value) return
  isFinishing.value = true
  const tripId = tripToView.value.id
  const items  = tripToView.value.itinerary_items ?? []

  try {
    const res = await fetch(
      `${API_BASE}/api/trips/${tripId}/complete`,
      { method: 'PATCH', headers: authHeaders() }
    )
    if (!res.ok) throw new Error(`${res.status}`)

    // Update local list so badge appears immediately
    const idx = trips.value.findIndex(t => t.id === tripId)
    if (idx !== -1) trips.value[idx] = { ...trips.value[idx], status: 'completed' }

    // Collect attractions for the review prompt
    finishedAttractions.value = items
      .filter(item => item.attraction?.id)
      .map(item => {
        const name = item.attraction!.name_en
        return {
          id:   item.attraction!.id,
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        }
      })

    tripToView.value = null
    showReviewPrompt.value = true
    showToast('Trip marked as completed!', 'success')
  } catch {
    showToast('Failed to complete trip', 'error')
  } finally {
    isFinishing.value = false
  }
}

const goToReview = () => {
  showReviewPrompt.value = false
  if (finishedAttractions.value.length) {
    router.push(`/attraction/${finishedAttractions.value[0].slug}`)
  }
}

// ─── Navigation ───────────────────────────────────────────────────────────────
const goToTrip = (trip: Trip) => {
  router.push({ name: 'trip-results-saved', params: { id: trip.id } })
}

// ─── Share ────────────────────────────────────────────────────────────────────
const shareLink = computed(() => {
  if (!tripToShare.value) return ''
  return tripToShare.value.invite_token
    ? `${window.location.origin}/trip/join/${tripToShare.value.invite_token}`
    : `${window.location.origin}/trip/results/${tripToShare.value.id}`
})

const shareTrip     = (trip: Trip)  => { tripToShare.value = trip }
const copyLink      = async ()      => {
  await navigator.clipboard.writeText(shareLink.value).catch(() => {})
  copiedText.value = '✓ Copied!'
  setTimeout(() => { copiedText.value = '📋 Copy' }, 2000)
}
const shareWhatsApp  = () => window.open(`https://wa.me/?text=${encodeURIComponent(`Join my trip! ${shareLink.value}`)}`, '_blank')
const shareEmail     = () => window.open(`mailto:?subject=Join my trip&body=${encodeURIComponent(shareLink.value)}`)
const shareFacebook  = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink.value)}`, '_blank')

// ─── Toast ────────────────────────────────────────────────────────────────────
const showToast = (msg: string, type = 'success') => {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = { msg: '', type: 'success' } }, 3000)
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  fetchTrips()
  clockInterval = setInterval(() => { now.value = new Date() }, 60_000)
})
onUnmounted(() => { if (clockInterval) clearInterval(clockInterval) })
</script>

<style scoped>
/* ── Base ──────────────────────────────────────────────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

.my-trips-page {
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  position: relative;
  background: #f4f6f3;
}

.page-bg {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 80% 50% at 10% 0%, rgba(21,128,61,.08) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 90% 100%, rgba(3,105,161,.07) 0%, transparent 55%);
}

.page-wrapper {
  position: relative; z-index: 1;
  max-width: 1200px; margin: 0 auto;
  padding: 48px 24px 80px;
}

/* ── Header ───────────────────────────────────────────────────────────────── */
.page-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 48px; flex-wrap: wrap; gap: 16px;
}
.page-title {
  font-family: 'Sora', sans-serif;
  font-size: 42px; font-weight: 800; color: #0f2417;
  letter-spacing: -1.5px; line-height: 1; margin: 0;
}
.page-sub { font-size: 14px; color: #6b7280; margin: 6px 0 0; }

.btn-new {
  display: inline-flex; align-items: center; gap: 8px;
  background: #15803d; color: white;
  padding: 12px 22px; border-radius: 999px;
  font-family: 'Sora', sans-serif; font-weight: 700; font-size: 14px;
  text-decoration: none; border: none; cursor: pointer;
  transition: transform .18s, box-shadow .18s;
  box-shadow: 0 4px 20px rgba(21,128,61,.3);
}
.btn-new:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(21,128,61,.35); }
.btn-new-icon { font-size: 18px; line-height: 1; }

/* ── Loading ──────────────────────────────────────────────────────────────── */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; padding: 100px 0; color: #6b7280;
}
.loader-ring {
  width: 48px; height: 48px;
  border: 4px solid #e5e7eb; border-top-color: #15803d;
  border-radius: 50%; animation: spin .8s linear infinite;
}

/* ── Empty ────────────────────────────────────────────────────────────────── */
.empty-state {
  text-align: center; padding: 100px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.empty-illustration { font-size: 72px; animation: float 3s ease-in-out infinite; }
.empty-state h2 { font-family:'Sora',sans-serif; font-size:28px; font-weight:800; color:#0f2417; margin:0; }
.empty-state p  { color:#6b7280; margin:0; }

/* ── Section ──────────────────────────────────────────────────────────────── */
.section { margin-bottom: 52px; }
.section-label {
  display: flex; align-items: center; gap: 8px;
  font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.5px; color: #6b7280;
  margin-bottom: 20px;
}
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-green { background: #15803d; }
.dot-amber { background: #f59e0b; }
.dot-gray  { background: #9ca3af; }

/* ── Trip card grid ───────────────────────────────────────────────────────── */
.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.trip-card {
  background: white; border-radius: 20px;
  overflow: hidden; cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  transition: transform .2s, box-shadow .2s;
  border: 1.5px solid #e9ede8;
}
.trip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,.10);
}

.card-bar { height: 6px; width: 100%; }

.card-body { padding: 22px 22px 18px; }

.card-title-row {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 8px; margin-bottom: 10px;
}
.card-title {
  font-family: 'Sora', sans-serif;
  font-size: 17px; font-weight: 700; color: #0f2417;
  margin: 0; flex: 1; line-height: 1.3;
}
.ongoing-badge {
  font-size: 11px; font-weight: 600; white-space: nowrap;
  background: #fef3c7; color: #92400e;
  padding: 3px 8px; border-radius: 999px;
  margin-top: 2px;
}
.completed-badge {
  font-size: 11px; font-weight: 700; white-space: nowrap;
  background: #f0fdf4; color: #15803d;
  border: 1px solid #bbf7d0;
  padding: 3px 8px; border-radius: 999px;
  margin-top: 2px;
}
.btn-delete {
  background: none; border: none; cursor: pointer;
  color: #d1d5db; font-size: 14px; padding: 2px 4px;
  border-radius: 4px; transition: color .15s, background .15s;
  flex-shrink: 0;
}
.btn-delete:hover { color: #ef4444; background: #fef2f2; }

/* Make the whole card clickable via an invisible overlay while keeping buttons clickable */
.trip-card { position: relative; }
.card-overlay {
  position: absolute; inset: 0; display: block; z-index: 2;
}
.card-body { position: relative; z-index: 1; }
.card-actions button, .btn-delete, .btn-share, .btn-view { position: relative; z-index: 3; }

.card-route {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600; color: #374151;
  margin-bottom: 8px;
}
.route-from { color: #15803d; }
.route-arrow { color: #9ca3af; }
.route-to   { color: #0369a1; }

.card-dates {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #6b7280; margin-bottom: 16px;
}
.date-icon { font-size: 13px; }
.duration-badge {
  background: #f0fdf4; color: #15803d;
  font-size: 11px; font-weight: 700;
  padding: 2px 7px; border-radius: 999px; margin-left: auto;
}

/* ── Countdown ────────────────────────────────────────────────────────────── */
.countdown-block {
  background: #f9fafb; border-radius: 12px;
  border: 1.5px solid #e9ede8;
  padding: 14px 16px; margin-bottom: 16px;
}
.countdown-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 1px; color: #9ca3af; margin-bottom: 10px;
}
.countdown-units {
  display: flex; align-items: center; gap: 6px; margin-bottom: 12px;
}
.countdown-unit { text-align: center; }
.countdown-num {
  display: block;
  font-family: 'Sora', sans-serif; font-size: 28px; font-weight: 800;
  color: #0f2417; line-height: 1;
}
.countdown-sub { font-size: 10px; color: #9ca3af; font-weight: 600; text-transform: uppercase; }
.countdown-sep { font-size: 22px; font-weight: 800; color: #d1d5db; margin-bottom: 14px; }

.countdown-progress-track {
  height: 5px; background: #e5e7eb; border-radius: 999px; overflow: hidden;
}
.countdown-progress-fill {
  height: 100%; border-radius: 999px;
  transition: width .5s ease;
}

/* ── Card stats ───────────────────────────────────────────────────────────── */
.card-stats {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 8px; margin-bottom: 16px;
}
.stat {
  background: #f9fafb; border-radius: 10px;
  padding: 10px 8px; text-align: center;
  border: 1px solid #f0f0f0;
}
.stat-num   { display: block; font-family: 'Sora',sans-serif; font-size: 18px; font-weight: 800; color: #0f2417; }
.stat-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: .5px; }

/* ── Card actions ─────────────────────────────────────────────────────────── */
.card-actions { display: flex; gap: 8px; }
.btn-view {
  flex: 1; text-align: center; text-decoration: none;
  background: #15803d; color: white;
  padding: 9px 16px; border-radius: 10px;
  font-size: 13px; font-weight: 700; font-family: 'Sora', sans-serif;
  transition: background .15s;
}
.btn-view:hover { background: #166534; }
.btn-share {
  padding: 9px 14px; border-radius: 10px;
  border: 1.5px solid #e5e7eb; background: white; color: #374151;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: border-color .15s, background .15s;
}
.btn-share:hover { border-color: #15803d; background: #f0fdf4; }

/* ── History list ─────────────────────────────────────────────────────────── */
.history-list { display: flex; flex-direction: column; gap: 12px; }

.history-card {
  background: white; border-radius: 14px;
  border: 1.5px solid #e9ede8;
  overflow: hidden; display: flex;
  transition: box-shadow .18s;
}
.history-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.07); }

.history-bar { width: 5px; flex-shrink: 0; }

.history-body {
  flex: 1; padding: 16px 20px;
  display: flex; align-items: center;
  justify-content: space-between; gap: 16px; flex-wrap: wrap;
}
.history-left  { display: flex; align-items: center; gap: 14px; }
.history-icon  { font-size: 32px; }
.history-title {
  font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700;
  color: #374151; margin: 0 0 3px;
}
.history-route { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 4px; }
.history-meta  { font-size: 12px; color: #9ca3af; }

.history-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.history-badge {
  background: #f3f4f6; color: #6b7280;
  font-size: 11px; font-weight: 700; padding: 4px 10px;
  border-radius: 999px; text-transform: uppercase; letter-spacing: .5px;
}
.btn-delete-sm {
  background: none; border: none; cursor: pointer;
  font-size: 16px; opacity: .4; transition: opacity .15s;
  padding: 4px;
}
.btn-delete-sm:hover { opacity: 1; }

/* ── Modals ───────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 16px;
}
.modal-box {
  background: white; border-radius: 24px;
  padding: 40px 36px; max-width: 420px; width: 100%;
  box-shadow: 0 24px 80px rgba(0,0,0,.2);
  text-align: center; position: relative;
}
.modal-icon  { font-size: 48px; margin-bottom: 12px; }
.modal-title {
  font-family: 'Sora', sans-serif; font-size: 22px; font-weight: 800;
  color: #0f2417; margin: 0 0 10px;
}
.modal-desc  { font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 28px; }

.modal-actions { display: flex; gap: 12px; justify-content: center; }
.btn-cancel {
  padding: 11px 24px; border-radius: 10px;
  border: 1.5px solid #e5e7eb; background: white; color: #374151;
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: background .15s;
}
.btn-cancel:hover { background: #f9fafb; }
.btn-confirm-delete {
  padding: 11px 24px; border-radius: 10px;
  background: #ef4444; color: white; border: none;
  font-size: 14px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: background .15s;
}
.btn-confirm-delete:hover:not(:disabled) { background: #dc2626; }
.btn-confirm-delete:disabled { opacity: .6; cursor: not-allowed; }

.modal-close {
  position: absolute; top: 16px; right: 18px;
  background: none; border: none; cursor: pointer;
  font-size: 18px; color: #9ca3af; transition: color .15s;
}
.modal-close:hover { color: #374151; }

/* Share modal extras */
.share-link-row { display: flex; gap: 8px; margin-bottom: 16px; }
.share-input {
  flex: 1; padding: 10px 12px; border: 1.5px solid #e5e7eb;
  border-radius: 10px; font-size: 13px; color: #6b7280;
  background: #f9fafb; outline: none;
}
.btn-copy {
  padding: 10px 14px; background: #15803d; color: white;
  border: none; border-radius: 10px; font-size: 13px;
  font-weight: 700; cursor: pointer; white-space: nowrap;
  transition: background .15s;
}
.btn-copy:hover { background: #166534; }
.share-buttons { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.share-btn {
  padding: 9px 16px; border-radius: 10px; border: none;
  font-size: 13px; font-weight: 700; cursor: pointer; color: white;
  transition: opacity .15s;
}
.share-btn:hover { opacity: .88; }
.share-wa  { background: #25D366; }
.share-em  { background: #ef4444; }
.share-fb  { background: #1877f2; }

/* ── Plan Detail button ───────────────────────────────────────────────────── */
.btn-detail {
  flex: 1; text-align: center;
  background: #0369a1; color: white; border: none;
  padding: 9px 16px; border-radius: 10px;
  font-size: 13px; font-weight: 700; font-family: 'Sora', sans-serif;
  cursor: pointer; transition: background .15s;
}
.btn-detail:hover { background: #075985; }

.btn-detail-sm {
  background: none; border: none; cursor: pointer;
  font-size: 16px; opacity: .5; transition: opacity .15s;
  padding: 4px;
}
.btn-detail-sm:hover { opacity: 1; }

/* ── Plan Detail Modal ────────────────────────────────────────────────────── */
.plan-modal-box {
  background: white; border-radius: 24px;
  width: 100%; max-width: 560px; max-height: 88vh;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,.22);
  overflow: hidden; position: relative;
}

.plan-modal-header {
  padding: 32px 32px 20px;
  border-bottom: 1.5px solid #f0f0f0;
  text-align: center;
}
.plan-modal-icon  { font-size: 36px; margin-bottom: 8px; }
.plan-modal-title {
  font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 800;
  color: #0f2417; margin: 0 0 8px; line-height: 1.3;
}
.plan-modal-meta {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; font-size: 13px; color: #6b7280; flex-wrap: wrap;
}
.plan-meta-dot { color: #d1d5db; }

.plan-modal-body {
  flex: 1; overflow-y: auto; padding: 20px 24px 28px;
}

.plan-empty {
  text-align: center; padding: 40px 20px;
  color: #6b7280; font-size: 14px; line-height: 1.6;
}

.plan-days { display: flex; flex-direction: column; gap: 20px; }

.plan-day-label {
  font-family: 'Sora', sans-serif;
  font-size: 11px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.5px;
  color: #15803d; margin-bottom: 10px;
}

.plan-items { display: flex; flex-direction: column; gap: 8px; }

.plan-item {
  display: flex; align-items: flex-start; gap: 12px;
  background: #f9fafb; border-radius: 12px;
  padding: 12px 14px; border: 1px solid #f0f0f0;
  transition: box-shadow .15s;
}
.plan-item:hover { box-shadow: 0 2px 10px rgba(0,0,0,.06); }

.plan-item-icon {
  font-size: 20px; flex-shrink: 0;
  width: 36px; height: 36px;
  background: white; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid #e5e7eb;
}

.plan-item-name {
  font-family: 'Sora', sans-serif; font-size: 14px;
  font-weight: 700; color: #0f2417; line-height: 1.3;
}
.plan-item-cat {
  font-size: 11px; color: #9ca3af;
  text-transform: uppercase; letter-spacing: .5px; margin-top: 2px;
}
.plan-item-time {
  font-size: 12px; color: #0369a1;
  font-weight: 600; margin-top: 4px;
}
.plan-item-notes {
  font-size: 12px; color: #6b7280;
  margin-top: 4px; line-height: 1.4;
  font-style: italic;
}

.plan-modal-footer {
  padding: 16px 24px 24px;
  border-top: 1.5px solid #f0f0f0;
  display: flex; justify-content: flex-end;
}
.plan-finish-btn {
  padding: 10px 24px; border-radius: 10px;
  background: #15803d; color: white; border: none;
  font-size: 14px; font-weight: 700; font-family: 'Sora', sans-serif;
  cursor: pointer; transition: background .15s;
  display: inline-flex; align-items: center; gap: 8px;
}
.plan-finish-btn:hover:not(:disabled) { background: #166534; }
.plan-finish-btn:disabled { opacity: .65; cursor: not-allowed; }

/* ── Toast ────────────────────────────────────────────────────────────────── */
.toast {
  position: fixed; bottom: 28px; right: 28px; z-index: 99999;
  padding: 12px 22px; border-radius: 12px;
  font-size: 14px; font-weight: 600;
  box-shadow: 0 8px 32px rgba(0,0,0,.18);
}
.toast.success { background: #15803d; color: white; }
.toast.error   { background: #ef4444; color: white; }

.mini-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: white; border-radius: 50%;
  animation: spin .7s linear infinite;
}

/* ── Animations ───────────────────────────────────────────────────────────── */
@keyframes spin  { to { transform: rotate(360deg); } }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

.modal-enter-active, .modal-leave-active { transition: opacity .22s ease; }
.modal-enter-from,  .modal-leave-to      { opacity: 0; }
.modal-enter-active .modal-box           { animation: popIn .22s cubic-bezier(.34,1.56,.64,1); }
@keyframes popIn { from { transform: scale(.88); opacity: 0; } }

.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateY(12px); }

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .page-wrapper  { padding: 28px 16px 60px; }
  .page-title    { font-size: 30px; }
  .trips-grid    { grid-template-columns: 1fr; }
  .history-body  { flex-direction: column; align-items: flex-start; }
  .history-right { width: 100%; justify-content: space-between; }
  .modal-box     { padding: 28px 20px; }
}
</style>