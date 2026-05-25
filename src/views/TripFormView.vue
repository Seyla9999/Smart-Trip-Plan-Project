<template>
  <div class="trip-form-container">
    <div class="trip-form-hero">
      <div class="trip-form-hero-bg"></div>
      <div class="trip-form-hero-overlay"></div>
      <div class="trip-form-hero-content">
        <h1 class="trip-form-title">Plan Your Perfect Trip</h1>
        <p class="trip-form-subtitle">Discover the best attractions and experiences tailored to your journey</p>
      </div>
    </div>

    <div class="trip-form-card">
      <form @submit.prevent="handleSearch" class="trip-search-form">

        <!-- Origin / Destination -->
        <div class="form-row">
          <div class="form-group">
            <label for="origin">Starting Point</label>
            <select v-model="formData.origin" id="origin" required>
              <option value="">Select province…</option>
              <option v-for="p in provinces" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="destination">Destination</label>
            <select v-model="formData.destination" id="destination" required>
              <option value="">Select province…</option>
              <option
                v-for="p in provinces"
                :key="p.value"
                :value="p.value"
                :disabled="p.value === formData.origin"
              >{{ p.label }}</option>
            </select>
          </div>
        </div>

        <!-- Dates -->
        <div class="form-row">
          <div class="form-group">
            <label for="start-date">Start Date</label>
            <input
              v-model="formData.startDate"
              id="start-date"
              type="date"
              :min="today"
              required
            />
          </div>

          <div class="form-group">
            <label for="end-date">End Date</label>
            <input
              v-model="formData.endDate"
              id="end-date"
              type="date"
              :min="formData.startDate || today"
              required
            />
          </div>
        </div>

        <!-- Travel type -->
        <div class="form-row">
          <div class="form-group full-width">
            <label>Travel Type</label>
            <div class="travel-type-options">
              <label v-for="t in travelTypes" :key="t.value" class="travel-type-option"
                :class="{ active: formData.travelType === t.value }"
                @click="formData.travelType = t.value">
                <input type="radio" :value="t.value" v-model="formData.travelType" hidden />
                <span class="travel-type-icon">{{ t.icon }}</span>
                <span>{{ t.label }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Duration badge (computed) -->
        <div v-if="tripDuration > 0" class="duration-badge">
          📅 {{ tripDuration }}-day trip &nbsp;·&nbsp; {{ originLabel }} → {{ destinationLabel }}
        </div>

        <!-- Error -->
        <transition name="slide-up">
          <div v-if="error" class="error-inline">⚠️ {{ error }}</div>
        </transition>

        <div class="form-actions">
          <button type="submit" class="btn-search" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Searching…' : 'Search & Plan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter }     from 'vue-router'

interface TripFormData {
  origin:      string
  destination: string
  startDate:   string
  endDate:     string
  travelType:  'solo' | 'friends' | 'family' | 'couple'
}

// ─── Static data ──────────────────────────────────────────────────────────────
const provinces = [
  { value: 'phnom-penh',      label: 'Phnom Penh'       },
  { value: 'siem-reap',       label: 'Siem Reap'        },
  { value: 'koh-kong',        label: 'Koh Kong'         },
  { value: 'kampot',          label: 'Kampot'           },
  { value: 'kep',             label: 'Kep'              },
  { value: 'battambang',      label: 'Battambang'       },
  { value: 'mondulkiri',      label: 'Mondulkiri'       },
  { value: 'kompong-thom',    label: 'Kompong Thom'     },
  { value: 'kratie',          label: 'Kratie'           },
  { value: 'pursat',          label: 'Pursat'           },
  { value: 'kompong-chhnang', label: 'Kompong Chhnang'  },
  { value: 'preah-vihear',    label: 'Preah Vihear'     },
  { value: 'ratanakiri',      label: 'Ratanakiri'       },
  { value: 'takeo',           label: 'Takeo'            },
  { value: 'prey-veng',       label: 'Prey Veng'        },
  { value: 'svay-rieng',      label: 'Svay Rieng'       },
  { value: 'kandal',          label: 'Kandal'           },
  { value: 'sihanoukvile',    label: 'Sihanoukville'    },
]

const travelTypes = [
  { value: 'solo',    label: 'Solo',    icon: '🧳' },
  { value: 'couple',  label: 'Couple',  icon: '💑' },
  { value: 'friends', label: 'Friends', icon: '👥' },
  { value: 'family',  label: 'Family',  icon: '👨‍👩‍👧‍👦' },
]

// ─── State ────────────────────────────────────────────────────────────────────
const router    = useRouter()
const isLoading = ref(false)
const error     = ref<string | null>(null)

const today = new Date().toISOString().split('T')[0]

