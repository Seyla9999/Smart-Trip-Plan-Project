<template>
  <div class="min-h-screen bg-gray-50 px-5 py-10" style="isolation: isolate;">

    <!-- Loading -->
    <div v-if="isPageLoading" class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div class="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
      <p class="text-gray-500 font-medium">Loading your trip...</p>
    </div>

    <!-- Error -->
    <div v-else-if="apiError" class="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div class="text-5xl">⚠️</div>
      <h2 class="text-xl font-bold text-gray-700">{{ apiError }}</h2>
      <router-link to="/trip"
        class="px-6 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition">
        ← Back to Search
      </router-link>
    </div>

    <template v-else>
      <!-- Page header -->
      <div class="max-w-7xl mx-auto mb-10 flex flex-wrap justify-between items-start gap-5">
        <div>
          <h1 class="text-3xl font-extrabold text-green-800 mb-2">Your Trip Plan</h1>
          <p class="flex flex-wrap items-center gap-3 text-gray-500">
            <span class="font-medium text-gray-700">{{ originName }} → {{ destinationName }}</span>
            <span class="text-sm text-gray-400">{{ displayDateRange }}</span>
          </p>
        </div>
        <div class="flex flex-wrap gap-3 items-center">
          <button @click="savePlan" :disabled="isSaving"
            class="px-4 py-2.5 bg-green-700 text-white rounded-lg text-sm font-semibold
                   hover:bg-green-800 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-sm flex items-center gap-2">
            <span v-if="isSaving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ saveLabel }}
          </button>
          <button v-if="canInvite"
            @click="openShareModal"
            class="px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition shadow-sm">
            🔗 Invite Friends
          </button>
          <button v-if="tripData?.owner_id && currentUserId.value && String(tripData.owner_id) === String(currentUserId.value)"
            @click="confirmDeleteOnPage"
            class="px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition shadow-sm">
            🗑️ Delete Trip
          </button>
          <button v-if="tripData?.members && tripData.members.length > 0"
            @click="showMembersPanel = true"
            class="px-4 py-2.5 bg-white text-green-800 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50 hover:border-green-700 transition shadow-sm">
            👥 Members
          </button>
          <router-link to="/trip"
            class="px-4 py-2.5 border border-gray-300 bg-white text-green-800 rounded-lg text-sm font-semibold
                   hover:bg-gray-50 hover:border-green-700 transition">
            ← New Search
          </router-link>
        </div>
      </div>

      <!-- Save notification -->
      <Teleport to="body">
        <transition name="toast">
          <div v-if="toastMsg"
            class="fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2"
            :class="toastType === 'success' ? 'bg-green-700 text-white' : 'bg-red-500 text-white'">
            {{ toastMsg }}
          </div>
        </transition>
      </Teleport>

      <!-- Share Modal -->
      <Teleport to="body">
        <div v-if="showShareModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4 pt-20"
          @click.self="showShareModal = false">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[85vh] flex flex-col">
            <div class="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <h3 class="text-lg font-bold text-green-800">Invite Friends</h3>
              <button @click="showShareModal = false" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div class="p-6 flex flex-col gap-5 overflow-y-auto">
              <p class="text-sm text-gray-500">Share this trip with your friends</p>
              <div v-if="isGeneratingToken"
                class="flex items-center gap-2 text-xs text-gray-400">
                <span class="w-3 h-3 border-2 border-gray-300 border-t-green-600
                            rounded-full animate-spin"></span>
                Generating invite link…
              </div>
              <div class="flex gap-2">
                <input :value="shareLink" readonly @focus="selectInput($event)"
                  class="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50" />
                <button @click="copyToClipboard"
                  class="px-4 py-2.5 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800 transition whitespace-nowrap">
                  {{ copiedText }}
                </button>
              </div>
              <div class="flex gap-3">
                <button @click="shareToWhatsApp" class="flex-1 py-2.5 bg-[#25D366] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition">💬 WhatsApp</button>
                <button @click="shareToEmail"    class="flex-1 py-2.5 bg-red-500    text-white rounded-lg text-sm font-semibold hover:opacity-90 transition">📧 Email</button>
                <button @click="shareToFacebook" class="flex-1 py-2.5 bg-[#1877f2] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition">👍 Facebook</button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="showMembersPanel" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4 pt-20"
          @click.self="showMembersPanel = false">
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col">
            <div class="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <h3 class="text-lg font-bold text-green-800">Trip Members</h3>
              <button @click="showMembersPanel = false" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div class="p-6 overflow-y-auto">
              <PlanMembers
                :members="formattedMembers"
                :tripId="tripId"
                :creatorId="tripData?.owner_id || ''"
                :groupChatId="groupChat?.id || ''"
                :hasJoinedGroupChat="hasJoinedGroupChat"
                @create-chat="handleCreateGroupChat"
                @join-chat="handleJoinedGroupChat"
                @open-chat="handleOpenGroupChat"
                @kick-member="handleKickMember"
              />
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Main grid -->
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-7 items-start">

        <!-- ─── Sidebar ─────────────────────────────────────────────────────── -->
        <aside class="flex flex-col gap-5 lg:sticky lg:top-5">

          <!-- Trip details -->
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <h3 class="text-xs font-bold text-green-800 uppercase tracking-wide mb-4">Trip Details</h3>
            <div class="divide-y divide-gray-50">
              <div class="flex justify-between py-2.5 text-sm"><span class="text-gray-400">From</span><span class="font-semibold text-gray-700">{{ originName }}</span></div>
              <div class="flex justify-between py-2.5 text-sm"><span class="text-gray-400">To</span><span class="font-semibold text-gray-700">{{ tripDetailsDestinationLabel }}</span></div>
              <div class="flex justify-between py-2.5 text-sm"><span class="text-gray-400">Duration</span><span class="font-semibold text-gray-700">{{ daysCount }} days</span></div>
              <div class="flex justify-between py-2.5 text-sm"><span class="text-gray-400">Travel Type</span><span class="font-semibold text-gray-700 capitalize">{{ travelType }}</span></div>
            </div>
          </div>

          <!-- ── Per-Day Weather ─────────────────────────────────────────────── -->
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-bold text-green-800 uppercase tracking-wide">Weather Forecast</h3>
              <span v-if="weatherLoading" class="w-4 h-4 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin"></span>
            </div>

            <!-- Day tabs -->
            <div class="flex gap-1.5 flex-wrap mb-4">
              <button v-for="(day, idx) in weatherForecast" :key="idx"
                @click="selectedWeatherDay = idx"
                :class="selectedWeatherDay === idx
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-green-400'"
                class="px-2.5 py-1 rounded-full border text-xs font-semibold transition">
                Day {{ idx + 1 }}
              </button>
            </div>

            <!-- Weather card for selected day -->
            <template v-if="weatherForecast.length">
              <div class="flex items-center gap-4 mb-3">
                <span class="text-4xl">{{ weatherForecast[selectedWeatherDay]?.icon }}</span>
                <div>
                  <div class="text-xs text-gray-400 mb-0.5">{{ weatherForecast[selectedWeatherDay]?.dateLabel }}</div>
                  <div class="text-2xl font-bold text-green-800">
                    {{ weatherForecast[selectedWeatherDay]?.tempMax }}° / {{ weatherForecast[selectedWeatherDay]?.tempMin }}°C
                  </div>
                  <div class="text-sm text-gray-500">{{ weatherForecast[selectedWeatherDay]?.condition }}</div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div class="bg-gray-50 rounded-lg px-3 py-2">💧 Rain: {{ weatherForecast[selectedWeatherDay]?.rain }} mm</div>
                <div class="bg-gray-50 rounded-lg px-3 py-2">💨 Wind: {{ weatherForecast[selectedWeatherDay]?.wind }} km/h</div>
                <div class="bg-gray-50 rounded-lg px-3 py-2">☀️ UV: {{ weatherForecast[selectedWeatherDay]?.uv }}</div>
                <div class="bg-gray-50 rounded-lg px-3 py-2">🌅 Sunrise: {{ weatherForecast[selectedWeatherDay]?.sunrise }}</div>
              </div>
            </template>
            <div v-else-if="!weatherLoading" class="text-xs text-gray-400 text-center py-4">Weather unavailable</div>
          </div>

          <!-- ── Daily Schedule (Timeline) ───────────────────────────────────── -->
          <div class="bg-white rounded-xl p-5 shadow-sm">

            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-bold text-green-800 uppercase tracking-wide">Daily Schedule</h3>
              <button v-if="schedule[selectedDay]?.length"
                @click="clearDay(selectedDay)"
                class="text-xs text-red-400 hover:text-red-600 transition font-medium">
                Clear Day
              </button>
            </div>

            <!-- Day selector pills -->
            <div class="flex flex-wrap gap-1.5 mb-5">
              <button v-for="day in daysCount" :key="day" @click="selectedDay = day"
                :class="selectedDay === day
                  ? 'bg-green-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-700'"
                class="px-3 py-1 rounded-full text-xs font-semibold transition">
                Day {{ day }}
              </button>
            </div>

            <!-- Empty state -->
            <div v-if="!schedule[selectedDay]?.length"
              class="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
              <span class="text-3xl mb-2">🗺️</span>
              <p class="text-xs text-gray-400 font-medium">No stops yet for Day {{ selectedDay }}</p>
              <p class="text-xs text-gray-300 mt-0.5">Add attractions from the list below</p>
            </div>

            <!-- Timeline -->
            <div v-else class="relative">
              <!-- Vertical line -->
              <div class="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-green-400 via-green-200 to-green-100 rounded-full"></div>

              <div class="flex flex-col gap-0">
                <div v-for="(item, i) in schedule[selectedDay]" :key="item.placeId"
                  class="relative flex items-start gap-3 group">

                  <!-- Timeline dot -->
                  <div class="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-green-500 flex items-center justify-center shadow-sm group-hover:border-green-700 transition-colors">
                    <span class="text-base leading-none">{{ item.icon }}</span>
                  </div>

                  <!-- Content card -->
                  <div
                    class="flex-1 min-w-0 mb-4 bg-green-50 hover:bg-green-100 border border-green-100 rounded-xl p-3 cursor-pointer transition-all duration-150 shadow-xs"
                    role="button"
                    tabindex="0"
                    @click="openScheduleItemMap(item)"
                    @keydown.enter.prevent="openScheduleItemMap(item)"
                    @keydown.space.prevent="openScheduleItemMap(item)">

                    <!-- Stop number + remove -->
                    <div class="flex items-center justify-between mb-0.5">
                      <span class="text-[10px] font-bold text-green-600 uppercase tracking-wider">Stop {{ i + 1 }}</span>
                      <button
                        @click.stop="removeFromSchedule(selectedDay, i)"
                        class="text-gray-300 hover:text-red-400 transition text-base leading-none -mr-1 -mt-1 px-1">
                        ×
                      </button>
                    </div>

                    <div class="text-xs font-bold text-green-900 leading-snug truncate">{{ item.name }}</div>

                    <div v-if="item.vicinity" class="text-[11px] text-gray-400 truncate mt-0.5">
                      📍 {{ item.vicinity }}
                    </div>

                    <!-- Time badge if available -->
                    <div v-if="item.startTime || item.endTime" class="mt-1.5 flex items-center gap-1">
                      <span class="text-[10px] bg-green-200 text-green-800 font-semibold px-2 py-0.5 rounded-full">
                        🕐 {{ item.startTime ?? '' }}{{ item.startTime && item.endTime ? ' – ' : '' }}{{ item.endTime ?? '' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- End cap -->
                <div class="relative flex items-center gap-3">
                  <div class="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-green-700 flex items-center justify-center shadow-sm">
                    <span class="text-white text-sm">🏁</span>
                  </div>
                  <span class="text-xs text-gray-400 font-medium">End of Day {{ selectedDay }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Packing list removed -->

        </aside>

        <!-- ─── Right column ──────────────────────────────────────────────────── -->
        <main class="flex flex-col gap-7">

          <!-- Map -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 class="text-xl font-bold text-green-800">Route Map</h2>
              <div class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-sm font-semibold">
                <span class="text-green-700">{{ originName }}</span>
                <span class="text-gray-400">→</span>
                <span class="text-blue-600">{{ effectivePlanMode === 'attraction' && effectiveAttractionName ? effectiveAttractionName : destinationName }}</span>
              </div>
            </div>

            <!-- Filters removed -->

            <div class="flex flex-col md:flex-row gap-5">
              <div class="relative flex-1 rounded-xl overflow-hidden border border-gray-200 min-h-[460px]">
                <div ref="mapContainer" class="w-full h-full min-h-[460px]"></div>
                <div v-if="isLoadingRoute"
                  class="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-3 pointer-events-none z-[500]">
                  <div class="w-9 h-9 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <span class="text-sm font-semibold text-green-800">Loading route...</span>
                </div>
              </div>
              <div class="w-full md:w-44 flex-shrink-0">
                <!-- Services summary removed -->
                <p class="text-xs font-bold text-green-800 uppercase tracking-wide mb-2">Map Key</p>
                <div class="flex flex-col gap-2 text-xs text-gray-600">
                  <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-green-700 ring-2 ring-green-700 ring-offset-1 flex-shrink-0"></span>Start</div>
                  <div v-if="effectivePlanMode === 'attraction'" class="flex items-center gap-2"><span class="text-base leading-none">⭐</span>Selected Attraction</div>
                  <div v-else class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-500 ring-offset-1 flex-shrink-0"></span>Destination</div>
                  <div class="flex items-center gap-2"><span class="inline-block w-6 h-1 bg-blue-500 rounded flex-shrink-0"></span>Route</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Route attractions from backend database ───────────────────── -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-2xl font-bold text-green-800">Attractions Along Route</h2>
              <span v-if="routeAttractionsLoading" class="w-5 h-5 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin"></span>
            </div>
            <p class="text-sm text-gray-400 mb-5">These are attractions found by Google near the driving route.</p>

            <div v-if="routeAttractionsLoading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <div v-for="n in 6" :key="n" class="animate-pulse bg-gray-100 rounded-xl h-56"></div>
            </div>

            <div v-else-if="routeAttractions.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <div v-for="item in routeAttractions" :key="item.place.place_id ?? item.place.id"
                class="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer focus-within:ring-2 focus-within:ring-green-600 focus-within:ring-offset-2"
                role="button"
                tabindex="0"
                @click="openAttraction(item.place)"
                @keydown.enter.prevent="openAttraction(item.place)"
                @keydown.space.prevent="openAttraction(item.place)">

                <div class="relative h-40 overflow-hidden bg-gray-100" @click.stop="openAttraction(item.place)">
                  <img v-if="getAttractionPhoto(item.place)"
                    :src="getAttractionPhoto(item.place) || ''" :alt="getAttractionName(item.place)"
                    @error="markImageError(item.place)"
                    class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-4xl">
                    {{ getCategoryIcon(item.place) }}
                  </div>
                  <span class="absolute top-3 right-3 bg-blue-700/90 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                    ~ {{ item.distanceKm.toFixed(1) }} km from route
                  </span>
                </div>

                <div class="p-4 flex flex-col flex-1">
                  <h3 class="font-bold text-green-800 mb-0.5 leading-tight hover:underline" @click.stop="openAttraction(item.place)">{{ getAttractionName(item.place) }}</h3>
                  <p class="text-xs text-gray-400 mb-1">📍 {{ getAttractionProvince(item.place) }}</p>
                  <p v-if="item.place.description" class="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">{{ item.place.description }}</p>
                  <div class="flex items-center gap-2 mb-3">
                    <span class="text-sm font-bold text-amber-500">⭐ {{ item.place.rating?.toFixed(1) ?? 'N/A' }}</span>
                    <span class="text-xs text-gray-400">Route match</span>
                  </div>
                  <div class="mt-auto flex items-center gap-2">
                    <select v-model="addToDayMap[String(item.place.id)]"
                      @click.stop
                      class="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500">
                      <option v-for="d in daysCount" :key="d" :value="d">Day {{ d }}</option>
                    </select>
                    <button @click.stop="openAttraction(item.place)"
                      class="px-3 py-1.5 border border-green-200 text-green-700 text-xs font-bold rounded-lg hover:bg-green-50 transition whitespace-nowrap">
                      Detail
                    </button>
                    <button @click.stop="openInGoogleMaps(item.place)"
                      class="px-3 py-1.5 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-50 transition whitespace-nowrap">
                      Open
                    </button>
                    <button @click.stop="addToSchedule(item.place)"
                      class="px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-800 transition whitespace-nowrap">
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="py-12 text-center text-gray-400 text-sm">
              No Google attractions were found along this route.
            </div>
          </div>

          <!-- ── Province attractions from backend database ───────────────── -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-2xl font-bold text-green-800">Attractions in {{ destinationName }}</h2>
              <span v-if="attractionsLoading" class="w-5 h-5 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin"></span>
            </div>
            <p class="text-sm text-gray-400 mb-5">All attractions available in the province the user selected.</p>

            <div class="flex gap-2 flex-wrap mb-5">
              <button v-for="cat in attractionCategories" :key="cat.type"
                @click="selectedAttractionCategory = cat.type"
                :class="selectedAttractionCategory === cat.type
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-green-400'"
                class="px-3 py-1 rounded-full border text-xs font-semibold transition">
                {{ cat.icon }} {{ cat.label }}
              </button>
            </div>

            <div v-if="attractionsLoading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <div v-for="n in 6" :key="n" class="animate-pulse bg-gray-100 rounded-xl h-56"></div>
            </div>

            <div v-else-if="filteredAttractions.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <div v-for="place in filteredAttractions" :key="place.id"
                class="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer focus-within:ring-2 focus-within:ring-green-600 focus-within:ring-offset-2"
                role="button"
                tabindex="0"
                @click="openAttraction(place)"
                @keydown.enter.prevent="openAttraction(place)"
                @keydown.space.prevent="openAttraction(place)">

                <div class="relative h-40 overflow-hidden bg-gray-100" @click.stop="openAttraction(place)">
                  <img v-if="getAttractionPhoto(place)"
                    :src="getAttractionPhoto(place) || ''" :alt="getAttractionName(place)"
                    @error="markImageError(place)"
                    class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-4xl">
                    {{ getCategoryIcon(place) }}
                  </div>
                  <span class="absolute top-3 right-3 bg-green-800/90 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {{ getCategoryIcon(place) }} {{ place.category ?? 'Attraction' }}
                  </span>
                  <span v-if="isAddedToAnyDay(String(place.id))"
                    class="absolute top-3 left-3 bg-yellow-400 text-gray-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    ✓ Added
                  </span>
                </div>

                <div class="p-4 flex flex-col flex-1">
                  <h3 class="font-bold text-green-800 mb-0.5 leading-tight hover:underline" @click.stop="openAttraction(place)">{{ getAttractionName(place) }}</h3>
                  <p class="text-xs text-gray-400 mb-1">📍 {{ place.vicinity || getAttractionProvince(place) }}</p>
                  <p v-if="place.description" class="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">{{ place.description }}</p>
                  <div class="flex items-center gap-2 mb-3">
                    <span class="text-sm font-bold text-amber-500">⭐ {{ Number(place.rating ?? place.average_rating ?? 0).toFixed(1) }}</span>
                    <span v-if="place.user_ratings_total" class="text-xs text-gray-400">({{ place.user_ratings_total.toLocaleString() }})</span>
                  </div>
                  <div class="mt-auto flex items-center gap-2">
                    <select v-model="addToDayMap[String(place.id)]"
                      @click.stop
                      class="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500">
                      <option v-for="d in daysCount" :key="d" :value="d">Day {{ d }}</option>
                    </select>
                    <button @click.stop="openAttraction(place)"
                      class="px-3 py-1.5 border border-green-200 text-green-700 text-xs font-bold rounded-lg hover:bg-green-50 transition whitespace-nowrap">
                      Detail
                    </button>
                    <button @click.stop="openInGoogleMaps(place)"
                      class="px-3 py-1.5 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-50 transition whitespace-nowrap">
                      Open
                    </button>
                    <button @click.stop="addToSchedule(place)"
                      class="px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-800 transition whitespace-nowrap">
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="py-12 text-center text-gray-400 text-sm">
              No attractions found in {{ destinationName }}.
            </div>
          </div>

          <!-- Nearby services removed -->

        </main>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import API from '@/api/axios'
import { getStoredAuthToken } from '@/services/auth-session.service'
import { findTripGroupChat } from '@/services/group-chat.service'
import type { GroupChat } from '@/services/group-chat.service'
import PlanMembers from '@/components/PlanMembers.vue'
import { useGroupChat } from '@/composables/useGroupChat'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// ─── Types ────────────────────────────────────────────────────────────────────
interface ItineraryAttraction { id: string; name_en: string; category?: string; province?: string | { name_en?: string; nameEn?: string; name?: string } }
interface ItineraryItem  {
  id: string
  title?: string
  description?: string
  notes?: string
  location?: string
  attraction_id?: string
  attraction?: ItineraryAttraction
  start_time?: string
  end_time?: string
  day_number?: number
  day_index: number
}
interface TripMember {
  id: string
  user_id: string
  role: string
  name?: string
  email?: string
  avatar_url?: string
  user?: {
    id?: string
    name?: string
    full_name?: string
    email?: string
    avatar_url?: string
  }
}
interface TripData       { id: string; title: string; origin?: string; destination: string; travel_type?: string; start_date: string; end_date: string; owner_id: string; invite_token: string; members: TripMember[]; itinerary_items: ItineraryItem[] }
interface Filter        { id: string; label: string; icon: string; active: boolean }
interface DayWeather   { dateLabel: string; icon: string; condition: string; tempMax: number; tempMin: number; rain: number; wind: number; uv: number; sunrise: string }
interface PlacePhoto { photo_reference: string; width: number; height: number }
interface Attraction {
  // Google Places fields
  place_id?: string
  vicinity?: string
  types?: string[]
  user_ratings_total?: number
  geometry?: { location: { lat: number; lng: number } }
  photos?: PlacePhoto[]
  
  id: string | number
  name: string
  name_en?: string
  description?: string
  province?: string | { name_en?: string; nameEn?: string }
  province_id?: string
  image_url?: string
  hero_image?: string
  average_rating?: number
  review_count?: number
  rating?: number
  category?: string
  latitude?: number
  longitude?: number
  __source?: 'db' | 'google'
}

interface POI          { id: string | number; name: string; type: string; icon?: string; description?: string; distance?: string; latitude?: number; longitude?: number }
interface ScheduleItem {
  placeId: string
  name: string
  vicinity: string
  icon: string
  source?: 'db' | 'google'
  latitude?: number
  longitude?: number
  startTime?: string
  endTime?: string
}

interface SavedScheduleMeta {
  placeId?: string
  source?: 'db' | 'google'
  name?: string
  vicinity?: string
  icon?: string
  latitude?: number
  longitude?: number
}

interface PersistedTripViewMeta {
  mode: 'province' | 'attraction'
  attractionId?: string
  attractionName?: string
  attractionLat?: number
  attractionLng?: number
}

const SCHEDULE_META_PREFIX = '[schedule-meta]'
const TRIP_VIEW_META_STORAGE_PREFIX = 'trip_results_view_meta:'

// ─── Province data ────────────────────────────────────────────────────────────
const provinceCoords: Record<string, [number, number]> = {
  'phnom-penh':      [11.5564, 104.9282], 'siem-reap':       [13.3671, 103.8448],
  'koh-kong':        [11.6144, 103.0066], 'kampot':          [10.6089, 104.1812],
  'kep':             [10.4843, 104.2993], 'battambang':      [13.1022, 103.1987],
  'mondulkiri':      [12.4573, 107.1883], 'kompong-thom':    [12.6861, 104.8888],
  'kratie':          [12.4889, 106.0186], 'pursat':          [12.5387, 103.9188],
  'kompong-chhnang': [12.2503, 104.6644],
}
const provinceNames: Record<string, string> = {
  'phnom-penh': 'Phnom Penh', 'siem-reap': 'Siem Reap', 'koh-kong': 'Koh Kong',
  'kampot': 'Kampot', 'kep': 'Kep', 'battambang': 'Battambang', 'mondulkiri': 'Mondulkiri',
  'kompong-thom': 'Kompong Thom', 'kratie': 'Kratie', 'pursat': 'Pursat',
  'kompong-chhnang': 'Kompong Chhnang',
}

// ─── State ────────────────────────────────────────────────────────────────────
const vueRoute          = useRoute()
const router            = useRouter()
const tripData          = ref<TripData | null>(null)
const isPageLoading     = ref(false)
const apiError          = ref<string | null>(null)
const isLoadingRoute    = ref(false)
const showShareModal    = ref(false)
const showMembersPanel  = ref(false)
const isSaving          = ref(false)
const saveLabel         = ref('💾 Save Plan')
const copiedText        = ref('📋 Copy')
const selectedDay       = ref(1)
const mapContainer      = ref<HTMLElement | null>(null)
const toastMsg          = ref('')
const toastType         = ref<'success' | 'error' | 'info'>('success')
const savedTripViewMeta = ref<PersistedTripViewMeta | null>(null)

// Weather
const weatherForecast   = ref<DayWeather[]>([])
const weatherLoading    = ref(false)
const selectedWeatherDay = ref(0)

const { getOrCreateChatForTrip, createChat, joinChat, removeMember,currentUserId } = useGroupChat()

const allAttractions             = ref<Attraction[]>([])
const attractionsLoading         = ref(false)
const selectedAttractionCategory = ref('all')
const addToDayMap                = reactive<Record<string, number>>({})
const imageLoadErrorMap          = reactive<Record<string, boolean>>({})
const routeLinePoints            = ref<[number, number][]>([])
const ROUTE_PROXIMITY_KM         = 20

// Exact coords for the selected attraction (attraction mode only)
const selectedAttractionCoords = ref<{ lat: number; lng: number } | null>(null)

// Nearby POIs removed

// Schedule: day → list of ScheduleItems
const schedule = ref<Record<number, ScheduleItem[]>>({})

let leafletMap:    L.Map        | null = null
let attractionLayerGroup: L.LayerGroup | null = null
let attractionMarkers: Map<string, L.Marker> = new Map()
let destinationMarker: L.Marker | null = null

// ─── Derived ──────────────────────────────────────────────────────────────────
const tripId      = computed(() => vueRoute.params.id      as string || '')
const qOrigin     = computed(() => vueRoute.query.origin   as string || '')
const qDest = computed(() => (vueRoute.query.dest as string) || (vueRoute.query.destination as string) || '')
const qStart      = computed(() => vueRoute.query.from     as string || '')
const qEnd        = computed(() => vueRoute.query.to       as string || '')
const qAttractionId   = computed(() => vueRoute.query.attractionId   as string || '')
const qAttractionName = computed(() => vueRoute.query.attractionName as string || '')
const qPlanMode       = computed(() => vueRoute.query.mode           as string || 'province')
const travelType  = computed(() => tripData.value?.travel_type || vueRoute.query.type as string || 'friends')

const effectivePlanMode = computed<'province' | 'attraction'>(() => {
  if (qPlanMode.value === 'attraction' && !!qAttractionId.value) return 'attraction'
  return savedTripViewMeta.value?.mode === 'attraction' ? 'attraction' : 'province'
})

const effectiveAttractionId = computed(() =>
  qAttractionId.value || savedTripViewMeta.value?.attractionId || ''
)

const effectiveAttractionName = computed(() =>
  qAttractionName.value || savedTripViewMeta.value?.attractionName || ''
)

const origin = computed(() => {
  if (tripData.value?.origin) return tripData.value.origin
  return tripData.value?.destination?.split('→')[0]?.trim() || qOrigin.value
})
const destination = computed(() => {
  if (tripData.value?.origin) return tripData.value.destination  // stored as separate fields
  return tripData.value?.destination?.split('→')[1]?.trim() || qDest.value
})
const startDate   = computed(() => tripData.value?.start_date || qStart.value)
const endDate     = computed(() => tripData.value?.end_date   || qEnd.value)

const originName      = computed(() => provinceNames[origin.value]      || origin.value      || 'Starting Point')
const destinationName = computed(() => provinceNames[destination.value] || destination.value || 'Destination')
const tripDetailsDestinationLabel = computed(() => {
  if (effectivePlanMode.value === 'attraction' && effectiveAttractionName.value) {
    return `${effectiveAttractionName.value} (${destinationName.value})`
  }
  return destinationName.value
})

const displayDateRange = computed(() => {
  if (!startDate.value || !endDate.value) return 'Select dates'
  const s = new Date(startDate.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const e = new Date(endDate.value).toLocaleDateString('en-US',   { month: 'short', day: 'numeric', year: 'numeric' })
  return `${s} – ${e}`
})

const daysCount = computed(() => {
  if (!startDate.value || !endDate.value) return 3
  return Math.max(1, Math.ceil((new Date(endDate.value).getTime() - new Date(startDate.value).getTime()) / 86_400_000))
})

function tripViewMetaStorageKey(id: string): string {
  return `${TRIP_VIEW_META_STORAGE_PREFIX}${id}`
}

function readTripViewMeta(id: string): PersistedTripViewMeta | null {
  if (!id) return null
  const raw = localStorage.getItem(tripViewMetaStorageKey(id))
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as PersistedTripViewMeta
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.mode !== 'province' && parsed.mode !== 'attraction') return null
    return parsed
  } catch {
    return null
  }
}

function writeTripViewMeta(id: string, meta: PersistedTripViewMeta): void {
  if (!id) return
  try {
    localStorage.setItem(tripViewMetaStorageKey(id), JSON.stringify(meta))
  } catch {
    // Ignore storage failures (private mode / quota issues)
  }
}

function buildCurrentTripViewMeta(): PersistedTripViewMeta {
  if (effectivePlanMode.value !== 'attraction') {
    return { mode: 'province' }
  }

  const coords = selectedAttractionCoords.value
  return {
    mode: 'attraction',
    attractionId: effectiveAttractionId.value || undefined,
    attractionName: effectiveAttractionName.value || undefined,
    attractionLat: coords?.lat,
    attractionLng: coords?.lng,
  }
}

// ─── Weather — Open-Meteo (free, no key needed) ───────────────────────────────
const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0:  { label: 'Clear Sky',        icon: '☀️' },
  1:  { label: 'Mainly Clear',     icon: '🌤️' },
  2:  { label: 'Partly Cloudy',    icon: '⛅' },
  3:  { label: 'Overcast',         icon: '☁️' },
  45: { label: 'Foggy',            icon: '🌫️' },
  48: { label: 'Icy Fog',          icon: '🌫️' },
  51: { label: 'Light Drizzle',    icon: '🌦️' },
  61: { label: 'Slight Rain',      icon: '🌧️' },
  63: { label: 'Moderate Rain',    icon: '🌧️' },
  65: { label: 'Heavy Rain',       icon: '🌧️' },
  80: { label: 'Showers',          icon: '🌦️' },
  95: { label: 'Thunderstorm',     icon: '⛈️' },
}

const fetchWeather = async () => {
  const coords = provinceCoords[destination.value]
  if (!coords || !startDate.value) return
  weatherLoading.value = true
  try {
    const [lat, lon] = coords
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
      + `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,uv_index_max,sunrise`
      + `&timezone=Asia%2FPhnom_Penh&forecast_days=14`
    const res  = await fetch(url)
    const data = await res.json()

    const { daily } = data
    const start = new Date(startDate.value)

    // Match forecast dates to trip days
    const days: DayWeather[] = []
    for (let d = 0; d < daysCount.value; d++) {
      const tripDate = new Date(start)
      tripDate.setDate(start.getDate() + d)
      const iso = tripDate.toISOString().split('T')[0]
      const idx = daily.time.indexOf(iso)

      if (idx === -1) {
        // Date outside 14-day forecast window — use a seasonal estimate
        days.push({
          dateLabel: tripDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          icon: '🌤️', condition: 'Forecast unavailable',
          tempMax: 32, tempMin: 25, rain: 0, wind: 12, uv: 8, sunrise: '06:00',
        })
      } else {
        const code = daily.weathercode[idx] as number
        const meta = WMO_CODES[code] ?? { label: 'Unknown', icon: '🌤️' }
        const sunriseRaw: string = daily.sunrise?.[idx] ?? ''
        const sunriseTime = sunriseRaw ? sunriseRaw.split('T')[1]?.slice(0, 5) : 'N/A'
        days.push({
          dateLabel: tripDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          icon: meta.icon,
          condition: meta.label,
          tempMax: Math.round(daily.temperature_2m_max[idx]),
          tempMin: Math.round(daily.temperature_2m_min[idx]),
          rain:    Math.round((daily.precipitation_sum[idx] ?? 0) * 10) / 10,
          wind:    Math.round(daily.windspeed_10m_max[idx] ?? 0),
          uv:      Math.round(daily.uv_index_max[idx] ?? 0),
          sunrise: sunriseTime,
        })
      }
    }
    weatherForecast.value = days
  } catch (e) {
    console.error('Weather fetch failed', e)
  } finally {
    weatherLoading.value = false
  }
}

function selectInput(e: Event) {
  try { (e.target as HTMLInputElement).select() } catch {}
}

// ─── Attractions — Google Places via backend proxy ────────────────────────────

// Google Places type → our category label/icon
const GOOGLE_TYPE_MAP: { type: string; label: string; icon: string }[] = [
  { type: 'tourist_attraction', label: 'Attraction', icon: '🏛️' },
  { type: 'natural_feature',    label: 'Nature',     icon: '🌿' },
  { type: 'park',               label: 'Nature',     icon: '🌿' },
  { type: 'museum',             label: 'Cultural',   icon: '🏺' },
  { type: 'place_of_worship',   label: 'Cultural',   icon: '⛩️' },
  { type: 'restaurant',         label: 'Food',       icon: '🍽️' },
  { type: 'lodging',            label: 'Hotel',      icon: '🏨' },
]

const attractionCategories = [
  { type: 'all',         label: 'All',        icon: '🗺️' },
  { type: 'Attraction',  label: 'Attraction',  icon: '🏛️' },
  { type: 'Nature',      label: 'Nature',      icon: '🌿' },
  { type: 'Cultural',    label: 'Cultural',    icon: '🏺' },
  { type: 'Food',        label: 'Food',        icon: '🍽️' },
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

type ProvinceLookup = { id: number; nameEn: string }

async function resolveProvinceLookup(slug: string): Promise<ProvinceLookup | null> {
  try {
    const response = await API.get('/provinces')
    const rawProvinces = Array.isArray(response.data)
      ? response.data
      : (response.data?.provinces ?? response.data?.data ?? [])

    const provinces = (Array.isArray(rawProvinces) ? rawProvinces : [])
      .map((province: any) => ({
        id: Number(province.id ?? province.province_id ?? province.provinceId),
        nameEn: String(province.nameEn ?? province.name_en ?? province.name ?? ''),
      }))
      .filter((province: ProvinceLookup) => province.id && province.nameEn)

    const matched = provinces.find((province) => slugify(province.nameEn) === slug)
    if (matched) return matched
  } catch (error) {
    console.warn('Failed to resolve province lookup from database:', error)
  }

  return null
}

function normalizeDatabaseAttraction(raw: any, provinceName: string): Attraction | null {
  if (!raw) return null

  const id = raw.id ?? raw.attraction_id
  const name = String(raw.nameEn ?? raw.name_en ?? raw.name ?? '').trim()

  if (!id || !name) return null

  const rating = Number(raw.averageRating ?? raw.average_rating ?? raw.rating ?? 0)
  const reviews = Number(raw.reviewCount ?? raw.review_count ?? raw.reviews_count ?? 0)
  const category = String(raw.category ?? raw.main_category ?? 'Attraction')

  return {
    id,
    name,
    name_en: name,
    description: String(raw.description ?? 'No description available yet.'),
    province: raw.province?.nameEn ?? raw.province?.name_en ?? raw.province_name ?? provinceName,
    province_id: String(raw.provinceId ?? raw.province_id ?? ''),
    image_url: raw.heroImage ?? raw.hero_image ?? raw.imageUrl ?? raw.image_url ?? null,
    hero_image: raw.heroImage ?? raw.hero_image ?? null,
    average_rating: rating,
    review_count: reviews,
    rating,
    category,
    latitude: raw.latitude ?? raw.lat ?? null,
    longitude: raw.longitude ?? raw.lng ?? null,
    // mark as coming from our database
    __source: 'db',
  }
}

async function fetchProvinceAttractionsFromDatabase(destinationSlug: string) {
  const provinceLookup = await resolveProvinceLookup(destinationSlug)

  if (!provinceLookup) {
    throw new Error('Unable to resolve province from database.')
  }

  const response = await API.get(`/attractions/province/${provinceLookup.id}`)
  const rawAttractions = Array.isArray(response.data)
    ? response.data
    : (response.data?.attractions ?? response.data?.data ?? response.data ?? [])

  return (Array.isArray(rawAttractions) ? rawAttractions : [])
    .map((item: any) => normalizeDatabaseAttraction(item, provinceLookup.nameEn))
    .filter(Boolean) as Attraction[]
}

function googleTypeToCategory(types: string[] = []): string {
  for (const t of types) {
    const match = GOOGLE_TYPE_MAP.find(m => m.type === t)
    if (match) return match.label
  }
  return 'Attraction'
}

function googleTypeToCategoryIcon(types: string[] = []): string {
  for (const t of types) {
    const match = GOOGLE_TYPE_MAP.find(m => m.type === t)
    if (match) return match.icon
  }
  return '📍'
}

/** Build a proxied photo URL from a Google photo_reference */
function googlePhotoUrl(ref: string, maxwidth = 400): string {
  return `${API}/places/photo?ref=${encodeURIComponent(ref)}&maxwidth=${maxwidth}`
}

/** Normalize a Google Places result into our Attraction shape */
function mapGooglePlace(p: any): Attraction {
  return {
    id:        p.place_id,
    place_id:  p.place_id,
    name:      p.name,
    name_en:   p.name,
    vicinity:  p.vicinity ?? '',
    rating:    p.rating,
    average_rating: p.rating,
    user_ratings_total: p.user_ratings_total,
    types:     p.types ?? [],
    category:  googleTypeToCategory(p.types),
    geometry:  p.geometry,
    photos:    p.photos ?? [],
    image_url: p.photos?.[0]?.photo_reference
      ? googlePhotoUrl(p.photos[0].photo_reference)
      : undefined,
    latitude:  p.geometry?.location?.lat,
    longitude: p.geometry?.location?.lng,
    province:  destinationName.value,
    // mark as from Google Places (not our DB)
    __source: 'google',
  }
}

const provinceAttractions    = ref<Attraction[]>([])
// Route attractions — discovered from Google Places along the route polyline
const routeAttractionsGoogle = ref<{ place: Attraction; distanceKm: number }[]>([])
const routeAttractionsLoading = ref(false)


async function fetchGooglePlaces(lat: number, lng: number, type = 'tourist_attraction', radius = 20000): Promise<Attraction[]> {
  const res = await API.get(`/places?lat=${lat}&lng=${lng}&type=${type}&radius=${radius}`)
  return (res.data.results ?? []).map(mapGooglePlace)
}

/** Sample N evenly-spaced points along the route polyline */
function sampleRoutePoints(route: [number, number][], count: number): [number, number][] {
  if (route.length <= count) return route
  const step = (route.length - 1) / (count - 1)
  return Array.from({ length: count }, (_, i) => route[Math.round(i * step)])
}

const fetchAttractions = async () => {
  if (!destination.value) return
  attractionsLoading.value = true
  allAttractions.value = []
  provinceAttractions.value = []
  routeAttractionsGoogle.value = []

  try {
    // ① Province attractions — database-backed attractions for the selected province
    const provPlaces = await fetchProvinceAttractionsFromDatabase(destination.value)
    provinceAttractions.value = provPlaces
    allAttractions.value = provPlaces
  } catch (e) {
    console.error('fetchAttractions (database) failed:', e)

    const destCoords = provinceCoords[destination.value]
    if (destCoords) {
      try {
        const fallbackPlaces = await fetchGooglePlaces(destCoords[0], destCoords[1], 'tourist_attraction', 25000)
        provinceAttractions.value = fallbackPlaces
        allAttractions.value = fallbackPlaces
      } catch (fallbackError) {
        console.error('Province attractions fallback failed:', fallbackError)
      }
    }
  } finally {
    attractionsLoading.value = false
  }
}

async function fetchRouteAttractionsFromGoogle() {
  const route = routeLinePoints.value
  if (route.length < 2) {
    routeAttractionsGoogle.value = []
    return
  }

  routeAttractionsLoading.value = true
  try {
    const sampledPoints = sampleRoutePoints(route, Math.min(5, route.length))
    const requests: Promise<Attraction[]>[] = []

    for (const [lat, lng] of sampledPoints) {
      for (const type of ['tourist_attraction', 'natural_feature', 'park']) {
        requests.push(fetchGooglePlaces(lat, lng, type, 15000).catch(() => []))
      }
    }

    const results = await Promise.all(requests)
    const merged = results.reduce((all, items) => all.concat(items), [] as Attraction[])
    const deduped = new Map<string, Attraction>()

    for (const place of merged) {
      const key = String(place.place_id ?? place.id ?? getAttractionName(place))
      if (!deduped.has(key)) deduped.set(key, place)
    }

    routeAttractionsGoogle.value = [...deduped.values()]
      .map((place) => ({ place, distanceKm: distanceToRouteKm(place, route) }))
      .filter((item) => Number.isFinite(item.distanceKm) && item.distanceKm <= ROUTE_PROXIMITY_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 12)
  } catch (error) {
    console.error('Failed to fetch Google route attractions:', error)
    routeAttractionsGoogle.value = []
  } finally {
    routeAttractionsLoading.value = false
  }
}

watch(routeLinePoints, () => {
  void fetchRouteAttractionsFromGoogle()
})

const filteredAttractions = computed(() => {
  if (selectedAttractionCategory.value === 'all') return provinceAttractions.value
  return provinceAttractions.value.filter(a =>
    normalizeText(a.category ?? '') === normalizeText(selectedAttractionCategory.value)
  )
})

const routeAttractions = computed(() => routeAttractionsGoogle.value)

function normalizeText(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

function normalizeScheduleVicinity(value: unknown): string {
  if (value == null) return ''

  if (typeof value === 'string') {
    const raw = value.trim()
    if (!raw) return ''

    const looksLikeJson = (raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))
    if (!looksLikeJson) return raw

    try {
      return normalizeScheduleVicinity(JSON.parse(raw))
    } catch {
      return raw
    }
  }

  if (typeof value === 'object') {
    const rec = value as Record<string, unknown>
    const candidate = [
      rec.province,
      rec.vicinity,
      rec.location,
      rec.name_en,
      rec.nameEn,
      rec.name,
      rec.title,
    ]

    for (const item of candidate) {
      if (typeof item === 'string' && item.trim()) return item.trim()
    }
    return ''
  }

  return String(value)
}

function parseSavedScheduleMeta(description?: string): SavedScheduleMeta | null {
  if (!description) return null

  const raw = String(description).trim()
  if (!raw) return null

  const payload = raw.startsWith(SCHEDULE_META_PREFIX)
    ? raw.slice(SCHEDULE_META_PREFIX.length)
    : raw

  try {
    const parsed = JSON.parse(payload) as SavedScheduleMeta
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

function extractReadableStopText(value: unknown): string {
  if (typeof value !== 'string') return ''
  const raw = value.trim()
  if (!raw) return ''
  if (raw.startsWith(SCHEDULE_META_PREFIX)) return ''

  const looksLikeJson = (raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))
  if (looksLikeJson) return ''

  return raw
}

function buildSavedScheduleMeta(item: ScheduleItem): string {
  const hasLat = Number.isFinite(Number(item.latitude))
  const hasLng = Number.isFinite(Number(item.longitude))

  const meta: SavedScheduleMeta = {
    placeId: item.placeId,
    source: item.source,
    name: item.name,
    vicinity: normalizeScheduleVicinity(item.vicinity),
    icon: item.icon,
  }

  if (hasLat) meta.latitude = Number(item.latitude)
  if (hasLng) meta.longitude = Number(item.longitude)

  return `${SCHEDULE_META_PREFIX}${JSON.stringify(meta)}`
}

const getAttractionName = (attraction: Attraction) => {
  const name = attraction.name ?? (attraction as any).name_en ?? (attraction as any).title
  return typeof name === 'string' && name.trim() ? name : 'Untitled attraction'
}

const getAttractionKey = (attraction: Attraction) =>
  String(attraction.id ?? attraction.place_id ?? getAttractionName(attraction))

const normalizeMediaUrl = (value: unknown): string | null => {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('/')) return `${API}${raw}`
  return `${API}/${raw}`
}

const markImageError = (attraction: Attraction) => {
  imageLoadErrorMap[getAttractionKey(attraction)] = true
}

/** Get a display photo URL — prefers already-resolved image_url, then builds proxy URL */
// Small inline SVG placeholder (encoded) used when no image is available
const DEFAULT_PLACEHOLDER_SVG = encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
    <rect width='100%' height='100%' fill='#f3f4f6'/>
    <g fill='#d1d5db' font-family='Arial, Helvetica, sans-serif' font-size='140' text-anchor='middle'>
      <text x='50%' y='50%' dy='0.35em'>🏛️</text>
    </g>
  </svg>
`)

const getAttractionPhoto = (attraction: Attraction): string | null => {
  const key = getAttractionKey(attraction)
  if (imageLoadErrorMap[key]) return null

  const direct = normalizeMediaUrl(attraction.image_url)
  if (direct) return direct

  const hero = normalizeMediaUrl((attraction as any).hero_image)
  if (hero) return hero

  const photos = (attraction as any).photos as PlacePhoto[] | undefined
  if (photos?.[0]?.photo_reference) return googlePhotoUrl(photos[0].photo_reference)
  // Fallback to an inline SVG placeholder so the card always shows an image
  return `data:image/svg+xml;utf8,${DEFAULT_PLACEHOLDER_SVG}`
}

/** Category icon for a Google Place */
const getCategoryIcon = (attraction: Attraction): string => {
  return googleTypeToCategoryIcon((attraction as any).types ?? [])
}

const getAttractionProvince = (attraction: Attraction) => {
  const province = attraction.province ?? (attraction as any).province_name ?? (attraction as any).province?.name ?? (attraction as any).province?.name_en
  return typeof province === 'string' ? province : ''
}

function getAttractionCoords(attraction: Attraction): { lat: number; lng: number } | null {
  const lat = Number(attraction.latitude ?? (attraction as any).lat)
  const lng = Number(attraction.longitude ?? (attraction as any).lng)

  if (Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0) {
    return { lat, lng }
  }

  const location = (attraction as any).location
  if (!location) return null

  if (typeof location === 'string') {
    const match = location.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/i)
    if (match) {
      const parsedLng = Number(match[1])
      const parsedLat = Number(match[2])
      if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) return { lat: parsedLat, lng: parsedLng }
    }
    return null
  }

  if (location.coordinates?.length >= 2) {
    return { lng: Number(location.coordinates[0]), lat: Number(location.coordinates[1]) }
  }

  if (location.longitude !== undefined && location.latitude !== undefined) {
    return { lng: Number(location.longitude), lat: Number(location.latitude) }
  }

  return null
}

function projectPointToPlane(point: { lat: number; lng: number }, referenceLat: number) {
  const earthRadiusKm = 6371
  const latRad = point.lat * Math.PI / 180
  const lngRad = point.lng * Math.PI / 180
  const refRad = referenceLat * Math.PI / 180

  return {
    x: earthRadiusKm * lngRad * Math.cos(refRad),
    y: earthRadiusKm * latRad,
  }
}

function pointToSegmentDistanceKm(
  point: { lat: number; lng: number },
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
) {
  const referenceLat = (point.lat + start.lat + end.lat) / 3
  const projectedPoint = projectPointToPlane(point, referenceLat)
  const projectedStart = projectPointToPlane(start, referenceLat)
  const projectedEnd = projectPointToPlane(end, referenceLat)

  const segmentX = projectedEnd.x - projectedStart.x
  const segmentY = projectedEnd.y - projectedStart.y
  const segmentLengthSquared = segmentX ** 2 + segmentY ** 2

  if (segmentLengthSquared === 0) {
    return Math.hypot(projectedPoint.x - projectedStart.x, projectedPoint.y - projectedStart.y)
  }

  const projection = ((projectedPoint.x - projectedStart.x) * segmentX + (projectedPoint.y - projectedStart.y) * segmentY) / segmentLengthSquared
  const t = Math.max(0, Math.min(1, projection))

  const closestX = projectedStart.x + t * segmentX
  const closestY = projectedStart.y + t * segmentY

  return Math.hypot(projectedPoint.x - closestX, projectedPoint.y - closestY)
}

function distanceToRouteKm(attraction: Attraction, route: [number, number][]) {
  const coords = getAttractionCoords(attraction)
  if (!coords || route.length < 2) return Number.POSITIVE_INFINITY

  let shortestDistance = Number.POSITIVE_INFINITY
  for (let index = 0; index < route.length - 1; index += 1) {
    const segmentDistance = pointToSegmentDistanceKm(
      coords,
      { lat: route[index][0], lng: route[index][1] },
      { lat: route[index + 1][0], lng: route[index + 1][1] },
    )
    if (segmentDistance < shortestDistance) shortestDistance = segmentDistance
  }

  return shortestDistance
}

const openInGoogleMaps = (attraction: Attraction) => {
  // Prefer place_id when available
  const placeId = (attraction as any).place_id ?? null
  if (placeId) {
    const url = `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(String(placeId))}`
    window.open(url, '_blank')
    return
  }

  // Fallback to coordinates
  const coords = getAttractionCoords(attraction)
  if (coords) {
    const url = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    window.open(url, '_blank')
    return
  }

  // Last resort: search by name
  const q = encodeURIComponent(getAttractionName(attraction))
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank')
}

const openAttraction = (attraction: Attraction) => {
  // If attraction came from our DB, navigate to in-app detail.
  // If it came from Google Places, open Google Maps (hybrid behavior).
  const src = (attraction as any).__source ?? null
  if (src === 'db') {
    router.push({ name: 'AttractionDetail', params: { id: String(attraction.id) } })
    return
  }

  // For google or unknown sources, open Google Maps
  openInGoogleMaps(attraction)
}

// ─── Schedule management ──────────────────────────────────────────────────────
const addToSchedule = (attraction: Attraction) => {
  const key = String(attraction.id)
  const day = addToDayMap[key] ?? selectedDay.value
  if (!schedule.value[day]) schedule.value[day] = []

  if (schedule.value[day].find(s => s.placeId === key)) {
    showToast('Already added to Day ' + day, 'error')
    return
  }
  const categoryIcon = getCategoryIcon(attraction as any)

  const attractionName = attraction.name_en ?? attraction.name ?? ''
  const provinceName = typeof attraction.province === 'object'
    ? (attraction.province?.name_en ?? '')
    : (attraction.province ?? '')
  const coords = getAttractionCoords(attraction)

  schedule.value[day].push({
    placeId:  key,
    name:     attractionName,
    vicinity: provinceName,
    icon:     categoryIcon,
    source:   (attraction as any).__source === 'google' ? 'google' : 'db',
    latitude: coords?.lat,
    longitude: coords?.lng,
  })
  selectedDay.value = day
  showToast(`Added to Day ${day}: ${attractionName}`, 'success')
}

const removeFromSchedule = (day: number, idx: number) => {
  schedule.value[day]?.splice(idx, 1)
}

const clearDay = (day: number) => {
  schedule.value[day] = []
}

const openScheduleItemMap = (item: ScheduleItem) => {
  // If this item came from our database, open the internal attraction detail.
  // `placeId` for DB items is the internal `attraction_id` we saved earlier.
  if (item.source === 'db' && item.placeId) {
    try {
      router.push({ name: 'AttractionDetail', params: { id: String(item.placeId) } })
      return
    } catch (e) {
      // fallthrough to map fallback
      console.warn('Failed to navigate to internal attraction detail:', e)
    }
  }

  // If this is a Google Places item, prefer opening the place_id URL.
  if (item.placeId && item.source === 'google') {
    window.open(`https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(item.placeId)}`, '_blank')
    return
  }

  // If we have coordinates, open them directly in Google Maps.
  if (Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude))) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`, '_blank')
    return
  }

  // Last resort: search by name + vicinity.
  const query = encodeURIComponent([item.name, item.vicinity].filter(Boolean).join(', '))
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
}

