<template>
  <section
    class="relative h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
  >
    <div class="flex h-full flex-col">
      <header class="border-b border-slate-800 bg-slate-900 px-4 py-4 md:px-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs font-semibold mb-3 uppercase tracking-[0.2em] text-emerald-300/80">
              Let's Go Cambodia
            </p>
            <h1 class="text-2xl font-bold text-white">Content Moderation</h1>
          </div>

          <div class="flex min-w-[260px] flex-1 items-center justify-end">
            <div class="relative w-full max-w-md">
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
                placeholder="Search moderation queue..."
                class="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-4 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      <div class="flex-1 min-h-0 overflow-hidden p-4 md:p-6">
        <div class="flex h-full min-h-0 flex-col gap-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Pending stories</p>
              <p class="mt-2 text-3xl font-bold text-slate-900">{{ pendingCount }}</p>
            </div>
            <div class="rounded-xl border border-red-100 bg-red-50 p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-red-600">Flagged stories</p>
              <p class="mt-2 text-3xl font-bold text-red-600">{{ flaggedCount }}</p>
            </div>
            <div class="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
              <div class="absolute -right-3 -top-4 text-white/10">
                <svg class="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                  />
                </svg>
              </div>
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Approved stories</p>
              <p class="mt-2 text-2xl font-bold text-white">{{ approvedCount }}</p>
            </div>
          </div>

          <div class="flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 md:px-6">
              <div>
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Moderation queue</p>
                <p class="text-sm font-semibold text-slate-900">{{ pendingCount }} pending items</p>
              </div>
              <div class="flex items-center gap-2">
                <div class="relative">
                  <button
                    @click="toggleBulkMenu"
                    class="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Bulk Actions
                  </button>
                  <div
                    v-if="showBulkMenu"
                    class="absolute right-0 z-10 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg"
                  >
                    <button
                      @click="applyBulkAction('approve')"
                      class="block w-full px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Approve all filtered
                    </button>
                    <button
                      @click="applyBulkAction('flag')"
                      class="block w-full px-3 py-2 text-left text-sm font-semibold text-amber-700 hover:bg-amber-50"
                    >
                      Flag all filtered
                    </button>
                  </div>
                </div>
                <div class="relative">
                  <button
                    @click="toggleFilterMenu"
                    class="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 cursor-pointer"
                  >
                    {{ filterLabel }}
                  </button>
                  <div
                    v-if="showFilterMenu"
                    class="absolute right-0 z-10 mt-2 w-44 rounded-lg border border-slate-200 bg-white shadow-lg"
                  >
                    <button
                      v-for="option in filterOptions"
                      :key="option.value"
                      @click="setFilter(option.value)"
                      class="block w-full px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      {{ option.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex-1 min-h-0 overflow-auto">
              <div class="p-4 md:p-6">
                <div class="space-y-4">
                  <div v-if="isLoading" class="flex h-40 items-center justify-center text-sm font-medium text-slate-500">
                    Loading stories from database...
                  </div>
                  <div
                    v-else-if="fetchError"
                    class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                  >
                    {{ fetchError }}
                  </div>
                  <div v-else-if="!filteredQueue.length" class="flex h-40 items-center justify-center text-sm font-medium text-slate-500">
                    No stories found.
                  </div>
                  <div v-else class="space-y-4">
                    <div
                      v-for="item in filteredQueue"
                      :key="item.id"
                      class="overflow-hidden rounded-xl border bg-white shadow-sm transition-all"
                      :class="item.flagged ? 'border-red-200' : 'border-slate-200'"
                    >
                      <div class="flex gap-4 p-4">
                        <div class="h-32 w-36 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          <img v-if="item.images" :src="item.images[1]" :alt="item.title" class="h-full w-full object-cover" />
                          <div v-else class="flex h-full w-full items-center justify-center bg-slate-200 text-xs font-semibold text-slate-500">
                            No image
                          </div>
                        </div>

                        <div class="min-w-0 flex-1">
                          <div class="mb-1 flex items-start justify-between gap-2">
                            <h2 class="text-base font-bold text-slate-900 leading-tight">{{ item.title }}</h2>
                            <div class="flex items-center gap-2 flex-shrink-0">
                              <span
                                v-if="item.flagged"
                                class="text-xs font-bold tracking-wide text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded"
                              >
                                FLAGGED
                              </span>
                              <span
                                v-else-if="item.approved"
                                class="text-xs font-bold tracking-wide text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded"
                              >
                                APPROVED
                              </span>
                              <button
                                type="button"
                                class="p-1 text-slate-300 hover:text-slate-600 transition-colors cursor-pointer"
                                @click="openStoryDetails(item)"
                                aria-label="Open story details"
                              >
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p class="text-xs text-slate-400 mb-2">
                            <span class="text-slate-600 font-medium">{{ item.authorName }}</span>
                            <span v-if="item.authorHandle" class="text-slate-400">({{ item.authorHandle }})</span>
                            &nbsp;·&nbsp; Submitted {{ item.submitted }}
                          </p>
                          <p class="text-sm text-slate-600 leading-relaxed line-clamp-3">{{ item.excerpt }}</p>
                        </div>
                      </div>

                      <div
                        class="flex items-center justify-between border-t px-4 py-3 bg-slate-50"
                        :class="item.flagged ? 'border-red-100' : 'border-slate-100'"
                      >
                        <div class="flex items-center gap-4">
                          <div v-for="meta in item.meta" :key="meta.label" class="flex items-center gap-1 text-xs text-slate-500">
                            <span v-html="meta.icon" class="text-slate-400"></span>
                            {{ meta.label }}
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <button
                            v-for="action in item.actions"
                            :key="action.label"
                            @click="handleAction(item, action)"
                            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                            :class="action.style"
                          >
                            <span v-html="action.icon"></span>
                            {{ action.label }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <teleport to="body">
      <div
        v-if="selectedStory"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        @click.self="closeStoryDetails"
      >
        <div class="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-xl max-h-[80vh] overflow-auto">
          <div class="mb-4 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Story details</p>
              <h3 class="text-lg font-bold text-slate-900 truncate">{{ selectedStory.title }}</h3>
            </div>
            <button
              type="button"
              @click="closeStoryDetails"
              class="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              aria-label="Close details"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mb-6">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Attached Images ({{ selectedStory.images.length }})</p>
            <div v-if="selectedStory.images && selectedStory.images.length > 0" class="flex flex-wrap gap-3">
              <div 
                v-for="(img, idx) in selectedStory.images" 
                :key="idx" 
                class="relative h-32 w-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm"
              >
                <img :src="img" :alt="'Image ' + (idx + 1)" class="h-full w-full object-cover" />
                <a 
                  :href="img" 
                  target="_blank" 
                  class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
            <div v-else class="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-sm font-medium text-slate-400">
              No images attached to this story.
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 text-sm border-t border-slate-100 pt-5">
            <div class="space-y-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</p>
                <span class="mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium" :class="statusBadge(selectedStory.status)">
                  {{ selectedStory.status }}
                </span>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Submitted</p>
                <p class="mt-1 font-medium text-slate-900">{{ selectedStory.submitted }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Author</p>
                <p class="mt-1 font-medium text-slate-900">{{ selectedStory.authorName }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Handle</p>
                <p class="mt-1 font-medium text-slate-900">{{ selectedStory.authorHandle || 'Not set' }}</p>
              </div>
            </div>
            <div class="space-y-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Category</p>
                <p class="mt-1 font-medium text-slate-900">{{ selectedStory.category }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Location</p>
                <p class="mt-1 font-medium text-slate-900">{{ selectedStory.location }}</p>
              </div>
              <div class="flex gap-10">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Likes</p>
                  <p class="mt-1 font-medium text-slate-900">{{ selectedStory.likesCount }}</p>
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Comments</p>
                  <p class="mt-1 font-medium text-slate-900">{{ selectedStory.commentsCount }}</p>
                </div>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Story ID</p>
                <p class="mt-1 font-mono text-[10px] text-slate-400 select-all">{{ selectedStory.id }}</p>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Story content</p>
            <p class="mt-2 whitespace-pre-line text-sm text-slate-700">
              {{ selectedStory.content || 'No content available for this story.' }}
            </p>
          </div>
        </div>
      </div>
    </teleport>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import { useAdminToast } from '@/composables/useAdminToast'

const { showAdminToast } = useAdminToast()
const searchQuery = ref('')
const queue = ref([])
const isLoading = ref(false)
const fetchError = ref('')
const selectedStory = ref(null)

const showBulkMenu = ref(false)
const showFilterMenu = ref(false)
const activeFilter = ref('all')

const filterOptions = [
  { value: 'all', label: 'All items' },
  { value: 'pending', label: 'Pending only' },
  { value: 'approved', label: 'Approved only' },
  { value: 'flagged', label: 'Flagged only' },
]

const filterLabel = computed(() => {
  const found = filterOptions.find((option) => option.value === activeFilter.value)
  return found ? `Filter: ${found.label}` : 'Filter Feed'
})

const normalizeStatus = (status) => {
  if (!status) return 'pending'
  const normalized = status.toString().trim().toLowerCase()
  if (normalized === 'published') return 'approved'
  return normalized
}

const formatStatus = (status) => {
  if (!status) return 'Pending'
  return status
    .toString()
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const isFlaggedStatus = (status) =>
  ['flagged', 'reported', 'rejected'].includes(status)

const statusBadge = (status) =>
  ({
    Approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Flagged: 'border-red-200 bg-red-50 text-red-700',
    Reported: 'border-amber-200 bg-amber-50 text-amber-700',
    Rejected: 'border-amber-200 bg-amber-50 text-amber-700',
    Pending: 'border-slate-200 bg-slate-100 text-slate-600',
  }[status] || 'border-slate-200 bg-slate-100 text-slate-600')

const formatRelativeTime = (dateValue) => {
  if (!dateValue) return 'Unknown'
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) return 'Unknown'

  const diffMs = Date.now() - parsed.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day

  if (diffMs < minute) return 'just now'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} mins ago`
  if (diffMs < day) return `${Math.floor(diffMs / hour)} hours ago`
  if (diffMs < week) return `${Math.floor(diffMs / day)} days ago`
  return parsed.toLocaleDateString()
}

const toExcerpt = (content) => {
  if (!content) return 'No content available for this story.'
  const normalized = content.replace(/\s+/g, ' ').trim()
  if (normalized.length <= 160) return normalized
  return `${normalized.slice(0, 157)}...`
}

const toHandle = (handle) => {
  if (!handle) return ''
  return handle.startsWith('@') ? handle : `@${handle}`
}

const statusIcon = (status) => {
  if (status === 'approved') {
    return '<svg class="w-3.5 h-3.5 inline text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
  }
  if (isFlaggedStatus(status)) {
    return '<svg class="w-3.5 h-3.5 inline text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>'
  }
  return '<svg class="w-3.5 h-3.5 inline text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v5l3 3"/></svg>'
}

const metaIcons = {
  tag: '<svg class="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M3 7a2 2 0 012-2h5.586a2 2 0 011.414.586l7.414 7.414a2 2 0 010 2.828l-4.586 4.586a2 2 0 01-2.828 0L4.586 13.414A2 2 0 014 12V7z"/></svg>',
  location: '<svg class="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  likes: '<svg class="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 9V5a3 3 0 00-6 0v4H5a2 2 0 00-2 2v2a8 8 0 008 8h4a2 2 0 002-2v-7a2 2 0 00-2-2h-1z"/></svg>',
  comments: '<svg class="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 14.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>',
}

const actionIcons = {
  approve: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
  flag: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5v14M5 5h11l-1 4 1 4H5"/></svg>',
  edit: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>',
}

const getActions = (status, flagged) => {
  if (status === 'approved') {
    return [
      {
        key: 'flag',
        label: 'Flag Story',
        style: 'text-amber-700 hover:bg-amber-50 border border-amber-200 cursor-pointer',
        icon: actionIcons.flag,
      },
    ]
  }

  if (flagged) {
    return [
      {
        key: 'approve',
        label: 'Approve Story',
        style: 'text-white bg-slate-900 hover:bg-slate-800 cursor-pointer',
        icon: actionIcons.approve,
      },
    ]
  }

  return [
    {
      key: 'flag',
      label: 'Flag Story',
      style: 'text-amber-700 hover:bg-amber-50 border border-amber-200 cursor-pointer',
      icon: actionIcons.flag,
    },
    {
      key: 'approve',
      label: 'Approve Story',
      style: 'text-white bg-slate-900 hover:bg-slate-800 cursor-pointer',
      icon: actionIcons.approve,
    },
  ]
}

const buildMeta = (item, status) => [
  { label: formatStatus(status), icon: statusIcon(status) },
  { label: item.category, icon: metaIcons.tag },
  { label: item.location, icon: metaIcons.location },
  { label: `${item.likesCount} Likes`, icon: metaIcons.likes },
  { label: `${item.commentsCount} Comments`, icon: metaIcons.comments },
]

const applyStatus = (item, status) => {
  const normalizedStatus = normalizeStatus(status)
  const flagged = isFlaggedStatus(normalizedStatus)
  const approved = normalizedStatus === 'approved'
  return {
    ...item,
    rawStatus: normalizedStatus,
    status: formatStatus(normalizedStatus),
    flagged,
    approved,
    meta: buildMeta(item, normalizedStatus),
    actions: getActions(normalizedStatus, flagged),
  }
}

const isValidImageUrl = (url) => {
  if (typeof url !== 'string') return false
  const trimmed = url.trim()
  return /^https?:\/\//i.test(trimmed)
}

const normalizeImageList = (value) => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .filter((img) => isValidImageUrl(img))
      .map((img) => img.trim())
  }

  if (typeof value === 'string') {
    const text = value.trim()
    if (!text) return []

    if (text.startsWith('{') && text.endsWith('}')) {
      const contents = text.slice(1, -1)
      return contents
        .split(',')
        .map((img) => img.trim().replace(/^"|"$/g, ''))
        .filter((img) => isValidImageUrl(img))
    }

    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) {
        return parsed
          .filter((img) => isValidImageUrl(img))
          .map((img) => img.trim())
      }
      if (typeof parsed === 'string' && isValidImageUrl(parsed)) {
        return [parsed.trim()]
      }
    } catch (error) {
      // not JSON, continue
    }

    if (text.includes(',')) {
      return text
        .split(',')
        .map((img) => img.trim().replace(/^"|"$/g, ''))
        .filter((img) => isValidImageUrl(img))
    }

    return isValidImageUrl(text) ? [text] : []
  }

  if (typeof value === 'object' && value !== null) {
    if (typeof value.url === 'string' && isValidImageUrl(value.url)) return [value.url.trim()]
    if (typeof value.image_url === 'string' && isValidImageUrl(value.image_url)) return [value.image_url.trim()]
  }

  return []
}

const normalizeStoryImages = (story) => {
  if (!story) return []
  const sources = ['imageUrls', 'imageUrl', 'image_url', 'image', 'images']
  const images = sources.flatMap((key) => normalizeImageList(story[key]))
  return [...new Set(images)]
}

const mapStory = (story) => {
  if (!story || story.deletedAt) return null
  const normalizedStatus = normalizeStatus(story.status)
  const authorName = story.authorName || 'Traveler'
  const authorHandle = toHandle(story.authorHandle)
  const likes = Number.isFinite(story.likesCount) ? story.likesCount : 0
  const comments = Number.isFinite(story.commentsCount) ? story.commentsCount : 0
  const category = story.category || 'Natural'
  const location = story.location || 'Cambodia'
  const images = normalizeStoryImages(story)

  const baseItem = {
    id: story.id,
    title: story.title || 'Untitled Story',
    authorName,
    authorHandle,
    submitted: formatRelativeTime(story.createdAt || story.publishedAt),
    excerpt: toExcerpt(story.content),
    content: story.content || '',
    images,
    image: images[0] || '',
    category,
    location,
    likesCount: likes,
    commentsCount: comments,
  }

  return applyStatus(baseItem, normalizedStatus)
}

const loadStories = async () => {
  isLoading.value = true
  fetchError.value = ''
  try {
    // Fetch ALL stories including pending, approved, and flagged
    const response = await api.get('/stories', {
      params: { status: 'pending,approved,flagged' }
    })
    const payload = response?.data?.data ?? response?.data ?? []
    const list = Array.isArray(payload) ? payload : []
    queue.value = list.map(mapStory).filter(Boolean)
  } catch (error) {
    fetchError.value = 'Unable to fetch stories from database.'
    console.error('Failed to fetch stories:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadStories)

const openStoryDetails = (story) => {
  selectedStory.value = { ...story }
}

const closeStoryDetails = () => {
  selectedStory.value = null
}

const syncSelectedStory = () => {
  if (!selectedStory.value) return
  const updated = queue.value.find((item) => item.id === selectedStory.value.id)
  if (updated) selectedStory.value = { ...updated }
}

const filteredQueue = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const filtered = queue.value.filter((item) => {
    if (activeFilter.value === 'pending') return item.rawStatus === 'pending'
    if (activeFilter.value === 'approved') return item.rawStatus === 'approved'
    if (activeFilter.value === 'flagged') return item.flagged
    return true
  })

  if (!query) return filtered
  return filtered.filter((item) =>
    [
      item.title,
      item.authorName,
      item.authorHandle,
      item.excerpt,
      item.category,
      item.location,
      item.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query),
  )
})

const toggleBulkMenu = () => {
  showBulkMenu.value = !showBulkMenu.value
  if (showBulkMenu.value) showFilterMenu.value = false
}

const toggleFilterMenu = () => {
  showFilterMenu.value = !showFilterMenu.value
  if (showFilterMenu.value) showBulkMenu.value = false
}

const setFilter = (value) => {
  activeFilter.value = value
  showFilterMenu.value = false
}

const updateStoryStatus = async (id, status) => {
  const normalizedStatus = normalizeStatus(status)
  const response = await api.patch(`/stories/${id}/status`, {
    status: normalizedStatus,
  })
  const payload = response?.data?.data ?? response?.data
  return normalizeStatus(payload?.status ?? normalizedStatus)
}

const applyBulkAction = async (action) => {
  const targetIds = new Set(filteredQueue.value.map((item) => item.id))
  if (!targetIds.size) return
  showBulkMenu.value = false
  const nextStatus = action === 'approve' ? 'approved' : action === 'flag' ? 'flagged' : null
  if (!nextStatus) return

  const updates = await Promise.allSettled(
    [...targetIds].map(async (id) => ({
      id,
      status: await updateStoryStatus(id, nextStatus),
    })),
  )
  const updated = updates
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value)
  if (!updated.length) return

  const statusMap = new Map(updated.map((item) => [item.id, item.status]))
  queue.value = queue.value.map((item) =>
    statusMap.has(item.id)
      ? applyStatus(item, statusMap.get(item.id) || nextStatus)
      : item,
  )
  showAdminToast({
    message: `Bulk ${action} complete`,
    detail: `Updated status for ${updated.length} stories.`,
    tone: action === 'approve' ? 'success' : 'delete'
  })
  syncSelectedStory()
}

const pendingCount = computed(
  () => queue.value.filter((item) => item.rawStatus === 'pending').length,
)
const flaggedCount = computed(() => queue.value.filter((item) => item.flagged).length)
const approvedCount = computed(() => queue.value.filter((item) => item.approved).length)

const handleAction = async (item, action) => {
  if (action.key === 'approve') {
    const nextStatus = await updateStoryStatus(item.id, 'approved')
    queue.value = queue.value.map((q) =>
      q.id === item.id ? applyStatus(q, nextStatus) : q,
    )
    showAdminToast({
      message: 'Story approved',
      tone: 'success'
    })
    syncSelectedStory()
  } else if (action.key === 'flag') {
    const nextStatus = await updateStoryStatus(item.id, 'flagged')
    queue.value = queue.value.map((q) =>
      q.id === item.id ? applyStatus(q, nextStatus) : q,
    )
    showAdminToast({
      message: 'Story flagged',
      tone: 'delete'
    })
    syncSelectedStory()
  }
}
</script>