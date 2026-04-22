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
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { verify, resendCode } from '@/services/auth.service'

const router = useRouter()

const email = localStorage.getItem('verify_email')

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
      router.push('/login')
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