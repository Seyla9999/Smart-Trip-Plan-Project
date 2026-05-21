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
              <h1 class="text-2xl font-bold text-white">Destination Management</h1>
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                @click="openAddProvinceModal"
                class="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700 transition-all cursor-pointer"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Province</span>
              </button>
              <button
                type="button"
                @click="openCreateModal"
                class="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Attraction</span>
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
              placeholder="Search attractions by name, category, or province..."
              class="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-4 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>
      </header>

      <div class="flex-1 min-h-0 overflow-hidden p-4 md:p-6">
        <div class="flex h-full min-h-0 flex-col gap-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Total attractions</p>
              <p class="mt-2 text-3xl font-bold text-slate-900">{{ totalAttractions }}</p>
            </div>
            <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-emerald-700">Hidden gems</p>
              <p class="mt-2 text-3xl font-bold text-emerald-700">{{ hiddenGemsCount }}</p>
            </div>
            <div class="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
              <div class="absolute -right-3 -top-4 text-white/10">
                <svg class="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                  />
                </svg>
              </div>
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Most popular</p>
              <p class="mt-2 text-xl font-bold text-white truncate" :title="mostPopularAttraction?.name">
                {{ mostPopularAttraction?.name || 'N/A' }}
              </p>
              <p v-if="mostPopularAttraction" class="text-[12px] text-emerald-400 font-bold mt-1">
                {{ mostPopularAttraction.rating }} ★ · {{ mostPopularAttraction.reviewCount }} Reviews
              </p>
            </div>
          </div>

          <div class="flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 md:px-6">
              <div>
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Attraction catalog</p>
                <p class="text-sm font-semibold text-slate-900">{{ filteredAttractions.length }} destinations</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <select
                  v-model="sortOption"
                  class="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <option value="rating-desc">Rating (High to Low)</option>
                  <option value="rating-asc">Rating (Low to High)</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="reviews-desc">Most Reviews</option>
                </select>
                <select
                  v-model="filterCategory"
                  class="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <option value="all">All Categories</option>
                  <option value="uncategorized">Uncategorized</option>
                  <option v-for="category in categoryOptions" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
                <select
                  v-model="filterProvince"
                  class="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <option value="all">All Provinces</option>
                  <option v-for="province in provinceOptions" :key="province.id" :value="String(province.id)">
                    {{ province.name_en || province.name_kh }}
                  </option>
                </select>
                <select
                  v-model="filterHidden"
                  class="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <option value="all">All Types</option>
                  <option value="hidden">Hidden gems</option>
                  <option value="regular">Regular</option>
                </select>
              </div>
            </div>

            <div class="flex-1 min-h-0 overflow-auto">
              <div class="p-4 md:p-6">
                <div class="space-y-4">
                  <div v-if="isLoading" class="flex h-40 items-center justify-center text-sm font-medium text-slate-500">
                    Loading attractions from database...
                  </div>
                  <div
                    v-else-if="fetchError"
                    class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                  >
                    {{ fetchError }}
                  </div>
                  <div v-else-if="!filteredAttractions.length" class="flex h-40 items-center justify-center text-sm font-medium text-slate-500">
                    No attractions found.
                  </div>
                  <div v-else class="space-y-4">
                    <div
                      v-for="attraction in filteredAttractions"
                      :key="attraction.id"
                      class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div class="flex gap-4 p-4">
                        <div class="h-32 w-36 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          <img v-if="attraction.imageUrl" :src="attraction.imageUrl" :alt="attraction.name" class="h-full w-full object-cover" />
                          <div v-else class="flex h-full w-full items-center justify-center bg-slate-200 text-xs font-semibold text-slate-500">
                            No image
                          </div>
                        </div>

                        <div class="min-w-0 flex-1">
                          <div class="mb-1 flex items-start justify-between gap-2">
                            <div class="min-w-0">
                              <h2 class="text-base font-bold text-slate-900 leading-tight truncate">{{ attraction.name }}</h2>
                              <p class="text-xs text-slate-500">
                                {{ resolveProvinceLabel(attraction) }} · {{ attraction.category || 'Uncategorized' }}
                              </p>
                            </div>
                            <div class="flex items-center gap-2 flex-shrink-0">
                              <span
                                v-if="attraction.isHiddenGem"
                                class="text-xs font-bold tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded"
                              >
                                HIDDEN GEM
                              </span>
                              <span
                                v-if="attraction.hasOpenStatus"
                                class="text-xs font-bold tracking-wide px-2 py-0.5 rounded border"
                                :class="attraction.isOpen ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-600 bg-red-50 border-red-200'"
                              >
                                {{ attraction.isOpen ? 'OPEN' : 'CLOSED' }}
                              </span>
                              <button
                                type="button"
                                class="p-1 text-slate-300 hover:text-slate-600 transition-colors cursor-pointer"
                                @click="openAttractionView(attraction)"
                                aria-label="Open attraction details"
                              >
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p class="text-sm text-slate-700 leading-relaxed line-clamp-3">
                            {{ attraction.description || 'No description provided for this attraction.' }}
                          </p>
                        </div>
                      </div>

                      <div class="flex flex-wrap items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50">
                        <div class="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                          <div class="flex items-center gap-1">
                            <svg class="h-3.5 w-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                            {{ formatRating(attraction.rating) }} rating
                          </div>
                          <div class="flex items-center gap-1">
                            <svg class="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 14.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                            {{ attraction.reviewCount }} reviews
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <button
                            type="button"
                            class="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                            @click="openAttractionView(attraction)"
                          >
                            View details
                          </button>
                          <button
                            type="button"
                            class="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 cursor-pointer"
                            @click="openAttractionEdit(attraction)"
                          >
                            Edit
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
    </div>

    <teleport to="body">
      <div
        v-if="selectedAttraction"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        @click.self="closeAttractionDetails"
      >
        <div class="w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-5 shadow-xl max-h-[90vh] overflow-auto">
          <div class="mb-4 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Attraction details</p>
              <h3 class="text-xl font-bold text-slate-900 truncate">{{ selectedAttraction.name }}</h3>
            </div>
            <button
              type="button"
              @click="closeAttractionDetails"
              class="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              aria-label="Close details"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="detailError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {{ detailError }}
          </div>
          <div v-if="saveError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {{ saveError }}
          </div>

          <div v-if="isDetailLoading" class="flex h-40 items-center justify-center text-sm font-medium text-slate-500">
            Loading full attraction details...
          </div>
          <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-[260px,1fr]">
            <div class="space-y-4">
              <div class="h-44 w-full overflow-hidden rounded-lg bg-slate-100">
                <img v-if="selectedAttraction.imageUrl" :src="selectedAttraction.imageUrl" :alt="selectedAttraction.name" class="h-full w-full object-cover" />
                <div v-else class="flex h-full w-full items-center justify-center bg-slate-200 text-xs font-semibold text-slate-500">
                  No image
                </div>
              </div>
              
              <div class="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Stats</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-slate-500">Avg Rating</span>
                  <span class="text-sm font-bold text-amber-600 flex items-center gap-1">
                    {{ formatRating(selectedAttraction.rating) }}
                    <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-slate-500">User Reviews</span>
                  <span class="text-sm font-bold text-slate-900">{{ selectedAttraction.reviewCount }}</span>
                </div>
                <div class="pt-1 border-t border-slate-200"></div>
                <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-slate-400 uppercase">Province</span>
                  <span class="text-sm font-semibold text-slate-700">{{ resolveProvinceLabel(selectedAttraction) }}</span>
                  <span class="text-[10px] text-slate-400 font-mono">ID: {{ selectedAttraction.provinceId }}</span>
                </div>
                <div class="flex flex-col pt-1">
                  <span class="text-[10px] font-bold text-slate-400 uppercase">UUID</span>
                  <span class="text-[10px] font-mono text-slate-500 break-all">{{ selectedAttraction.id }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="flex items-center border-b border-slate-100">
                <button
                  v-for="tab in detailTabs"
                  :key="tab.key"
                  @click="activeTab = tab.key"
                  class="px-4 py-2 text-sm font-semibold transition-colors relative"
                  :class="activeTab === tab.key ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'"
                >
                  {{ tab.label }}
                  <div v-if="activeTab === tab.key" class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>
                </button>
              </div>

              <div v-if="activeTab === 'details'" class="space-y-4">
                <div class="rounded-xl border border-slate-200 bg-white p-4">
                  <p class="text-xs font-bold text-slate-500 uppercase mb-3">Destination details</p>
                  <div class="grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-2">
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Name (English)</p>
                      <p class="font-semibold">{{ selectedAttraction.nameEn || selectedAttraction.name }}</p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Name (Khmer)</p>
                      <p class="font-semibold">{{ selectedAttraction.nameKh || 'Not set' }}</p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Category</p>
                      <p class="font-semibold">{{ selectedAttraction.category || 'Uncategorized' }}</p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Province</p>
                      <p class="font-semibold">{{ resolveProvinceLabel(selectedAttraction) }}</p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Average rating</p>
                      <p class="font-semibold">{{ formatRating(selectedAttraction.rating) }}</p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Hidden gem</p>
                      <p class="font-semibold">{{ selectedAttraction.isHiddenGem ? 'Yes' : 'No' }}</p>
                    </div>
                  </div>
                </div>

                <div class="rounded-xl border border-slate-200 bg-white p-4">
                  <p class="text-xs font-bold text-slate-500 uppercase mb-2">Description</p>
                  <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {{ selectedAttraction.description || 'No description available.' }}
                  </p>
                </div>
              </div>

              <div v-else-if="activeTab === 'edit'" class="space-y-4">
                <form @submit.prevent="saveAttraction" class="space-y-4">
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Name (English)</label>
                      <input
                        v-model="editForm.name_en"
                        type="text"
                        required
                        class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Name (Khmer)</label>
                      <input
                        v-model="editForm.name_kh"
                        type="text"
                        class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                      <input
                        v-model="editForm.category"
                        type="text"
                        class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Province</label>
                      <select
                        v-model="editForm.province_id"
                        class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">Select province</option>
                        <option v-for="province in provinceOptions" :key="province.id" :value="String(province.id)">
                          {{ province.name_en || province.name_kh }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <span class="block text-xs font-bold text-slate-400 uppercase mb-1">Avg Rating</span>
                      <input
                        :value="formatRating(selectedAttraction.rating)"
                        type="text"
                        disabled
                        class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
                      />
                      
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Image URL</label>
                      <input
                        v-model="editForm.image_url"
                        type="text"
                        class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div class="md:col-span-2">
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Hero Image URL</label>
                      <input
                        v-model="editForm.hero_image"
                        type="text"
                        class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div class="flex items-center gap-4 py-2">
                    <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input v-model="editForm.is_hidden_gem" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                      Hidden gem
                    </label>
                  </div>

                  <div class="rounded-xl border border-slate-200 bg-white p-4">
                    <p class="text-xs font-bold text-slate-500 uppercase mb-2">Description</p>
                    <textarea
                      v-model="editForm.description"
                      rows="4"
                      class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none resize-none"
                      placeholder="Enter description..."
                    ></textarea>
                  </div>

                  <div class="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      @click="closeAttractionDetails"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      :disabled="isSaving"
                      class="rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
                    >
                      {{ isSaving ? 'Saving...' : 'Save All Changes' }}
                    </button>
                  </div>
                </form>
              </div>

              <div v-else-if="activeTab === 'reviews'" class="space-y-4">
                <div v-if="isReviewsLoading" class="flex h-40 items-center justify-center text-sm font-medium text-slate-500">
                  Loading user reviews...
                </div>
                <div v-else-if="!selectedAttractionReviews.length" class="flex h-40 flex-col items-center justify-center text-sm font-medium text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <svg class="h-10 w-10 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 14.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  No reviews yet for this destination.
                </div>
                <div v-else class="space-y-4 max-h-[500px] overflow-auto pr-2">
                  <div 
                    v-for="review in selectedAttractionReviews" 
                    :key="review.id"
                    class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h4 class="font-bold text-slate-900 text-sm">{{ review.title || 'Review' }}</h4>
                        <div class="flex items-center gap-2 mt-0.5">
                          <span class="text-xs font-semibold text-slate-500">{{ review.authorName }}</span>
                          <div class="flex text-amber-500">
                            <svg v-for="i in 5" :key="i" class="h-3 w-3" :class="i <= review.rating ? 'fill-current' : 'text-slate-200'" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          </div>
                          
                        </div>
                      </div>
                      <span class="text-[10px] text-slate-400 font-medium">{{ formatDate(review.createdAt) }}</span>
                    </div>
                    <p class="text-sm text-slate-700 leading-relaxed">{{ review.comment }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Create Attraction Modal -->
    <teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        @click.self="closeCreateModal"
      >
        <div class="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-auto">
          <div class="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold text-slate-900">Add New Attraction</h3>
              <p class="text-sm text-slate-500">Create a new destination entry.</p>
            </div>
            <button
              type="button"
              @click="closeCreateModal"
              class="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              aria-label="Close"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="createError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {{ createError }}
          </div>

          <form @submit.prevent="createAttractionSubmit" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Name (English)</label>
                <input
                  v-model="newAttraction.name_en"
                  type="text"
                  required
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Name (Khmer)</label>
                <input
                  v-model="newAttraction.name_kh"
                  type="text"
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                <input
                  v-model="newAttraction.category"
                  type="text"
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Province</label>
                <select
                  v-model="newAttraction.province_id"
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Select province</option>
                  <option v-for="province in provinceOptions" :key="province.id" :value="String(province.id)">
                    {{ province.name_en || province.name_kh }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Image URL</label>
                <input
                  v-model="newAttraction.image_url"
                  type="text"
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Hero Image URL</label>
                <input
                  v-model="newAttraction.hero_image"
                  type="text"
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
              <textarea
                v-model="newAttraction.description"
                rows="4"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none resize-none"
                placeholder="Add a short description..."
              ></textarea>
            </div>

            <div class="flex items-center gap-4">
              <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                <input v-model="newAttraction.is_hidden_gem" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                Hidden gem
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                @click="closeCreateModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isCreating"
                class="rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                {{ isCreating ? 'Creating...' : 'Create Attraction' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Add Province Modal -->
    <teleport to="body">
      <div
        v-if="showAddProvinceModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        @click.self="closeAddProvinceModal"
      >
        <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
          <div class="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold text-slate-900">Add New Province</h3>
              <p class="text-sm text-slate-500">Create a new province entry.</p>
            </div>
            <button
              type="button"
              @click="closeAddProvinceModal"
              class="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="createProvinceError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {{ createProvinceError }}
          </div>

          <form @submit.prevent="handleAddProvince" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Name (English)</label>
              <input
                v-model="newProvince.name_en"
                type="text"
                required
                placeholder="e.g. Siem Reap"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Name (Khmer)</label>
              <input
                v-model="newProvince.name_kh"
                type="text"
                required
                placeholder="e.g. សៀមរាប"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Main Image URL</label>
              <input
                v-model="newProvince.main_image_url"
                type="text"
                placeholder="https://..."
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
              <textarea
                v-model="newProvince.description"
                rows="3"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none resize-none"
                placeholder="Brief description..."
              ></textarea>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                @click="closeAddProvinceModal"
                class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isCreatingProvince"
                class="rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                {{ isCreatingProvince ? 'Creating...' : 'Create Province' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { createAttraction, getAttractionById, getAttractions, updateAttraction } from '@/services/attractions.service'
import { getProvinces, createProvince } from '@/services/home.service'
import { getReviewsByAttraction } from '@/services/reviews.service'

const searchQuery = ref('')
const attractions = ref([])
const provinces = ref([])
const isLoading = ref(false)
const fetchError = ref('')
const selectedAttraction = ref(null)
const showCreateModal = ref(false)
const showAddProvinceModal = ref(false)
const detailMode = ref('view')
const isDetailLoading = ref(false)
const detailError = ref('')
const isSaving = ref(false)
const saveError = ref('')
const isCreating = ref(false)
const createError = ref('')
const isCreatingProvince = ref(false)
const createProvinceError = ref('')

const activeTab = ref('details')
const selectedAttractionReviews = ref([])
const isReviewsLoading = ref(false)
const sortOption = ref('rating-desc')
const filterCategory = ref('all')
const filterProvince = ref('all')
const filterHidden = ref('all')

const editForm = ref({
  name_en: '',
  name_kh: '',
  description: '',
  category: '',
  image_url: '',
  hero_image: '',
  province_id: '',
  is_hidden_gem: false,
})

const newAttraction = ref({
  name_en: '',
  name_kh: '',
  category: '',
  province_id: '',
  description: '',
  image_url: '',
  hero_image: '',
  is_hidden_gem: false,
})

const newProvince = ref({
  name_en: '',
  name_kh: '',
  description: '',
  main_image_url: '',
})

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeAttraction = (item) => {
  if (!item) return null
  const nameEn = item.name_en || item.name || ''
  const nameKh = item.name_kh || ''
  const name = nameEn || nameKh || 'Untitled attraction'
  const rating = toNumber(item.average_rating ?? item.rating) ?? 0
  const reviewCount = toNumber(item.review_count ?? item.reviews_count ?? item.reviews) ?? 0
  const entranceFee = toNumber(item.entrance_fee)
  const hasOpenStatus = typeof item.is_open === 'boolean'
  const isOpen = hasOpenStatus ? item.is_open : null
  const amenities = Array.isArray(item.amenities) ? item.amenities : []
  const provinceLabel =
    item.province?.name_en ||
    item.province?.name_kh ||
    item.province_name ||
    item.province ||
    item.province_id ||
    'Unknown province'

  return {
    id: item.id,
    name,
    nameEn,
    nameKh,
    category: item.category || '',
    description: item.description || '',
    rating,
    reviewCount,
    entranceFee,
    hasEntranceFee: entranceFee !== null,
    isOpen,
    hasOpenStatus,
    amenities,
    hasAmenities: amenities.length > 0,
    imageUrl: item.image_url || item.hero_image || item.image || '',
    heroImage: item.hero_image || '',
    provinceLabel,
    provinceId: item.province_id || item.province?.id || '',
    isHiddenGem: Boolean(item.is_hidden_gem ?? item.isHiddenGem ?? false),
    raw: item,
  }
}

const formatRating = (value) => {
  if (!Number.isFinite(value)) return '0.0'
  return Number(value).toFixed(1)
}

const formatFee = (value) => {
  const parsed = toNumber(value)
  if (parsed === null) return 'Entry fee unavailable'
  if (parsed === 0) return 'Free entry'
  return `$${parsed.toFixed(2)} entry`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const loadAttractions = async () => {
  isLoading.value = true
  fetchError.value = ''
  try {
    const response = await getAttractions({limit: 9999, sortBy: 'rating', sortOrder: 'DESC' })
    const payload = response?.data?.data ?? response?.data ?? []
    const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []
    attractions.value = list.map(normalizeAttraction).filter(Boolean)
  } catch (error) {
    fetchError.value = 'Unable to fetch attractions from database.'
    console.error('Failed to fetch attractions:', error)
  } finally {
    isLoading.value = false
  }
}

const loadProvinces = async () => {
  try {
    const list = await getProvinces()
    provinces.value = Array.isArray(list) ? list : []
  } catch (error) {
    console.error('Failed to fetch provinces:', error)
  }
}

onMounted(() => {
  loadAttractions()
  loadProvinces()
})

const totalAttractions = computed(() => attractions.value.length)
const hiddenGemsCount = computed(() => attractions.value.filter((item) => item.isHiddenGem).length)
const mostPopularAttraction = computed(() => {
  if (!attractions.value.length) return null
  // Calculate a popularity score: Rating * log10(ReviewCount + 1.1)
  const sorted = [...attractions.value].sort((a, b) => {
    const scoreA = (Number(a.rating) || 0) * Math.log10((Number(a.reviewCount) || 0) + 1.1)
    const scoreB = (Number(b.rating) || 0) * Math.log10((Number(b.reviewCount) || 0) + 1.1)
    return scoreB - scoreA
  })
  return sorted[0]
})

const provinceOptions = computed(() =>
  [...provinces.value].sort((a, b) =>
    (a.name_en || '').localeCompare(b.name_en || ''),
  ),
)

const provinceMap = computed(() => {
  const map = new Map()
  provinces.value.forEach((province) => {
    map.set(String(province.id), province.name_en || province.name_kh || 'Unknown province')
  })
  return map
})

const resolveProvinceLabel = (attraction) => {
  if (!attraction) return 'Unknown province'
  const byId = provinceMap.value.get(String(attraction.provinceId || attraction.province_id || ''))
  return byId || attraction.provinceLabel || 'Unknown province'
}

const categoryOptions = computed(() => {
  const set = new Set()
  attractions.value.forEach((item) => {
    if (item.category) set.add(item.category)
  })
  return [...set].sort((a, b) => a.localeCompare(b))
})

const filteredAttractions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  let list = [...attractions.value]

  if (filterCategory.value === 'uncategorized') {
    list = list.filter((item) => !item.category)
  } else if (filterCategory.value !== 'all') {
    list = list.filter((item) => item.category === filterCategory.value)
  }

  if (filterProvince.value !== 'all') {
    list = list.filter((item) => String(item.provinceId || '') === filterProvince.value)
  }

  if (filterHidden.value === 'hidden') {
    list = list.filter((item) => item.isHiddenGem)
  } else if (filterHidden.value === 'regular') {
    list = list.filter((item) => !item.isHiddenGem)
  }

  if (query) {
    list = list.filter((item) =>
    [item.name, item.nameEn, item.nameKh, item.category, resolveProvinceLabel(item), item.description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query),
    )
  }

  switch (sortOption.value) {
    case 'rating-asc':
    list.sort((a, b) => (a.rating || 0) - (b.rating || 0))
    break
    case 'name-asc':
    list.sort((a, b) => a.name.localeCompare(b.name))
    break
    case 'name-desc':
    list.sort((a, b) => b.name.localeCompare(a.name))
    break
    case 'reviews-desc':
    list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    break
    default:
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }

  return list
})

const detailTabs = computed(() => {
  if (detailMode.value === 'edit') {
    return [
      { key: 'edit', label: 'Edit Details' },
      { key: 'reviews', label: `User Reviews (${selectedAttraction.value?.reviewCount || 0})` },
    ]
  }
  return [
    { key: 'details', label: 'View Details' },
    { key: 'reviews', label: `User Reviews (${selectedAttraction.value?.reviewCount || 0})` },
  ]
})

const hydrateEditForm = (attraction) => {
  if (!attraction) return
  editForm.value = {
    name_en: attraction.nameEn || attraction.name || '',
    name_kh: attraction.nameKh || '',
    description: attraction.description || '',
    category: attraction.category || '',
    image_url: attraction.imageUrl || '',
    hero_image: attraction.heroImage || '',
    province_id: attraction.provinceId ? String(attraction.provinceId) : '',
    is_hidden_gem: Boolean(attraction.isHiddenGem),
  }
}

const fetchReviews = async (attractionId) => {
  isReviewsLoading.value = true
  try {
    const response = await getReviewsByAttraction(attractionId)
    selectedAttractionReviews.value = response?.data?.data || []
  } catch (error) {
    console.error('Failed to load reviews:', error)
  } finally {
    isReviewsLoading.value = false
  }
}

const openAttractionDetails = async (attraction, mode = 'view') => {
  selectedAttraction.value = { ...attraction }
  saveError.value = ''
  detailError.value = ''
  detailMode.value = mode
  activeTab.value = mode === 'edit' ? 'edit' : 'details'
  hydrateEditForm(attraction)
  isDetailLoading.value = true
  
  // Fetch reviews in parallel
  fetchReviews(attraction.id)

  try {
    const response = await getAttractionById(attraction.id)
    const detail = response?.data?.data ?? response?.data ?? null
    if (detail) {
      const normalized = normalizeAttraction(detail)
      if (normalized) {
        const reviewCount = selectedAttraction.value?.reviewCount ?? normalized.reviewCount
        selectedAttraction.value = { ...selectedAttraction.value, ...normalized, reviewCount }
        hydrateEditForm(selectedAttraction.value)
      }
    }
  } catch (error) {
    detailError.value = 'Unable to load full attraction details.'
    console.error('Failed to load attraction details:', error)
  } finally {
    isDetailLoading.value = false
  }
}

const openAttractionView = (attraction) => openAttractionDetails(attraction, 'view')
const openAttractionEdit = (attraction) => openAttractionDetails(attraction, 'edit')

const closeAttractionDetails = () => {
  selectedAttraction.value = null
  detailError.value = ''
  saveError.value = ''
  isDetailLoading.value = false
  detailMode.value = 'view'
  activeTab.value = 'details'
  selectedAttractionReviews.value = []
}

const resetNewAttraction = () => {
  newAttraction.value = {
    name_en: '',
    name_kh: '',
    category: '',
    province_id: '',
    description: '',
    image_url: '',
    hero_image: '',
    is_hidden_gem: false,
  }
}

const openCreateModal = () => {
  createError.value = ''
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  createError.value = ''
  resetNewAttraction()
}

const openAddProvinceModal = () => {
  createProvinceError.value = ''
  showAddProvinceModal.value = true
}

const closeAddProvinceModal = () => {
  showAddProvinceModal.value = false
  createProvinceError.value = ''
  newProvince.value = {
    name_en: '',
    name_kh: '',
    description: '',
    main_image_url: '',
  }
}

const handleAddProvince = async () => {
  if (!newProvince.value.name_en || !newProvince.value.name_kh) {
    createProvinceError.value = 'English and Khmer names are required.'
    return
  }

  isCreatingProvince.value = true
  createProvinceError.value = ''
  try {
    const data = await createProvince(newProvince.value)
    if (data) {
      // Refresh provinces list
      await loadProvinces()
      closeAddProvinceModal()
    }
  } catch (error) {
    const message = error?.response?.data?.message || error?.message
    createProvinceError.value = message || 'Unable to create province.'
    console.error('Failed to create province:', error)
  } finally {
    isCreatingProvince.value = false
  }
}
const parseProvinceId = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const createAttractionSubmit = async () => {
  const nameEn = newAttraction.value.name_en.trim()
  if (!nameEn) {
    createError.value = 'Name (English) is required.'
    return
  }

  isCreating.value = true
  createError.value = ''
  try {
    const payload = {
      name_en: nameEn,
      name_kh: newAttraction.value.name_kh.trim() || undefined,
      category: newAttraction.value.category.trim() || undefined,
      description: newAttraction.value.description.trim() || undefined,
      province_id: parseProvinceId(newAttraction.value.province_id),
      image_url: newAttraction.value.image_url.trim() || undefined,
      hero_image: newAttraction.value.hero_image.trim() || undefined,
      is_hidden_gem: newAttraction.value.is_hidden_gem,
    }
    const response = await createAttraction(payload)
    const created = response?.data?.data ?? response?.data ?? null
    if (created) {
      const normalized = normalizeAttraction(created)
      if (normalized) {
        attractions.value = [normalized, ...attractions.value]
      }
    }
    closeCreateModal()
  } catch (error) {
    const message = error?.response?.data?.message
    createError.value = message || 'Unable to create attraction.'
    console.error('Failed to create attraction:', error)
  } finally {
    isCreating.value = false
  }
}

const buildUpdatePayload = () => {
  return {
    name_en: editForm.value.name_en.trim(),
    name_kh: editForm.value.name_kh.trim() || undefined,
    description: editForm.value.description.trim() || undefined,
    category: editForm.value.category.trim() || undefined,
    image_url: editForm.value.image_url.trim() || undefined,
    hero_image: editForm.value.hero_image.trim() || undefined,
    province_id: editForm.value.province_id?.trim() || undefined,
    is_hidden_gem: editForm.value.is_hidden_gem,
  }
}

const buildLocalUpdate = () => {
  const provinceId = editForm.value.province_id?.trim() || selectedAttraction.value?.provinceId || ''
  return {
    name: editForm.value.name_en.trim(),
    nameEn: editForm.value.name_en.trim(),
    nameKh: editForm.value.name_kh.trim(),
    description: editForm.value.description.trim(),
    category: editForm.value.category.trim(),
    imageUrl: editForm.value.image_url.trim() || selectedAttraction.value?.imageUrl || '',
    heroImage: editForm.value.hero_image.trim() || selectedAttraction.value?.heroImage || '',
    provinceLabel: resolveProvinceLabel({ provinceId }),
    provinceId,
    isHiddenGem: editForm.value.is_hidden_gem,
  }
}

const saveAttraction = async () => {
  if (!selectedAttraction.value?.id) return
  isSaving.value = true
  saveError.value = ''
  try {
    const payload = buildUpdatePayload()
    const response = await updateAttraction(selectedAttraction.value.id, payload)
    const updated = response?.data?.data ?? response?.data ?? null
    const normalized = updated ? normalizeAttraction(updated) : null
    const localUpdate = normalized || buildLocalUpdate()
    selectedAttraction.value = { ...selectedAttraction.value, ...localUpdate }
    attractions.value = attractions.value.map((item) =>
      item.id === selectedAttraction.value.id ? { ...item, ...localUpdate } : item,
    )
  } catch (error) {
    const message = error?.response?.data?.message
    saveError.value = message || 'Unable to update attraction.'
    console.error('Failed to update attraction:', error)
  } finally {
    isSaving.value = false
  }
}
</script>
