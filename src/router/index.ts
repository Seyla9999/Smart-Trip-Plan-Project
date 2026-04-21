import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProvinceDetailView from '../views/ProvinceDetailView.vue'
import AttractionDetail from '../components/AttractionDetail.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/province/:slug',
      name: 'province-detail',
      component: ProvinceDetailView
    },
    {
      path: '/attraction/:id',
      name: 'AttractionDetail',
      component: AttractionDetail,
      props: true 
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router