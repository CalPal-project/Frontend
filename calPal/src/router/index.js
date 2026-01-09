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
// Simple auth check
const checkAuth = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return false;
  
  // Preveri če je token potekel (lokalno)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

router.beforeEach((to, from, next) => {
  console.log(`Router: ${from.path} -> ${to.path}`);
  
  // Če stran zahteva avtentikacijo
  if (to.meta.requiresAuth) {
    if (checkAuth()) {
      next(); // Nadaljuj
    } else {
      console.log("Not authenticated, redirecting to login");
      next('/login'); // Redirect na login
    }
  } 
  // Če gre na login in je že prijavljen
  else if (to.path === '/login' && checkAuth()) {
    next('/dashboard'); // Redirect na dashboard
  }
  // Vse ostalo
  else {
    next();
  }
})



export default router
