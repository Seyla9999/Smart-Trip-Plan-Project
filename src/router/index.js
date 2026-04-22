import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import VerifyView from '../views/auth/VerifyView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/verify', name: 'verify', component: VerifyView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router