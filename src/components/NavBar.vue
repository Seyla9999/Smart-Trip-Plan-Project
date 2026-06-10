<template>
  <nav class="navbar">
    <div class="navbar-container">

      <a href="/" class="navbar-brand">
        <img src="/logo.png" alt="logo" class="logo-img" />
        <span class="logo-text">តោះទៅ! Cambodia</span>
      </a>

      <ul class="nav-links">
        <li><a href="/"          class="nav-link" :class="{ active: currentPath === '/' }">Home</a></li>
        <li><a href="/about"     class="nav-link" :class="{ active: currentPath === '/about' }">About</a></li>
        <li><a href="/discover"  class="nav-link" :class="{ active: currentPath === '/discover' }">Discover</a></li>
        <li><a href="/plan-trip" class="nav-link" :class="{ active: currentPath === '/plan-trip' }">Plan Trip</a></li>
        <li><a href="/map"       class="nav-link" :class="{ active: currentPath === '/map' }">Map</a></li>
        <li><a href="/community" class="nav-link" :class="{ active: currentPath === '/community' }">Community</a></li>
      </ul>

      <div class="nav-actions">

        <template v-if="!user">
          <a href="/login"    class="btn-login">Login</a>
          <a href="/register" class="btn-signup">Sign Up Free</a>
        </template>

        <template v-else>
          <a href="/chat" class="icon-btn" title="Messages">
            <span>💬</span>
            <span v-if="chatUnread > 0" class="notif-badge chat-badge">
              {{ chatUnread > 9 ? '9+' : chatUnread }}
            </span>
          </a>

          <div class="notif-wrap" ref="notifRef">
            <button class="icon-btn" @click="toggleNotif" title="Notifications">
              <span>🔔</span>
              <span v-if="unreadCount > 0" class="notif-badge">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>
            <transition name="drop">
              <div v-if="notifOpen" class="notif-dropdown">
                <div class="notif-header">
                  <span class="notif-title">Notifications</span>
                  <button v-if="unreadCount > 0" class="mark-read-btn" @click="markAllRead">
                    Mark all read
                  </button>
                </div>

                <div v-if="notifLoading" class="notif-empty">
                  <div class="notif-spinner"></div>
                  <p>Loading...</p>
                </div>

                <div v-else-if="notifications.length > 0" class="notif-list">
                  <div v-for="n in notifications" :key="n.id"
                     class="notif-item"
                     :class="{ unread: !n.is_read }"
                     @click="handleNotifClick(n)"
                     style="cursor:pointer">
                    <div class="notif-icon">{{ getNotifIcon(n.type) }}</div>
                    <div class="notif-body">
                      <div class="notif-item-title">{{ n.title }}</div>
                      <div class="notif-item-msg" v-if="n.message">{{ n.message }}</div>
                      <div class="notif-item-time">{{ formatTime(n.created_at) }}</div>
                    </div>
                    <div v-if="!n.is_read" class="unread-dot" />
                  </div>
                </div>

                <div v-else class="notif-empty">
                  <span>🔔</span>
                  <p>No notifications yet</p>
                </div>
                <div v-if="notifications.length > 0" class="notif-footer-wrap">
                  <button class="notif-footer-btn" @click="goToAllNotifications">
                    See all notifications
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <div class="user-menu" ref="menuRef">
            <button class="avatar-btn" @click="menuOpen = !menuOpen">
              <img v-if="user.avatar_url"
                   :src="getAvatarSrc(user.avatar_url)"
                   :alt="user.full_name"
                   class="avatar-img"
                   @error="onAvatarError" />
              <div v-else class="avatar-circle">{{ getInitials(user.full_name) }}</div>
            </button>

            <transition name="drop">
              <div v-if="menuOpen" class="user-dropdown">
                <div class="dropdown-header">
                  <div class="dh-avatar-wrap">
                    <img v-if="user.avatar_url"
                         :src="getAvatarSrc(user.avatar_url)"
                         class="dh-avatar-img"
                         @error="onAvatarError" />
                    <div v-else class="dh-circle">{{ getInitials(user.full_name) }}</div>
                  </div>
                  <div class="dh-info">
                    <div class="dh-name">{{ user.full_name || user.username || 'Traveler' }}</div>
                    <div class="dh-email">{{ user.email || (user.username ? `@${user.username}` : '') }}</div>
                  </div>
                </div>
                <div class="dd-divider" />
                <a href="/profile"           class="dd-item" @click="menuOpen = false">👤 My Profile</a>
                <a href="/profile/trips"     class="dd-item" @click="menuOpen = false">🗺️ My Trips</a>
                <a href="/profile/stories"   class="dd-item" @click="menuOpen = false">📖 My Stories</a>
                <a href="/profile/bookmarks" class="dd-item" @click="menuOpen = false">🔖 Bookmarks</a>
                <a href="/profile/settings"  class="dd-item" @click="menuOpen = false">⚙️ Settings</a>
                <div class="dd-divider" />
                <button class="dd-item dd-logout" @click="handleLogout">🚪 Log Out</button>
              </div>
            </transition>
          </div>
        </template>
      </div>

      <button class="hamburger" @click="mobileOpen = !mobileOpen" aria-label="Menu">
        <span /><span /><span />
      </button>
    </div>

    <div v-if="mobileOpen" class="overlay" @click="mobileOpen = false" />

    <div class="mobile-menu" :class="{ open: mobileOpen }">
      <a href="/"          class="mobile-link" @click="mobileOpen = false">Home</a>
      <a href="/about"     class="mobile-link" @click="mobileOpen = false">About</a>
      <a href="/discover"  class="mobile-link" @click="mobileOpen = false">Discover</a>
      <a href="/plan-trip" class="mobile-link" @click="mobileOpen = false">Plan Trip</a>
      <a href="/map"       class="mobile-link" @click="mobileOpen = false">Map</a>
      <a href="/community" class="mobile-link" @click="mobileOpen = false">Community</a>

      <div class="mobile-auth">
        <template v-if="!user">
          <a href="/login"    class="btn-login-m">Login</a>
          <a href="/register" class="btn-signup-m">Sign Up Free</a>
        </template>
        <div v-else class="mobile-user">
          <div class="mobile-user-info">
            <div class="mobile-avatar-wrap">
              <img v-if="user.avatar_url"
                   :src="getAvatarSrc(user.avatar_url)"
                   class="mobile-avatar-img"
                   @error="onAvatarError" />
              <div v-else class="mobile-avatar">{{ getInitials(user.full_name) }}</div>
            </div>
            <div>
              <div class="mobile-name">{{ user.full_name || user.username || 'Traveler' }}</div>
              <div class="mobile-email">{{ user.email || (user.username ? `@${user.username}` : '') }}</div>
            </div>
          </div>

          <a href="/chat" class="mobile-dd-link" @click="mobileOpen = false">
            💬 Messages
            <span v-if="chatUnread > 0" class="mobile-badge-inline">{{ chatUnread > 9 ? '9+' : chatUnread }}</span>
          </a>
          <div class="mobile-dd-link mobile-notif-toggle" @click="showMobileNotif = !showMobileNotif">
            🔔 Notifications
            <span v-if="unreadCount > 0" class="mobile-badge-inline">{{ unreadCount }}</span>
          </div>
          <div v-if="showMobileNotif" class="mobile-notif-list">
            <div v-if="notifications.length === 0" class="mobile-notif-item">
              No notifications yet
            </div>
            <div v-for="n in notifications.slice(0, 3)" :key="n.id"
                 class="mobile-notif-item" :class="{ unread: !n.is_read }">
              {{ getNotifIcon(n.type) }} {{ n.title }}
            </div>
            <button v-if="unreadCount > 0" class="mobile-mark-read" @click="markAllRead">
              Mark all read
            </button>
          </div>

          <a href="/profile"          class="mobile-dd-link" @click="mobileOpen = false">👤 My Profile</a>
          <a href="/profile/trips"    class="mobile-dd-link" @click="mobileOpen = false">🗺️ My Trips</a>
          <a href="/profile/stories"  class="mobile-dd-link" @click="mobileOpen = false">📖 My Stories</a>
          <a href="/profile/settings" class="mobile-dd-link" @click="mobileOpen = false">⚙️ Settings</a>
          <button class="btn-logout-m" @click="handleLogout">🚪 Log Out</button>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showAllNotifModal" class="modal-overlay" @click.self="showAllNotifModal = false">
        <div class="all-notif-modal">
          <div class="all-notif-header">
            <span class="notif-title">All Notifications</span>
            <div class="all-notif-actions">
              <button v-if="unreadCount > 0" class="mark-read-btn" @click="markAllRead">Mark all read</button>
              <button class="modal-close-btn" @click="showAllNotifModal = false">✕</button>
            </div>
          </div>
          <div class="all-notif-list" v-if="notifications.length > 0">
            <a v-for="n in notifications" :key="n.id"
               :href="getNotifLink(n)"
               class="notif-item"
               :class="{ unread: !n.is_read }"
               @click="handleNotifClick(n); showAllNotifModal = false">
              <div class="notif-icon">{{ getNotifIcon(n.type) }}</div>
              <div class="notif-body">
                <div class="notif-item-title">{{ n.title }}</div>
                <div class="notif-item-msg" v-if="n.message">{{ n.message }}</div>
                <div class="notif-item-time">{{ formatTime(n.created_at) }}</div>
              </div>
              <div v-if="!n.is_read" class="unread-dot" />
            </a>
          </div>
          <div v-else class="notif-empty">
            <span>🔔</span>
            <p>No notifications yet</p>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script lang="ts">
