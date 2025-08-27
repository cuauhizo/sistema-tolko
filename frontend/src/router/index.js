import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import HomeView from '../views/HomeView.vue' // Crea un HomeView.vue simple
import LoginView from '../views/LoginView.vue'
import ProductsView from '../views/ProductsView.vue' // El que ya tenías
import UsersView from '../views/UsersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }, // Esta ruta requiere autenticación
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
      meta: { requiresAuth: true }, // Esta también
    },
    {
      path: '/users', // <-- AÑADE LA NUEVA RUTA
      name: 'users',
      component: UsersView,
      meta: { requiresAuth: true, requiresAdmin: true }, // <-- Ruta protegida y solo para admins
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
  ],
})

// Guard de navegación (Navigation Guard)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login' })
  }

  // Si la ruta requiere admin y el usuario no lo es, lo redirigimos
  if (to.meta.requiresAdmin && !authStore.isAdmin) { // <-- Necesitaremos añadir `isAdmin` a la store
    return next({ name: 'home' }) // O a una página de "Acceso Denegado"
  }

  next()
})

export default router
