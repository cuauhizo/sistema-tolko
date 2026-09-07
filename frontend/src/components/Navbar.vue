<script setup>
  import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
  import { RouterLink, useRouter, useRoute } from 'vue-router'
  import { useAuthStore } from '../stores/auth'
  import NotificationBell from './NotificationBell.vue'
  import SkeletonLoader from './SkeletonLoader.vue'

  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  // Estados reactivos para controlar la visibilidad
  const mobileMenuOpen = ref(false)
  const workDropdownOpen = ref(false)
  const adminDropdownOpen = ref(false)
  const profileDropdownOpen = ref(false)
  const navbarRef = ref(null)

  // NUEVO: Verificamos si el usuario tiene al menos un permiso para mostrar el menú "Gestión"
  const hasManagementAccess = computed(() => {
    return (
      authStore.hasPermission('read_suppliers') ||
      authStore.hasPermission('read_clients') ||
      authStore.hasPermission('read_categories') ||
      authStore.hasPermission('read_products') ||
      authStore.hasPermission('manage_users') ||
      authStore.hasPermission('read_tasks') ||
      authStore.hasPermission('read_workorders') ||
      authStore.hasPermission('read_inventory') ||
      authStore.hasPermission('manage_inventory')
    )
  })

  const handleLogout = () => {
    authStore.logout()
    router.push('/login')
  }

  // Funciones de control
  const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  const toggleWorkDropdown = () => {
    workDropdownOpen.value = !workDropdownOpen.value
    adminDropdownOpen.value = false
    profileDropdownOpen.value = false
  }

  const toggleAdminDropdown = () => {
    adminDropdownOpen.value = !adminDropdownOpen.value
    workDropdownOpen.value = false
    profileDropdownOpen.value = false
  }

  const toggleProfileDropdown = () => {
    profileDropdownOpen.value = !profileDropdownOpen.value
    workDropdownOpen.value = false
    adminDropdownOpen.value = false
  }

  const closeAllDropdowns = () => {
    workDropdownOpen.value = false
    adminDropdownOpen.value = false
    profileDropdownOpen.value = false
  }

  const handleClickOutside = event => {
    if (navbarRef.value && !navbarRef.value.contains(event.target)) {
      closeAllDropdowns()
      mobileMenuOpen.value = false
    }
  }

  const handleEscapeKey = event => {
    if (event.key === 'Escape') {
      closeAllDropdowns()
      mobileMenuOpen.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscapeKey)
  })

  watch(
    () => route.path,
    () => {
      closeAllDropdowns()
      mobileMenuOpen.value = false
    },
  )
</script>

