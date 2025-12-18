import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login', // Root preusmeri na login
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
  },
  {
    path: '/meals',
    name: 'Meals',
    component: () => import('@/views/MealsView.vue'),
  },
  {
    path: '/mealshistory',
    name: 'MealsHistory',
    component: () => import('@/views/MealsHistory.vue'),
  },
  {
    path: '/goalmanager',
    name: 'GoalManager',
    component: () => import('@/views/GoalManagerView.vue'),
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
