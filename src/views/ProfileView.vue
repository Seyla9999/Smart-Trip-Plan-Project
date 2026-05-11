<template>
  <div class="profile-page" v-if="user">

    <!-- ─── COVER + AVATAR ─── -->
    <div class="cover-section">
      <div class="cover-bg" />
      <div class="cover-overlay" />
      <div class="profile-hero container">
        <div class="avatar-wrap">
          <div class="big-avatar" :style="{ background: avatarColor }">
            <img v-if="user.avatar_url" :src="user.avatar_url" :alt="user.full_name" class="avatar-img" />
            <span v-else class="avatar-initials">{{ initials }}</span>
          </div>
          <div class="avatar-badge">{{ user.role || 'Traveler' }}</div>
        </div>
        <div class="profile-info">
          <h1 class="profile-name">{{ user.full_name }}</h1>
          <p class="profile-username" v-if="user.username">@{{ user.username }}</p>
          <p class="profile-bio" v-if="user.bio">{{ user.bio }}</p>
          <p class="profile-bio muted" v-else>No bio yet — add one in Settings!</p>
          <div class="profile-stats">
            <div class="pstat"><span class="pstat-num">{{ stats.trips }}</span><span class="pstat-lbl">Trips</span></div>
            <div class="pstat"><span class="pstat-num">{{ stats.stories }}</span><span class="pstat-lbl">Stories</span></div>
            <div class="pstat"><span class="pstat-num">{{ stats.bookmarks }}</span><span class="pstat-lbl">Bookmarks</span></div>
          </div>
        </div>
        <div class="profile-actions">
          <button class="btn-edit" @click="activeTab = 'settings'">✏️ Edit Profile</button>
        </div>
      </div>
    </div>

    <!-- ─── TABS ─── -->
    <div class="tabs-bar">
      <div class="container">
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab.key" class="tab" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- ─── CONTENT ─── -->
    <div class="tab-content container">

      <!-- MY TRIPS -->
      <div v-if="activeTab === 'trips'">
        <div v-if="tripsLoading" class="loading-state">Loading trips...</div>
        <div v-else-if="trips.length === 0" class="empty-state">
          <div class="es-icon">🗺️</div>
          <div class="es-title">No trips yet</div>
          <div class="es-sub">Start planning your first Cambodia adventure!</div>
          <a href="/plan-trip" class="es-btn">Plan a Trip</a>
        </div>
        <div v-else class="trips-grid">
          <div v-for="t in trips" :key="t.id" class="trip-card">
            <div class="tc-head">
              <div class="tc-title">{{ t.title }}</div>
              <span class="tc-status" :class="t.status">{{ t.status }}</span>
            </div>
            <div class="tc-dates">📅 {{ formatDate(t.start_date) }} → {{ formatDate(t.end_date) }}</div>
            <div class="tc-desc" v-if="t.description">{{ t.description }}</div>
          </div>
        </div>
      </div>

      <!-- MY STORIES -->
      <div v-if="activeTab === 'stories'">
        <div v-if="storiesLoading" class="loading-state">Loading stories...</div>
        <div v-else-if="stories.length === 0" class="empty-state">
          <div class="es-icon">📖</div>
          <div class="es-title">No stories yet</div>
          <div class="es-sub">Share your travel experiences with the community!</div>
          <a href="/community" class="es-btn">Write a Story</a>
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

      <!-- BOOKMARKS -->
      <div v-if="activeTab === 'bookmarks'">
        <div v-if="bookmarksLoading" class="loading-state">Loading bookmarks...</div>
        <div v-else-if="bookmarks.length === 0" class="empty-state">
          <div class="es-icon">🔖</div>
          <div class="es-title">No bookmarks yet</div>
          <div class="es-sub">Save attractions you want to visit!</div>
          <a href="/discover" class="es-btn">Discover Attractions</a>
        </div>
        <div v-else class="bookmarks-grid">
          <div v-for="b in bookmarks" :key="b.id" class="bookmark-card" @click="$router.push('/discover')">
            <div class="bk-img" :style="{ backgroundImage: b.attraction?.image_url ? `url(${b.attraction.image_url})` : `url(${b.attraction?.province?.main_image_url})`, backgroundColor: '#2D6A4F' }">
              <button class="bk-remove" @click.stop="removeBookmark(b.id)" title="Remove">✕</button>
            </div>
            <div class="bk-body">
              <div class="bk-name">{{ b.attraction?.name_en || 'Saved Place' }}</div>
              <div class="bk-prov" v-if="b.attraction?.province">📍 {{ b.attraction.province.name_en }}</div>
              <div class="bk-cat"  v-if="b.attraction?.category">{{ b.attraction.category }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- SETTINGS -->
      <div v-if="activeTab === 'settings'" class="settings-section">
        <h2 class="settings-title">Edit Profile</h2>
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
            <input v-model="form.email" class="form-input" type="email" disabled />
            <span class="form-hint">Email cannot be changed</span>
          </div>
          <div class="form-group">
            <label class="form-label">Bio</label>
            <textarea v-model="form.bio" class="form-input form-textarea" placeholder="Tell other travelers about yourself..." rows="3" />
          </div>
          <div class="form-group">
            <label class="form-label">Avatar URL</label>
            <input v-model="form.avatar_url" class="form-input" placeholder="https://..." />
            <span class="form-hint">Paste a link to your profile photo</span>
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
            <label class="form-label">Confirm New Password</label>
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
            <div class="modal-title">Delete Account?</div>
            <div class="modal-desc">This will permanently delete your account, trips, and stories. This cannot be undone.</div>
            <div class="modal-actions">
              <button class="btn-cancel" @click="confirmDelete = false">Cancel</button>
              <button class="btn-confirm-delete" @click="deleteAccount">Yes, Delete</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Not logged in -->
  <div v-else class="not-logged-in">
    <div class="nli-icon">🔒</div>
    <div class="nli-title">Please log in to view your profile</div>
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
    const router    = useRouter()
    const user      = ref<any>(null)
    const activeTab = ref('trips')

    const tabs = [
      { key: 'trips',     label: 'My Trips',    icon: '🗺️' },
      { key: 'stories',   label: 'My Stories',  icon: '📖' },
      { key: 'bookmarks', label: 'Bookmarks',   icon: '🔖' },
      { key: 'settings',  label: 'Settings',    icon: '⚙️' },
    ]

    const trips     = ref<any[]>([])
    const stories   = ref<any[]>([])
    const bookmarks = ref<any[]>([])
    const stats     = ref({ trips: 0, stories: 0, bookmarks: 0 })
    const tripsLoading     = ref(false)
    const storiesLoading   = ref(false)
    const bookmarksLoading = ref(false)

    const form    = ref({ full_name: '', username: '', email: '', bio: '', avatar_url: '' })
    const pwForm  = ref({ current: '', newPw: '', confirm: '' })
    const saving  = ref(false)
    const pwSaving = ref(false)
    const saveMsg = ref('')
    const saveMsgType = ref('success')
    const pwMsg   = ref('')
    const pwMsgType = ref('success')
    const confirmDelete = ref(false)

    const initials = computed(() => {
      if (!user.value?.full_name) return '?'
      return user.value.full_name.trim().split(/\s+/).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    })

    const avatarColor = computed(() => {
      if (!user.value?.full_name) return COLORS[0]
      return COLORS[user.value.full_name.charCodeAt(0) % COLORS.length]
    })

    function getToken(): string {
      return localStorage.getItem('token')
          || localStorage.getItem('access_token')
          || ''
    }

    function getHeaders() {
      const token = getToken()
      return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    }

    // ✅ Read user from localStorage — tries all possible keys
    async function loadProfile() {
      const raw = localStorage.getItem('user_data')
                || localStorage.getItem('user')
                || localStorage.getItem('currentUser')
      if (!raw) { user.value = null; return }

      try {
        user.value = JSON.parse(raw)
        form.value = {
          full_name:  user.value.full_name  || '',
          username:   user.value.username   || '',
          email:      user.value.email      || '',
          bio:        user.value.bio        || '',
          avatar_url: user.value.avatar_url || '',
        }

        // Auto-select tab based on URL path
        const path = router.currentRoute.value.path
        if (path.includes('/trips'))     activeTab.value = 'trips'
        if (path.includes('/stories'))   activeTab.value = 'stories'
        if (path.includes('/bookmarks')) activeTab.value = 'bookmarks'
        if (path.includes('/settings'))  activeTab.value = 'settings'

        // Load data in parallel
        await Promise.allSettled([loadTrips(), loadStories(), loadBookmarks()])
      } catch {
        user.value = null
      }
    }

    async function loadTrips() {
      tripsLoading.value = true
      try {
        const res  = await fetch(`${API_URL}/trips`, { headers: getHeaders() })
        const data = await res.json()
        trips.value       = data.data || data || []
        stats.value.trips = trips.value.length
      } catch { trips.value = [] } finally { tripsLoading.value = false }
    }

    async function loadStories() {
      storiesLoading.value = true
      try {
        const res  = await fetch(`${API_URL}/users/${user.value.id}/stories`, { headers: getHeaders() })
        const data = await res.json()
        stories.value       = data.data || data || []
        stats.value.stories = stories.value.length
      } catch { stories.value = [] } finally { storiesLoading.value = false }
    }

    async function loadBookmarks() {
      bookmarksLoading.value = true
      try {
        const res  = await fetch(`${API_URL}/bookmarks`, { headers: getHeaders() })
        const data = await res.json()
        bookmarks.value       = data.data || data || []
        stats.value.bookmarks = bookmarks.value.length
      } catch { bookmarks.value = [] } finally { bookmarksLoading.value = false }
    }

    async function saveProfile() {
      saving.value  = true
      saveMsg.value = ''
      try {
        const res = await fetch(`${API_URL}/users/${user.value.id}`, {
          method: 'PUT', headers: getHeaders(),
          body: JSON.stringify({
            full_name:  form.value.full_name,
            username:   form.value.username,
            bio:        form.value.bio,
            avatar_url: form.value.avatar_url,
          }),
        })
        if (res.ok) {
          const data    = await res.json()
          const updated = { ...user.value, ...(data.data || data) }
          // Update all possible localStorage keys
          const key = localStorage.getItem('user_data') ? 'user_data'
                    : localStorage.getItem('user')       ? 'user'
                    : 'user_data'
          localStorage.setItem(key, JSON.stringify(updated))
          user.value        = updated
          saveMsg.value     = '✅ Profile updated!'
          saveMsgType.value = 'success'
        } else {
          saveMsg.value     = '❌ Failed to save. Try again.'
          saveMsgType.value = 'error'
        }
      } catch {
        saveMsg.value     = '❌ Network error. Try again.'
        saveMsgType.value = 'error'
      } finally {
        saving.value = false
        setTimeout(() => { saveMsg.value = '' }, 3000)
      }
    }

    async function changePassword() {
      if (pwForm.value.newPw !== pwForm.value.confirm) {
        pwMsg.value = '❌ Passwords do not match!'; pwMsgType.value = 'error'; return
      }
      pwSaving.value = true; pwMsg.value = ''
      try {
        const res = await fetch(`${API_URL}/users/${user.value.id}/change-password`, {
          method: 'POST', headers: getHeaders(),
          body: JSON.stringify({ current_password: pwForm.value.current, new_password: pwForm.value.newPw }),
        })
        if (res.ok) { pwMsg.value = '✅ Password updated!'; pwMsgType.value = 'success'; pwForm.value = { current: '', newPw: '', confirm: '' } }
        else         { pwMsg.value = '❌ Wrong current password.'; pwMsgType.value = 'error' }
      } catch { pwMsg.value = '❌ Network error.'; pwMsgType.value = 'error' }
      finally { pwSaving.value = false; setTimeout(() => { pwMsg.value = '' }, 3000) }
    }

    async function deleteAccount() {
      try {
        await fetch(`${API_URL}/users/${user.value.id}/delete-account`, { method: 'POST', headers: getHeaders() })
        localStorage.removeItem('user_data'); localStorage.removeItem('user')
        localStorage.removeItem('token');     localStorage.removeItem('access_token')
        router.push('/')
      } catch { confirmDelete.value = false }
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
      user, activeTab, tabs, trips, stories, bookmarks, stats,
      tripsLoading, storiesLoading, bookmarksLoading,
      form, pwForm, saving, pwSaving, saveMsg, saveMsgType, pwMsg, pwMsgType,
      confirmDelete, initials, avatarColor,
      saveProfile, changePassword, deleteAccount, removeBookmark,
      formatDate, truncate,
    }
  },
})
</script>

