<template>
  <AuthLayout imagePosition="left">
    <div class="form">
      <h1>Create Account</h1>

      <input v-model="email" placeholder="Email" />
      <input v-model="full_name" placeholder="Full Name" />
      <input v-model="password" type="password" placeholder="Password" />
      <input v-model="confirmPassword" type="password" placeholder="Confirm Password" />

      <button @click="handleRegister">Sign up</button>

      <p @click="$router.push('/login')">
        Already have account? Sign in
      </p>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { register } from '@/services/auth.service'

const email = ref('')
const full_name = ref('')
const password = ref('')
const confirmPassword = ref('')

const handleRegister = async () => {
  if (!email.value || !full_name.value || !password.value) {
    alert('Please fill all fields')
    return
  }
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match')
    return
  }

  try {
    await register({
      email: email.value,
      full_name: full_name.value,
      password: password.value
    })

    alert('Register success')
  } catch (err) {
    alert('Register failed')
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

  animation: fadeIn 0.6s ease;
}
h1 {
  font-size: 40px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 20px;
}
input {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: 0.3s;
}

input:focus {
  border-color: black;
  outline: none;
}

button {
  padding: 12px;
  border-radius: 8px;
  background: black;
  color: white;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  opacity: 0.8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>