import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import HomeView from '../views/HomeView.vue'; // Crea un HomeView.vue simple
import LoginView from '../views/LoginView.vue';
import ProductsView from '../views/ProductsView.vue'; // El que ya tenías

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true } // Esta ruta requiere autenticación
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
      meta: { requiresAuth: true } // Esta también
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    }
  ]
});

// Guard de navegación (Navigation Guard)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Si la ruta requiere autenticación y el usuario no está logueado, redirige a /login
    next({ name: 'login' });
  } else if (to.name === 'login' && isAuthenticated) {
    // Si el usuario ya está logueado, no debe poder acceder a /login de nuevo
    next({ name: 'home' });
  } else {
    // En cualquier otro caso, permite la navegación
    next();
  }
});

export default router;