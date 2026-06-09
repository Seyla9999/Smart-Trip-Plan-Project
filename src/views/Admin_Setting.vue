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
              <h1 class="text-2xl font-bold text-white">Profile Settings</h1>
            </div>
            <button
              @click="handleLogout"
              class="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div class="flex-1 min-h-0 overflow-auto p-4 md:p-6">
        <div class="flex h-full min-h-0 flex-col gap-6 max-w-2xl">
          <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Edit Profile</h3>
            <p class="text-sm text-slate-500 mb-6">Manage your account information and credentials.</p>
            
            <form @submit.prevent="saveSettings" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
                <input v-model="form.name" type="text" class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
                <input v-model="form.email" type="email" class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
              <div class="pt-4 border-t border-slate-100">
                <h4 class="text-sm font-semibold text-slate-900 mb-3">Change Password</h4>
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">New Password</label>
                    <input v-model="form.password" type="password" placeholder="••••••••" class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Confirm New Password</label>
                    <input v-model="form.confirmPassword" type="password" placeholder="••••••••" class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" class="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer" @click="resetForm">
                  Cancel
                </button>
                <button type="submit" class="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useAdminToast } from '@/composables/useAdminToast'
import { logout } from '@/services/auth.service'

const { showAdminToast } = useAdminToast()

const form = reactive({
  name: 'Admin User',
  email: 'admin@letsgocambodia.site',
  password: '',
  confirmPassword: ''
})

const saveSettings = () => {
  if (form.password && form.password !== form.confirmPassword) {
    showAdminToast({
      message: 'Password mismatch',
      detail: 'New passwords do not match.',
      tone: 'delete'
    })
    return
  }
  showAdminToast({
    message: 'Profile updated',
    detail: 'Your profile information has been saved.',
    tone: 'update'
  })
}

const resetForm = () => {
  form.password = ''
  form.confirmPassword = ''
  showAdminToast({
    message: 'Form cleared',
    detail: 'Changes have been reset.',
    tone: 'delete'
  })
}

const handleLogout = () => {
  logout()
}
</script>