<style scoped>
.profile-page { min-height: 100vh; background: #F5F3EE; font-family: 'DM Sans', sans-serif; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 48px; }

/* Cover */
.cover-section { position: relative; height: 220px; }
.cover-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #1a2340 0%, #2D6A4F 100%); }
.cover-overlay { position: absolute; inset: 0; background: url('/hero/hero1.jpg') center/cover no-repeat; opacity: 0.15; }
.profile-hero { position: absolute; bottom: -44px; left: 50%; transform: translateX(-50%); display: flex; align-items: flex-end; gap: 20px; width: 100%; }

/* Avatar */
.avatar-wrap { position: relative; flex-shrink: 0; }
.big-avatar { width: 92px; height: 92px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.15); overflow: hidden; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-initials { font-size: 28px; font-weight: 700; color: #fff; font-family: 'Cinzel', serif; }
.avatar-badge { position: absolute; bottom: 0; right: 0; background: #C8922A; color: #fff; font-size: 9px; font-weight: 700; letter-spacing: 0.06em; padding: 2px 7px; border-radius: 20px; text-transform: uppercase; border: 2px solid #fff; }

/* Profile info */
.profile-info { flex: 1; padding-bottom: 8px; }
.profile-name { font-family: 'Cinzel', serif; font-size: 22px; font-weight: 700; color: #fff; margin: 0 0 2px; text-shadow: 0 1px 8px rgba(0,0,0,0.3); }
.profile-username { font-size: 13px; color: rgba(255,255,255,0.6); margin: 0 0 4px; }
.profile-bio { font-size: 13px; color: rgba(255,255,255,0.75); margin: 0 0 10px; max-width: 480px; }
.profile-bio.muted { color: rgba(255,255,255,0.35); font-style: italic; }
.profile-stats { display: flex; gap: 24px; }
.pstat { display: flex; flex-direction: column; align-items: center; }
.pstat-num { font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; color: #F4D58D; line-height: 1; }
.pstat-lbl { font-size: 10px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
.profile-actions { padding-bottom: 8px; flex-shrink: 0; }
.btn-edit { padding: 8px 18px; background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.35); border-radius: 8px; color: #fff; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
.btn-edit:hover { background: rgba(255,255,255,0.25); }

/* Tabs */
.tabs-bar { background: #fff; border-bottom: 1px solid #E0DDD6; margin-top: 52px; }
.tabs { display: flex; gap: 0; }
.tab { padding: 14px 20px; background: none; border: none; border-bottom: 2px solid transparent; font-size: 13px; font-weight: 500; color: #6B6B6B; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; display: flex; align-items: center; gap: 6px; }
.tab:hover { color: #1a1a1a; }
.tab.active { color: #2D6A4F; border-bottom-color: #2D6A4F; font-weight: 600; }
.tab-content { padding: 36px 48px; }

/* Loading / Empty */
.loading-state { text-align: center; padding: 40px; color: #888; font-size: 14px; }
.empty-state { text-align: center; padding: 60px 20px; }
.es-icon  { font-size: 48px; margin-bottom: 14px; }
.es-title { font-family: 'Cinzel', serif; font-size: 20px; color: #1a1a1a; margin-bottom: 8px; }
.es-sub   { font-size: 14px; color: #6B6B6B; margin-bottom: 20px; }
.es-btn   { display: inline-block; padding: 10px 24px; background: #2D6A4F; color: #fff; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 500; }
.es-btn:hover { background: #1e4d39; }

/* Trips */
.trips-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.trip-card { background: #fff; border-radius: 12px; padding: 18px; border: 1px solid #E0DDD6; }
.tc-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.tc-title { font-size: 14px; font-weight: 600; color: #1a1a1a; }
.tc-status { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.04em; }
.tc-status.planning  { background: #E6F1FB; color: #185FA5; }
.tc-status.active    { background: #EAF3DE; color: #3B6D11; }
.tc-status.completed { background: #F5F3EE; color: #6B6B6B; }
.tc-dates { font-size: 12px; color: #6B6B6B; margin-bottom: 6px; }
.tc-desc  { font-size: 12px; color: #888; line-height: 1.5; }

/* Stories */
.stories-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.story-card { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #E0DDD6; }
.sc-img    { height: 130px; background-size: cover; background-position: center; }
.sc-body   { padding: 14px; }
.sc-status { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
.sc-status.published { color: #3B6D11; }
.sc-status.pending   { color: #854F0B; }
.sc-title  { font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; line-height: 1.4; }
.sc-date   { font-size: 11px; color: #888; margin-bottom: 6px; }
.sc-preview { font-size: 12px; color: #666; line-height: 1.5; }

/* Bookmarks */
.bookmarks-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.bookmark-card { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #E0DDD6; cursor: pointer; transition: transform 0.2s; }
.bookmark-card:hover { transform: translateY(-2px); }
.bk-img  { height: 130px; background-size: cover; background-position: center; position: relative; }
.bk-remove { position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; border-radius: 50%; background: rgba(0,0,0,0.5); color: #fff; border: none; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.bk-remove:hover { background: #AE2012; }
.bk-body { padding: 12px 14px; }
.bk-name { font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; }
.bk-prov { font-size: 12px; color: #6B6B6B; margin-bottom: 4px; }
.bk-cat  { font-size: 11px; color: #C8922A; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }

/* Settings */
.settings-section { max-width: 560px; }
.settings-title    { font-family: 'Cinzel', serif; font-size: 20px; color: #1a1a1a; margin-bottom: 24px; }
.settings-subtitle { font-family: 'Cinzel', serif; font-size: 16px; color: #1a1a1a; margin-bottom: 20px; }
.settings-divider  { height: 1px; background: #E0DDD6; margin: 32px 0; }
.settings-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 12px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.06em; }
.form-input { padding: 10px 14px; border: 1.5px solid #E0DDD6; border-radius: 8px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1a1a1a; background: #fff; outline: none; transition: border-color 0.2s; }
.form-input:focus { border-color: #2D6A4F; }
.form-input:disabled { background: #F5F3EE; color: #888; cursor: not-allowed; }
.form-textarea { resize: vertical; min-height: 80px; }
.form-hint { font-size: 11px; color: #888; }
.form-actions { display: flex; align-items: center; gap: 16px; margin-top: 4px; }
.btn-save { padding: 10px 28px; background: #2D6A4F; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.2s; }
.btn-save:hover:not(:disabled) { background: #1e4d39; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.save-msg { font-size: 13px; }
.save-msg.success { color: #3B6D11; }
.save-msg.error   { color: #AE2012; }
.danger-zone  { background: #FFF5F5; border: 1px solid #FCCACA; border-radius: 12px; padding: 20px 24px; }
.danger-title { font-size: 15px; font-weight: 600; color: #AE2012; margin-bottom: 6px; }
.danger-desc  { font-size: 13px; color: #6B6B6B; margin-bottom: 14px; }
.btn-danger   { padding: 9px 20px; background: #AE2012; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; }
.btn-danger:hover { background: #8B1A0E; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal { background: #fff; border-radius: 16px; padding: 32px; max-width: 380px; width: 90%; }
.modal-title { font-family: 'Cinzel', serif; font-size: 18px; color: #1a1a1a; margin-bottom: 10px; }
.modal-desc  { font-size: 14px; color: #6B6B6B; margin-bottom: 24px; line-height: 1.6; }
.modal-actions { display: flex; gap: 12px; }
.btn-cancel         { flex: 1; padding: 10px; border: 1.5px solid #E0DDD6; border-radius: 8px; background: none; font-size: 14px; cursor: pointer; }
.btn-confirm-delete { flex: 1; padding: 10px; background: #AE2012; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }

/* Not logged in */
.not-logged-in { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
.nli-icon  { font-size: 48px; }
.nli-title { font-family: 'Cinzel', serif; font-size: 20px; color: #1a1a1a; }
.nli-actions { display: flex; gap: 12px; margin-top: 8px; }
.btn-login-big  { padding: 11px 28px; border: 1.5px solid #2D6A4F; border-radius: 8px; color: #2D6A4F; text-decoration: none; font-size: 14px; font-weight: 500; }
.btn-signup-big { padding: 11px 28px; background: #2D6A4F; border-radius: 8px; color: #fff; text-decoration: none; font-size: 14px; font-weight: 500; }

@media (max-width: 768px) {
  .container { padding: 0 20px; }
  .profile-hero { flex-direction: column; align-items: flex-start; bottom: -80px; }
  .cover-section { height: 180px; }
  .tabs-bar { margin-top: 92px; }
  .trips-grid, .stories-grid, .bookmarks-grid { grid-template-columns: 1fr; }
  .tab-content { padding: 24px 20px; }
}
</style>