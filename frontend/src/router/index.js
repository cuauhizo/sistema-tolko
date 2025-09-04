import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ProductsView from '../views/ProductsView.vue'
import UsersView from '../views/UsersView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import TasksView from '../views/TasksView.vue'
import MyTasksView from '../views/MyTasksView.vue'
import WorkOrdersView from '../views/WorkOrdersView.vue'
import WorkOrderDetailView from '../views/WorkOrderDetailView.vue'
import InventoryMovementsView from '../views/InventoryMovementsView.vue'
import MyWorkOrdersView from '../views/MyWorkOrdersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: TasksView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/work-orders',
      name: 'work-orders',
      component: WorkOrdersView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/work-orders/:id',
      name: 'work-order-detail',
      component: WorkOrderDetailView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/inventory/movements',
      name: 'inventory-movements',
      component: InventoryMovementsView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/my-tasks',
      name: 'my-tasks',
      component: MyTasksView,
      meta: { requiresAuth: true },
    },
    {
      path: '/my-work-orders',
      name: 'my-work-orders',
      component: MyWorkOrdersView,
      meta: { requiresAuth: true },
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
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // <-- Necesitaremos añadir `isAdmin` a la store
    return next({ name: 'home' }) // O a una página de "Acceso Denegado"
  }

  next()
})

export default router
