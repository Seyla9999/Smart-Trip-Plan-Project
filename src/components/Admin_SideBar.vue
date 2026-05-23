<script setup lang="ts">
import { useRoute } from 'vue-router'
import { logout } from '../services/auth.service'

const route = useRoute()
const linkBaseClass =
  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium border'

function handleLogout() {
  logout()
}

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

        <button
          type="button"
          :class="[linkBaseClass, 'mt-4 border-rose-500/20 text-rose-300 hover:bg-rose-500/10 hover:text-white']"
          @click="handleLogout"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Log Out</span>
        </button>
      </nav>
    </div>
  </aside>
</template>