const isAddedToAnyDay = (id: string) =>
  Object.values(schedule.value).some(items => items.some(i => i.placeId === id))

// ─── Save plan to backend ─────────────────────────────────────────────────────

const savePlan = async () => {
  isSaving.value = true
  try {
    const token = getStoredAuthToken()
    if (!token) {
      showToast('Your session expired. Please log in again.', 'error')
      isSaving.value = false
      return
    }

    const itineraryItems = Object.entries(schedule.value).reduce((acc, [day, items]) => {
      items.forEach((item, idx) => {
        const itineraryItem: {
          day_number: number
          attraction_id?: string
          title: string
          description: string
          sort_order: number
          start_time?: string
          end_time?: string
        } = {
          day_number:    parseInt(day),
          title:         item.name,
          description:   buildSavedScheduleMeta(item),
          sort_order:    idx,
        }

        if (item.source !== 'google') {
          itineraryItem.attraction_id = item.placeId
        }

        if (item.startTime) itineraryItem.start_time = item.startTime
        if (item.endTime) itineraryItem.end_time = item.endTime

        acc.push(itineraryItem)
      })
      return acc
    }, [] as Array<{
      day_number: number
      attraction_id?: string
      title: string
      description: string
      sort_order: number
      start_time?: string
      end_time?: string
    }>)

    const payload = {
      title:         `Trip to ${destinationName.value}`,
      origin:        origin.value,
      destination:   destination.value,
      start_date:    startDate.value,
      end_date:      endDate.value,
      travel_type:   travelType.value,
      itinerary_items: itineraryItems,
    }

    const itineraryPayload = {
      itinerary_items: itineraryItems,
    }

    let data: any = null
    try {
      if (tripId.value) {
        console.debug('Updating trip itinerary payload:', itineraryPayload)
        try {
          const resp = await API.put(`/trips/${tripId.value}/itinerary`, itineraryPayload)
          data = resp.data
        } catch (innerErr: any) {
          console.warn('PUT /itinerary failed, attempting item-by-item upload', innerErr)
          if (innerErr?.response?.status === 404 || innerErr?.response?.status === 500) {
            data = { id: tripId.value }
            for (const item of itineraryItems) {
              const itemPayload: any = {
                day_number: item.day_number,
                sort_order: item.sort_order,
              }
              if (item.attraction_id) itemPayload.attraction_id = item.attraction_id
              if (item.title)         itemPayload.title = item.title
              if (item.description)   itemPayload.description = item.description
              if (item.start_time)    itemPayload.start_time = item.start_time
              if (item.end_time)      itemPayload.end_time = item.end_time

              try {
                await API.post(`/trips/${tripId.value}/itinerary-items`, itemPayload)
              } catch (itemErr: any) {
                console.warn('Failed to create itinerary item for existing trip', tripId.value, itemPayload, itemErr)
              }
            }
          } else {
            throw innerErr
          }
        }
      } else {
        // Create trip first without nested itinerary_items to avoid backend nested-create errors
        const createPayload = { ...payload }
        delete (createPayload as any).itinerary_items
        console.debug('Creating trip payload:', createPayload)
        const resp = await API.post('/trips', createPayload)
        data = resp.data

        // If the trip was created and we have itinerary items, add them individually
        const newId = String(data?.id ?? data?.data?.id ?? data?.trip?.id ?? '')
        if (newId && itineraryItems.length) {
          for (const item of itineraryItems) {
            const itemPayload: any = {
              day_number: item.day_number,
              sort_order: item.sort_order,
            }
            if (item.attraction_id) itemPayload.attraction_id = item.attraction_id
            if (item.title)         itemPayload.title = item.title
            if (item.description)   itemPayload.description = item.description
            if (item.start_time)    itemPayload.start_time = item.start_time
            if (item.end_time)      itemPayload.end_time = item.end_time

            try {
              await API.post(`/trips/${newId}/itinerary-items`, itemPayload)
            } catch (itemErr: any) {
              console.warn('Failed to create itinerary item for trip', newId, itemPayload, itemErr)
            }
          }
        }
      }
    } catch (err: any) {
      // Surface backend error details when available
      console.error('Save trip failed:', err)
      console.error('Server response body:', err?.response?.data)
      const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message || String(err)
      if (err?.response?.status === 401) throw new Error('Your session expired. Please log in again.')
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg))
    }

    const persistedTripId = tripId.value || String(data?.id ?? data?.data?.id ?? data?.trip?.id ?? '')
    if (persistedTripId) {
      writeTripViewMeta(persistedTripId, buildCurrentTripViewMeta())
      if (!tripId.value) {
        router.replace({
          name: 'trip-results',
          params: { id: persistedTripId },
          query: { ...vueRoute.query },
        })
      }
    }

    if (persistedTripId) {
      try {
        await generateInviteTokenForTrip(persistedTripId)
      } catch (err) {
        console.error('Error generating invite token for Solo trip:', err)
      }
    }

    try {
      if (persistedTripId) {
        const chat = await getOrCreateChatForTrip(
          persistedTripId,
          tripData.value?.title || payload.title,
          formattedMembers.value,
        )
        if (chat) {
          groupChat.value = chat
          hasJoinedGroupChat.value = currentUserId.value
            ? chat.members?.some(m => String(m.id) === String(currentUserId.value)) ?? false
            : false
        }
      }
    } catch (err) {
      console.error('Error creating group chat:', err)
      // Don't block trip save if group chat fails
    }

    saveLabel.value = '✓ Saved!'
    showToast('Trip plan saved successfully!', 'success')
    setTimeout(() => router.push({ name: 'my-trips' }), 1500)
  } catch (err: any) {
    showToast(err.message || 'Failed to save. Please try again.', 'error')
  } finally {
    isSaving.value = false
  }
}

