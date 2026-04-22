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