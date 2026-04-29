<template>
  <AuthLayout imagePosition="left" class="">
    <div class="form">
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
          type="password"
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

      <p v-if="message" class="message">{{ message }}</p>

      <button
        :disabled="loading || !formValid"
        @click="handleRegister"
      >
        {{ loading ? 'Creating...' : 'Sign up' }}
      </button>

      <p class="link" @click="$router.push('/login')">
        Already have account? Sign in
      </p>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

import AuthLayout from '@/layouts/AuthLayout.vue'
import { register } from '@/services/auth.service'

const router = useRouter()

const email = ref('')
const full_name = ref('')
const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const loading = ref(false)
const submitted = ref(false)

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

    message.value = res.data.message
    setTimeout(() => {
      router.push('/verify')
    }, 800)
  } catch (err) {
    console.error('ERROR:', err)
    message.value = err.response?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
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
  gap: 14px;
}

input {
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #ddd;
  transition: 0.25s;
}

input:focus {
  border-color: #2e7d32;
  box-shadow: 0 0 5px rgba(46,125,50,0.3);
  outline: none;
}

.invalid {
  border: 1px solid #d32f2f;
  background: #fff5f5;
  animation: shake 0.2s;
}

@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  50% { transform: translateX(3px); }
  75% { transform: translateX(-3px); }
  100% { transform: translateX(0); }
}

.field-error {
  color: #d32f2f;
  font-size: 13px;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  width: 100%;
  padding-right: 40px;
}

.eye {
  width: 22px;
  position: absolute;
  right: 12px;
  top: 14px;
  cursor: pointer;
  color: #777;
}

.eye:hover {
  color: #2e7d32;
}

.password-rules {
  font-size: 13px;
  color: #777;
}

.password-rules p {
  margin: 2px 0;
}

.password-rules .valid {
  color: #2e7d32;
}

button {
  padding: 14px;
  border-radius: 10px;
  background: linear-gradient(135deg,#2e7d32,#66bb6a);
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
}

button:disabled {
  background: #aaa;
}

.link {
  text-align: center;
  cursor: pointer;
}
.message {
  color: #ff0000;
}
</style>