<template>
  <nav class="bg-blue-600 shadow-sm w-full z-50" ref="navbarRef">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <RouterLink class="flex items-center text-white w-[200px] text-lg font-bold hover:text-blue-100 transition-colors" to="/">
          <i class="pi pi-box mr-2 !text-xl"></i>
          Sistema Tolko
        </RouterLink>

        <!-- Botón Móvil -->
        <button class="lg:hidden text-white hover:text-blue-200 focus:outline-none" type="button" @click="toggleMobileMenu">
          <i class="pi pi-bars !text-2xl"></i>
        </button>

        <div class="hidden lg:flex lg:items-center lg:w-full lg:justify-between ml-8">
          <ul v-if="authStore.isLoading" class="flex space-x-4 items-center">
            <li><SkeletonLoader width="60px" height="24px" radius="4px" /></li>
            <li><SkeletonLoader width="100px" height="24px" radius="4px" /></li>
            <li><SkeletonLoader width="140px" height="24px" radius="4px" /></li>
          </ul>

          <!-- ENLACES IZQUIERDOS REALES -->
          <ul v-else-if="authStore.isAuthenticated" class="flex space-x-1 items-center">
            <li>
              <RouterLink class="px-3 py-2 rounded-md text-white/80 hover:text-white font-medium hover:bg-blue-500 transition-colors" active-class="bg-blue-700 text-white font-bold" to="/" @click="closeAllDropdowns">Inicio</RouterLink>
            </li>

            <li class="relative">
              <button @click.prevent="toggleWorkDropdown" class="px-3 py-2 rounded-md text-white/80 hover:text-white font-medium hover:bg-blue-500 transition-colors flex items-center">
                Mi Trabajo
                <i class="pi pi-angle-down ml-1 text-sm"></i>
              </button>
              <div v-show="workDropdownOpen" class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                <RouterLink class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/my-tasks" @click="closeAllDropdowns">Mis Tareas</RouterLink>
                <RouterLink class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/my-work-orders" @click="closeAllDropdowns">Mis Órdenes</RouterLink>
              </div>
            </li>

            <!-- GESTIÓN: Visible solo si tiene al menos un permiso de los siguientes -->
            <li v-if="authStore.hasPermission('read_suppliers') || authStore.hasPermission('read_clients') || authStore.hasPermission('read_inventory') || authStore.hasPermission('manage_users')" class="relative">
              <button @click.prevent="toggleAdminDropdown" class="px-3 py-2 rounded-md text-white/80 hover:text-white font-medium hover:bg-blue-500 transition-colors flex items-center">
                Gestión
                <i class="pi pi-angle-down ml-1 text-sm"></i>
              </button>

              <div v-show="adminDropdownOpen" class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                <!-- Proveedores -->
                <RouterLink
                  v-if="authStore.hasPermission('read_suppliers')"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  active-class="bg-blue-50 text-blue-700 font-bold"
                  to="/suppliers"
                  @click="closeAllDropdowns">
                  Proveedores
                </RouterLink>

                <!-- Clientes -->
                <RouterLink v-if="authStore.hasPermission('read_clients')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/clients" @click="closeAllDropdowns">
                  Clientes
                </RouterLink>

                <!-- Inventario -->
                <RouterLink
                  v-if="authStore.hasPermission('read_inventory')"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  active-class="bg-blue-50 text-blue-700 font-bold"
                  to="/categories"
                  @click="closeAllDropdowns">
                  Categorías
                </RouterLink>
                <RouterLink
                  v-if="authStore.hasPermission('read_inventory')"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  active-class="bg-blue-50 text-blue-700 font-bold"
                  to="/products"
                  @click="closeAllDropdowns">
                  Productos
                </RouterLink>

                <!-- Usuarios y Permisos -->
                <RouterLink v-if="authStore.hasPermission('manage_users')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/users" @click="closeAllDropdowns">
                  Usuarios
                </RouterLink>
                <RouterLink
                  v-if="authStore.hasPermission('manage_users')"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  active-class="bg-blue-50 text-blue-700 font-bold"
                  to="/permissions"
                  @click="closeAllDropdowns">
                  Matriz de Permisos
                </RouterLink>

                <hr class="border-gray-200 my-1" />

                <!-- Gestión de Órdenes -->
                <RouterLink v-if="authStore.hasPermission('read_tasks')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/tasks" @click="closeAllDropdowns">
                  Asignar Tareas
                </RouterLink>
                <RouterLink
                  v-if="authStore.hasPermission('read_workorders')"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  active-class="bg-blue-50 text-blue-700 font-bold"
                  to="/work-orders"
                  @click="closeAllDropdowns">
                  Órdenes de Trabajo
                </RouterLink>

                <!-- Historial Inventario -->
                <template v-if="authStore.hasPermission('read_inventory')">
                  <hr class="border-gray-200 my-1" />
                  <RouterLink class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/inventory/adjustments" @click="closeAllDropdowns">
                    Ajustes de Inventario
                  </RouterLink>
                  <RouterLink class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/inventory/movements" @click="closeAllDropdowns">Historial de Mov.</RouterLink>
                </template>
              </div>
            </li>
          </ul>

          <ul v-if="authStore.isLoading" class="flex items-center space-x-4">
            <li><SkeletonLoader width="36px" height="36px" radius="8px" /></li>
            <li><SkeletonLoader width="140px" height="36px" radius="6px" /></li>
          </ul>

          <ul v-else-if="authStore.isAuthenticated" class="flex items-center space-x-2">
            <NotificationBell />

            <li class="relative">
              <button @click.prevent="toggleProfileDropdown" class="px-3 py-2 rounded-md text-white font-medium flex items-center hover:bg-blue-500 transition-colors">
                <i class="pi pi-user mr-2"></i>
                Hola, {{ authStore.username }}
                <i class="pi pi-angle-down ml-1 text-sm"></i>
              </button>

              <div v-show="profileDropdownOpen" class="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                <RouterLink class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/profile" @click="closeAllDropdowns">
                  <i class="pi pi-key mr-2 text-gray-400"></i>
                  Cambiar Contraseña
                </RouterLink>
                <hr class="border-gray-200 my-1" />
                <a href="#" @click.prevent="handleLogout" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700">
                  <i class="pi pi-sign-out mr-2"></i>
                  Cerrar Sesión
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- MENÚ MÓVIL (Con permisos granulares) -->
    <div v-show="mobileMenuOpen" class="lg:hidden bg-blue-700 px-2 pt-2 pb-3 space-y-1 shadow-inner">
      <RouterLink class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800 font-bold" to="/" @click="toggleMobileMenu">Inicio</RouterLink>

      <div class="px-3 py-2 text-blue-200 text-sm font-semibold uppercase tracking-wider mt-2">Mi Trabajo</div>
      <RouterLink class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/my-tasks" @click="toggleMobileMenu">Mis Tareas</RouterLink>
      <RouterLink class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/my-work-orders" @click="toggleMobileMenu">Mis Órdenes</RouterLink>

      <template v-if="hasManagementAccess">
        <div class="px-3 py-2 text-blue-200 text-sm font-semibold uppercase tracking-wider mt-2">Gestión</div>
        <RouterLink v-if="authStore.hasPermission('read_suppliers')" class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/suppliers" @click="toggleMobileMenu">
          Proveedores
        </RouterLink>
        <RouterLink v-if="authStore.hasPermission('read_clients')" class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/clients" @click="toggleMobileMenu">Clientes</RouterLink>
        <RouterLink v-if="authStore.hasPermission('read_categories')" class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/categories" @click="toggleMobileMenu">
          Categorías
        </RouterLink>
        <RouterLink v-if="authStore.hasPermission('read_products')" class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/products" @click="toggleMobileMenu">Productos</RouterLink>
        <RouterLink v-if="authStore.hasPermission('manage_users')" class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/users" @click="toggleMobileMenu">Usuarios</RouterLink>
        <RouterLink v-if="authStore.hasPermission('manage_users')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/permissions" @click="closeAllDropdowns">
          Matriz de Permisos
        </RouterLink>
        <hr v-if="authStore.hasPermission('read_tasks') || authStore.hasPermission('read_workorders')" class="border-blue-500 my-1" />

        <RouterLink v-if="authStore.hasPermission('read_tasks')" class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/tasks" @click="toggleMobileMenu">Asignar Tareas</RouterLink>
        <RouterLink v-if="authStore.hasPermission('read_workorders')" class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/work-orders" @click="toggleMobileMenu">
          Órdenes de Trabajo
        </RouterLink>

        <hr v-if="authStore.hasPermission('manage_inventory') || authStore.hasPermission('read_inventory')" class="border-blue-500 my-1" />

        <RouterLink v-if="authStore.hasPermission('manage_inventory')" class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/inventory/adjustments" @click="toggleMobileMenu">
          Ajustes de Inventario
        </RouterLink>
        <RouterLink v-if="authStore.hasPermission('read_inventory')" class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/inventory/movements" @click="toggleMobileMenu">
          Historial de Mov.
        </RouterLink>
      </template>

      <div class="px-3 py-2 text-blue-200 text-sm font-semibold uppercase tracking-wider mt-2 border-t border-blue-500 pt-3">Mi Cuenta</div>
      <RouterLink class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/profile" @click="toggleMobileMenu">Cambiar Contraseña</RouterLink>
      <a href="#" @click.prevent="handleLogout" class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-red-200 hover:bg-blue-600 hover:text-white">Cerrar Sesión</a>
    </div>
  </nav>
</template>
