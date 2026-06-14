<template>
  <div class="max-h-full max-w-full">
    <NavBar v-if="showGlobalLayout" />
    <router-view />
    <Footer v-if="showGlobalLayout" />

    <ChatBotButton
  @toggle="chatbotOpen = !chatbotOpen"
/>

<ChatBotWindow
  v-if="chatbotOpen"
  @close="chatbotOpen = false"
/>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { clearAuthSession, isAuthSessionExpired, markAuthActivity } from '@/services/auth-session.service'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'

import ChatBotButton from '@/components/chatbot/ChatBotButton.vue'
import ChatBotWindow from '@/components/chatbot/ChatBotWindow.vue'

const chatbotOpen = ref(false)

const route = useRoute()
const authPaths = ['/login', '/register', '/verify', '/forgot-password']
const showGlobalLayout = computed(() => {
  const isAuthRoute = authPaths.includes(route.path)
  const isAdminRoute = route.path.startsWith('/admin')
  return !isAuthRoute && !isAdminRoute
})

const redirectToLogin = () => {
  clearAuthSession()
  window.location.href = '/login?timeout=1'
}

const checkSession = () => {
  if (!localStorage.getItem('auth_token')) return

  if (isAuthSessionExpired()) {
    redirectToLogin()
  }
}

const handleActivity = () => {
  checkSession()
  if (localStorage.getItem('auth_token')) {
    markAuthActivity()
  }
}

const activityEvents = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart', 'focus'] as const
let sessionTimer: number | undefined

onMounted(() => {
  checkSession()

  activityEvents.forEach((eventName) => {
    window.addEventListener(eventName, handleActivity, { passive: true })
  })

  document.addEventListener('visibilitychange', checkSession)

  if (localStorage.getItem('auth_token')) {
    markAuthActivity()
  }

  sessionTimer = window.setInterval(checkSession, 30 * 1000)
})

onBeforeUnmount(() => {
  activityEvents.forEach((eventName) => {
    window.removeEventListener(eventName, handleActivity)
  })

  document.removeEventListener('visibilitychange', checkSession)

  if (sessionTimer) {
    window.clearInterval(sessionTimer)
  }
})
</script>
