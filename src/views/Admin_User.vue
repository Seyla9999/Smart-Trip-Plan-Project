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
              <h1 class="text-2xl font-bold text-white">User Management</h1>
            </div>

            <button
              @click="openAddAdminModal"
              class="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Admin</span>
            </button>
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
              placeholder="Search traveler by name or email..."
              class="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-4 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>
      </header>

      <div class="flex-1 min-h-0 overflow-hidden p-4 md:p-6">
        <div class="flex h-full min-h-0 flex-col gap-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Total users</p>
              <p class="mt-2 text-3xl font-bold text-slate-900">{{ totalUsers }}</p>
            </div>
            <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-emerald-700">User Accounts</p>
              <p class="mt-2 text-3xl font-bold text-emerald-700">{{ userCount }}</p>
            </div>
            <div class="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
              <div class="absolute -right-3 -top-4 text-white/10">
                <svg class="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                  />
                </svg>
              </div>
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Admin Accounts</p>
              <p class="mt-2 text-2xl font-bold text-white">{{ adminCount }}</p>
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
              <div class="flex items-center gap-1">
                <button
                  v-for="tab in tabOptions"
                  :key="tab"
                  @click="activeTab = tab"
                  :class="[
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                    activeTab === tab
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  ]"
                >
                  {{ tab }}
                </button>
              </div>
              <div class="flex items-center gap-2 text-sm text-slate-500">
                <span>Sort by:</span>
                <select
                  v-model="sortBy"
                  class="rounded-md border border-slate-200 bg-white px-2 py-1 font-medium text-slate-700 focus:border-emerald-400 focus:outline-none cursor-pointer"
                >
                  <option>Recently Joined</option>
                  <option>Name A-Z</option>
                  <option>Access Level</option>
                  <option>Status</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-12 border-b border-slate-100 bg-slate-50 px-4 py-2 md:px-6">
              <div class="col-span-4 text-xs font-semibold uppercase tracking-wider text-slate-500">User</div>
              <div class="col-span-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</div>
              <div class="col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Role</div>
              <div class="col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</div>
              <div class="col-span-1 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Action</div>
            </div>

            <div class="flex-1 min-h-0 overflow-auto">
              <div v-if="isLoading" class="flex h-full items-center justify-center px-4 py-10 text-sm font-medium text-slate-500">
                Loading users from database...
              </div>
              <div v-else-if="!filteredUsers.length" class="flex h-full items-center justify-center px-4 py-10 text-sm font-medium text-slate-500">
                No users found.
              </div>
              <template v-else>
                <div
                  v-for="user in filteredUsers"
                  :key="user.id"
                  class="group grid grid-cols-12 items-center border-b border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50 md:px-6"
                >
                  <div class="col-span-4 flex items-center gap-3">
                    <div class="relative">
                      <div
                        class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                        :class="avatarColor(user.name)"
                      >
                        {{ user.name.charAt(0).toUpperCase() }}
                      </div>
                      <span
                        v-if="user.status === 'Active'"
                        class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400"
                      ></span>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-slate-800">{{ user.name }}</p>
                      <p class="text-xs text-slate-500">Joined {{ user.joined }}</p>
                    </div>
                  </div>

                  <div class="col-span-3">
                    <a :href="'mailto:' + user.email" class="text-sm text-emerald-700 hover:underline">
                      {{ user.email }}
                    </a>
                  </div>

                  <div class="col-span-2">
                    <span class="inline-block rounded border px-2.5 py-0.5 text-xs font-semibold" :class="accessBadge(user.role)">
                      {{ user.role }}
                    </span>
                  </div>

                  <div class="col-span-2">
                    <span class="inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium" :class="statusBadge(user.status)">
                      {{ user.status }}
                    </span>
                  </div>

                  <div class="col-span-1 flex justify-end">
                    <button
                      @click="openUserDetails(user)"
                      class="rounded-md p-1.5 text-slate-300 transition-all hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100 cursor-pointer"
                      type="button"
                      aria-label="Open user details"
                    >
                      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="5" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="19" cy="12" r="2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div
        v-if="selectedUser"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        @click.self="closeUserDetails"
      >
        <!-- (existing selectedUser modal content) -->
        <div class="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
          <div class="mb-4 flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">User details</p>
              <h3 class="text-lg font-bold text-slate-900">{{ selectedUser.name }}</h3>
            </div>
            <button
              type="button"
              @click="closeUserDetails"
              class="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close details"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</p>
              <p class="text-slate-700">{{ selectedUser.email }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Username</p>
              <p class="text-slate-700">{{ selectedUser.username || 'Not set' }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Role</p>
              <p class="text-slate-700">{{ selectedUser.role }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</p>
              <span class="inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium" :class="statusBadge(selectedUser.status)">
                {{ selectedUser.status }}
              </span>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Joined</p>
              <p class="text-slate-700">{{ selectedUser.joined }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Last login</p>
              <p class="text-slate-700">{{ selectedUser.lastLoginLabel }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Stories Uploaded</p>
              <p class="text-slate-700 font-bold text-emerald-600">{{ selectedUser.storyCount }} stories</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Trips Planned</p>
              <p class="text-slate-700 font-bold text-sky-600">{{ selectedUser.tripCount }} trips</p>
            </div>
            <div class="col-span-2">
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Bio</p>
              <p class="text-slate-700">{{ selectedUser.bio || 'No bio provided' }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">User ID</p>
              <p class="font-mono text-xs text-slate-500">{{ selectedUser.shortId }}</p>
            </div>
          </div>

          <div v-if="statusUpdateError" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {{ statusUpdateError }}
          </div>

          <div class="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              class="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              @click="changeUserStatus(selectedUser, 'active')"
              :disabled="isUpdatingStatus || selectedUser.status === 'Active'"
            >
              Keep Active
            </button>
            <button
              type="button"
              class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              @click="changeUserStatus(selectedUser, 'banned')"
              :disabled="isUpdatingStatus || selectedUser.status === 'Banned'"
            >
              Ban user
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showAddAdminModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        @click.self="closeAddAdminModal"
      >
        <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
          <div class="mb-6 flex items-start justify-between">
            <div>
              <h3 class="text-xl font-bold text-slate-900">Add New Admin</h3>
              <p class="text-sm text-slate-500">Create a new administrator account.</p>
            </div>
            <button
              type="button"
              @click="closeAddAdminModal"
              class="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleAddAdmin" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                v-model="newAdmin.full_name"
                type="text"
                required
                placeholder="e.g. Sok Samnang"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                v-model="newAdmin.email"
                type="email"
                required
                placeholder="admin@example.com"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input
                v-model="newAdmin.password"
                type="password"
                required
                placeholder="Min 6 characters"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div v-if="createAdminError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {{ createAdminError }}
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                @click="closeAddAdminModal"
                class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isCreatingAdmin"
                class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 cursor-pointer"
              >
                {{ isCreatingAdmin ? 'Creating...' : 'Create Admin' }}
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
import { createUser, getAdminUsers, getUsersCount, updateUserStatus } from '@/services/users.service'
import { useAdminToast } from '@/composables/useAdminToast'
import API from '@/api/axios'

const { showAdminToast } = useAdminToast()
const searchQuery = ref('')
const activeTab = ref('All Users')
const sortBy = ref('Recently Joined')
const isLoading = ref(false)
const fetchError = ref('')
const statusUpdateError = ref('')
const isUpdatingStatus = ref(false)
const selectedUser = ref(null)
const showAddAdminModal = ref(false)
const createAdminError = ref('')
const isCreatingAdmin = ref(false)
const newAdmin = ref({
  full_name: '',
  email: '',
  password: '',
})

const tabOptions = ['All Users', 'Admins', 'Travelers']
const users = ref([])
const fallbackTotalUsers = ref(0)

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthMap = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
}

const formatMonthYear = (dateValue) => {
  if (!dateValue) return 'N/A'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

const formatDateTime = (dateValue) => {
  if (!dateValue) return 'Never'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Never'
  return date.toLocaleString()
}

const shortId = (id) => (id ? `${id.slice(0, 8)}...${id.slice(-4)}` : 'Hidden')

const toDisplayName = (user) => {
  if (user.full_name && user.full_name.trim()) return user.full_name
  if (user.username && user.username.trim()) return user.username
  if (user.email && user.email.includes('@')) return user.email.split('@')[0]
  return 'Unknown User'
}

const toRoleLabel = (role) => (role ? role.toString().toUpperCase() : 'TRAVELER')

const toStatusLabel = (user) => {
  const rawStatus = user.status ? user.status.toString().trim().toLowerCase() : ''
  if (rawStatus === 'banned') return 'Banned'
  if (rawStatus === 'active') return 'Active'
  if (user.deleted_at) return 'Banned'
  return 'Active'
}

const mapApiUser = (user) => ({
  id: user.id,
  name: toDisplayName(user),
  email: user.email,
  username: user.username || '',
  avatarUrl: user.avatar_url || '',
  bio: user.bio || '',
  role: toRoleLabel(user.role),
  status: toStatusLabel(user),
  joined: formatMonthYear(user.created_at),
  lastLoginLabel: formatDateTime(user.last_login),
  isVerified: Boolean(user.is_verified),
  shortId: shortId(user.id),
})

const syncUser = (updatedUser) => {
  const mapped = mapApiUser(updatedUser)
  const index = users.value.findIndex((item) => item.id === mapped.id)
  if (index === -1) {
    users.value.unshift(mapped)
  } else {
    users.value[index] = mapped
  }
  if (selectedUser.value?.id === mapped.id) {
    selectedUser.value = { ...mapped }
  }
}

const resetNewAdmin = () => {
  newAdmin.value = {
    full_name: '',
    email: '',
    password: '',
  }
}

const openAddAdminModal = () => {
  createAdminError.value = ''
  showAddAdminModal.value = true
}

const closeAddAdminModal = () => {
  showAddAdminModal.value = false
  createAdminError.value = ''
  resetNewAdmin()
}

const loadUsers = async () => {
  isLoading.value = true
  fetchError.value = ''
  try {
    const response = await getAdminUsers()
    const list = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data?.data)
        ? response.data.data
        : []

    if (list.length) {
      users.value = list.map(mapApiUser)
      fallbackTotalUsers.value = 0
    } else {
      fallbackTotalUsers.value = await getUsersCount()
      users.value = []
    }
  } catch (error) {
    fetchError.value = 'Unable to fetch users from database.'
    console.error('Failed to fetch users:', error)
    fallbackTotalUsers.value = await getUsersCount()
  } finally {
    isLoading.value = false
  }
}

const handleAddAdmin = async () => {
  const payload = {
    full_name: newAdmin.value.full_name.trim(),
    email: newAdmin.value.email.trim(),
    password: newAdmin.value.password,
    role: 'admin',
  }

  if (!payload.full_name || !payload.email || !payload.password) {
    createAdminError.value = 'Please fill in all required fields.'
    return
  }

  isCreatingAdmin.value = true
  createAdminError.value = ''
  try {
    const response = await createUser(payload)
    const createdUser = response?.data?.data
    if (createdUser) {
      syncUser(createdUser)
    }
    showAdminToast({
      message: 'Admin added',
      detail: `${payload.full_name} account is ready.`,
      tone: 'success'
    })
    closeAddAdminModal()
  } catch (error) {
    const message = error?.response?.data?.message
    createAdminError.value = message || 'Unable to create admin.'
    console.error('Failed to create admin:', error)
  } finally {
    isCreatingAdmin.value = false
  }
}

const openUserDetails = async (user) => {
  statusUpdateError.value = ''
  // Set initial state with 0 counts
  selectedUser.value = { 
    ...user, 
    storyCount: 0, 
    tripCount: 0 
  }
  
  try {
    const [storiesRes, tripsRes] = await Promise.allSettled([
      API.get('/stories', { params: { userId: user.id } }),
      API.get('/trips', { params: { ownerId: user.id } })
    ])
    
    // Create a fresh update object to ensure reactivity
    const statsUpdate = { ...selectedUser.value }
    
    if (storiesRes.status === 'fulfilled') {
      console.log('Stories API response:', storiesRes.value.data)
      statsUpdate.storyCount = storiesRes.value.data?.meta?.total ?? 0
    } else {
      console.error('Failed to fetch user story count:', storiesRes.reason)
    }

    if (tripsRes.status === 'fulfilled') {
      console.log('Trips API response:', tripsRes.value.data)
      statsUpdate.tripCount = tripsRes.value.data?.meta?.total ?? 0
    } else {
      console.error('Failed to fetch user trip count:', tripsRes.reason)
    }

    // Only update if the user hasn't switched to someone else
    if (selectedUser.value && selectedUser.value.id === user.id) {
      selectedUser.value = statsUpdate
    }
  } catch (error) {
    console.error('Unexpected error fetching user statistics:', error)
  }
}

const closeUserDetails = () => {
  selectedUser.value = null
  statusUpdateError.value = ''
}

const changeUserStatus = async (user, nextStatus) => {
  if (!user?.id) return
  isUpdatingStatus.value = true
  statusUpdateError.value = ''
  try {
    const response = await updateUserStatus(user.id, nextStatus)
    const updatedUser = response?.data?.data
    if (updatedUser) {
      syncUser(updatedUser)
    }
    showAdminToast({
      message: nextStatus === 'active' ? 'User activated' : 'User banned',
      tone: nextStatus === 'active' ? 'success' : 'delete'
    })
  } catch (error) {
    statusUpdateError.value = 'Unable to update user status.'
    console.error('Failed to update status:', error)
  } finally {
    isUpdatingStatus.value = false
  }
}

const joinedScore = (value) => {
  const [month, year] = value.split(' ')
  if (!month || !year) return 0
  return Number(year) * 12 + (monthMap[month] || 0)
}

const filteredUsers = computed(() => {
  let list = [...users.value]
  const query = searchQuery.value.trim().toLowerCase()

  if (activeTab.value === 'Admins') list = list.filter((user) => user.role === 'ADMIN')
  if (activeTab.value === 'Travelers') list = list.filter((user) => user.role !== 'ADMIN')

  if (query) {
    list = list.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    )
  }

  switch (sortBy.value) {
    case 'Name A-Z':
      list.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'Access Level':
      list.sort((a, b) => a.role.localeCompare(b.role))
      break
    case 'Status':
      list.sort((a, b) => a.status.localeCompare(b.status))
      break
    default:
      list.sort((a, b) => joinedScore(b.joined) - joinedScore(a.joined))
  }

  return list
})

const totalUsers = computed(() => users.value.length || fallbackTotalUsers.value)
const userCount = computed(() => users.value.filter((user) => user.role !== 'ADMIN').length)
const adminCount = computed(() => users.value.filter((user) => user.role === 'ADMIN').length)

const avatarColor = (name) => {
  const colors = ['bg-emerald-600', 'bg-cyan-600', 'bg-violet-600', 'bg-blue-600', 'bg-fuchsia-600', 'bg-amber-600']
  const initial = name?.charCodeAt(0) ?? 0
  return colors[initial % colors.length]
}

const accessBadge = (role) =>
  ({
    ADMIN: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    TRAVELER: 'border-slate-200 bg-slate-100 text-slate-700',
    EDITOR: 'border-violet-200 bg-violet-50 text-violet-700',
  }[role] || 'border-slate-200 bg-slate-100 text-slate-600')

const statusBadge = (status) =>
  ({
    Active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Banned: 'border-red-200 bg-red-50 text-red-700',
  }[status] || 'border-slate-200 bg-slate-100 text-slate-600')

onMounted(loadUsers)
</script>