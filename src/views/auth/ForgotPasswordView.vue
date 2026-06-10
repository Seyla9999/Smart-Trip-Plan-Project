<template>
  <AuthLayout imagePosition="right">
    <!-- Step 1: Enter Email -->
    <form v-if="step === 1" class="form" @submit.prevent="handleSendCode">
      <h1>Forgot Password?</h1>
      <p class="subtitle">Enter your email and we’ll send you a one-time code.</p>

      <input
        v-model="email"
        type="email"
        placeholder="Email"
        :class="{ invalid: emailError }"
      />
      <p v-if="emailError" class="field-error">{{ emailError }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send OTP' }}
      </button>

      <p @click="$router.push('/login')" class="link">
        Back to Sign in
      </p>
    </form>

    <!-- Step 2: Verify OTP -->
    <form v-else-if="step === 2" class="form" @submit.prevent="handleVerifyCode">
      <h1>Verify OTP</h1>
      <p class="subtitle">Check your email and enter the code we sent.</p>

      <input
        v-model="resetCode"
        type="text"
        placeholder="Enter OTP"
        maxlength="6"
        :class="{ invalid: codeError }"
      />
      <p v-if="codeError" class="field-error">{{ codeError }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Verifying...' : 'Verify OTP' }}
      </button>

      <p @click="goBack(1)" class="link">
        Change email address
      </p>
    </form>

    <!-- Step 3: Reset Password -->
    <form v-else-if="step === 3" class="form" @submit.prevent="handleResetPassword">
      <h1>Reset Password</h1>
      <p class="subtitle">Your OTP is verified. Set your new password now.</p>

      <div class="password-wrapper">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="newPassword"
          placeholder="New Password"
          :class="{ invalid: passwordError }"
        />
        <component
          :is="showPassword ? EyeSlashIcon : EyeIcon"
          class="eye-icon"
          @click="showPassword = !showPassword"
        />
      </div>

      <!-- PASSWORD RULES -->
      <div class="password-rules">
        <p :class="{ valid: newPassword.length >= 8 }">• At least 8 characters</p>
        <p :class="{ valid: /[A-Z]/.test(newPassword) }">• One uppercase letter</p>
        <p :class="{ valid: /[0-9]/.test(newPassword) }">• One number</p>
      </div>

      <p v-if="passwordError" class="field-error">{{ passwordError }}</p>

      <div class="password-wrapper">
        <input
          :type="showConfirm ? 'text' : 'password'"
          v-model="confirmPassword"
          placeholder="Confirm Password"
          :class="{ invalid: confirmError }"
        />
        <component
          :is="showConfirm ? EyeSlashIcon : EyeIcon"
          class="eye-icon"
          @click="showConfirm = !showConfirm"
        />
      </div>
      <p v-if="confirmError" class="field-error">{{ confirmError }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Resetting...' : 'Reset Password' }}
      </button>

      <p @click="goBack(2)" class="link">
        Back to OTP verification
      </p>
    </form>

    <!-- Success Modal -->
    <div v-if="dialogVisible" class="dialog-overlay">
      <div class="dialog-box">
        <div class="icon success">✓</div>
        <p class="message">{{ dialogMessage }}</p>
        <button @click="handleSuccess">OK</button>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import API from '@/api/axios'

const router = useRouter()

// Step control
const step = ref(1)
const loading = ref(false)

// Inputs
const email = ref('')
const resetCode = ref('')
const resetToken = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)

// Dialog
const dialogVisible = ref(false)
const dialogMessage = ref('')

// Validation
const submitted = ref(false)

const emailError = computed(() => {
  if (!submitted.value) return ''
  if (!email.value) return 'Email is required'
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
  if (!valid) return 'Invalid email format'
  return ''
})

const codeError = computed(() => {
  if (!submitted.value) return ''
  if (!resetCode.value) return 'OTP is required'
  return ''
})

const passwordError = computed(() => {
  if (!submitted.value) return ''
  if (!newPassword.value) return 'Password is required'
  if (newPassword.value.length < 8) return 'At least 8 characters required'
  if (!/[A-Z]/.test(newPassword.value)) return 'Must contain uppercase letter'
  if (!/[0-9]/.test(newPassword.value)) return 'Must contain a number'
  return ''
})

const confirmError = computed(() => {
  if (!submitted.value) return ''
  if (!confirmPassword.value) return 'Please confirm password'
  if (confirmPassword.value !== newPassword.value) return 'Passwords do not match'
  return ''
})

const handleSendCode = async () => {
  submitted.value = true
  if (emailError.value) return

  try {
    loading.value = true
    await API.post('/auth/forgot-password', { email: email.value })
    step.value = 2
    submitted.value = false
  } catch (err) {
    dialogMessage.value = err.response?.data?.message || 'Failed to send OTP'
    dialogVisible.value = true
  } finally {
    loading.value = false
  }
}

const formatErrorMessage = (err) => {
  const message = err.response?.data?.message
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string') return message
  return err.message || 'Action failed'
}

const handleVerifyCode = async () => {
  submitted.value = true
  if (codeError.value) return

  try {
    loading.value = true
    const response = await API.post('/auth/verify-reset-code', {
      email: email.value,
      code: resetCode.value,
    })

    const token = response.data?.resetToken || response.data?.token || response.data?.reset_token
    if (!token) {
      dialogMessage.value = 'OTP verified, but no reset token was returned.'
      dialogVisible.value = true
      return
    }

    resetToken.value = token
    step.value = 3
    submitted.value = false
  } catch (err) {
    dialogMessage.value = formatErrorMessage(err)
    dialogVisible.value = true
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  submitted.value = true
  if (passwordError.value || confirmError.value) return

  if (!resetToken.value) {
    dialogMessage.value = 'Reset token is missing. Please verify your OTP again.'
    dialogVisible.value = true
    return
  }

  try {
    loading.value = true
    await API.post('/auth/reset-password', {
      email: email.value,
      resetToken: resetToken.value,
      newPassword: newPassword.value,
    })
    dialogMessage.value = 'Password reset successfully! Redirecting to login...'
    dialogVisible.value = true
  } catch (err) {
    dialogMessage.value = formatErrorMessage(err)
    dialogVisible.value = true
  } finally {
    loading.value = false
  }
}

const goBack = (targetStep = 1) => {
  submitted.value = false
  if (targetStep === 1) {
    step.value = 1
    resetCode.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } else if (targetStep === 2) {
    step.value = 2
    newPassword.value = ''
    confirmPassword.value = ''
  }
}

const handleSuccess = () => {
  dialogVisible.value = false
  router.push('/login')
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

.subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin: 0;
  line-height: 1.5;
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

.password-rules {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  margin-top: -8px;
}

.password-rules p {
  font-size: 12px;
  color: #999;
  margin: 6px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-rules p.valid {
  color: #2e7d32;
  font-weight: 500;
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
}

.icon {
  font-size: 48px;
  line-height: 1;
  margin-bottom: 16px;
}

.icon.success {
  color: #2e7d32;
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
  width: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .form {
    max-width: 100%;
    padding: 24px 16px;
  }

  h1 {
    font-size: 24px;
  }

  .subtitle {
    font-size: 13px;
  }
}
</style>
