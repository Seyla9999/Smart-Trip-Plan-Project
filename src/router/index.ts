import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import VerifyView from '../views/auth/VerifyView.vue'
import AdminView from '../views/AdminView.vue'
import Admin_Dashboard from '../views/Admin_Dashboard.vue'
import UserView from '../views/UserView.vue'
import User_Discover from '../views/User_Discover.vue'
import CommunityView from '../views/CommunityView.vue'
import ProvinceDetailView from '../views/ProvinceDetailView.vue'
import AttractionDetail from '../components/AttractionDetail.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/verify',
      name: 'verify',
      component: VerifyView,
    },
    {
      path: '/admin',
      component: AdminView,
      children: [
        { path: '', name: 'admin-dashboard', component: Admin_Dashboard },
      ],
    },
    {
      path: '/discover',
      component: UserView,
      children: [
        { path: '', name: 'discover', component: User_Discover },
      ],
    },
    {
      path: '/user',
      redirect: '/discover',
    },
    {
      path: '/user/discover',
      redirect: '/discover',
    },
    {
      path: '/community',
      name: 'community',
      component: CommunityView,
    },
    {
      path: '/province/:slug',
      name: 'province-detail',
      component: ProvinceDetailView,
    },
    {
      path: '/province/:slug/:placeSlug',
      name: 'place-detail',
      component: AttractionDetail,
      props: true,
    },
    {
      path: '/attraction/:id',
      name: 'AttractionDetail',
      redirect: (to) => `/province/koh-kong/${to.params.id}`,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  const publicRoutes = ['home', 'login', 'register', 'verify', 'discover']
  
  if (!token && !publicRoutes.includes(to.name)) {
    next('/login')
  } else {
    next()
  }
})

export default router
