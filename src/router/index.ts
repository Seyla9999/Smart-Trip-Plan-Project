import { createRouter, createWebHistory } from 'vue-router'
import AttractionDetail from '../components/AttractionDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/attraction/:id',
      name: 'AttractionDetail',
      component: AttractionDetail
    },
    {
      path: '/',
      name: 'Home',
      component: { template: '<div style="padding:4rem 2rem;text-align:center;font-size:1.5rem;">🏠 Home Page (replace with your Home component)</div>' }
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router