<template>
  <div class="profile-page" v-if="user">
    <div class="cover-section">
      <div class="cover-bg" />
      <div class="cover-overlay" />
      <div class="cover-content">
        <h1 class="cover-name">{{ user.full_name }}</h1>
        <p class="cover-username" v-if="user.username">@{{ user.username }}</p>
      </div>
    </div>
    <div class="profile-header-wrap">
      <div class="container profile-header">

        <div class="avatar-outer">
          <div class="avatar-wrap">
            <div class="big-avatar" :style="{ background: avatarColor }">
              <img v-if="previewUrl || user.avatar_url" :src="previewUrl || user.avatar_url" :alt="user.full_name" class="avatar-img" />
              <span v-else class="avatar-initials">{{ initials }}</span>
            </div>
            <label class="camera-btn" title="Change photo">
              📷
              <input type="file" accept="image/*" class="file-input" @change="onAvatarChange" />
            </label>
          </div>
          <div class="role-badge" :class="user.role">{{ formatRole(user.role) }}</div>
        </div>

        <div class="header-right">
          <div class="profile-stats">
            <div class="pstat"><span class="pstat-num">{{ stats.trips }}</span><span class="pstat-lbl">Trips</span></div>
            <div class="pstat"><span class="pstat-num">{{ stats.stories }}</span><span class="pstat-lbl">Stories</span></div>
            <div class="pstat"><span class="pstat-num">{{ stats.bookmarks }}</span><span class="pstat-lbl">Saved</span></div>
          </div>
          <p class="profile-bio" v-if="user.bio">{{ user.bio }}</p>
        </div>

        <div class="profile-actions">
          <button class="btn-edit" @click="activeTab = 'settings'">✏️ Edit Profile</button>
        </div>
      </div>
    </div>

    <div class="tabs-bar">
      <div class="container">
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab.key" class="tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key">
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>
      </div>
    </div>
    <div class="tab-content container">

      <div v-if="activeTab === 'trips'">
        <div v-if="tripsLoading" class="loading-state"><div class="spinner" /> Loading trips...</div>
        <div v-else-if="trips.length === 0" class="empty-state">
          <div class="es-emoji">🗺️</div>
          <h3 class="es-title">No trips yet</h3>
          <p class="es-desc">You haven't planned any trips yet.<br>Start exploring Cambodia and plan your first adventure!</p>
          <a href="/plan-trip" class="es-btn">+ Plan a Trip</a>
        </div>
        <div v-else class="trips-grid">
          <div v-for="t in trips" :key="t.id" class="trip-card">
            <div class="tc-top">
              <div class="tc-province" v-if="t.province_id">📍 Province {{ t.province_id }}</div>
              <span class="tc-status" :class="t.status">{{ t.status }}</span>
            </div>
            <div class="tc-title">{{ t.title }}</div>
            <div class="tc-dates" v-if="t.start_date">📅 {{ formatDate(t.start_date) }} → {{ formatDate(t.end_date) }}</div>
            <div class="tc-type"  v-if="t.travel_type">✈️ {{ t.travel_type }}</div>
            <div class="tc-desc"  v-if="t.description">{{ truncate(t.description, 80) }}</div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'stories'">
        <div v-if="storiesLoading" class="loading-state"><div class="spinner" /> Loading stories...</div>
        <div v-else-if="stories.length === 0" class="empty-state">
          <div class="es-emoji">📖</div>
          <h3 class="es-title">No stories yet</h3>
          <p class="es-desc">You haven't shared any travel stories yet.<br>Share your experiences and inspire other travelers!</p>
          <a href="/community" class="es-btn">+ Write a Story</a>
        </div>
        <div v-else class="stories-grid">
          <div v-for="s in stories" :key="s.id" class="story-card">
            <div class="sc-img" :style="{ backgroundImage: s.image_url ? `url(${s.image_url})` : 'none', backgroundColor: '#2D6A4F' }" />
            <div class="sc-body">
              <div class="sc-status" :class="s.status">{{ s.status }}</div>
              <div class="sc-title">{{ s.title }}</div>
              <div class="sc-date">{{ formatDate(s.created_at) }}</div>
              <div class="sc-preview">{{ truncate(s.content, 100) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'bookmarks'">
        <div v-if="bookmarksLoading" class="loading-state"><div class="spinner" /> Loading bookmarks...</div>
        <div v-else-if="bookmarks.length === 0" class="empty-state">
          <div class="es-emoji">🔖</div>
          <h3 class="es-title">No saved places yet</h3>
          <p class="es-desc">You haven't saved any attractions yet.<br>Explore Cambodia and save places you want to visit!</p>
          <a href="/discover" class="es-btn">Discover Places</a>
        </div>
        <div v-else class="bookmarks-grid">
          <div v-for="b in bookmarks" :key="b.id" class="bookmark-card">
            <div class="bk-img" :style="{ backgroundImage: b.attraction?.image_url ? `url(${b.attraction.image_url})` : `url(${b.attraction?.province?.main_image_url})`, backgroundColor: '#2D6A4F' }">
              <button class="bk-remove" @click.stop="removeBookmark(b.id)">✕</button>
            </div>
            <div class="bk-body">
              <div class="bk-name">{{ b.attraction?.name_en || 'Saved Place' }}</div>
              <div class="bk-prov" v-if="b.attraction?.province">📍 {{ b.attraction.province.name_en }}</div>
              <div class="bk-cat"  v-if="b.attraction?.category">{{ b.attraction.category }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'settings'" class="settings-section">
        <h2 class="settings-title">Edit Profile</h2>

        <div class="avatar-upload-row">
          <div class="aus-avatar" :style="{ background: avatarColor }">
            <img v-if="previewUrl || user.avatar_url" :src="previewUrl || user.avatar_url" class="avatar-img" />
            <span v-else>{{ initials }}</span>
          </div>
          <div class="aus-info">
            <div class="aus-label">Profile Photo</div>
            <div class="aus-hint">JPG or PNG, max 5MB</div>
            <label class="aus-btn">
              📷 Change Photo
              <input type="file" accept="image/*" class="file-input" @change="onAvatarChange" />
            </label>
            <span v-if="uploadMsg" class="upload-msg">{{ uploadMsg }}</span>
          </div>
        </div>

        <div class="settings-form">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input v-model="form.full_name" class="form-input" placeholder="Your full name" />
          </div>
          <div class="form-group">
            <label class="form-label">Username</label>
            <input v-model="form.username" class="form-input" placeholder="@username" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input :value="form.email" class="form-input" disabled />
            <span class="form-hint">Email cannot be changed</span>
          </div>
          <div class="form-group">
            <label class="form-label">Bio</label>
            <textarea v-model="form.bio" class="form-input form-textarea" placeholder="Tell other travelers about yourself..." rows="3" maxlength="200" />
            <span class="form-hint">{{ form.bio?.length || 0 }}/200 characters</span>
          </div>
          <div class="form-actions">
            <button class="btn-save" @click="saveProfile" :disabled="saving">{{ saving ? 'Saving...' : 'Save Changes' }}</button>
            <span v-if="saveMsg" class="save-msg" :class="saveMsgType">{{ saveMsg }}</span>
          </div>
        </div>

        <div class="settings-divider" />
        <h3 class="settings-subtitle">Change Password</h3>
        <div class="settings-form">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <input v-model="pwForm.current" class="form-input" type="password" placeholder="••••••••" />
          </div>
          <div class="form-group">
            <label class="form-label">New Password</label>
            <input v-model="pwForm.newPw" class="form-input" type="password" placeholder="••••••••" />
          </div>
          <div class="form-group">
            <label class="form-label">Confirm Password</label>
            <input v-model="pwForm.confirm" class="form-input" type="password" placeholder="••••••••" />
          </div>
          <div class="form-actions">
            <button class="btn-save" @click="changePassword" :disabled="pwSaving">{{ pwSaving ? 'Updating...' : 'Update Password' }}</button>
            <span v-if="pwMsg" class="save-msg" :class="pwMsgType">{{ pwMsg }}</span>
          </div>
        </div>

        <div class="settings-divider" />
        <div class="danger-zone">
          <h3 class="danger-title">⚠️ Danger Zone</h3>
          <p class="danger-desc">Once you delete your account, there is no going back.</p>
          <button class="btn-danger" @click="confirmDelete = true">Delete Account</button>
        </div>

        <div v-if="confirmDelete" class="modal-overlay" @click.self="confirmDelete = false">
          <div class="modal">
            <div class="modal-icon">⚠️</div>
            <div class="modal-title">Delete Account?</div>
            <div class="modal-desc">This will permanently delete your account and all data. This cannot be undone.</div>
            <div class="modal-actions">
              <button class="btn-cancel" @click="confirmDelete = false">Cancel</button>
              <button class="btn-confirm-delete" @click="deleteAccount">Yes, Delete</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <div v-else class="not-logged-in">
    <div class="nli-icon">🔒</div>
    <h2 class="nli-title">Please log in to view your profile</h2>
    <div class="nli-actions">
      <a href="/login"    class="btn-login-big">Login</a>
      <a href="/register" class="btn-signup-big">Sign Up Free</a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const COLORS  = ['#1D3557','#2D6A4F','#C8922A','#5C4B8A','#AE2012','#2196A6','#6B4C3B']

export default defineComponent({
  name: 'ProfileView',
  setup() {
    const router     = useRouter()
    const user       = ref<any>(null)
    const activeTab  = ref('trips')
    const previewUrl = ref('')

    const tabs = [
      { key: 'trips',     label: 'My Trips',   icon: '🗺️' },
      { key: 'stories',   label: 'My Stories', icon: '📖' },
      { key: 'bookmarks', label: 'Bookmarks',  icon: '🔖' },
      { key: 'settings',  label: 'Settings',   icon: '⚙️' },
    ]

    const trips     = ref<any[]>([])
    const stories   = ref<any[]>([])
    const bookmarks = ref<any[]>([])
    const stats     = ref({ trips: 0, stories: 0, bookmarks: 0 })
    const tripsLoading     = ref(false)
    const storiesLoading   = ref(false)
    const bookmarksLoading = ref(false)

    const form    = ref({ full_name: '', username: '', email: '', bio: '' })
    const pwForm  = ref({ current: '', newPw: '', confirm: '' })
    const saving  = ref(false)
    const pwSaving = ref(false)
    const saveMsg  = ref('')
    const saveMsgType = ref('success')
    const pwMsg    = ref('')
    const pwMsgType = ref('success')
    const uploadMsg = ref('')
    const confirmDelete = ref(false)

    const initials = computed(() => {
      if (!user.value?.full_name) return '?'
      return user.value.full_name.trim().split(/\s+/).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    })

    const avatarColor = computed(() => {
      if (!user.value?.full_name) return COLORS[0]
      return COLORS[user.value.full_name.charCodeAt(0) % COLORS.length]
    })

    function formatRole(role: string): string {
      if (!role) return 'Traveler'
      const map: Record<string, string> = {
        traveler:  '✈️ Traveler',
        admin:     '⚙️ Admin',
        moderator: '🛡️ Moderator',
      }
      return map[role.toLowerCase()] || role
    }

    function getToken(): string {
      return localStorage.getItem('access_token')
          || localStorage.getItem('token')
          || localStorage.getItem('authToken')
          || localStorage.getItem('jwt')
          || sessionStorage.getItem('access_token')
          || sessionStorage.getItem('token')
          || ''
    }

    function getHeaders(isJson = true) {
      const token = getToken()
      return {
        ...(isJson ? { 'Content-Type': 'application/json' } : {}),
        ...(token   ? { Authorization: `Bearer ${token}` } : {}),
      }
    }

    function getStorageKey(): string {
      if (localStorage.getItem('user_data')) return 'user_data'
      if (localStorage.getItem('user'))      return 'user'
      return 'user_data'
    }

    function saveUserLocally(updated: any) {
      localStorage.setItem(getStorageKey(), JSON.stringify(updated))
      user.value = { ...updated }
    }

    async function loadProfile() {
      const raw = localStorage.getItem('user_data')
                || localStorage.getItem('user')
                || localStorage.getItem('currentUser')
      if (!raw) { user.value = null; return }
      try {
        user.value = JSON.parse(raw)
        form.value = {
          full_name: user.value.full_name || '',
          username:  user.value.username  || '',
          email:     user.value.email     || '',
          bio:       user.value.bio       || '',
        }
        const path = router.currentRoute.value.path
        if (path.includes('/trips'))     activeTab.value = 'trips'
        if (path.includes('/stories'))   activeTab.value = 'stories'
        if (path.includes('/bookmarks')) activeTab.value = 'bookmarks'
        if (path.includes('/settings'))  activeTab.value = 'settings'
        await Promise.allSettled([loadTrips(), loadStories(), loadBookmarks()])
      } catch { user.value = null }
    }

    async function loadTrips() {
      tripsLoading.value = true
      try {
        const res  = await fetch(`${API_URL}/trips`, { headers: getHeaders() })
        const data = await res.json()
        trips.value       = Array.isArray(data) ? data : (data.data || data.trips || [])
        stats.value.trips = trips.value.length
      } catch { trips.value = [] } finally { tripsLoading.value = false }
    }

    async function loadStories() {
      storiesLoading.value = true
      try {
        const res = await fetch(`${API_URL}/users/${user.value.id}/stories`, { headers: getHeaders() })
        if (res.ok) {
          const data          = await res.json()
          stories.value       = Array.isArray(data) ? data : (data.data || data.stories || [])
          stats.value.stories = stories.value.length
        }
      } catch { stories.value = [] } finally { storiesLoading.value = false }
    }

    async function loadBookmarks() {
      bookmarksLoading.value = true
      try {
        const res = await fetch(`${API_URL}/bookmarks`, { headers: getHeaders() })
        if (res.ok) {
          const data            = await res.json()
          bookmarks.value       = Array.isArray(data) ? data : (data.data || data.bookmarks || [])
          stats.value.bookmarks = bookmarks.value.length
        }
      } catch { bookmarks.value = [] } finally { bookmarksLoading.value = false }
    }

    async function saveProfile() {
      saving.value  = true
      saveMsg.value = ''
      try {
        const res = await fetch(`${API_URL}/users/${user.value.id}`, {
          method: 'PUT', headers: getHeaders(),
          body: JSON.stringify({
            full_name: form.value.full_name,
            username:  form.value.username,
            bio:       form.value.bio,
          }),
        })
        const updated = { ...user.value, full_name: form.value.full_name, username: form.value.username, bio: form.value.bio }
        if (res.ok) {
          const data = await res.json()
          saveUserLocally({ ...updated, ...(data.data || data) })
          saveMsg.value = '✅ Profile updated successfully!'
          saveMsgType.value = 'success'
        } else {
          saveUserLocally(updated)
          saveMsg.value     = res.status === 401 ? '✅ Saved locally! (Backend needs JWT)' : '⚠️ Saved locally. Backend error'
          saveMsgType.value = 'success'
        }
      } catch {
        saveUserLocally({ ...user.value, full_name: form.value.full_name, username: form.value.username, bio: form.value.bio })
        saveMsg.value = '✅ Saved locally!'
        saveMsgType.value = 'success'
      } finally {
        saving.value = false
        setTimeout(() => { saveMsg.value = '' }, 5000)
      }
    }

    async function onAvatarChange(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      if (file.size > 5 * 1024 * 1024) { uploadMsg.value = '❌ Max 5MB'; return }
      const reader = new FileReader()
      reader.onload = ev => { previewUrl.value = ev.target?.result as string }
      reader.readAsDataURL(file)
      uploadMsg.value = '⏳ Uploading...'
      try {
        const fd = new FormData()
        fd.append('file', file)
        const token = getToken()
        const res = await fetch(`${API_URL}/users/${user.value.id}/upload-avatar`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        })
        const avatarUrl = res.ok ? ((await res.json()).avatar_url || previewUrl.value) : previewUrl.value
        saveUserLocally({ ...user.value, avatar_url: avatarUrl })
        uploadMsg.value = '✅ Photo updated!'
      } catch {
        saveUserLocally({ ...user.value, avatar_url: previewUrl.value })
        uploadMsg.value = '✅ Photo saved!'
      }
      setTimeout(() => { uploadMsg.value = '' }, 3000)
    }

    async function changePassword() {
      if (pwForm.value.newPw !== pwForm.value.confirm) { pwMsg.value = '❌ Passwords do not match!'; pwMsgType.value = 'error'; return }
      pwSaving.value = true; pwMsg.value = ''
      try {
        const res = await fetch(`${API_URL}/users/${user.value.id}/change-password`, {
          method: 'POST', headers: getHeaders(),
          body: JSON.stringify({ current_password: pwForm.value.current, new_password: pwForm.value.newPw }),
        })
        pwMsg.value = res.ok ? '✅ Password updated!' : '❌ Wrong current password.'
        pwMsgType.value = res.ok ? 'success' : 'error'
        if (res.ok) pwForm.value = { current: '', newPw: '', confirm: '' }
      } catch { pwMsg.value = '❌ Network error.'; pwMsgType.value = 'error' }
      finally { pwSaving.value = false; setTimeout(() => { pwMsg.value = '' }, 3000) }
    }

    async function deleteAccount() {
      try { await fetch(`${API_URL}/users/${user.value.id}/delete-account`, { method: 'POST', headers: getHeaders() }) }
      finally { localStorage.clear(); sessionStorage.clear(); router.push('/') }
    }

    async function removeBookmark(id: string) {
      try {
        await fetch(`${API_URL}/bookmarks/${id}`, { method: 'DELETE', headers: getHeaders() })
        bookmarks.value       = bookmarks.value.filter((b: any) => b.id !== id)
        stats.value.bookmarks = bookmarks.value.length
      } catch {}
    }

    function formatDate(d: string): string {
      if (!d) return ''
      return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    function truncate(text: string, max: number): string {
      if (!text) return ''
      return text.length > max ? text.slice(0, max) + '...' : text
    }

    onMounted(loadProfile)

    return {
      user, activeTab, tabs, previewUrl,
      trips, stories, bookmarks, stats,
      tripsLoading, storiesLoading, bookmarksLoading,
      form, pwForm, saving, pwSaving,
      saveMsg, saveMsgType, pwMsg, pwMsgType, uploadMsg,
      confirmDelete, initials, avatarColor,
      formatRole, saveProfile, changePassword, deleteAccount,
      removeBookmark, onAvatarChange, formatDate, truncate,
    }
  },
})
</script>

<style scoped>
.profile-page { min-height: 100vh; background: #F5F3EE; font-family: 'DM Sans', sans-serif; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 48px; }

.cover-section { position: relative; height: 240px; overflow: hidden; }
.cover-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #1a2340 0%, #2D6A4F 100%); }
.cover-overlay { position: absolute; inset: 0; background: url('/hero/hero1.jpg') center/cover no-repeat; opacity: 0.25; }

.cover-content {
  position: absolute;
  bottom: 10px;           
  left: 310px;
  text-align: left;
  z-index: 2;
}
.cover-name {
  font-family: 'Cinzel', serif;
  font-size: 30px; font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 16px rgba(0,0,0,0.55);
  margin: 0 0 2px;
}
.cover-username { font-size: 13px; color: rgba(255,255,255,0.65); margin: 0; }

.profile-header-wrap { background: #fff; border-bottom: 1px solid #E0DDD6; }
.profile-header { display: flex; align-items: center; gap: 20px; padding: 12px 0 16px; }

.avatar-outer {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-top: -56px;
}

.avatar-wrap { position: relative; }
.big-avatar {
  width: 100px; height: 100px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 4px solid #fff;
  box-shadow: 0 4px 20px rgba(0,0,0,0.18);
  overflow: hidden;
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-initials { font-size: 30px; font-weight: 700; color: #fff; font-family: 'Cinzel', serif; }

.camera-btn {
  position: absolute;
  bottom: 2px; right: 2px;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: #1a2340; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; cursor: pointer;
  border: 2px solid #fff;
  transition: background 0.2s;
  z-index: 3;
}
.camera-btn:hover { background: #C8922A; }
.file-input { display: none; }

.role-badge {
  font-size: 9px; font-weight: 700;
  padding: 3px 12px; border-radius: 20px;
  white-space: nowrap; letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1.5px solid rgba(255,255,255,0.5);
  margin-top: 2px;
}
.role-badge.traveler  { background: #C8922A; color: #fff; }
.role-badge.admin     { background: #1D3557; color: #fff; }
.role-badge.moderator { background: #2D6A4F; color: #fff; }


.header-right { flex: 1; padding: 4px 0; }
.profile-stats { display: flex; gap: 28px; margin-bottom: 8px; }
.pstat { display: flex; flex-direction: column; align-items: center; }
.pstat-num { font-family: 'Cinzel', serif; font-size: 20px; font-weight: 700; color: #2D6A4F; line-height: 1; }
.pstat-lbl { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }
.profile-bio { font-size: 14px; color: #4a4a4a; line-height: 1.6; max-width: 480px; margin: 0; }

.profile-actions { padding: 4px 0; flex-shrink: 0; }
.btn-edit { padding: 9px 20px; background: #1a2340; border: none; border-radius: 8px; color: #fff; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.2s; }
.btn-edit:hover { background: #2D6A4F; }


.tabs-bar { background: #fff; border-bottom: 1px solid #E0DDD6; }
.tabs { display: flex; max-width: 1100px; margin: 0 auto; padding: 0 48px; }
.tab { padding: 14px 20px; background: none; border: none; border-bottom: 2px solid transparent; font-size: 13px; font-weight: 500; color: #6B6B6B; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; display: flex; align-items: center; gap: 6px; }
.tab:hover  { color: #1a1a1a; }
.tab.active { color: #2D6A4F; border-bottom-color: #2D6A4F; font-weight: 600; }
.tab-content { padding: 36px 48px; }


.loading-state { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 60px; color: #888; }
.spinner { width: 20px; height: 20px; border: 2px solid #E0DDD6; border-top-color: #2D6A4F; border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 80px 20px; }
.es-emoji { font-size: 56px; margin-bottom: 16px; }
.es-title { font-family: 'Cinzel', serif; font-size: 22px; color: #1a1a1a; margin-bottom: 10px; }
.es-desc  { font-size: 14px; color: #6B6B6B; line-height: 1.7; margin-bottom: 24px; }
.es-btn   { display: inline-block; padding: 12px 28px; background: #2D6A4F; color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; transition: background 0.2s; }
.es-btn:hover { background: #1e4d39; }

.trips-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.trip-card { background: #fff; border-radius: 12px; padding: 18px; border: 1px solid #E0DDD6; transition: box-shadow 0.2s; }
.trip-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.tc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.tc-province { font-size: 11px; color: #888; }
.tc-status { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px; text-transform: uppercase; }
.tc-status.planning  { background: #E6F1FB; color: #185FA5; }
.tc-status.active    { background: #EAF3DE; color: #3B6D11; }
.tc-status.completed { background: #F5F3EE; color: #6B6B6B; }
.tc-title { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; }
.tc-dates { font-size: 12px; color: #6B6B6B; margin-bottom: 4px; }
.tc-type  { font-size: 12px; color: #C8922A; font-weight: 500; margin-bottom: 4px; text-transform: capitalize; }
.tc-desc  { font-size: 12px; color: #888; line-height: 1.5; margin-top: 4px; }

.stories-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.story-card { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #E0DDD6; }
.sc-img { height: 130px; background-size: cover; background-position: center; }
.sc-body { padding: 14px; }
.sc-status { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
.sc-status.published { color: #3B6D11; }
.sc-status.pending   { color: #854F0B; }
.sc-title   { font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; line-height: 1.4; }
.sc-date    { font-size: 11px; color: #888; margin-bottom: 6px; }
.sc-preview { font-size: 12px; color: #666; line-height: 1.5; }


.bookmarks-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.bookmark-card { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #E0DDD6; cursor: pointer; transition: transform 0.2s; }
.bookmark-card:hover { transform: translateY(-2px); }
.bk-img { height: 130px; background-size: cover; background-position: center; position: relative; }
.bk-remove { position: absolute; top: 8px; right: 8px; width: 26px; height: 26px; border-radius: 50%; background: rgba(0,0,0,0.55); color: #fff; border: none; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.bk-remove:hover { background: #AE2012; }
.bk-body { padding: 12px 14px; }
.bk-name { font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; }
.bk-prov { font-size: 12px; color: #6B6B6B; margin-bottom: 3px; }
.bk-cat  { font-size: 11px; color: #C8922A; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }

.settings-section  { max-width: 560px; }
.settings-title    { font-family: 'Cinzel', serif; font-size: 20px; color: #1a1a1a; margin-bottom: 24px; }
.settings-subtitle { font-family: 'Cinzel', serif; font-size: 16px; color: #1a1a1a; margin-bottom: 20px; }
.settings-divider  { height: 1px; background: #E0DDD6; margin: 32px 0; }

.avatar-upload-row { display: flex; align-items: center; gap: 20px; padding: 20px; background: #F5F3EE; border-radius: 12px; border: 1px solid #E0DDD6; margin-bottom: 24px; }
.aus-avatar { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #fff; flex-shrink: 0; overflow: hidden; font-family: 'Cinzel', serif; }
.aus-info { flex: 1; }
.aus-label { font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 2px; }
.aus-hint  { font-size: 12px; color: #888; margin-bottom: 8px; }
.aus-btn   { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; background: #1a2340; color: #fff; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.2s; }
.aus-btn:hover { background: #2D6A4F; }
.upload-msg { font-size: 12px; color: #3B6D11; margin-left: 8px; }

.settings-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 12px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.06em; }
.form-input { padding: 10px 14px; border: 1.5px solid #E0DDD6; border-radius: 8px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1a1a1a; background: #fff; outline: none; transition: border-color 0.2s; }
.form-input:focus    { border-color: #2D6A4F; }
.form-input:disabled { background: #F5F3EE; color: #888; cursor: not-allowed; }
.form-textarea { resize: vertical; min-height: 80px; }
.form-hint { font-size: 11px; color: #888; }
.form-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.btn-save { padding: 10px 28px; background: #2D6A4F; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.2s; }
.btn-save:hover:not(:disabled) { background: #1e4d39; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.save-msg { font-size: 13px; line-height: 1.4; max-width: 320px; }
.save-msg.success { color: #3B6D11; }
.save-msg.error   { color: #854F0B; }

.danger-zone  { background: #FFF5F5; border: 1px solid #FCCACA; border-radius: 12px; padding: 20px 24px; }
.danger-title { font-size: 15px; font-weight: 600; color: #AE2012; margin-bottom: 6px; }
.danger-desc  { font-size: 13px; color: #6B6B6B; margin-bottom: 14px; }
.btn-danger   { padding: 9px 20px; background: #AE2012; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.btn-danger:hover { background: #8B1A0E; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal { background: #fff; border-radius: 16px; padding: 32px; max-width: 380px; width: 90%; text-align: center; }
.modal-icon  { font-size: 36px; margin-bottom: 12px; }
.modal-title { font-family: 'Cinzel', serif; font-size: 18px; color: #1a1a1a; margin-bottom: 10px; }
.modal-desc  { font-size: 14px; color: #6B6B6B; margin-bottom: 24px; line-height: 1.6; }
.modal-actions { display: flex; gap: 12px; }
.btn-cancel         { flex: 1; padding: 10px; border: 1.5px solid #E0DDD6; border-radius: 8px; background: none; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.btn-confirm-delete { flex: 1; padding: 10px; background: #AE2012; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; }

.not-logged-in { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; padding: 48px; }
.nli-icon  { font-size: 52px; }
.nli-title { font-family: 'Cinzel', serif; font-size: 22px; color: #1a1a1a; }
.nli-actions { display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; justify-content: center; }
.btn-login-big  { padding: 11px 28px; border: 1.5px solid #2D6A4F; border-radius: 8px; color: #2D6A4F; text-decoration: none; font-size: 14px; font-weight: 500; }
.btn-signup-big { padding: 11px 28px; background: #2D6A4F; border-radius: 8px; color: #fff; text-decoration: none; font-size: 14px; font-weight: 500; }

@media (max-width: 768px) {
  .container, .tabs { padding: 0 20px; }
  .cover-name { font-size: 22px; }
  .trips-grid, .stories-grid, .bookmarks-grid { grid-template-columns: 1fr; }
  .tab-content { padding: 24px 20px; }
  .profile-stats { display: none; }
  .avatar-upload-row { flex-direction: column; }
}
</style>