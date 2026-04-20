import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '../api/auth.ts'

interface User {
  id: number
  email: string
  username: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('access_token'))

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('access_token', newToken)
  }

  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem('access_token')
  }

  async function signIn(credentials: { email: string; password: string }) {
    const data = await authApi.signIn(credentials)
    setToken(data.access_token)
    user.value = data.user
  }

  async function signUp(payload: { email: string; username: string; password: string }) {
    const data = await authApi.signUp(payload)
    setToken(data.access_token)
    user.value = data.user
  }

  async function fetchProfile() {
    if (!token.value) return
    user.value = await authApi.getProfile()
  }

  function signOut() {
    clearAuth()
  }

  const isAuthenticated = () => !!token.value

  return { user, token, signIn, signUp, signOut, fetchProfile, isAuthenticated }
})