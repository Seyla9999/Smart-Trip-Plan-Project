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

        <!-- Origin -->
        <div class="form-row">
          <div class="form-group">
            <label for="origin">Starting Point</label>
            <select v-model="formData.origin" id="origin" required>
              <option value="">Select province…</option>
              <option v-for="p in provinces" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Plan Destination By</label>
            <div class="plan-mode-options">
              <label
                v-for="mode in planModes"
                :key="mode.value"
                class="plan-mode-option"
                :class="{ active: formData.planMode === mode.value }"
                @click="formData.planMode = mode.value"
              >
                <input type="radio" :value="mode.value" v-model="formData.planMode" hidden />
                <span class="plan-mode-icon">{{ mode.icon }}</span>
                <span>{{ mode.label }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Destination choice -->
        <div class="form-row">
          <div v-if="formData.planMode === 'province'" class="form-group full-width">
            <label for="destination">Destination Province</label>
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

          <div v-else class="form-group full-width attraction-picker">
            <label for="attraction-search">Search Attraction</label>
            <input
              ref="attractionInput"
              id="attraction-search"
              v-model="attractionSearch"
              type="text"
              placeholder="Type attraction name (e.g. Angkor Wat, Kep Beach)"
              autocomplete="off"
              @focus="showAttractionDropdown = true"
              @keydown.enter.prevent
            />

            <div v-if="showAttractionDropdown" class="attraction-dropdown">
              <div v-if="isLoadingAttractions" class="attraction-empty">Loading attractions...</div>

              <template v-else>
                <button
                  v-for="item in attractionSearchResults"
                  :key="item.id"
                  type="button"
                  class="attraction-item"
                  @click="selectAttraction(item)"
                >
                  <span class="attraction-name">{{ getAttractionName(item) }}</span>
                  <span class="attraction-province">{{ getAttractionProvince(item) }}</span>
                </button>

                <div v-if="!attractionSearchResults.length" class="attraction-empty">
                  No attractions found.
                </div>
              </template>
            </div>

            <div v-if="selectedAttraction" class="resolved-destination">
              Selected: <strong>{{ getAttractionName(selectedAttraction) }}</strong>
              <span> · Destination province: {{ resolvedDestinationLabel }}</span>
            </div>
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
          📅 {{ tripDuration }}-day trip &nbsp;·&nbsp; {{ originLabel }} → {{ resolvedDestinationLabel }}
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter }     from 'vue-router'
import { getAttractions } from '../../services/attractions.service'
import { getProvinces } from '../../services/home.service'

interface TripFormData {
  origin:      string
  destination: string
  planMode:    'province' | 'attraction'
  startDate:   string
  endDate:     string
  travelType:  'solo' | 'friends' | 'family'
}

interface AttractionSearchItem {
  id: string
  name?: string
  name_en?: string
  title?: string
  province?: string | { name?: string; name_en?: string }
  province_name?: string
  province_id?: string
}

