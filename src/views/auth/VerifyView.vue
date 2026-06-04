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
          maxlength="1"
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
.form {
  width: 420px;
  padding: 45px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 20px; /* Ensures it doesn't touch screen edges on mobile */
}

.otp-container {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.otp-container input {
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  border: 2px solid #ddd;
  border-radius: 12px;
  transition: all 0.3s;
}

.otp-container input:focus {
  border-color: #2e7d32;
  box-shadow: 0 0 10px rgba(46,125,50,0.2);
  outline: none;
}

/* Responsive Media Query */
@media (max-width: 480px) {
  .form {
    width: 90%;
    padding: 30px 20px;
  }
  .otp-container input {
    width: 40px;
    height: 50px;
  }
}
</style>