// ─── Toast helper ──────────────────────────────────────────────────────────────
const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
  toastMsg.value  = msg
  toastType.value = type
  setTimeout(() => { toastMsg.value = '' }, 3000)
}

// ─── Trip API fetch ────────────────────────────────────────────────────────────
const fetchTrip = async () => {
  isPageLoading.value = true
  apiError.value = null

  if (!tripId.value) {
    savedTripViewMeta.value = null
    const scaffold: Record<number, ScheduleItem[]> = {}
    const n = daysCount.value || 3
    for (let i = 1; i <= n; i++) scaffold[i] = []
    schedule.value = scaffold
    isPageLoading.value = false
    return
  }
  try {
    const res = await API.get(`/trips/${tripId.value}`)
    tripData.value = res.data
    await refreshTripGroupChatStatus()

    const persistedMeta = readTripViewMeta(tripId.value)
    if (qPlanMode.value === 'attraction' && qAttractionId.value) {
      savedTripViewMeta.value = {
        mode: 'attraction',
        attractionId: qAttractionId.value,
        attractionName: qAttractionName.value || persistedMeta?.attractionName,
        attractionLat: persistedMeta?.attractionLat,
        attractionLng: persistedMeta?.attractionLng,
      }
    } else {
      savedTripViewMeta.value = persistedMeta
    }

    if (
      savedTripViewMeta.value?.mode === 'attraction'
      && Number.isFinite(savedTripViewMeta.value.attractionLat)
      && Number.isFinite(savedTripViewMeta.value.attractionLng)
    ) {
      selectedAttractionCoords.value = {
        lat: Number(savedTripViewMeta.value.attractionLat),
        lng: Number(savedTripViewMeta.value.attractionLng),
      }
    }

    // Restore schedule from existing itinerary items
    const restored: Record<number, ScheduleItem[]> = {}

    if (tripData.value?.itinerary_items?.length) {
      for (const item of tripData.value.itinerary_items) {
        const day = item.day_number ?? (item.day_index ?? 0) + 1
        if (!restored[day]) restored[day] = []
        const meta = parseSavedScheduleMeta(item.description)
          ?? parseSavedScheduleMeta(item.notes)
          ?? parseSavedScheduleMeta(typeof item.location === 'string' ? item.location : undefined)

        const fallbackTitle = extractReadableStopText(item.title)
          || extractReadableStopText(item.notes)
          || 'Unnamed stop'
        const name = item.attraction?.name_en ?? meta?.name ?? fallbackTitle
        const catIcon = meta?.icon ?? '📍'
        const savedAttraction = item.attraction ? {
          ...item.attraction,
          latitude: (item.attraction as any).latitude ?? (item.attraction as any).lat,
          longitude: (item.attraction as any).longitude ?? (item.attraction as any).lng,
        } : null
        const coords = savedAttraction ? getAttractionCoords(savedAttraction as any) : null
        const placeId = meta?.placeId
          || (item.attraction_id ? String(item.attraction_id) : '')
          || String(item.id)
        const vicinity = normalizeScheduleVicinity(
          meta?.vicinity ?? item.attraction?.province ?? item.location ?? ''
        )
        restored[day].push({
          placeId,
          name,
          vicinity,
          icon: catIcon,
          source: meta?.source ?? (item.attraction_id ? 'db' : 'google'),
          latitude: meta?.latitude ?? coords?.lat,
          longitude: meta?.longitude ?? coords?.lng,
          startTime: item.start_time,
          endTime: item.end_time,
        })
      }
    }

    const totalDays = daysCount.value || 3
    for (let day = 1; day <= totalDays; day += 1) {
      if (!restored[day]) restored[day] = []
    }
    schedule.value = restored
  } catch (err: any) {
    apiError.value = err.message || 'Failed to load trip'
  } finally {
    isPageLoading.value = false
  }
}