interface ProvinceCatalogItem {
  id: number
  nameEn: string
  slug: string
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

const travelTypes: { value: 'solo' | 'friends' | 'family'; label: string; icon: string }[] = [
  { value: 'solo',    label: 'Solo',    icon: '🧳' },
  { value: 'friends', label: 'Friends', icon: '👥' },
  { value: 'family',  label: 'Family',  icon: '👨‍👩‍👧‍👦' },
]

const planModes = [
  { value: 'province', label: 'Province', icon: '🗺️' },
  { value: 'attraction', label: 'Attraction', icon: '📍' },
] as const

// ─── State ────────────────────────────────────────────────────────────────────
const router    = useRouter()
const isLoading = ref(false)
const error     = ref<string | null>(null)
const isLoadingAttractions = ref(false)
const attractionSearch = ref('')
const showAttractionDropdown = ref(false)
const attractionsCatalog = ref<AttractionSearchItem[]>([])
const selectedAttraction = ref<AttractionSearchItem | null>(null)
const provinceCatalog = ref<ProvinceCatalogItem[]>([])
const attractionInput = ref<HTMLInputElement | null>(null)

const today = new Date().toISOString().split('T')[0]

const formData = ref<TripFormData>({
  origin:      '',
  destination: '',
  planMode:    'province',
  startDate:   '',
  endDate:     '',
  travelType:  'friends',
})

// ─── Computed ──────────────────────────────────────────────────────────────────
const originLabel      = computed(() => provinces.find(p => p.value === formData.value.origin)?.label      ?? '')

const normalizeProvinceSlug = (value: unknown) =>
  String(value ?? '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

const resolveProvinceSlug = (item: AttractionSearchItem | null) => {
  if (!item) return ''

  const provinceId = Number(item.province_id ?? 0)
  if (Number.isFinite(provinceId) && provinceId > 0) {
    const byId = provinceCatalog.value.find((province) => province.id === provinceId)
    if (byId) return byId.slug
  }

  const provinceName = normalizeProvinceSlug(getAttractionProvince(item))
  if (provinceName) {
    const byName = provinceCatalog.value.find((province) => normalizeProvinceSlug(province.nameEn) === provinceName)
    if (byName) return byName.slug

    const byLabel = provinces.find((province) => normalizeProvinceSlug(province.label) === provinceName)
    if (byLabel) return byLabel.value
  }

  return ''
}

const attractionSearchResults = computed(() => {
  const search = normalizeText(attractionSearch.value)
  if (!search) return attractionsCatalog.value.slice(0, 12)

  return attractionsCatalog.value
    .filter((item) => {
      const name = normalizeText(getAttractionName(item))
      const province = normalizeText(getAttractionProvince(item))
      return name.includes(search) || province.includes(search)
    })
    .slice(0, 16)
})

const resolvedDestinationValue = computed(() => {
  if (formData.value.planMode === 'province') return formData.value.destination
  if (!selectedAttraction.value) return ''

  const resolvedByCatalog = resolveProvinceSlug(selectedAttraction.value)
  if (resolvedByCatalog) return resolvedByCatalog

  const byProvinceId = normalizeText(selectedAttraction.value.province_id)
  const provinceName = normalizeText(getAttractionProvince(selectedAttraction.value))

  const exactByValue = provinces.find((p) => normalizeText(p.value) === byProvinceId)
  if (exactByValue) return exactByValue.value

  const byLabel = provinces.find((p) => {
    const label = normalizeText(p.label)
    const value = normalizeText(p.value)
    return provinceName === label || provinceName === value || provinceName.includes(label) || label.includes(provinceName)
  })

  return byLabel?.value ?? ''
})

const resolvedDestinationLabel = computed(() => {
  const destination = provinces.find((p) => p.value === resolvedDestinationValue.value)
  if (destination) return destination.label
  if (selectedAttraction.value) return getAttractionProvince(selectedAttraction.value) || 'Destination'
  return ''
})

const tripDuration = computed(() => {
  if (!formData.value.startDate || !formData.value.endDate) return 0
  const diff = new Date(formData.value.endDate).getTime() - new Date(formData.value.startDate).getTime()
  return Math.max(0, Math.ceil(diff / 86_400_000))
})

watch(attractionSearch, (value) => {
  const typed = normalizeText(value)
  const selectedName = normalizeText(getAttractionName(selectedAttraction.value))
  const isExactSelectedValue = !!selectedAttraction.value && typed === selectedName

  if (!isExactSelectedValue) {
    selectedAttraction.value = null
    showAttractionDropdown.value = formData.value.planMode === 'attraction'
    return
  }

  // Keep dropdown closed once a result is explicitly selected.
  showAttractionDropdown.value = false
})

watch(() => formData.value.planMode, (mode) => {
  error.value = null
  showAttractionDropdown.value = mode === 'attraction'
  if (mode === 'province') {
    attractionSearch.value = ''
    selectedAttraction.value = null
  } else {
    formData.value.destination = ''
    void nextTick(() => {
      attractionInput.value?.focus()
      attractionInput.value?.select()
    })
  }
})

const normalizeText = (value: unknown) => String(value ?? '').trim().toLowerCase()

const getAttractionName = (item: AttractionSearchItem | null) => {
  if (!item) return ''
  return item.name_en || item.name || item.title || ''
}

const getAttractionProvince = (item: AttractionSearchItem | null) => {
  if (!item) return ''
  if (typeof item.province === 'string') return item.province
  if (item.province && typeof item.province === 'object') {
    return item.province.name_en || item.province.name || ''
  }
  return item.province_name || ''
}

const selectAttraction = (item: AttractionSearchItem) => {
  selectedAttraction.value = item
  attractionSearch.value = getAttractionName(item)
  showAttractionDropdown.value = false
}

const loadAttractions = async () => {
  isLoadingAttractions.value = true
  try {
    const res = await getAttractions({ limit: 600, sortBy: 'name', sortOrder: 'ASC' })
    const raw = Array.isArray(res?.data?.data)
      ? res.data.data
      : Array.isArray((res?.data as any))
        ? (res.data as any)
        : []
    attractionsCatalog.value = raw.map((item: any) => ({
      id: String(item.id),
      name: item.name,
      name_en: item.name_en,
      title: item.title,
      province: item.province,
      province_name: item.province_name,
      province_id: item.province_id,
    }))
  } catch {
    attractionsCatalog.value = []
  } finally {
    isLoadingAttractions.value = false
  }
}

const loadProvinces = async () => {
  try {
    const res = await getProvinces()
    provinceCatalog.value = (Array.isArray(res) ? res : []).map((province: any) => ({
      id: Number(province.id ?? province.province_id ?? province.provinceId),
      nameEn: String(province.name_en ?? province.nameEn ?? province.name ?? ''),
      slug: provinces.find((option) => normalizeProvinceSlug(option.label) === normalizeProvinceSlug(province.name_en ?? province.nameEn ?? province.name ?? ''))?.value
        ?? normalizeProvinceSlug(String(province.name_en ?? province.nameEn ?? province.name ?? '')),
    })).filter((province: ProvinceCatalogItem) => province.id && province.nameEn)
  } catch {
    provinceCatalog.value = []
  }
}

onMounted(() => {
  void loadAttractions()
  void loadProvinces()
})

// ─── Submit ────────────────────────────────────────────────────────────────────
const handleSearch = async () => {
  error.value = null

  const destinationValue = resolvedDestinationValue.value

  if (!formData.value.origin)                                     return void (error.value = 'Please select a starting point')
  if (formData.value.planMode === 'province' && !formData.value.destination)
                                                                   return void (error.value = 'Please select a destination province')
  if (formData.value.planMode === 'attraction' && !selectedAttraction.value)
                                                                   return void (error.value = 'Please choose an attraction from search results')
  if (!destinationValue)                                           return void (error.value = 'We could not map this attraction to a destination province')
  if (formData.value.origin === destinationValue)                  return void (error.value = 'Starting point and destination must be different')
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
        dest:   destinationValue,   // "dest" to avoid collision with vue-router's "destination"
        from:   formData.value.startDate,
        to:     formData.value.endDate,
        type:   formData.value.travelType,
        mode:   formData.value.planMode,
        attractionId: selectedAttraction.value?.id || '',
        attractionName: getAttractionName(selectedAttraction.value),
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

.attraction-picker {
  position: relative;
}

.attraction-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #d8dce6;
  border-radius: 12px;
  box-shadow: 0 12px 24px rgba(2, 8, 23, 0.12);
  max-height: 280px;
  overflow-y: auto;
  z-index: 20;
}

.attraction-item {
  width: 100%;
  border: 0;
  background: #fff;
  text-align: left;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
}

.attraction-item:hover {
  background: #f0fdf4;
}

.attraction-name {
  color: #1f2937;
  font-weight: 600;
  font-size: 13px;
}

.attraction-province {
  color: #64748b;
  font-size: 12px;
  white-space: nowrap;
}

.attraction-empty {
  padding: 12px;
  font-size: 12px;
  color: #64748b;
}

.resolved-destination {
  margin-top: 10px;
  background: #ecfdf3;
  border: 1px solid #bbf7d0;
  color: #166534;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
}

.plan-mode-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.plan-mode-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid #d8dce6;
  border-radius: 9999px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.plan-mode-option:hover {
  border-color: #15543f;
  color: #15543f;
}

.plan-mode-option.active {
  border-color: #15543f;
  background: #15543f;
  color: #fff;
}

.plan-mode-icon {
  font-size: 16px;
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