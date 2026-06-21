<template>
  <teleport to="body">
    <transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toast.visible"
        class="fixed bottom-6 right-6 z-[100] w-full max-w-sm overflow-hidden rounded-xl border bg-white shadow-2xl ring-1 ring-black/5"
        :class="toneClasses.border"
      >
        <div class="p-4">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <div :class="['rounded-full p-1', toneClasses.bg]">
                <svg
                  v-if="toast.tone === 'success' || toast.tone === 'update'"
                  class="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg
                  v-else-if="toast.tone === 'delete'"
                  class="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div class="flex-1 pt-0.5">
              <p class="text-sm font-bold text-slate-900">{{ toast.message }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ toast.detail }}</p>
            </div>
            <div class="ml-4 flex flex-shrink-0">
              <button
                type="button"
                @click="clearAdminToast"
                class="inline-flex rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <span class="sr-only">Close</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="h-1 w-full bg-slate-100">
          <div
            class="h-full transition-all duration-[4000ms] ease-linear"
            :class="toneClasses.progress"
            :style="{ width: toast.visible ? '0%' : '100%' }"
          ></div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdminToast } from '../composables/useAdminToast'

const { toast, clearAdminToast } = useAdminToast()

const toneClasses = computed(() => {
  switch (toast.tone) {
    case 'update':
      return {
        border: 'border-blue-100',
        bg: 'bg-blue-500',
        progress: 'bg-blue-500',
      }
    case 'delete':
      return {
        border: 'border-red-100',
        bg: 'bg-red-500',
        progress: 'bg-red-500',
      }
    default:
      return {
        border: 'border-emerald-100',
        bg: 'bg-emerald-500',
        progress: 'bg-emerald-500',
      }
  }
})
</script>