// Packing toggle removed

// Nearby services feature removed

/** After allAttractions loads, resolve the exact lat/lng of the chosen attraction */
const resolveSelectedAttractionCoords = () => {
  if (effectivePlanMode.value !== 'attraction') {
    selectedAttractionCoords.value = null
    return
  }

  const targetAttractionId = effectiveAttractionId.value
  if (targetAttractionId) {
    const found = allAttractions.value.find(a => {
      const idMatch = String(a.id) === targetAttractionId
      const placeIdMatch = String((a as any).place_id ?? '') === targetAttractionId
      return idMatch || placeIdMatch
    })
    if (found) {
      selectedAttractionCoords.value = getAttractionCoords(found as any)
      return
    }
  }

  if (
    savedTripViewMeta.value?.mode === 'attraction'
    && Number.isFinite(savedTripViewMeta.value.attractionLat)
    && Number.isFinite(savedTripViewMeta.value.attractionLng)
  ) {
    selectedAttractionCoords.value = {
      lat: Number(savedTripViewMeta.value.attractionLat),
      lng: Number(savedTripViewMeta.value.attractionLng),
    }
  }
}
watch(allAttractions, resolveSelectedAttractionCoords)

watch(
  [tripId, effectivePlanMode, effectiveAttractionId, effectiveAttractionName, selectedAttractionCoords],
  () => {
    if (!tripId.value) return
    writeTripViewMeta(tripId.value, buildCurrentTripViewMeta())
  },
  { immediate: false }
)

