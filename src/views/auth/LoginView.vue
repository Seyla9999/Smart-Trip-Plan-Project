<template>
  <div class="auth-wrapper">
    <div class="auth-image">
      <img src="/root/travelcam_frontend/src/assets/phnom-penh.png" alt="Phnom Penh temple" />
    </div>

    <div class="auth-form-panel">
      <div class="auth-form-container">
        <h1 class="auth-title">Welcome Back</h1>
        <p class="auth-subtitle">Sign in to continue shopping your favorite stationery</p>

        <form class="auth-form" @submit.prevent="handleSignIn" novalidate>
          <div class="field-group">
            <input
              v-model="form.email"
              type="email"
              placeholder="Email"
              class="auth-input"
              :class="{ 'input-error': errors.email }"
              autocomplete="email"
            />
            <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
          </div>

          <div class="field-group">
            <div class="password-wrapper">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password"
                class="auth-input"
                :class="{ 'input-error': errors.password }"
                autocomplete="current-password"
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword" aria-label="Toggle password visibility">
                <EyeIcon v-if="!showPassword" />
                <EyeOffIcon v-else />
              </button>
            </div>
            <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
          </div>

          <div class="forgot-row">
            <RouterLink to="/auth/forgot-password" class="forgot-link">Forgot password?</RouterLink>
          </div>

          <button type="submit" class="btn-primary" :disabled="isLoading">
            <span v-if="isLoading" class="spinner" />
            <span v-else>Sign in</span>
          </button>

          <p v-if="apiError" class="api-error">{{ apiError }}</p>
        </form>

        <p class="auth-switch">
          Don't have an account?
          <RouterLink to="/register" class="auth-link">Sign up</RouterLink>
        </p>

        <div class="divider"><span>or</span></div>

        <div class="social-buttons">
          <button class="btn-social" @click="handleGoogleLogin" type="button">
            <GoogleIcon />
          </button>
          <button class="btn-social" @click="handleFacebookLogin" type="button">
            <FacebookIcon />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '/root/travelcam_frontend/src/stores/auth.ts'

// Icons (inline SVG components for simplicity — replace with your icon library if needed)
const EyeIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
}
const EyeOffIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
}
const GoogleIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`
}
const FacebookIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
}

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const showPassword = ref(false)
const isLoading = ref(false)
const apiError = ref('')

function validate(): boolean {
  errors.email = ''
  errors.password = ''
  let valid = true
  if (!form.email) { errors.email = 'Email is required'; valid = false }
  else if (!/\S+@\S+\.\S+/.test(form.email)) { errors.email = 'Enter a valid email'; valid = false }
  if (!form.password) { errors.password = 'Password is required'; valid = false }
  return valid
}

async function handleSignIn() {
  if (!validate()) return
  isLoading.value = true
  apiError.value = ''
  try {
    await authStore.signIn({ email: form.email, password: form.password })
    router.push('/')
  } catch (err: any) {
    apiError.value = err?.message ?? 'Sign in failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function handleGoogleLogin() {
  // TODO: integrate Google OAuth
}
function handleFacebookLogin() {
  // TODO: integrate Facebook OAuth
}
</script>

<style scoped>
.auth-wrapper {
  display: flex;
  min-height: 100vh;
  background: #fff;
}

.auth-image {
  flex: 1;
  overflow: hidden;
  max-width: 50%;
}

.auth-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auth-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-form-container {
  width: 100%;
  max-width: 360px;
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 0.35rem;
}

.auth-subtitle {
  font-size: 0.875rem;
  color: #666;
  margin: 0 0 1.75rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.auth-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: #fff;
  color: #111;
}

.auth-input:focus {
  border-color: #1e2a4a;
}

.auth-input.input-error {
  border-color: #ef4444;
}

.password-wrapper {
  position: relative;
}

.password-wrapper .auth-input {
  padding-right: 2.5rem;
}

.toggle-password {
  position: absolute;
  right: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  padding: 0;
}

.toggle-password:hover {
  color: #111;
}

.error-msg {
  font-size: 0.78rem;
  color: #ef4444;
}

.forgot-row {
  display: flex;
  justify-content: flex-start;
  margin-top: -0.25rem;
}

.forgot-link {
  font-size: 0.82rem;
  color: #555;
  text-decoration: none;
}

.forgot-link:hover {
  color: #1e2a4a;
  text-decoration: underline;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: #1e2a4a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.btn-primary:hover:not(:disabled) {
  background: #2d3f6e;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.api-error {
  font-size: 0.83rem;
  color: #ef4444;
  text-align: center;
  margin: 0;
}

.auth-switch {
  text-align: center;
  font-size: 0.85rem;
  color: #555;
  margin: 1.25rem 0 0;
}

.auth-link {
  color: #1e2a4a;
  font-weight: 600;
  text-decoration: none;
}

.auth-link:hover {
  text-decoration: underline;
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.25rem 0;
  color: #aaa;
  font-size: 0.82rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.social-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-social {
  width: 48px;
  height: 48px;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.btn-social:hover {
  border-color: #9ca3af;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

@media (max-width: 640px) {
  .auth-image { display: none; }
  .auth-wrapper { justify-content: center; }
}
</style>
