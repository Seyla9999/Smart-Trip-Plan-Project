<template>
  <section
    class="relative h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
  >
    <div class="flex h-full flex-col">
      <header class="border-b border-slate-800 bg-slate-900 px-4 py-4 md:px-6">
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="text-xs font-semibold mb-3 uppercase tracking-[0.2em] text-emerald-300/80">
                Let's Go Cambodia
              </p>
              <h1 class="text-2xl font-bold text-white">Sponsor Management</h1>
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                @click="openAddModal"
                class="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Sponsor
              </button>
            </div>
          </div>

          <div class="relative w-full max-w-md md:self-end">
            <svg
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search sponsor by name or tier..."
              class="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-4 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>
      </header>

      <div class="flex-1 min-h-0 overflow-hidden p-4 md:p-6">
        <div class="flex h-full min-h-0 flex-col gap-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Total sponsors</p>
              <p class="mt-2 text-3xl font-bold text-slate-900">{{ totalSponsors }}</p>
              <p class="mt-1 text-xs text-slate-500">Active partner organizations</p>
            </div>
            <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-emerald-700">With logos</p>
              <p class="mt-2 text-3xl font-bold text-emerald-700">{{ logoCount }}</p>
              <p class="mt-1 text-xs text-emerald-700/80">{{ websiteCount }} link to websites</p>
            </div>
            <div class="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
              <div class="absolute -right-3 -top-4 text-white/10">
                <svg class="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                  />
                </svg>
              </div>
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Top tier</p>
              <p class="mt-2 text-xl font-bold text-white">{{ topTier?.label || 'N/A' }}</p>
              <p class="mt-1 text-xs text-emerald-300">
                {{ topTier?.count || 0 }} sponsors · {{ tierCoverage }} tiers active
              </p>
            </div>
          </div>

          <p
            v-if="fetchError"
            class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          >
            {{ fetchError }}
          </p>

          <div class="flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 md:px-6">
              <div>
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Sponsor catalog</p>
                <p class="text-sm font-semibold text-slate-900">{{ filteredSponsors.length }} partners</p>
              </div>
              <div class="flex items-center gap-2 text-sm text-slate-500">
                <span>Sort by:</span>
                <select
                  v-model="sortOption"
                  class="rounded-md border border-slate-200 bg-white px-2 py-1 font-medium text-slate-700 focus:border-emerald-400 focus:outline-none cursor-pointer"
                >
                  <option>Name A-Z</option>
                  <option>Name Z-A</option>
                  <option>Tier</option>
                  <option>Has Website</option>
                </select>
              </div>
            </div>

            <div class="flex-1 min-h-0 overflow-auto p-4 md:p-6">
              <div v-if="isLoading" class="flex h-40 items-center justify-center text-sm font-medium text-slate-500">
                Loading sponsors from database...
              </div>
              <div
                v-else-if="fetchError"
                class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
              >
                {{ fetchError }}
              </div>
              <div v-else-if="!filteredSponsors.length" class="flex h-40 items-center justify-center text-sm font-medium text-slate-500">
                No sponsors found.
              </div>
              <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div
                  v-for="sponsor in filteredSponsors"
                  :key="sponsor.id"
                  class="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3">
                      <div
                        class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border"
                        :class="tierLogoClass(sponsor.tierNormalized)"
                      >
                        <img
                          v-if="sponsor.logoUrl"
                          :src="sponsor.logoUrl"
                          :alt="sponsor.name"
                          class="h-full w-full object-contain bg-white"
                        />
                        <span v-else class="text-sm font-bold">{{ sponsor.abbr }}</span>
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-semibold text-slate-900 truncate">{{ sponsor.name }}</p>
                        <p class="text-xs text-slate-500 line-clamp-2">
                          {{ sponsor.description || 'No description provided.' }}
                        </p>
                      </div>
                    </div>
                    <div class="relative">
                      <button
                        type="button"
                        class="rounded-md p-1.5 text-slate-300 transition-all hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                        @click.stop="toggleMenu(sponsor.id)"
                        aria-label="Open sponsor actions"
                      >
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="19" cy="12" r="2" />
                        </svg>
                      </button>
                      <div
                        v-if="menuOpenFor === sponsor.id"
                        class="absolute right-0 mt-2 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg z-10"
                      >
                        <button
                          type="button"
                          class="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          @click="openEditModal(sponsor.id)"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          class="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          @click="openDeleteModal(sponsor.id)"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="mt-4 flex items-center justify-between gap-3">
                    <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold" :class="tierBadgeClass(sponsor.tierNormalized)">
                      {{ sponsor.tierLabel }}
                    </span>
                    <a
                      v-if="sponsor.websiteUrl"
                      :href="sponsor.websiteUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      Visit website
                    </a>
                    <span v-else class="text-xs text-slate-400">No website</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <teleport to="body">
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      @click.self="closeAddModal"
    >
      <div class="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <div class="mb-4 flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Sponsor details</p>
            <h3 class="text-lg font-bold text-slate-900">{{ isEditing ? 'Edit sponsor' : 'Add sponsor' }}</h3>
            <p class="text-xs text-slate-500 mt-1">
              {{ isEditing ? 'Update the sponsor details and save changes.' : 'Fill in the form below to add a new sponsor to the website.' }}
            </p>
          </div>
          <button
            type="button"
            @click="closeAddModal"
            class="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close add sponsor"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          v-if="!supabaseReady"
          class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700"
        >
          Supabase is not configured in this environment. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable uploads.
        </div>
        <div
          v-if="submitError"
          class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          {{ submitError }}
        </div>

        <form class="space-y-4" @submit.prevent="submitSponsor">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Name</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                placeholder="Sponsor name"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Tier</label>
              <select
                v-model="form.tier"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option v-for="tier in tierOptions" :key="tier.value" :value="tier.value">{{ tier.label }}</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Website URL</label>
              <input
                v-model="form.websiteUrl"
                type="url"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                placeholder="https://partner.com"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                placeholder="Short sponsor description"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Logo</label>
              <div v-if="editingSponsor?.logo_url && !logoFile" class="mb-2 flex items-center gap-2 text-xs text-slate-500">
                <img :src="editingSponsor.logo_url" alt="Current logo" class="h-8 w-16 object-contain rounded border border-slate-200 bg-white" />
                <span>Current logo will be kept unless you upload a new one.</span>
              </div>
              <label class="flex flex-col gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <input type="file" accept="image/*" class="hidden" @change="handleLogoChange" />
                <span class="font-semibold text-slate-700">Upload logo</span>
                <span class="text-xs text-slate-500">
                  {{ logoName || 'PNG, JPG, or SVG up to 5MB' }}
                </span>
              </label>
            </div>
            <div class="flex items-center gap-3">
              <input id="sponsor-active" v-model="form.isActive" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              <label for="sponsor-active" class="text-sm text-slate-600">Active on sponsor bar</label>
            </div>
          </div>

          <div class="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              @click="closeAddModal"
              class="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!canSubmit"
              class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save changes' : 'Save sponsor') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </teleport>

  <teleport to="body">
    <div
      v-if="isDeleteModalOpen && deleteTarget"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      @click.self="closeDeleteModal"
    >
      <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <div class="mb-4 flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Delete sponsor</p>
            <h3 class="text-lg font-bold text-slate-900">Remove {{ deleteTarget.name }}</h3>
            <p class="text-xs text-slate-500 mt-1">
              This action removes the sponsor from Supabase and hides it from the platform.
            </p>
          </div>
          <button
            type="button"
            @click="closeDeleteModal"
            class="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close delete confirmation"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          v-if="deleteError"
          class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          {{ deleteError }}
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            @click="closeDeleteModal"
            class="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="isDeleting"
            @click="confirmDelete"
            class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete sponsor' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { getSponsors, createSponsor, type Sponsor } from '@/services/home.service'
import { supabase } from '@/lib/supabase'
import { useAdminToast } from '@/composables/useAdminToast'

const { showAdminToast } = useAdminToast()
const sponsors = ref<Sponsor[]>([])
const isLoading = ref(true)
const fetchError = ref('')
const searchQuery = ref('')
const sortOption = ref('Name A-Z')
const isAddModalOpen = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')
const logoFile = ref<File | null>(null)
const logoName = ref('')
const menuOpenFor = ref<string | null>(null)
const editingSponsor = ref<Sponsor | null>(null)
const isDeleteModalOpen = ref(false)
const deleteTarget = ref<Sponsor | null>(null)
const deleteError = ref('')
const isDeleting = ref(false)

const tierOrder = ['platinum', 'gold', 'silver', 'bronze', 'partner', 'supporter', 'other']
const sponsorLogoBucket = (import.meta.env.VITE_SUPABASE_SPONSOR_BUCKET as string | undefined)?.trim() || 'sponsor-logos'
const tierOptions = [
  { value: 'platinum', label: 'Platinum' },
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'partner', label: 'Partner' },
  { value: 'supporter', label: 'Supporter' },
  { value: 'other', label: 'Other' },
]
const supabaseReady = computed(() => Boolean(supabase))
const isEditing = computed(() => Boolean(editingSponsor.value))

const form = reactive({
  name: '',
  tier: 'gold',
  websiteUrl: '',
  description: '',
  isActive: true,
})

const normalizeTier = (tier?: string | null): string => {
  const normalized = (tier || '').trim().toLowerCase()
  return normalized || 'other'
}

const formatTier = (tier: string): string => {
  if (!tier || tier === 'other') return 'Other'
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

const getAbbr = (name: string): string => {
  if (!name) return '?'
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase()
  return words.slice(0, 2).map(word => word[0]).join('').toUpperCase()
}

const normalizedSponsors = computed(() => sponsors.value.map((sponsor) => {
  const tierNormalized = normalizeTier(sponsor.tier)
  return {
    id: sponsor.id,
    name: sponsor.name || 'Unnamed Sponsor',
    logoUrl: sponsor.logo_url || '',
    websiteUrl: sponsor.website_url || '',
    description: sponsor.description || '',
    tierNormalized,
    tierLabel: formatTier(tierNormalized),
    abbr: getAbbr(sponsor.name || ''),
  }
}))

const sortedSponsors = computed(() => {
  const list = [...normalizedSponsors.value]
  if (sortOption.value === 'Name Z-A') {
    return list.sort((a, b) => b.name.localeCompare(a.name))
  }
  if (sortOption.value === 'Tier') {
    const tierIndex = (tier: string) => {
      const index = tierOrder.indexOf(tier)
      return index === -1 ? tierOrder.length : index
    }
    return list.sort((a, b) => {
      const tierCompare = tierIndex(a.tierNormalized) - tierIndex(b.tierNormalized)
      if (tierCompare !== 0) return tierCompare
      return a.name.localeCompare(b.name)
    })
  }
  if (sortOption.value === 'Has Website') {
    return list.sort((a, b) => Number(Boolean(b.websiteUrl)) - Number(Boolean(a.websiteUrl)) || a.name.localeCompare(b.name))
  }
  return list.sort((a, b) => a.name.localeCompare(b.name))
})

const filteredSponsors = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return sortedSponsors.value
  return sortedSponsors.value.filter((sponsor) =>
    sponsor.name.toLowerCase().includes(query) || sponsor.tierLabel.toLowerCase().includes(query)
  )
})

const totalSponsors = computed(() => sponsors.value.length)
const logoCount = computed(() => normalizedSponsors.value.filter((sponsor) => sponsor.logoUrl).length)
const websiteCount = computed(() => normalizedSponsors.value.filter((sponsor) => sponsor.websiteUrl).length)

const tierCounts = computed(() => normalizedSponsors.value.reduce<Record<string, number>>((acc, sponsor) => {
  const tierKey = sponsor.tierNormalized
  acc[tierKey] = (acc[tierKey] || 0) + 1
  return acc
}, {}))

const tierCoverage = computed(() => Object.keys(tierCounts.value).length)

const topTier = computed(() => {
  const entries = Object.entries(tierCounts.value)
  if (!entries.length) return null
  const [tier, count] = entries.sort((a, b) => b[1] - a[1])[0]
  return { label: formatTier(tier), count }
})

const tierBadgeClass = (tier: string): string => {
  switch (tier) {
    case 'platinum':
      return 'text-indigo-700 bg-indigo-50 border-indigo-200'
    case 'gold':
      return 'text-amber-700 bg-amber-50 border-amber-200'
    case 'silver':
      return 'text-slate-600 bg-slate-100 border-slate-200'
    case 'bronze':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    case 'partner':
      return 'text-sky-700 bg-sky-50 border-sky-200'
    case 'supporter':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    default:
      return 'text-slate-600 bg-slate-100 border-slate-200'
  }
}

const tierLogoClass = (tier: string): string => {
  switch (tier) {
    case 'platinum':
      return 'border-indigo-200 bg-indigo-50 text-indigo-700'
    case 'gold':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'silver':
      return 'border-slate-200 bg-slate-100 text-slate-600'
    case 'bronze':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'partner':
      return 'border-sky-200 bg-sky-50 text-sky-700'
    case 'supporter':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600'
  }
}

const loadSponsors = async () => {
  isLoading.value = true
  fetchError.value = ''
  try {
    sponsors.value = await getSponsors()
  } catch (error) {
    console.error('Failed to load sponsors:', error)
    fetchError.value = 'Unable to load sponsors at the moment. Please try again.'
    sponsors.value = []
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  form.name = ''
  form.tier = 'gold'
  form.websiteUrl = ''
  form.description = ''
  form.isActive = true
  logoFile.value = null
  logoName.value = ''
  submitError.value = ''
  editingSponsor.value = null
}

const openAddModal = () => {
  resetForm()
  isAddModalOpen.value = true
}

const closeAddModal = () => {
  isAddModalOpen.value = false
  submitError.value = ''
  editingSponsor.value = null
  menuOpenFor.value = null
}

const handleLogoChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] || null
  logoFile.value = file
  logoName.value = file?.name || ''
}

const toggleMenu = (id: string) => {
  menuOpenFor.value = menuOpenFor.value === id ? null : id
}

const openEditModal = (id: string) => {
  const target = sponsors.value.find((sponsor) => sponsor.id === id)
  if (!target) return
  editingSponsor.value = target
  form.name = target.name || ''
  form.tier = normalizeTier(target.tier)
  form.websiteUrl = target.website_url || ''
  form.description = target.description || ''
  form.isActive = typeof target.is_active === 'boolean' ? target.is_active : true
  logoFile.value = null
  logoName.value = ''
  submitError.value = ''
  isAddModalOpen.value = true
  menuOpenFor.value = null
}

const openDeleteModal = (id: string) => {
  const target = sponsors.value.find((sponsor) => sponsor.id === id)
  if (!target) return
  deleteTarget.value = target
  deleteError.value = ''
  isDeleteModalOpen.value = true
  menuOpenFor.value = null
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  deleteTarget.value = null
  deleteError.value = ''
}

const uploadSponsorLogo = async (file: File): Promise<string | null> => {
  if (!supabase) return null
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext || 'png'}`
  const { error } = await supabase.storage.from(sponsorLogoBucket).upload(filename, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) {
    console.error('Supabase upload error:', error.message)
    return null
  }
  const { data } = supabase.storage.from(sponsorLogoBucket).getPublicUrl(filename)
  return data.publicUrl
}

const canSubmit = computed(() => form.name.trim().length > 0 && !isSubmitting.value)

const submitSponsor = async () => {
  if (!canSubmit.value) return
  submitError.value = ''
  if (!supabase) {
    submitError.value = 'Supabase is not configured for this environment.'
    return
  }

  isSubmitting.value = true
  try {
    let logoUrl: string | null = null
    if (logoFile.value) {
      logoUrl = await uploadSponsorLogo(logoFile.value)
      if (!logoUrl) {
        submitError.value = 'Unable to upload logo to Supabase.'
        return
      }
    }

    const payload: Record<string, string | boolean | null> = {
      name: form.name.trim(),
      tier: normalizeTier(form.tier),
      website_url: form.websiteUrl.trim() || null,
      description: form.description.trim() || null,
      is_active: form.isActive,
    }

    if (isEditing.value) {
      if (logoUrl) {
        payload.logo_url = logoUrl
      }
      const { error } = await supabase
        .from('sponsors')
        .update(payload)
        .eq('id', editingSponsor.value?.id)
      if (error) {
        throw new Error(error.message)
      }
      showAdminToast({
        message: 'Sponsor updated',
        tone: 'update'
      })
    } else {
      payload.logo_url = logoUrl
      const res = await createSponsor(payload)
      if (!res.success) {
        throw new Error(res.message || 'Failed to save sponsor')
      }
      showAdminToast({
        message: 'Sponsor added',
        tone: 'success'
      })
    }

    closeAddModal()
    await loadSponsors()
  } catch (error) {
    console.error('Failed to add sponsor:', error)
    submitError.value = 'Failed to add sponsor. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  if (!supabase) {
    deleteError.value = 'Supabase is not configured for this environment.'
    return
  }
  isDeleting.value = true
  deleteError.value = ''
  try {
    const { error } = await supabase
      .from('sponsors')
      .delete()
      .eq('id', deleteTarget.value.id)
    if (error) {
      throw new Error(error.message)
    }
    showAdminToast({
      message: 'Sponsor deleted',
      tone: 'delete'
    })
    closeDeleteModal()
    await loadSponsors()
  } catch (error) {
    console.error('Failed to delete sponsor:', error)
    deleteError.value = 'Unable to delete sponsor. Please try again.'
  } finally {
    isDeleting.value = false
  }
}

onMounted(loadSponsors)
</script>