// Nearby service filters and computed lists removed

// ─── Map ──────────────────────────────────────────────────────────────────────
const fetchRoadRoute = async (o: [number, number], d: [number, number]): Promise<[number, number][]> => {
  try {
    const res  = await fetch(`https://router.project-osrm.org/route/v1/driving/${o[1]},${o[0]};${d[1]},${d[0]}?overview=full&geometries=geojson`)
    const data = await res.json()
    if (!data.routes?.length) throw new Error()
    return data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number])
  } catch { return [o, d] }
}

const initMap = async () => {
  if (!mapContainer.value) return
  const oC: [number, number] = provinceCoords[origin.value] || [11.5564, 104.9282]

  // ── Resolve destination pin ───────────────────────────────────────────────
  // In attraction mode: use the attraction's exact coords (or province centroid
  // as a fallback while the catalog is still loading).
  // In province mode: use the province centroid as before.
  let dC: [number, number] = provinceCoords[destination.value] || [13.3671, 103.8448]
  let destLabel = destinationName.value
  let isAttractionMode = effectivePlanMode.value === 'attraction'
  const hasResolvedAttractionDestination = isAttractionMode && !!selectedAttractionCoords.value

  if (hasResolvedAttractionDestination && selectedAttractionCoords.value) {
    dC = [selectedAttractionCoords.value.lat, selectedAttractionCoords.value.lng]
    destLabel = effectiveAttractionName.value || destinationName.value
  }

  leafletMap = L.map(mapContainer.value, { zoomControl: true, scrollWheelZoom: true })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>', maxZoom: 18,
  }).addTo(leafletMap)

  const mkIcon = (html: string) => L.divIcon({ html, className: '', iconSize: [0, 0], iconAnchor: [0, 0] })

  // Origin marker (green)
  L.marker(oC, {
    icon: mkIcon(`<div class="lf-marker lf-origin"><div class="lf-pin lf-pin-green"></div><div class="lf-label">${originName.value}</div></div>`)
  }).addTo(leafletMap)

  // Destination marker — in attraction mode, only render after exact attraction
  // coords are resolved; never fall back to province marker.
  if (!isAttractionMode || hasResolvedAttractionDestination) {
    if (isAttractionMode) {
      destinationMarker = L.marker(dC, {
        icon: mkIcon(
          `<div class="lf-marker lf-dest">` +
          `<div class="lf-star-pin">⭐</div>` +
          `<div class="lf-label lf-label-attraction">${destLabel}</div>` +
          `</div>`
        )
      }).addTo(leafletMap)
    } else {
      destinationMarker = L.marker(dC, {
        icon: mkIcon(`<div class="lf-marker lf-dest"><div class="lf-pin lf-pin-blue"></div><div class="lf-label">${destLabel}</div></div>`)
      }).addTo(leafletMap)
    }
    leafletMap.fitBounds(L.latLngBounds([oC, dC]), { padding: [60, 60] })
  } else {
    destinationMarker = null
    leafletMap.setView(oC, 8)
  }

  attractionLayerGroup = L.layerGroup().addTo(leafletMap)

  if (isAttractionMode && !hasResolvedAttractionDestination) {
    routeLinePoints.value = []
    return
  }

  isLoadingRoute.value = true
  const coords = await fetchRoadRoute(oC, dC)
  isLoadingRoute.value = false
  routeLinePoints.value = coords
  if (!leafletMap) return

  const line = L.polyline(coords, { color: '#1a73e8', weight: 5, opacity: 0.9, lineJoin: 'round', lineCap: 'round' }).addTo(leafletMap)
  L.polyline(coords, { color: '#fff', weight: 2, opacity: 0.45, dashArray: '8 14', lineJoin: 'round' }).addTo(leafletMap)
  leafletMap.fitBounds(line.getBounds(), { padding: [60, 60] })
}

