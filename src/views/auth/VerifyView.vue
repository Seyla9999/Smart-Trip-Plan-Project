<template>
  <AuthLayout imagePosition="right">
    <div class="form">
      <h1>Verify Account</h1>

      <input v-model="email" placeholder="Email" />
      <input v-model="code" placeholder="Enter verification code" />

      <button :disabled="loading" @click="handleVerify">
        {{ loading ? 'Verifying...' : 'Verify' }}
      </button>

      <p v-if="message">{{ message }}</p>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { verify } from '@/services/auth.service'

const email = ref('')
const code = ref('')
const message = ref('')
const loading = ref(false)

const route = useRouter()

const handleVerify = async () => {
  if (!email.value || !code.value) {
    alert('Please fill all fields')
    return
  }

  try {
    loading.value = true
    email.value = route.query.email || ''

    const res = await verify({
      email: email.value,
      code: code.value
    })

    message.value = res.data.message

    // 👉 redirect to login after success
    setTimeout(() => {
      route.push('/login')
    }, 1500)

  } catch (err) {
    message.value = err.response?.data?.message || 'Verification failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form {
  width: 400px;
  padding: 40px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 18px;
}
</style>