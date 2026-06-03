<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const linkBaseClass =
  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium border'

function getLinkClass(routeName: string) {
  return [
    linkBaseClass,
    route.name === routeName
      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white border-transparent',
  ]
}
</script>

<template>
  <aside class="w-72 min-h-screen bg-[#0f172a] text-slate-200 border-r border-slate-800 shadow-2xl">
    <div class="h-full flex flex-col px-5 py-6">
      <div class="flex items-center gap-3 pb-6 border-b border-slate-800">
        <div class="w-10 h-10 rounded-xl text-emerald-400 flex items-center justify-center">
          <img src="/logo.png" alt="">
        </div>
        <div>
          <h2 class="text-lg font-semibold text-white">តោះទៅ! Cambodia</h2>
        </div>
      </div>

      <nav class="mt-6 flex-1 flex flex-col">
        <div class="space-y-2">
          <router-link
            :to="{ name: 'admin-dashboard' }"
            :class="getLinkClass('admin-dashboard')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 12h7V4H4v8zm0 8h7v-6H4v6zm9 0h7V12h-7v8zm0-10h7V4h-7v6z" />
            </svg>
            <span>Dashboard</span>
          </router-link>

          <router-link :to="{ name: 'admin-destination' }" :class="getLinkClass('admin-destination')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 21l8-18M5 10h5m4 4h5" />
            </svg>
            <span>Destination</span>
          </router-link>

          <router-link :to="{ name: 'admin-sponsor' }" :class="getLinkClass('admin-sponsor')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Sponsor</span>
          </router-link>

          <router-link :to="{ name: 'admin-moderation' }" :class="getLinkClass('admin-moderation')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Moderation</span>
          </router-link>

          <router-link :to="{ name: 'admin-user' }" :class="getLinkClass('admin-user')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 20h5V4H2v16h5m10 0v-2a4 4 0 00-8 0v2m8 0H9m8-10a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>User</span>
          </router-link>
        </div>

        <router-link
          :to="{ name: 'admin-setting' }"
          :class="[...getLinkClass('admin-setting'), 'mt-auto']"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M11.983 13.943a1.96 1.96 0 100-3.92 1.96 1.96 0 000 3.92z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 12a2.11 2.11 0 00-.33-1.16l-1.07-1.66a2.11 2.11 0 01-.23-1.69l.41-1.93a2.1 2.1 0 00-2.57-2.47l-1.95.49a2.1 2.1 0 01-1.71-.24l-1.66-1.08a2.1 2.1 0 00-2.3 0L7.92 3.35a2.1 2.1 0 01-1.71.24l-1.95-.49a2.1 2.1 0 00-2.57 2.47l.41 1.93a2.1 2.1 0 01-.23 1.69L.8 10.84a2.1 2.1 0 000 2.32l1.07 1.66a2.1 2.1 0 01.23 1.69l-.41 1.93a2.1 2.1 0 002.57 2.47l1.95-.49a2.1 2.1 0 011.71.24l1.66 1.08a2.1 2.1 0 002.3 0l1.66-1.08a2.1 2.1 0 011.71-.24l1.95.49a2.1 2.1 0 002.57-2.47l-.41-1.93a2.1 2.1 0 01.23-1.69l1.07-1.66c.21-.35.33-.75.33-1.16z" />
          </svg>
          <span>Setting</span>
        </router-link>
      </nav>
    </div>
  </aside>
</template>