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
        <div v-else class="user-menu" ref="menuRef">
          <button class="avatar-btn" @click="menuOpen = !menuOpen">
            <img
              v-if="user.avatar_url"
              :src="user.avatar_url"
              :alt="user.full_name"
              class="avatar-img"
            />
            <div v-else class="avatar-circle">
              {{ getInitials(user.full_name) }}
            </div>
          </button>
          <transition name="drop">
            <div v-if="menuOpen" class="user-dropdown">
              <div class="dropdown-header">
                <div class="dh-circle">{{ getInitials(user.full_name) }}</div>
                <div class="dh-info">
                  <div class="dh-name">{{ user.full_name }}</div>
                  <div class="dh-email">{{ user.email }}</div>
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
            <div class="mobile-avatar">{{ getInitials(user.full_name) }}</div>
            <span class="mobile-name">{{ user.full_name }}</span>
          </div>
          <a href="/profile"          class="mobile-dd-link" @click="mobileOpen = false">👤 My Profile</a>
          <a href="/profile/trips"    class="mobile-dd-link" @click="mobileOpen = false">🗺️ My Trips</a>
          <a href="/profile/stories"  class="mobile-dd-link" @click="mobileOpen = false">📖 My Stories</a>
          <a href="/profile/settings" class="mobile-dd-link" @click="mobileOpen = false">⚙️ Settings</a>
          <button class="btn-logout-m" @click="handleLogout">🚪 Log Out</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { computed, defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
  name: 'NavBar',
  setup() {
    const mobileOpen = ref(false)
    const menuOpen   = ref(false)
    const menuRef    = ref<HTMLElement | null>(null)
    const router     = useRouter()
    const route      = useRoute()
    const currentPath = computed(() => route.path)
    const user = ref<any>(null)
    function loadUser() {
      const raw = localStorage.getItem('user_data')
                || localStorage.getItem('user')
                || localStorage.getItem('currentUser')
      if (raw) {
        try { user.value = JSON.parse(raw) } catch { user.value = null }
      } else {
        user.value = null
      }
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
      user.value   = null
      menuOpen.value   = false
      mobileOpen.value = false
      router.push('/login')
    }
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
        menuOpen.value = false
      }
    }

    onMounted(() => {
      loadUser()
      document.addEventListener('click', handleClickOutside)
      window.addEventListener('user-logged-in', loadUser)
      window.addEventListener('storage', loadUser)
      window.addEventListener('user-updated', loadUser)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('user-logged-in', loadUser)
      window.removeEventListener('storage', loadUser)
      window.removeEventListener('user-updated', loadUser)
    })

    return {
      mobileOpen, menuOpen, menuRef,
      currentPath, user,
      getInitials, handleLogout,
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

.nav-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.btn-login { padding: 8px 18px; border: 1.5px solid rgba(255,255,255,0.4); border-radius: 6px; color: rgba(255,255,255,0.85); text-decoration: none; font-size: 13px; font-family: 'DM Sans', sans-serif; transition: all 0.2s; white-space: nowrap; }
.btn-login:hover { background: rgba(255,255,255,0.1); color: #fff; }
.btn-signup { padding: 8px 18px; background: #C8922A; border-radius: 6px; color: #fff; text-decoration: none; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; transition: background 0.2s; white-space: nowrap; }
.btn-signup:hover { background: #b07820; }
.user-menu { position: relative; }
.avatar-btn { background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; }
.avatar-circle { width: 36px; height: 36px; background: #C8922A; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif; border: 2px solid rgba(255,255,255,0.3); transition: border-color 0.2s, transform 0.2s; }
.avatar-circle:hover { border-color: #fff; transform: scale(1.05); }
.avatar-img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.3); }
.user-dropdown { position: absolute; top: calc(100% + 12px); right: 0; width: 230px; background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); border: 1px solid #E0DDD6; overflow: hidden; z-index: 999; }
.dropdown-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #F5F3EE; }
.dh-circle { width: 36px; height: 36px; background: #C8922A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; font-family: 'DM Sans', sans-serif; }
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
.mobile-menu { position: fixed; top: 0; right: -100%; width: 270px; height: 100vh; background: #1a2340; z-index: 999; display: flex; flex-direction: column; padding: 80px 0 24px; transition: right 0.3s ease; overflow-y: auto; }
.mobile-menu.open { right: 0; }
.mobile-link { padding: 14px 28px; color: rgba(255,255,255,0.75); text-decoration: none; font-size: 15px; font-family: 'DM Sans', sans-serif; border-left: 3px solid transparent; transition: all 0.15s; }
.mobile-link:hover { color: #fff; background: rgba(255,255,255,0.06); border-left-color: #C8922A; }
.mobile-auth { display: flex; flex-direction: column; gap: 10px; padding: 16px 28px; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); }
.btn-login-m { padding: 10px; border: 1.5px solid rgba(255,255,255,0.35); border-radius: 7px; color: rgba(255,255,255,0.85); text-decoration: none; font-size: 14px; text-align: center; }
.btn-signup-m { padding: 10px; background: #C8922A; border-radius: 7px; color: #fff; text-decoration: none; font-size: 14px; font-weight: 500; text-align: center; }
.mobile-user { display: flex; flex-direction: column; gap: 8px; }
.mobile-user-info { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.mobile-avatar { width: 34px; height: 34px; background: #C8922A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; }
.mobile-name { color: #fff; font-size: 14px; font-family: 'DM Sans', sans-serif; }
.mobile-dd-link { padding: 9px 0; color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; font-family: 'DM Sans', sans-serif; border-bottom: 1px solid rgba(255,255,255,0.07); }
.mobile-dd-link:hover { color: #fff; }
.btn-logout-m { padding: 10px; background: transparent; border: 1px solid rgba(255,60,60,0.5); border-radius: 7px; color: #ff6b6b; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 4px; }

@media (max-width: 1024px) { .nav-links { display: none; } .nav-actions { display: none; } .hamburger { display: flex; } }
@media (max-width: 600px) { .navbar-container { padding: 0 20px; } .logo-text { font-size: 14px; } }
</style>