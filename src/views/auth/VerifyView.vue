<template>
  <AuthLayout>
    <div class="form">
      <h1>Verify Email</h1>
      <p class="subtitle">Enter the 6-digit code sent to your email</p>

      <!-- OTP -->
      <div class="otp-container">
        <input
          v-for="(digit, index) in otp"
          :key="index"
          ref="inputs"
          type="number"
          inputmode="numeric"
          maxlength="1"
          min="0"
          max="9"
          v-model="otp[index]"
          @input="moveNext(index)"
          @keydown.backspace="moveBack(index)"
        />
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>

      <button :disabled="loading" @click="handleVerify">
        {{ loading ? 'Verifying...' : 'Verify' }}
      </button>

      <p class="resend">
        Didn’t receive code?
        <span @click="handleResend" :class="{ disabled: countdown > 0 }">
          Resend {{ countdown > 0 ? `(${countdown}s)` : '' }}
        </span>
      </p>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { verify, resendCode } from '@/services/auth.service'

const router = useRouter()
const route = useRoute()
const REDIRECT_KEY = 'post_auth_redirect'

const email = localStorage.getItem('verify_email')
const redirectPath = ref(typeof route.query.redirect === 'string' ? route.query.redirect : localStorage.getItem(REDIRECT_KEY) || '')

const otp = ref(['', '', '', '', '', ''])
const inputs = ref([])

const error = ref('')
const success = ref('')
const loading = ref(false)
const countdown = ref(0)

onMounted(() => {
  if (!email) {
    router.push('/register') // fallback
  }

  if (typeof route.query.redirect === 'string' && route.query.redirect) {
    localStorage.setItem(REDIRECT_KEY, route.query.redirect)
    redirectPath.value = route.query.redirect
  }
})

// 👉 Auto move next
const moveNext = (i) => {
  if (otp.value[i] && i < 5) {
    inputs.value[i + 1].focus()
  }
}

// 👉 Backspace
const moveBack = (i) => {
  if (!otp.value[i] && i > 0) {
    inputs.value[i - 1].focus()
  }
}

// 👉 Verify
const handleVerify = async () => {
  error.value = ''
  success.value = ''

  const code = otp.value.join('')

  if (code.length !== 6) {
    error.value = 'Please enter full code'
    return
  }

  try {
    loading.value = true

    const res = await verify({
      email,
      code
    })

    success.value = res.data.message

    // clear saved email
    localStorage.removeItem('verify_email')

    setTimeout(() => {
      const nextRedirect = redirectPath.value || localStorage.getItem(REDIRECT_KEY) || ''
      router.push(nextRedirect ? { path: '/login', query: { redirect: nextRedirect } } : '/login')
    }, 1500)

  } catch (err) {
    error.value =
      err.response?.data?.message || 'Verification failed'
  } finally {
    loading.value = false
  }
}

// 👉 Resend
const handleResend = async () => {
  if (countdown.value > 0) return

  try {
    await resendCode({ email })

    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value === 0) clearInterval(timer)
    }, 1000)

  } catch (err) {
    error.value = 'Failed to resend'
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
  gap: 22px;
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
  font-size: 15px;
  text-align: center;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.otp-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 0;
}

.otp-container input {
  width: 48px;
  height: 56px;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  border: 1.5px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: #fafafa;
  font-family: 'Courier New', 'Courier', monospace;
  color: #333;
}

.otp-container input:focus {
  border-color: #2e7d32;
  background: white;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
  outline: none;
}

.otp-container input::-webkit-outer-spin-button,
.otp-container input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.otp-container input[type=number] {
  -moz-appearance: textfield;
}

.error {
  color: #d32f2f;
  font-size: 13px;
  text-align: center;
  padding: 12px 14px;
  background: #fff8f7;
  border-radius: 10px;
  border-left: 3px solid #d32f2f;
  font-weight: 500;
  margin: -4px 0 0 0;
}

.success {
  color: #2e7d32;
  font-size: 13px;
  text-align: center;
  padding: 12px 14px;
  background: #f1f8f4;
  border-radius: 10px;
  border-left: 3px solid #2e7d32;
  font-weight: 600;
  margin: -4px 0 0 0;
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

.resend {
  text-align: center;
  font-size: 13px;
  color: #666;
  margin: 4px 0 0 0;
}

.resend span {
  color: #2e7d32;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;
  display: inline;
  margin-left: 2px;
}

.resend span:not(.disabled):active {
  color: #1b5e20;
}

.resend span.disabled {
  color: #bbb;
  cursor: not-allowed;
  font-weight: 500;
}

/* Mobile: 375px to 480px */
@media (max-width: 480px) {
  .form {
    padding: 28px 18px;
    border-radius: 16px;
    gap: 20px;
  }

  h1 {
    font-size: 26px;
    margin-bottom: 4px;
  }

  .subtitle {
    font-size: 14px;
  }

  .otp-container {
    gap: 8px;
    padding: 4px 0;
  }

  .otp-container input {
    width: 44px;
    height: 52px;
    font-size: 20px;
    border-radius: 10px;
  }

  .error,
  .success {
    font-size: 12px;
    padding: 10px 12px;
  }

  button {
    padding: 16px;
    font-size: 15px;
    min-height: 52px;
    border-radius: 10px;
  }

  .resend {
    font-size: 12px;
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

  .subtitle {
    font-size: 16px;
  }

  .otp-container {
    gap: 12px;
  }

  .otp-container input {
    width: 52px;
    height: 60px;
    font-size: 24px;
    border-radius: 12px;
  }

  button {
    padding: 18px;
    min-height: 56px;
  }

  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(46, 125, 50, 0.2);
  }

  .resend span:not(.disabled):hover {
    text-decoration: underline;
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

  .subtitle {
    font-size: 16px;
  }

  .error,
  .success {
    font-size: 14px;
  }

  .resend {
    font-size: 14px;
  }
}
</style>