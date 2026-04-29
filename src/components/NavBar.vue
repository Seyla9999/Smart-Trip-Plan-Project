<template>
  <nav class="navbar">
    <div class="navbar-container">

      <a href="/" class="navbar-brand">
        <img src="/logo.png" alt="logo" class="logo-img" />
        <span class="logo-text">តោះទៅ! Cambodia</span>
      </a>

      <ul class="nav-links">
        <li><a href="/" class="nav-link" :class="{ active: currentPath === '/' }">Home</a></li>
        <li><a href="/about" class="nav-link" :class="{ active: currentPath === '/about' }">About</a></li>
        <li><a href="/discover" class="nav-link" :class="{ active: currentPath === '/discover' }">Discover</a></li>
        <li><a href="/plan-trip" class="nav-link" :class="{ active: currentPath === '/plan-trip' }">Plan Trip</a></li>
        <li><a href="/map" class="nav-link" :class="{ active: currentPath === '/map' }">Map</a></li>
        <li><a href="/community" class="nav-link" :class="{ active: currentPath === '/community' }">Community</a></li>
      </ul>

      <div class="nav-actions">
        <template v-if="!user">
          <a href="/login" class="btn-login">Login</a>
          <a href="/register" class="btn-signup">Sign Up Free</a>
        </template>
        
        <div v-else class="user-profile">
          <div class="avatar">{{ user.full_name.charAt(0).toUpperCase() }}</div>
          <span class="user-name">{{ user.full_name }}</span>
          <button @click="handleLogout" class="btn-logout">Logout</button>
        </div>
      </div>

      <button class="hamburger" @click="mobileOpen = !mobileOpen" aria-label="Menu">
        <span /><span /><span />
      </button>

    </div>

    <div v-if="mobileOpen" class="overlay" @click="mobileOpen = false" />


    <div class="mobile-menu" :class="{ open: mobileOpen }">
      <a href="/" class="mobile-link" @click="mobileOpen = false">Home</a>
      <a href="/about" class="mobile-link" @click="mobileOpen = false">About</a>
      <a href="/discover" class="mobile-link" @click="mobileOpen = false">Discover</a>
      <a href="/plan-trip" class="mobile-link" @click="mobileOpen = false">Plan Trip</a>
      <a href="/map" class="mobile-link" @click="mobileOpen = false">Map</a>
      <a href="/community" class="mobile-link" @click="mobileOpen = false">Community</a>
      <div class="mobile-auth">
        <template v-if="!user">
          <a href="/login" class="btn-login-m">Login</a>
          <a href="/register" class="btn-signup-m">Sign Up Free</a>
        </template>
        
        <div v-else class="mobile-profile-menu">
          <div class="mobile-profile-info">
            <div class="avatar">{{ user.full_name.charAt(0).toUpperCase() }}</div>
            <span class="user-name">{{ user.full_name }}</span>
          </div>
          <button @click="handleLogout" class="btn-logout-m">Logout</button>
        </div>
      </div>
    </div>

  </nav>
</template>

<script lang="ts">
import { computed, defineComponent, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
  name: 'NavBar',
  setup() {
    const mobileOpen = ref<boolean>(false)
    const router = useRouter()
    const route = useRoute()
    const currentPath = computed<string>(() => route.path)

    const user = ref<any>(null)

    onMounted(() => {
      const userData = localStorage.getItem('user_data')
      if (userData) {
        user.value = JSON.parse(userData)
      }
    })
    const handleLogout = () => {
      localStorage.removeItem('user_data')
      user.value = null
      router.push('/login')
    }

    return { mobileOpen, currentPath, user, handleLogout }
  }
})
</script>

<style scoped>
.navbar {
  background: #1a2340;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
}
.logo-text {
  font-family: 'Cinzel', serif;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}

.nav-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}
.nav-link {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 14px;
  color: rgba(255,255,255,0.65);
  text-decoration: none;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;
}
.nav-link:hover { color: #fff; }
.nav-link.active { color: #fff; border-bottom-color: #C8922A; }

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.btn-login {
  padding: 8px 18px;
  border: 1.5px solid rgba(255,255,255,0.4);
  border-radius: 6px;
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-login:hover { background: rgba(255,255,255,0.1); color: #fff; }
.btn-signup {
  padding: 8px 18px;
  background: #C8922A;
  border-radius: 6px;
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-signup:hover { background: #b07820; }

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  flex-shrink: 0;
}
.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 998;
}

.mobile-menu {
  position: fixed;
  top: 0;
  right: -100%;
  width: 270px;
  height: 100vh;
  background: #1a2340;
  z-index: 999;
  display: flex;
  flex-direction: column;
  padding: 80px 0 24px;
  transition: right 0.3s ease;
}
.mobile-menu.open { right: 0; }
.mobile-link {
  padding: 14px 28px;
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  font-size: 15px;
  font-family: 'DM Sans', sans-serif;
  border-left: 3px solid transparent;
  transition: all 0.15s;
}
.mobile-link:hover { color: #fff; background: rgba(255,255,255,0.06); border-left-color: #C8922A; }
.mobile-auth {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 28px;
  margin-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.btn-login-m {
  padding: 10px;
  border: 1.5px solid rgba(255,255,255,0.35);
  border-radius: 7px;
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  font-size: 14px;
  text-align: center;
}
.btn-signup-m {
  padding: 10px;
  background: #C8922A;
  border-radius: 7px;
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 34px;
  height: 34px;
  background: #C8922A;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
}

.user-name {
  color: white;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
}

.btn-logout {
  padding: 6px 14px;
  border: 1px solid rgba(255,255,255,0.4);
  background: transparent;
  border-radius: 6px;
  color: rgba(255,255,255,0.85);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: rgba(255, 60, 60, 0.2);
  border-color: rgba(255, 60, 60, 0.6);
  color: white;
}

/* Mobile Profile Styles */
.mobile-profile-menu {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mobile-profile-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-logout-m {
  padding: 10px;
  background: transparent;
  border: 1px solid rgba(255, 60, 60, 0.5);
  border-radius: 7px;
  color: #ff6b6b;
  font-size: 14px;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .nav-links { display: none; }
  .nav-actions { display: none; }
  .hamburger { display: flex; }
}
@media (max-width: 600px) {
  .navbar-container { padding: 0 20px; }
  .logo-text { font-size: 14px; }
}
</style>
