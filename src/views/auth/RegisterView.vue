<template>
  <AuthLayout imagePosition="left" class="">
    <form class="form" @submit.prevent="handleRegister">
      <h1>Create Account</h1>

      <input
        v-model="email"
        placeholder="Email"
        :class="{ invalid: emailError }"
      />
      <p v-if="emailError" class="field-error">{{ emailError }}</p>

      <input
        v-model="full_name"
        placeholder="Full Name"
        :class="{ invalid: nameError }"
      />
      <p v-if="nameError" class="field-error">{{ nameError }}</p>

      <div class="password-wrapper">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="Password"
          :class="{ invalid: passwordError }"
        />

        <component
          :is="showPassword ? EyeSlashIcon : EyeIcon"
          class="eye"
          @click="showPassword = !showPassword"
        />
      </div>

      <!-- PASSWORD RULES -->
      <div class="password-rules">
        <p :class="{ valid: password.length >= 8 }">• At least 8 characters</p>
        <p :class="{ valid: /[A-Z]/.test(password) }">• One uppercase letter</p>
        <p :class="{ valid: /[0-9]/.test(password) }">• One number</p>
      </div>


      <div class="password-wrapper">
        <input
          :type="showConfirm ? 'text' : 'password'"
          v-model="confirmPassword"
          placeholder="Confirm Password"
          :class="{ invalid: confirmError }"
        />

        <component
          :is="showConfirm ? EyeSlashIcon : EyeIcon"
          class="eye"
          @click="showConfirm = !showConfirm"
        />
      </div>
      <p v-if="confirmError" class="field-error">{{ confirmError }}</p>

      <p v-if="message" :class="['message', isSuccess ? 'success-text' : 'error-text']">
        {{ message }}
      </p>

      <button
        type="submit"
        :disabled="loading || !formValid"
      >
        {{ loading ? 'Creating...' : 'Sign up' }}
      </button>

      <p class="link" @click="$router.push('/login')">
        Already have account? Sign in
      </p>
    </form>
  </AuthLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

import AuthLayout from '@/layouts/AuthLayout.vue'
import { register } from '@/services/auth.service'

const router = useRouter()
const route = useRoute()
const REDIRECT_KEY = 'post_auth_redirect'

const email = ref('')
const full_name = ref('')
const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const loading = ref(false)
const submitted = ref(false)
const isSuccess = ref(false)

const showPassword = ref(false)
const showConfirm = ref(false)

const emailError = computed(() => {
  if (!submitted.value) return ''
  if (!email.value) return 'Email is required'

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
  if (!valid) return 'Invalid email format'

  return ''
})

const nameError = computed(() => {
  if (!submitted.value) return ''
  if (!full_name.value) return 'Full name is required'
  if (full_name.value.length < 3) return 'Name too short'
  return ''
})

const passwordError = computed(() => {
  if (!submitted.value) return ''
  if (!password.value) return 'Password is required'

  if (password.value.length < 8)
    return 'Must be at least 8 characters'

  if (!/[A-Z]/.test(password.value))
    return 'Must include uppercase letter'

  if (!/[0-9]/.test(password.value))
    return 'Must include a number'

  return ''
})

const confirmError = computed(() => {
  if (!submitted.value) return ''
  if (!confirmPassword.value) return 'Please confirm password'

  if (confirmPassword.value !== password.value)
    return 'Passwords do not match'

  return ''
})

const formValid = computed(() => {
  return (
    !emailError.value &&
    !nameError.value &&
    !passwordError.value &&
    !confirmError.value
  )
})

const handleRegister = async () => {
  submitted.value = true
  if (!formValid.value) return

  try {
    loading.value = true

    const res = await register({
      email: email.value,
      full_name: full_name.value,
      password: password.value
    })

    localStorage.setItem('verify_email', email.value)

    const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    if (redirectPath) {
      localStorage.setItem(REDIRECT_KEY, redirectPath)
    }

    isSuccess.value = true
    message.value = res.data.message
    setTimeout(() => {
      router.push({ path: '/verify', query: redirectPath ? { redirect: redirectPath } : {} })
    }, 800)
  } catch (err) {
    console.error('ERROR:', err)
    isSuccess.value = false
    message.value = err.response?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
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
  gap: 18px;
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
  animation: shake 0.3s ease;
}

@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-4px); }
  100% { transform: translateX(0); }
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

.eye {
  position: absolute;
  right: 14px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.eye:active {
  color: #2e7d32;
}

.password-rules {
  background: #f5f7fa;
  border-left: 3px solid #2e7d32;
  padding: 12px 14px;
  border-radius: 8px;
  margin: -4px 0 4px 0;
}

.password-rules p {
  font-size: 12px;
  color: #666;
  margin: 6px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.password-rules .valid {
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

.message {
  border-radius: 10px;
  padding: 12px 14px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  display: block;
  border-left: 3px solid;
}

.message.error-text {
  color: #d32f2f;
  background: #fff8f7;
  border-left-color: #d32f2f;
}

.message.success-text {
  color: #2e7d32;
  background: #f1f8f4;
  border-left-color: #2e7d32;
}

/* Mobile: 375px to 480px */
@media (max-width: 480px) {
  .form {
    padding: 28px 18px;
    border-radius: 16px;
    gap: 16px;
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

  .password-rules {
    padding: 10px 12px;
    margin: -2px 0 2px 0;
  }

  .password-rules p {
    font-size: 11px;
    margin: 4px 0;
  }

  .link {
    font-size: 13px;
  }

  .message {
    font-size: 12px;
    padding: 10px 12px;
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

  .link:hover {
    text-decoration: underline;
  }

  .eye:hover {
    color: #2e7d32;
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