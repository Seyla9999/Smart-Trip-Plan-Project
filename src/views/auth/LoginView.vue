<template>
  <AuthLayout imagePosition="right">
    <form class="form" @submit.prevent="handleLogin">
      <h1>Welcome Back</h1>

      <input v-model="email" placeholder="Email" :class="{ invalid: emailError }" />
      <p v-if="emailError" class="field-error">{{ emailError }}</p>

      <!-- <input
        v-model="password"
        type="password"
        placeholder="Password"
        :class="{ invalid: passwordError }"
      /> -->
      <div class="password-wrapper">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="Password"
          :class="{ invalid: passwordError }"
        />

        <component
          :is="showPassword ? EyeSlashIcon : EyeIcon"
          class="eye-icon"
          @click="showPassword = !showPassword"
        />
      </div>
      <p v-if="passwordError" class="field-error">{{ passwordError }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>

      <p class="forgot">Forgot Password?</p>

      <p @click="$router.push('/register')" class="link">
        Don’t have account? Sign up
      </p>
    </form>
    <div v-if="dialogVisible" class="dialog-overlay">
      <div class="dialog-box">
        
        <div class="icon" :class="dialogType">
          {{ dialogType === 'success' ? '✓' : '!' }}
        </div>

        <p class="message">{{ dialogMessage }}</p>

        <button @click="dialogVisible = false">OK</button>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { login } from '@/services/auth.service'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const submitted = ref(false)
const showPassword = ref(false)
const dialogVisible = ref(false)
const dialogMessage = ref('')
const dialogType = ref('success') 

const router = useRouter()
const route = useRoute()
const REDIRECT_KEY = 'post_auth_redirect'

const timeoutMessage = computed(() => {
  const timeoutValue = route.query.timeout
  return timeoutValue === '1' || timeoutValue === 'true'
})

onMounted(() => {
  if (timeoutMessage.value) {
    showDialog('Your session has timed out. Please log in again.', 'error')
  }
})

const getNormalizedRole = (user) => {
  const role = user?.role || user?.user_role || ''
  return String(role).trim().toLowerCase()
}

const emailError = computed(() => {
  if (!submitted.value) return '' 
  if (!email.value) return 'Email is required'

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
  if (!valid) return 'Invalid email format'
  return ''
})

const passwordError = computed(() => {
  if (!submitted.value) return ''
  if (!password.value) return 'Password is required'
  return ''
})

const handleLogin = async () => {
  submitted.value = true
  error.value = ''
  success.value = ''

  if (!email.value || !password.value) {
    error.value = 'Please fill all fields'
    return
  }

  try {
    loading.value = true

    const res = await login({
      email: email.value,
      password: password.value
    })
    
    localStorage.setItem('user_data', JSON.stringify(res.data.user));
    window.dispatchEvent(new Event('user-updated'))
    success.value = res.data.message

    setTimeout(() => {
      const redirectPath = typeof route.query.redirect === 'string'
        ? route.query.redirect
        : localStorage.getItem(REDIRECT_KEY) || ''
      if (redirectPath) localStorage.removeItem(REDIRECT_KEY)

      const nextRoute = redirectPath || (getNormalizedRole(res.data.user) === 'admin' ? '/admin' : '/')
      router.replace(nextRoute)
    }, 1200)

  } catch (err) {
    error.value =
      err.response?.data?.message ||
      err.message ||
      'Login failed'
    showDialog(error.value, 'error')
  } finally {
    loading.value = false
  }
}

const showDialog = (message, type = 'success') => {
  dialogMessage.value = message
  dialogType.value = type
  dialogVisible.value = true
}

</script>

<style scoped>
* {
  box-sizing: border-box;
}

.form {
  width: 100%;
  max-width: 380px;
  padding: 32px 20px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin: 0;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

input {
  width: 100%;
  padding: 16px 14px;
  border: 1.5px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  transition: all 0.3s ease;
  background: #fafafa;
  color: #333;
}

input::placeholder {
  color: #999;
}

input:focus {
  border-color: #2e7d32;
  background: white;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
  outline: none;
}

input.invalid {
  border-color: #d32f2f;
  background: #fff8f7;
}

.field-error {
  font-size: 12px;
  color: #d32f2f;
  margin-top: -12px;
  display: block;
  font-weight: 500;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  padding-right: 48px;
  width: 100%;
}

.eye-icon {
  position: absolute;
  right: 14px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.eye-icon:active {
  color: #2e7d32;
}

button {
  width: 100%;
  padding: 18px 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 56px;
}

button:active {
  transform: scale(0.98);
}

button:disabled {
  background: linear-gradient(135deg, #ccc 0%, #aaa 100%);
  cursor: not-allowed;
}

.forgot {
  text-align: center;
  font-size: 14px;
  color: #2e7d32;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;
  margin: 0;
}

.forgot:active {
  color: #1b5e20;
}

.link {
  text-align: center;
  font-size: 14px;
  color: #2e7d32;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;
  margin: 0;
}

.link:active {
  color: #1b5e20;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  animation: fadeIn 0.3s ease;
}

.dialog-box {
  width: 100%;
  max-width: 320px;
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
}

.icon {
  font-size: 48px;
  line-height: 1;
  margin-bottom: 16px;
}

.icon.success {
  color: #2e7d32;
}

.icon.error {
  color: #d32f2f;
}

.message {
  font-size: 15px;
  color: #333;
  margin: 16px 0;
  line-height: 1.5;
}

.dialog-box button {
  padding: 14px 28px;
  margin-top: 16px;
  font-size: 14px;
  min-height: 48px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Mobile: 375px to 480px */
@media (max-width: 480px) {
  .form {
    padding: 28px 18px;
    border-radius: 16px;
    gap: 18px;
  }

  h1 {
    font-size: 26px;
    margin-bottom: 4px;
  }

  input {
    padding: 15px 12px;
    font-size: 16px;
    border-radius: 10px;
  }

  button {
    padding: 16px;
    min-height: 52px;
    border-radius: 10px;
  }

  .field-error {
    font-size: 11px;
    margin-top: -10px;
  }

  .forgot,
  .link {
    font-size: 13px;
  }

  .dialog-box {
    padding: 24px 20px;
    max-width: 280px;
  }

  .icon {
    font-size: 44px;
    margin-bottom: 12px;
  }

  .message {
    font-size: 14px;
  }

  .dialog-box button {
    padding: 12px 24px;
    min-height: 44px;
  }
}

/* Tablet: 640px and up */
@media (min-width: 640px) {
  .form {
    padding: 40px 32px;
    max-width: 420px;
  }

  h1 {
    font-size: 32px;
  }

  input {
    padding: 16px 14px;
    font-size: 16px;
  }

  button {
    padding: 18px;
    min-height: 56px;
  }

  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(46, 125, 50, 0.2);
  }

  .forgot:hover,
  .link:hover {
    text-decoration: underline;
  }

  .eye-icon:hover {
    color: #2e7d32;
  }

  .dialog-box button:hover {
    opacity: 0.95;
  }
}

/* Desktop: 1024px and up */
@media (min-width: 1024px) {
  .form {
    padding: 48px 40px;
    max-width: 460px;
  }

  h1 {
    font-size: 36px;
  }
}
</style>