// Track route polylines explicitly so we can remove/redraw without touching other layers
let routePolylines: L.Polyline[] = []

/**
 * Re-draw the route when the selected attraction's coords become available
 * (i.e. after allAttractions finishes loading, later than initMap).
 */
watch(selectedAttractionCoords, async (coords) => {
  if (!coords || !leafletMap || effectivePlanMode.value !== 'attraction') return

  const oC: [number, number] = provinceCoords[origin.value] || [11.5564, 104.9282]
  const dC: [number, number] = [coords.lat, coords.lng]

  // Remove previously drawn route lines only
  routePolylines.forEach(p => { try { p.remove() } catch {} })
  routePolylines = []

  // Fetch road route to the exact attraction coords
  isLoadingRoute.value = true
  const routeCoords = await fetchRoadRoute(oC, dC)
  isLoadingRoute.value = false
  routeLinePoints.value = routeCoords

  if (!leafletMap) return

  const solidLine = L.polyline(routeCoords, { color: '#1a73e8', weight: 5, opacity: 0.9, lineJoin: 'round', lineCap: 'round' }).addTo(leafletMap)
  const dashLine  = L.polyline(routeCoords, { color: '#fff',    weight: 2, opacity: 0.45, dashArray: '8 14', lineJoin: 'round' }).addTo(leafletMap)
  routePolylines = [solidLine, dashLine]
  leafletMap.fitBounds(solidLine.getBounds(), { padding: [60, 60] })

  // Drop the star pin on the exact attraction location
  const destLabel = effectiveAttractionName.value || destinationName.value
  const mkIcon = (html: string) => L.divIcon({ html, className: '', iconSize: [0, 0], iconAnchor: [0, 0] })
  if (destinationMarker) {
    try { destinationMarker.remove() } catch {}
    destinationMarker = null
  }
  destinationMarker = L.marker(dC, {
    icon: mkIcon(
      `<div class="lf-marker lf-dest">` +
      `<div class="lf-star-pin">⭐</div>` +
      `<div class="lf-label lf-label-attraction">${destLabel}</div>` +
      `</div>`
    )
  }).addTo(leafletMap)
})


