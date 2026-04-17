import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ProvinceDetailView from "../views/ProvinceDetailView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/province/:slug",
      name: "province-detail",
      component: ProvinceDetailView,
    },
  ],
});

export default router;