import { computed, defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default defineComponent({
  name: 'NavBar',
  setup() {
    const mobileOpen        = ref(false)
    const menuOpen          = ref(false)
    const notifOpen         = ref(false)
    const showMobileNotif   = ref(false)
    const showAllNotifModal = ref(false)
    const notifLoading      = ref(false)
    const menuRef           = ref<HTMLElement | null>(null)
    const notifRef          = ref<HTMLElement | null>(null)
    const router            = useRouter()
    const route             = useRoute()
    const currentPath       = computed(() => route.path)
    const user              = ref<any>(null)

    const notifications = ref<any[]>([])
    const unreadCount   = ref(0)
    const chatUnread    = ref(0)
    let notifInterval: any = null
    let chatInterval:  any = null

    function normalizeUser(rawUser: any) {
      const fullName = rawUser.full_name || rawUser.name || rawUser.user_name || rawUser.username || rawUser.email || ''
      const userName = rawUser.username || rawUser.user_name || rawUser.handle || (fullName ? String(fullName).split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : '')
      const email = rawUser.email || rawUser.user_email || rawUser.email_address || ''
      const avatarUrl = rawUser.avatar_url || rawUser.avatar || rawUser.profile_image || rawUser.imageUrl || rawUser.user_avatar || null
      const id = rawUser.id || rawUser.user_id || rawUser.uuid || null
      return {
        ...rawUser,
        id,
        full_name: fullName,
        username: userName,
        email,
        avatar_url: avatarUrl,
      }
    }

    function loadUser() {
      const raw = localStorage.getItem('user_data')
                || localStorage.getItem('user')
                || localStorage.getItem('currentUser')
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          user.value = normalizeUser(parsed)
          loadNotifications()
          loadChatUnread()
        } catch { user.value = null }
      } else {
        user.value          = null
        notifications.value = []
        unreadCount.value   = 0
        chatUnread.value    = 0
      }
    }

    async function loadChatUnread() {
      if (!user.value?.id) return
      try {
        const res = await fetch(`${API_URL}/chat/unread?userId=${user.value.id}`)
        if (res.ok) {
          const data       = await res.json()
          chatUnread.value = data.unread || 0
        }
      } catch { chatUnread.value = 0 }
    }

    async function loadNotifications() {
      if (!user.value?.id) return
      notifLoading.value = true
      try {
        const res = await fetch(`${API_URL}/users/${user.value.id}/notifications`)
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            notifications.value = data.data  || []
            unreadCount.value   = data.unread || 0
          }
        }
      } catch {
        notifications.value = []
        unreadCount.value   = 0
      } finally {
        notifLoading.value = false
      }
    }

    async function markAllRead() {
      if (!user.value?.id) return
      try {
        await fetch(`${API_URL}/users/${user.value.id}/notifications/read`, { method: 'PUT' })
      } catch {}
      notifications.value = notifications.value.map((n: any) => ({ ...n, is_read: true }))
      unreadCount.value   = 0
    }

    async function handleNotifClick(n: any) {
      notifOpen.value = false
      if (!n.is_read) {
        n.is_read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
        if (user.value?.id) {
          try {
            await fetch(`${API_URL}/users/${user.value.id}/notifications/read`, { method: 'PUT' })
          } catch {}
        }
      }
      const link = getNotifLink(n)
      if (link && link !== '#') router.push(link)
    }

    function goToAllNotifications() {
      notifOpen.value = false
      router.push('/notifications')
    }

    function getNotifLink(n: any): string {
      if (n.type === 'trip_invite') return '/trip'

      if (n.type === 'new_message') {
        if (n.link) {
          try { return new URL(n.link).pathname + new URL(n.link).search } catch {}
          return n.link
        }
        return '/chat'
      }

      if (['story_like', 'story_comment', 'story_status'].includes(n.type)) return '/community'


      if (n.link) {
        try {
          const url = new URL(n.link)
          return url.pathname
        } catch {
          return n.link
        }
      }
      return '/'
    }

    function toggleNotif() {
      notifOpen.value = !notifOpen.value
      menuOpen.value  = false
    }

    function getNotifIcon(type: string): string {
      const icons: Record<string, string> = {
        story_like: '❤️', new_message: '💬', trip_invite: '✈️',
        bookmark: '🔖', system: '🔔', comment: '💬', follow: '👤',
      }
      return icons[type] || '🔔'
    }

    function formatTime(dateStr: string): string {
      if (!dateStr) return ''
      const diff  = Date.now() - new Date(dateStr).getTime()
      const mins  = Math.floor(diff / 60000)
      const hours = Math.floor(mins / 60)
      const days  = Math.floor(hours / 24)
      if (mins  < 1)  return 'Just now'
      if (mins  < 60) return `${mins}m ago`
      if (hours < 24) return `${hours}h ago`
      return `${days}d ago`
    }

    function getAvatarSrc(url: string | null): string {
      if (!url) return ''
      if (url.startsWith('data:'))    return url
      if (url.startsWith('http'))     return url
      if (url.startsWith('/uploads')) return `${API_URL}${url}`
      return url
    }

    function onAvatarError(e: Event) {
      const img = e.target as HTMLImageElement
      img.style.display = 'none'
      if (user.value) user.value = { ...user.value, avatar_url: null }
    }

    function getInitials(name: string): string {
      if (!name) return '?'
      return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
    }

    function handleLogout() {
      localStorage.removeItem('user_data')
      localStorage.removeItem('user')
      localStorage.removeItem('currentUser')
      localStorage.removeItem('token')
      localStorage.removeItem('access_token')
      user.value          = null
      menuOpen.value      = false
      notifOpen.value     = false
      mobileOpen.value    = false
      notifications.value = []
      unreadCount.value   = 0
      if (notifInterval) clearInterval(notifInterval)
      if (chatInterval)  clearInterval(chatInterval)
      router.push('/login')
    }

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.value  && !menuRef.value.contains(e.target as Node))  menuOpen.value  = false
      if (notifRef.value && !notifRef.value.contains(e.target as Node)) notifOpen.value = false
    }

    onMounted(() => {
      loadUser()
      document.addEventListener('click', handleClickOutside)
      window.addEventListener('user-logged-in', loadUser)
      window.addEventListener('storage',        loadUser)
      window.addEventListener('user-updated',   loadUser)
      notifInterval = setInterval(loadNotifications, 60000)
      chatInterval  = setInterval(loadChatUnread,    10000)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('user-logged-in', loadUser)
      window.removeEventListener('storage',        loadUser)
      window.removeEventListener('user-updated',   loadUser)
      if (notifInterval) clearInterval(notifInterval)
      if (chatInterval)  clearInterval(chatInterval)
    })

    return {
      mobileOpen, menuOpen, notifOpen, showMobileNotif,
      showAllNotifModal, notifLoading,
      menuRef, notifRef, currentPath, user,
      notifications, unreadCount, chatUnread,
      getInitials, getAvatarSrc, onAvatarError, handleLogout,
      toggleNotif, markAllRead, getNotifIcon, formatTime,
      handleNotifClick, getNotifLink, goToAllNotifications,
    }
  },
})
</script>

