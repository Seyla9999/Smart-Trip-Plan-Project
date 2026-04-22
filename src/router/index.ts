import { createRouter, createWebHistory } from 'vue-router'
import Admin_Dashboard from '../views/Admin_Dashboard.vue'
import AdminView from '../views/AdminView.vue'
import UserView from '../views/UserView.vue'
import User_Discover from '../views/User_Discover.vue'

const routes = [
{
    path: '/admin',
    component: AdminView,
    children: [
        { path: '', name: 'admin-dashboard', component: Admin_Dashboard }
    ]
},
{
    path: '/user',
    component: UserView,
    children: [
        { path: 'discover', name: 'user-discover', component: User_Discover }
    ]
}
]

export default createRouter({
    history: createWebHistory(),
    routes
})
import HomeView from '../views/HomeView.vue'
import CommunityView from '../views/CommunityView.vue'
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
      path: '/community',
      name: 'community',
      component: CommunityView
    },
    {
      path: '/attraction/:id',
      name: 'AttractionDetail',
      component: AttractionDetail,
      props: true 
    }
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
