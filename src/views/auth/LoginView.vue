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
import { ref, computed } from 'vue'
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
.form {
  width: 420px;
  padding: 45px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  gap: 16px;

  animation: fadeIn 0.6s ease;
}

h1 {
  font-size: 36px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 10px;
}

input {
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #ddd;
  transition: all 0.25s ease;
}

input:focus {
  border-color: #2e7d32;
  box-shadow: 0 0 5px rgba(46,125,50,0.3);
  outline: none;
}

button {
  padding: 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2e7d32, #66bb6a);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

button:disabled {
  background: #aaa;
  cursor: not-allowed;
}

.invalid {
  border: 1px solid #d32f2f !important;
  background: #fff5f5;
}

.field-error {
  color: #d32f2f;
  font-size: 13px;
  margin-top: -10px;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  width: 100%;
  padding: 14px;
  padding-right: 45px;
}

.eye-icon {
  width: 22px;
  height: 22px;
  position: absolute;
  right: 12px;
  cursor: pointer;
  color: #666;
  transition: 0.2s;
}

.eye-icon:hover {
  color: #2e7d32;
}

.toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}

.link {
  cursor: pointer;
  text-align: center;
}

.link:hover {
  text-decoration: underline;
}

.forgot {
  font-size: 14px;
  color: gray;
  cursor: pointer;
  text-align: right;
}

.forgot:hover {
  color: black;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.dialog-box {
  width: 320px;
  background: white;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 15px 40px rgba(0,0,0,0.2);
  animation: fadeIn 0.3s ease;
}

.icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.icon.success {
  color: #2e7d32;
}

.icon.error {
  color: #d32f2f;
}

.message {
  margin: 15px 0;
  font-size: 16px;
}

.dialog-box button {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: #2e7d32;
  color: white;
  cursor: pointer;
}

.dialog-box button:hover {
  opacity: 0.8;
}
</style>