// Pin route attractions on the map when loaded
watch(routeAttractions, (places) => {
  if (!leafletMap || !attractionLayerGroup) return
  attractionLayerGroup.clearLayers()
  attractionMarkers.forEach(m => { try { m.remove() } catch {} })
  attractionMarkers.clear()

  places.slice(0, 10).forEach(({ place, distanceKm }) => {
    const coords = getAttractionCoords(place)
    if (!coords) return
    const catIcon = getCategoryIcon(place as any)
    const marker = L.marker([coords.lat, coords.lng], {
      icon: L.divIcon({ html: `<div class="lf-poi">${catIcon}</div>`, className: '', iconSize: [36,36], iconAnchor: [18,18] })
    }).bindPopup(
      `<div class="lf-popup"><b>${catIcon} ${getAttractionName(place)}</b><br/>
       <span style="color:#666;font-size:12px">⭐ ${place.rating?.toFixed(1) ?? 'N/A'}</span><br/>
       <span style="color:#999;font-size:11px">📍 ${ (place as any).vicinity || getAttractionProvince(place)}</span><br/>
       <span style="color:#1a73e8;font-size:11px">~ ${distanceKm.toFixed(1)} km from route</span></div>`,
      { maxWidth: 220 }
    ).addTo(attractionLayerGroup!)

    try {
      const key = String(place.id)
      attractionMarkers.set(key, marker)
      if (effectiveAttractionId.value && key === effectiveAttractionId.value) {
        marker.openPopup()
        try { leafletMap?.flyTo([coords.lat, coords.lng], 12, { animate: true }) } catch {}
      }
    } catch (e) { /* ignore marker store failures */ }
  })
}, { deep: true, immediate: true })

// Nearby POI marker updates removed

let groupChatRefreshTimer: ReturnType<typeof setInterval> | null = null

// ─── Group Chat State Refresh ─────────────────────────────────────────────────
const refreshTripGroupChatStatus = async () => {
  if (!tripId.value) return
  try {
    const existing = await findTripGroupChat(tripId.value, tripData.value?.title)
    if (existing) {
      groupChat.value = existing
      hasJoinedGroupChat.value = existing.members?.some(m => String(m.id) === String(currentUserId.value)) ?? false
    } else {
      groupChat.value = null
      hasJoinedGroupChat.value = false
    }
  } catch (err) {
    console.debug('Group chat refresh check:', err)
  }
}

const refreshTripDataAndChatStatus = async () => {
  if (!tripId.value) return
  try {
    await fetchTrip()
  } catch (err) {
    console.debug('Trip refresh failed:', err)
  }
  await refreshTripGroupChatStatus()
}

