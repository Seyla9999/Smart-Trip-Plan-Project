<template>
  <AuthLayout imagePosition="right">
    <div class="form">
      <h1>Welcome Back</h1>

      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />

      <button @click="handleLogin">Sign in</button>
      
      <p class="forgot">Forgot Password?</p>
      <p @click="$router.push('/register')">
        Don’t have account? Sign up
      </p>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { login } from '@/services/auth.service'

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    alert('Please fill all fields')
    return
  }
  try {
    const res = await login(email.value, password.value)

    console.log(res.data)

    alert('Login success')
  } catch (err) {
    alert('Login failed')
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
  background: rgb(38, 94, 1);
  color: white;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  opacity: 0.8;
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
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>