<style scoped>
.navbar { background: #1a2340; height: 64px; position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
.navbar-container { max-width: 1400px; margin: 0 auto; padding: 0 40px; height: 100%; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.navbar-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
.logo-img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
.logo-text { font-family: 'Cinzel', serif; font-size: 16px; font-weight: 700; color: #fff; white-space: nowrap; }
.nav-links { list-style: none; margin: 0; padding: 0; display: flex; align-items: center; flex: 1; justify-content: center; }
.nav-link { display: flex; align-items: center; height: 64px; padding: 0 14px; color: rgba(255,255,255,0.65); text-decoration: none; font-size: 14px; font-family: 'DM Sans', sans-serif; border-bottom: 2px solid transparent; transition: color 0.2s, border-color 0.2s; white-space: nowrap; }
.nav-link:hover { color: #fff; }
.nav-link.active { color: #fff; border-bottom-color: #C8922A; }

.nav-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.btn-login  { padding: 8px 18px; border: 1.5px solid rgba(255,255,255,0.4); border-radius: 6px; color: rgba(255,255,255,0.85); text-decoration: none; font-size: 13px; font-family: 'DM Sans', sans-serif; transition: all 0.2s; white-space: nowrap; }
.btn-login:hover { background: rgba(255,255,255,0.1); color: #fff; }
.btn-signup { padding: 8px 18px; background: #C8922A; border-radius: 6px; color: #fff; text-decoration: none; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; transition: background 0.2s; white-space: nowrap; }
.btn-signup:hover { background: #b07820; }

.icon-btn { position: relative; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.08); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; text-decoration: none; transition: background 0.2s; font-size: 16px; }
.icon-btn:hover { background: rgba(255,255,255,0.15); }
.notif-badge { position: absolute; top: -2px; right: -2px; background: #AE2012; color: #fff; font-size: 9px; font-weight: 700; padding: 1px 4px; border-radius: 10px; min-width: 16px; text-align: center; border: 1.5px solid #1a2340; }

.notif-wrap { position: relative; }
.notif-dropdown { position: absolute; top: calc(100% + 12px); right: 0; width: 320px; background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); border: 1px solid #E0DDD6; overflow: hidden; z-index: 999; }
.notif-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #E0DDD6; background: #F5F3EE; }
.notif-title { font-size: 14px; font-weight: 600; color: #1a1a1a; }
.mark-read-btn { font-size: 12px; color: #C8922A; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.mark-read-btn:hover { text-decoration: underline; }
.notif-list { max-height: 300px; overflow-y: auto; }
.notif-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px; border-bottom: 1px solid #E0DDD6; text-decoration: none; transition: background 0.15s; position: relative; cursor: pointer; }
.notif-item:hover { background: #F5F3EE; }
.notif-item.unread { background: #FDFAF5; }
.notif-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
.notif-body { flex: 1; min-width: 0; }
.notif-item-title { font-size: 13px; font-weight: 600; color: #1a1a1a; line-height: 1.4; }
.notif-item-msg   { font-size: 12px; color: #6B6B6B; margin-top: 2px; line-height: 1.4; }
.notif-item-time  { font-size: 11px; color: #C8922A; margin-top: 4px; }
.unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #C8922A; flex-shrink: 0; margin-top: 6px; }
.notif-empty { text-align: center; padding: 32px 16px; color: #888; font-size: 13px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.notif-empty span { font-size: 28px; }
.notif-spinner { width: 20px; height: 20px; border: 2px solid #E0DDD6; border-top-color: #C8922A; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }


.notif-footer-wrap { border-top: 1px solid #E0DDD6; }
.notif-footer-btn { display: block; width: 100%; padding: 12px; font-size: 13px; color: #C8922A; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; text-align: center; }
.notif-footer-btn:hover { background: #F5F3EE; }


.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.all-notif-modal { background: #fff; border-radius: 16px; width: 420px; max-width: 95vw; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 12px 48px rgba(0,0,0,0.2); }
.all-notif-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #E0DDD6; background: #F5F3EE; flex-shrink: 0; }
.all-notif-actions { display: flex; align-items: center; gap: 12px; }
.modal-close-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #888; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.modal-close-btn:hover { background: #E0DDD6; color: #1a1a1a; }
.all-notif-list { overflow-y: auto; flex: 1; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.user-menu { position: relative; }
.avatar-btn { background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; }
.avatar-circle { width: 36px; height: 36px; background: #C8922A; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif; border: 2px solid rgba(255,255,255,0.3); transition: border-color 0.2s, transform 0.2s; }
.avatar-circle:hover { border-color: #fff; transform: scale(1.05); }
.avatar-img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.3); transition: border-color 0.2s; }
.avatar-img:hover { border-color: #fff; }

.user-dropdown { position: absolute; top: calc(100% + 12px); right: 0; width: 230px; background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); border: 1px solid #E0DDD6; overflow: hidden; z-index: 999; }
.dropdown-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #F5F3EE; }
.dh-avatar-wrap { width: 36px; height: 36px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
.dh-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.dh-circle { width: 36px; height: 36px; background: #C8922A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; }
.dh-info { min-width: 0; }
.dh-name  { font-size: 13px; font-weight: 600; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dh-email { font-size: 11px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dd-divider { height: 1px; background: #E0DDD6; }
.dd-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; font-size: 13px; color: #1a1a1a; text-decoration: none; transition: background 0.15s; font-family: 'DM Sans', sans-serif; width: 100%; background: none; border: none; cursor: pointer; text-align: left; }
.dd-item:hover { background: #F5F3EE; }
.dd-logout { color: #AE2012; }
.dd-logout:hover { background: #FFF0EF !important; }

.drop-enter-active, .drop-leave-active { transition: opacity 0.15s, transform 0.15s; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-8px); }

.hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 8px; flex-shrink: 0; }
.hamburger span { display: block; width: 22px; height: 2px; background: #fff; border-radius: 2px; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 998; }
.mobile-menu { position: fixed; top: 0; right: -100%; width: 280px; height: 100vh; background: #1a2340; z-index: 999; display: flex; flex-direction: column; padding: 80px 0 24px; transition: right 0.3s ease; overflow-y: auto; }
.mobile-menu.open { right: 0; }
.mobile-link { padding: 14px 28px; color: rgba(255,255,255,0.75); text-decoration: none; font-size: 15px; font-family: 'DM Sans', sans-serif; border-left: 3px solid transparent; transition: all 0.15s; }
.mobile-link:hover { color: #fff; background: rgba(255,255,255,0.06); border-left-color: #C8922A; }
.mobile-auth { display: flex; flex-direction: column; gap: 8px; padding: 16px 28px; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); }
.btn-login-m  { padding: 10px; border: 1.5px solid rgba(255,255,255,0.35); border-radius: 7px; color: rgba(255,255,255,0.85); text-decoration: none; font-size: 14px; text-align: center; }
.btn-signup-m { padding: 10px; background: #C8922A; border-radius: 7px; color: #fff; text-decoration: none; font-size: 14px; font-weight: 500; text-align: center; }
.mobile-user { display: flex; flex-direction: column; gap: 8px; }
.mobile-user-info { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 4px; }
.mobile-avatar-wrap { width: 42px; height: 42px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.3); }
.mobile-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.mobile-avatar { width: 42px; height: 42px; background: #C8922A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0; }
.mobile-name  { color: #fff; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; }
.mobile-email { color: rgba(255,255,255,0.5); font-size: 11px; font-family: 'DM Sans', sans-serif; margin-top: 1px; }
.mobile-notif-list { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 8px; display: flex; flex-direction: column; gap: 6px; }
.mobile-notif-item { font-size: 12px; color: rgba(255,255,255,0.7); padding: 6px 8px; border-radius: 6px; }
.mobile-notif-item.unread { color: #fff; background: rgba(200,146,42,0.15); }
.mobile-mark-read { background: none; border: none; color: #C8922A; font-size: 12px; cursor: pointer; text-align: left; padding: 4px 8px; font-family: 'DM Sans', sans-serif; }
.mobile-dd-link { padding: 10px 0; color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; font-family: 'DM Sans', sans-serif; border-bottom: 1px solid rgba(255,255,255,0.07); }
.mobile-dd-link:hover { color: #fff; }
.btn-logout-m { padding: 10px; background: transparent; border: 1px solid rgba(255,60,60,0.5); border-radius: 7px; color: #ff6b6b; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 4px; }
.mobile-badge-inline { background: #AE2012; color: #fff; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 10px; margin-left: 4px; }

@media (max-width: 1024px) { .nav-links { display: none; } .nav-actions { display: none; } .hamburger { display: flex; } }
@media (max-width: 600px) { .navbar-container { padding: 0 20px; } .logo-text { font-size: 14px; } }
</style>