watch(showMembersPanel, async (isOpen) => {
  if (isOpen) {
    await refreshTripGroupChatStatus()
    if (groupChatRefreshTimer) clearInterval(groupChatRefreshTimer)
    groupChatRefreshTimer = setInterval(refreshTripGroupChatStatus, 5000)
  } else if (groupChatRefreshTimer) {
    clearInterval(groupChatRefreshTimer)
    groupChatRefreshTimer = null
  }
})

onUnmounted(() => {
  if (groupChatRefreshTimer) {
    clearInterval(groupChatRefreshTimer)
    groupChatRefreshTimer = null
  }
})

// ─── Share ────────────────────────────────────────────────────────────────────
const inviteToken = ref(tripData.value?.invite_token ?? '')
watch(tripData, (t) => { if (t?.invite_token) inviteToken.value = t.invite_token })

const shareLink = computed(() => {
  if (inviteToken.value) {
    const base = `${window.location.origin}/trip/join/${inviteToken.value}`
    if (effectivePlanMode.value === 'attraction' && effectiveAttractionId.value && effectiveAttractionName.value) {
      return `${base}?mode=attraction&attractionId=${encodeURIComponent(effectiveAttractionId.value)}&attractionName=${encodeURIComponent(effectiveAttractionName.value)}`
    }
    return base
  }
  if (tripId.value)
    return `${window.location.origin}/trip/results/${tripId.value}`
  return `${window.location.origin}/trip/results?origin=${origin.value}&dest=...` // ← fixed ?dest=
})

const canInvite = computed(() => !!tripId.value || !!inviteToken.value)
const isGeneratingToken = ref(false)
const generateInviteTokenForTrip = async (targetTripId: string) => {
  if (!targetTripId || inviteToken.value) return
  const endpoints = [
    `/trips/${targetTripId}/invite-token`,
    `/trips/${targetTripId}/invite`,
    `/trips/${targetTripId}/share`,
  ]
  for (const ep of endpoints) {
    try {
      const res = await API.post(ep)
      const data = res.data
      const generated = data?.invite_token ?? data?.token
                      ?? data?.inviteToken ?? data?.data?.invite_token ?? ''
      if (generated) {
        inviteToken.value = String(generated)
        return
      }
    } catch {
      continue
    }
  }
}

const openShareModal = async () => {
  if (!canInvite.value) return
  showShareModal.value = true
  if (inviteToken.value || !tripId.value) return  // already have one or no saved plan
  const authToken = localStorage.getItem('auth_token')
  if (!authToken) return
  isGeneratingToken.value = true
  try {
    await generateInviteTokenForTrip(tripId.value)
  } catch { /* ignore */ } finally {
    isGeneratingToken.value = false
  }
}

const copyToClipboard = async () => { await navigator.clipboard.writeText(shareLink.value).catch(()=>{}); copiedText.value = '✓ Copied!'; setTimeout(() => { copiedText.value = '📋 Copy' }, 2000) }

const confirmDeleteOnPage = async () => {
  if (!tripData.value) return
  const ok = window.confirm(`Delete trip "${tripData.value.title}"? This cannot be undone.`)
  if (!ok) return
  try {
    await API.delete(`/trips/${tripId.value}`)
    showToast('Trip deleted', 'success')
    router.push({ name: 'my-trips' })
  } catch (err: any) {
    console.error('Failed to delete trip', err)
    showToast(err?.response?.data?.message || 'Failed to delete trip', 'error')
  }
}
const shareToWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`My trip: ${originName.value} → ${destinationName.value} — ${shareLink.value}`)}`, '_blank')
const shareToEmail    = () => window.open(`mailto:?subject=${encodeURIComponent(`Trip: ${originName.value} → ${destinationName.value}`)}&body=${encodeURIComponent(shareLink.value)}`)
const shareToFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink.value)}`, '_blank')

// ─── Lifecycle ────────────────────────────────────────────────────────────────
// ─── Group Chat Handlers ────────────────────────────────────────────────────
const groupChat = ref<GroupChat | null>(null)
const hasJoinedGroupChat = ref(false)

const formattedMembers = computed(() => {
  if (!tripData.value?.members) return []
  return tripData.value.members.map(member => {
    const memberId = member.user?.id || member.user_id || member.id
    return {
      id: memberId,
      name: member.user?.full_name || member.user?.name || member.name || 'Member',
      email: member.user?.email || member.email || '',
      avatar_url: (normalizeMediaUrl(member.avatar_url || member.user?.avatar_url) ?? undefined) as string | undefined,
      role: (memberId === tripData.value?.owner_id ? 'owner' : 'member') as 'owner' | 'member',
    }
  })
})

const handleCreateGroupChat = async () => {
  try {
    if (!tripId.value) {
      showToast('Please save the trip first before creating the message group', 'error')
      return
    }

    const existing = await findTripGroupChat(tripId.value, tripData.value?.title)
    if (existing) {
      groupChat.value = existing
      hasJoinedGroupChat.value = existing.members?.some(m => String(m.id) === String(currentUserId.value)) ?? false
      showToast('A message group already exists for this trip.', 'info')
      return
    }

    const chat = await createChat(tripId.value, formattedMembers.value, tripData.value?.title)
    if (chat) {
      groupChat.value = chat
      hasJoinedGroupChat.value = chat.members?.some(m => String(m.id) === String(currentUserId.value)) ?? false
      showToast('Message group created successfully!', 'success')
    }
  } catch (error) {
    console.error('Error creating group chat:', error)
    
    // Try to recover: check if the group was actually created despite the error
    try {
      const recovered = await findTripGroupChat(tripId.value, tripData.value?.title)
      if (recovered) {
        groupChat.value = recovered
        hasJoinedGroupChat.value = recovered.members?.some(m => String(m.id) === String(currentUserId.value)) ?? false
        showToast('Message group created!', 'success')
        return
      }
    } catch (recoveryError) {
      console.error('Error during recovery:', recoveryError)
    }
    
    showToast('Failed to create message group. Please try again.', 'error')
  }
}

const handleJoinedGroupChat = async (payload?: { tripId?: string; members?: any[] }) => {
  try {
    if (!tripId.value) {
      showToast('Please save the trip first before joining chat', 'error')
      return
    }

    // If the PlanMembers component passed members in the event payload,
    // forward them so the service can create the group with the full member list.
    const membersToUse = payload?.members ?? formattedMembers.value
    const chat = await getOrCreateChatForTrip(tripId.value, tripData.value?.title, membersToUse)
    if (chat) {
      groupChat.value = chat
      if (currentUserId.value && !chat.members?.some(m => String(m.id) === String(currentUserId.value))) {
        await joinChat(chat.id);
      }
      hasJoinedGroupChat.value = true
      showToast('Redirecting to group chat...', 'success')
      // Close modal and navigate immediately
      showMembersPanel.value = false
      await nextTick()

      const safeChat = chat as any;
      const finalChatId = safeChat.id || safeChat.data?.id || safeChat.chat?.id || safeChat.groupChat?.id;
      
      if (finalChatId) {
        router.push({ name: 'chat', query: { convId: String(finalChatId) } })
      } else {
        console.error("Chat was created, but frontend couldn't find the ID! Backend returned:", chat);
        showToast("Error reading Chat ID from server.", "error");
      }
    }
  } catch (error) {
    console.error('Error joining group chat:', error)
    showToast('Failed to join group chat. Please try again.', 'error')
  }
}

const handleOpenGroupChat = async () => {
  try {
    if (!tripId.value) {
      showToast('Please save the trip first before opening chat', 'error')
      return
    }

    const chat = await getOrCreateChatForTrip(tripId.value, tripData.value?.title)
    if (chat) {
      if (currentUserId.value && !chat.members?.some(m => String(m.id) === String(currentUserId.value))) {
        const joined = await joinChat(chat.id)
        if (joined) {
          groupChat.value = joined
        }
      }
      showMembersPanel.value = false
      await nextTick()
      router.push({ name: 'chat', query: { convId: String(chat.id) } })
    }
  } catch (error) {
    console.error('Error opening group chat:', error)
    showToast('Failed to open group chat. Please try again.', 'error')
  }
}

const handleKickMember = async (targetUserId: string) => {
  const confirm = window.confirm("Are you sure you want to remove this member from the trip?");
  if (!confirm) return;

  try {
    await API.delete(`/trips/${tripId.value}/members/${targetUserId}?userId=${currentUserId.value}`);

    if (groupChat.value?.id) {
      await removeMember(targetUserId); 
    }

    if (tripData.value && tripData.value.members) {
      tripData.value.members = tripData.value.members.filter(m => {
        const id = m.user?.id || m.user_id || m.id;
        return String(id) !== String(targetUserId);
      });
    }

    showToast("Member removed successfully", "success");
  } catch (error) {
    console.error("Failed to remove member:", error);
    showToast("Failed to remove member. Please try again.", "error");
  }
}

onMounted(async () => {
  try {
    await fetchTrip()
    await nextTick()
    await initMap()
    await Promise.all([fetchWeather(), fetchAttractions()])
  } catch (err: any) {
    console.error('[TripResultsView] onMounted error:', err)
    apiError.value = err?.message || 'Something went wrong loading the trip results.'
  }
})
onUnmounted(() => {
  leafletMap?.remove()
  leafletMap = null
  destinationMarker = null
  attractionLayerGroup = null
})
</script>

<style>
/* Leaflet markers — must be global */
.lf-marker     { display:flex; align-items:center; gap:7px; pointer-events:none; }
.lf-pin        { width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,.35); flex-shrink:0; }
.lf-pin-green  { background:#15803d; }
.lf-pin-blue   { background:#1a73e8; }
.lf-label      { background:white; font-size:12px; font-weight:700; padding:3px 9px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,.18); white-space:nowrap; }
.lf-origin .lf-label { border-left:3px solid #15803d; }
.lf-dest   .lf-label { border-left:3px solid #1a73e8; }
.lf-label-attraction  { border-left:3px solid #f59e0b !important; color:#92400e; }
.lf-star-pin   { width:32px; height:32px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 3px 10px rgba(0,0,0,.3); border:3px solid #f59e0b; flex-shrink:0; }
.lf-poi        { width:36px; height:36px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 3px 10px rgba(0,0,0,.25); border:2px solid #e5e7eb; cursor:pointer; transition:transform .15s; }
.lf-poi:hover  { transform:scale(1.15); }
.lf-popup      { font-size:13px; line-height:1.5; }
.leaflet-control-attribution { font-size:10px !important; }

/* Toast transition */
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
</style>