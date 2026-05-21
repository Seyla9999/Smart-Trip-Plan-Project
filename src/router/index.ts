import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import VerifyView from '../views/auth/VerifyView.vue'
import AdminView from '../views/AdminView.vue'
import Admin_Dashboard from '../views/Admin_Dashboard.vue'
import Admin_Destination from '../views/Admin_Destination.vue'
import Admin_Moderation from '../views/Admin_Moderation.vue'
import Admin_User from '../views/Admin_User.vue'
import Admin_Setting from '../views/Admin_Setting.vue'
import UserView from '../views/UserView.vue'
import User_Discover from '../views/User_Discover.vue'
import CommunityView from '../views/CommunityView.vue'
import ProvinceDetailView from '../views/ProvinceDetailView.vue'
import AboutView from '../views/AboutView.vue'
import AttractionDetail from '../components/AttractionDetail.vue'
import TripPlannerView from '../views/TripPlannerView.vue'
import TripFormView from '../views/TripFormView.vue'
import TripResultsView from '../views/TripResultsView.vue'
import MapView from '../views/MapView.vue'
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/verify",
      name: "verify",
      component: VerifyView,
    },
    {
      path: "/admin",
      component: AdminView,
      children: [
        { path: '', name: 'admin-dashboard', component: Admin_Dashboard },
        { path: 'destination', name: 'admin-destination', component: Admin_Destination },
        { path: 'moderation', name: 'admin-moderation', component: Admin_Moderation },
        { path: 'user', name: 'admin-user', component: Admin_User },
        { path: 'setting', name: 'admin-setting', component: Admin_Setting },
      ],
    },
    {
      path: "/discover",
      component: UserView,
      children: [{ path: "", name: "discover", component: User_Discover }],
    },
    {
      path: "/map",
      name: "map",
      component: MapView,
    },
    {
      path: "/user",
      redirect: "/discover",
    },
    {
      path: "/user/discover",
      redirect: "/discover",
    },
    {
      path: "/community",
      name: "community",
      component: CommunityView,
    },
    {
      path: "/trip",
      component: TripPlannerView,
      children: [
        { path: "", name: "trip", component: TripFormView },
        { path: "results", name: "trip-results", component: TripResultsView },
      ],
    },
    {
      path: "/plan-trip",
      redirect: "/trip",
    },
    {
      path: "/province/:slug",
      name: "province-detail",
      component: ProvinceDetailView,
    },
    {
      path: "/province/:slug/:placeSlug",
      name: "place-detail",
      component: AttractionDetail,
      props: true,
    },
    {
      path: "/attraction/:id",
      name: "AttractionDetail",
      component: AttractionDetail,
    },
    {
      path: "/about",
      name: "about",
      component: AboutView,
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView,
    },
    {
      path: "/profile/trips",
      component: ProfileView,
    },
    {
      path: "/profile/stories",
      component: ProfileView,
    },
    {
      path: "/profile/bookmarks",
      component: ProfileView,
    },
    {
      path: "/profile/settings",
      component: ProfileView,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    return { top: 0 };
  },
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("auth_token");
  const rawUser = localStorage.getItem('user_data') || localStorage.getItem('user') || localStorage.getItem('currentUser')
  let isAdminUser = false

  if (rawUser) {
    try {
      const user = JSON.parse(rawUser)
      const role = String(user?.role || user?.user_role || '').trim().toLowerCase()
      isAdminUser = role === 'admin'
    } catch {
      isAdminUser = false
    }
  }

  if (to.path.startsWith('/admin')) {
    if (!token) {
      next('/login')
      return
    }

    if (!isAdminUser) {
      next('/')
      return
    }
  }

  const publicRoutes = [
    "home",
    "login",
    "register",
    "verify",
    "discover",
    "map",
    "trip",
    "trip-results",
    "province-detail",
    "place-detail",
    "AttractionDetail",
  ];
  const routeName = typeof to.name === "string" ? to.name : "";

  if (!token && !publicRoutes.includes(routeName)) {
    next("/login");
  } else {
    next();
  }
});

export default router;
