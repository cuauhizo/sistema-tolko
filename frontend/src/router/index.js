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
import AdjustmentsView from '../views/AdjustmentsView.vue'
import ProfileView from '../views/ProfileView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import SuppliersView from '../views/SuppliersView.vue'
import ClientsView from '../views/ClientsView.vue'
import RolePermissions from '../views/RolePermissions.vue'

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
      meta: { requiresAuth: true, requiredPermission: 'read_categories' },
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
      meta: { requiresAuth: true, requiredPermission: 'read_products' },
    },
    {
      path: '/clients',
      name: 'clients',
      component: ClientsView,
      meta: { requiresAuth: true, requiredPermission: 'read_clients' },
    },
    {
      path: '/permissions',
      name: 'RolePermissions',
      component: RolePermissions,
      meta: { requiresAuth: true, requiredPermission: 'manage_users' },
    },
    {
      path: '/suppliers',
      name: 'suppliers',
      component: SuppliersView,
      meta: { requiresAuth: true, requiredPermission: 'read_suppliers' },
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requiresAuth: true, requiredPermission: 'manage_users' },
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: TasksView,
      meta: { requiresAuth: true, requiredPermission: 'read_tasks' },
    },
    {
      path: '/work-orders',
      name: 'work-orders',
      component: WorkOrdersView,
      meta: { requiresAuth: true, requiredPermission: 'read_workorders' },
    },
    {
      path: '/work-orders/:id',
      name: 'work-order-detail',
      component: WorkOrderDetailView,
      meta: { requiresAuth: true, requiredPermission: 'read_workorders' },
    },
    {
      path: '/inventory/movements',
      name: 'inventory-movements',
      component: InventoryMovementsView,
      meta: { requiresAuth: true, requiredPermission: 'read_inventory' },
    },
    {
      path: '/inventory/adjustments',
      name: 'inventory-adjustments',
      component: AdjustmentsView,
      meta: { requiresAuth: true, requiredPermission: 'manage_inventory' },
    },
    // Rutas operativas (solo requieren estar logueado)
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
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    // Ruta para manejar rutas no encontradas (404)
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

// Guard de navegación (Navigation Guard) actualizado a Permisos Granulares
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 1. Si la ruta requiere autenticación y no hay sesión, al login.
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login' })
  }

  // 2. Si la ruta requiere un permiso específico, verificamos que lo tenga
  if (to.meta.requiredPermission && !authStore.hasPermission(to.meta.requiredPermission)) {
    // Si no tiene el permiso, lo mandamos al inicio (o a una página de 403)
    return next({ name: 'home' })
  }

  // 3. Si todo está bien, lo dejamos pasar
  next()
})

export default router