const formData = ref<TripFormData>({
  origin:      '',
  destination: '',
  startDate:   '',
  endDate:     '',
  travelType:  'friends',
})

// ─── Computed ──────────────────────────────────────────────────────────────────
const originLabel      = computed(() => provinces.find(p => p.value === formData.value.origin)?.label      ?? '')
const destinationLabel = computed(() => provinces.find(p => p.value === formData.value.destination)?.label ?? '')

const tripDuration = computed(() => {
  if (!formData.value.startDate || !formData.value.endDate) return 0
  const diff = new Date(formData.value.endDate).getTime() - new Date(formData.value.startDate).getTime()
  return Math.max(0, Math.ceil(diff / 86_400_000))
})

// ─── Submit ────────────────────────────────────────────────────────────────────
const handleSearch = async () => {
  error.value = null

  if (!formData.value.origin)                                     return void (error.value = 'Please select a starting point')
  if (!formData.value.destination)                                return void (error.value = 'Please select a destination')
  if (formData.value.origin === formData.value.destination)       return void (error.value = 'Starting point and destination must be different')
  if (!formData.value.startDate || !formData.value.endDate)       return void (error.value = 'Please select both start and end dates')
  if (new Date(formData.value.startDate) >= new Date(formData.value.endDate))
                                                                   return void (error.value = 'End date must be after start date')

  isLoading.value = true
  try {
    // Small debounce to show spinner
    await new Promise(resolve => setTimeout(resolve, 400))

    // Navigate to results — all params in query string
    // TripResultsView reads: origin, dest, from, to, type
    router.push({
      name: 'trip-results',
      query: {
        origin: formData.value.origin,
        dest:   formData.value.destination,   // "dest" to avoid collision with vue-router's "destination"
        from:   formData.value.startDate,
        to:     formData.value.endDate,
        type:   formData.value.travelType,
      },
    })
  } catch {
    error.value = 'Something went wrong. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.trip-form-container { width: 100%; }

/* Hero */
.trip-form-hero {
  position: relative;
  height: 300px;
  margin-bottom: -80px;
  z-index: 1;
}
.trip-form-hero-bg {
  position: absolute; inset: 0;
  background-image: url('/hero/hero1.jpg');
  background-size: cover;
  background-position: center;
}
.trip-form-hero-overlay {
  position: absolute; inset: 0;
  background: rgba(0, 0, 0, 0.45);
}
.trip-form-hero-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  padding: 0 20px;
}
.trip-form-title    { font-size: 48px; font-weight: 800; margin: 0 0 12px; }
.trip-form-subtitle { font-size: 18px; margin: 0; opacity: 0.9; }

/* Card */
.trip-form-card {
  position: relative;
  z-index: 10;
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 900px;
  margin: 0 auto 60px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}
.trip-search-form { display: flex; flex-direction: column; gap: 28px; }

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}
.form-group         { display: flex; flex-direction: column; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label {
  font-size: 12px;
  font-weight: 700;
  color: #15543f;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}
.form-group input,
.form-group select {
  padding: 12px 14px;
  border: 1.5px solid #d8dce6;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fafafa;
}
.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #15543f;
  box-shadow: 0 0 0 3px rgba(21, 84, 63, 0.12);
  background: #fff;
}

/* Travel type pills */
.travel-type-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.travel-type-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1.5px solid #e2e8f0;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  background: #f8fafc;
  transition: all 0.2s;
  user-select: none;
}
.travel-type-option:hover {
  border-color: #15543f;
  color: #15543f;
}
.travel-type-option.active {
  border-color: #15543f;
  background: #15543f;
  color: white;
}
.travel-type-icon { font-size: 18px; }

/* Duration badge */
.duration-badge {
  background: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  color: #15803d;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 9999px;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

/* Error inline */
.error-inline {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  font-size: 13px;
  font-weight: 500;
  padding: 10px 16px;
  border-radius: 8px;
}

/* Submit button */
.form-actions    { display: flex; justify-content: center; margin-top: 8px; }
.btn-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 52px;
  background: linear-gradient(135deg, #097445 0%, #0a5a35 100%);
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  min-width: 200px;
  justify-content: center;
}
.btn-search:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(9, 116, 69, 0.35);
}
.btn-search:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

/* Animations */
@keyframes spin    { to { transform: rotate(360deg); } }
@keyframes fadeIn  { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to       { opacity: 0; transform: translateY(-6px); }

/* Responsive */
@media (max-width: 768px) {
  .trip-form-hero   { height: 220px; margin-bottom: -60px; }
  .trip-form-title  { font-size: 28px; }
  .trip-form-subtitle { font-size: 14px; }
  .trip-form-card   { padding: 24px 16px; margin: 0 12px 40px; }
  .form-row         { grid-template-columns: 1fr; }
}
</style>