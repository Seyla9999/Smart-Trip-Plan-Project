import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '../api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('access_token'))

  async function signIn(credentials: any) {
    const { data } = await authApi.signIn(credentials)
    token.value = data.access_token
    user.value = data.user
    localStorage.setItem('access_token', data.access_token)
  }

  async function signUp(payload: any) {
    const { data } = await authApi.signUp(payload)
    // Backend should send verification email here
    return data
  }

  function handleGoogleLogin() {
    // Redirects to the NestJS Google OAuth route
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
  }

  function signOut() {
    user.value = null
    token.value = null
    localStorage.removeItem('access_token')
  }

  return { user, token, signIn, signUp, signOut, handleGoogleLogin }
})