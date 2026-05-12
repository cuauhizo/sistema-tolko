<script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { RouterLink, useRouter, useRoute } from 'vue-router'
  import { useAuthStore } from '../stores/auth'
  import NotificationBell from './NotificationBell.vue'

  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  // Estados reactivos para controlar la visibilidad
  const mobileMenuOpen = ref(false)
  const workDropdownOpen = ref(false)
  const adminDropdownOpen = ref(false)
  const profileDropdownOpen = ref(false) // <- ¡Aquí está la variable nueva!

  // Referencias para los elementos del navbar
  const navbarRef = ref(null)

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

  // Nueva función para el menú del usuario
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

  // Función para cerrar dropdowns al hacer click fuera
  const handleClickOutside = event => {
    if (navbarRef.value && !navbarRef.value.contains(event.target)) {
      closeAllDropdowns()
      mobileMenuOpen.value = false
    }
  }

  // Función para cerrar dropdowns con la tecla Escape
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
        <RouterLink class="flex items-center text-white w-[200px] text-lg font-bold hover:text-blue-100 transition-colors" to="/">
          <i class="pi pi-box mr-2 !text-xl"></i>
          Sistema Tolko
        </RouterLink>

        <button class="lg:hidden text-white hover:text-blue-200 focus:outline-none" type="button" @click="toggleMobileMenu">
          <i class="pi pi-bars !text-2xl"></i>
        </button>

        <div class="hidden lg:flex lg:items-center lg:w-full lg:justify-between ml-8">
          <ul v-if="authStore.isAuthenticated" class="flex space-x-1 items-center">
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

            <li v-if="authStore.isAdmin" class="relative">
              <button @click.prevent="toggleAdminDropdown" class="px-3 py-2 rounded-md text-white/80 hover:text-white font-medium hover:bg-blue-500 transition-colors flex items-center">
                Gestión (Admin)
                <i class="pi pi-angle-down ml-1 text-sm"></i>
              </button>
              <div v-show="adminDropdownOpen" class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                <RouterLink class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/categories" @click="closeAllDropdowns">Categorías</RouterLink>
                <RouterLink class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/products" @click="closeAllDropdowns">Productos</RouterLink>
                <RouterLink class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/users" @click="closeAllDropdowns">Usuarios</RouterLink>
                <hr class="border-gray-200 my-1" />
                <RouterLink class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/tasks" @click="closeAllDropdowns">Asignar Tareas</RouterLink>
                <RouterLink class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/work-orders" @click="closeAllDropdowns">Órdenes de Trabajo</RouterLink>
                <hr class="border-gray-200 my-1" />
                <RouterLink class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/inventory/adjustments" @click="closeAllDropdowns">Ajustes de Inventario</RouterLink>
                <RouterLink class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" active-class="bg-blue-50 text-blue-700 font-bold" to="/inventory/movements" @click="closeAllDropdowns">Historial de Mov.</RouterLink>
              </div>
            </li>
          </ul>

          <ul v-if="authStore.isAuthenticated" class="flex items-center space-x-2">
            <NotificationBell />

            <li class="relative">
              <button @click.prevent="toggleProfileDropdown" class="px-3 py-2 rounded-md text-white font-medium flex items-center hover:bg-blue-500 transition-colors">
                <i class="pi pi-user mr-2"></i>
                Hola, {{ authStore.username }}
                <i class="pi pi-angle-down ml-1 text-sm"></i>
              </button>

              <div v-show="profileDropdownOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
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

    <div v-show="mobileMenuOpen" class="lg:hidden bg-blue-700 px-2 pt-2 pb-3 space-y-1 shadow-inner">
      <RouterLink class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800 font-bold" to="/" @click="toggleMobileMenu">Inicio</RouterLink>

      <div class="px-3 py-2 text-blue-200 text-sm font-semibold uppercase tracking-wider mt-2">Mi Trabajo</div>
      <RouterLink class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/my-tasks" @click="toggleMobileMenu">Mis Tareas</RouterLink>
      <RouterLink class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/my-work-orders" @click="toggleMobileMenu">Mis Órdenes</RouterLink>

      <template v-if="authStore.isAdmin">
        <div class="px-3 py-2 text-blue-200 text-sm font-semibold uppercase tracking-wider mt-2">Gestión</div>
        <RouterLink class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/categories" @click="toggleMobileMenu">Categorías</RouterLink>
        <RouterLink class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/products" @click="toggleMobileMenu">Productos</RouterLink>
        <RouterLink class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/users" @click="toggleMobileMenu">Usuarios</RouterLink>
      </template>

      <div class="px-3 py-2 text-blue-200 text-sm font-semibold uppercase tracking-wider mt-2 border-t border-blue-500 pt-3">Mi Cuenta</div>
      <RouterLink class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-white hover:bg-blue-600" active-class="bg-blue-800" to="/profile" @click="toggleMobileMenu">Cambiar Contraseña</RouterLink>
      <a href="#" @click.prevent="handleLogout" class="block px-3 py-2 pl-6 rounded-md text-base font-medium text-red-200 hover:bg-blue-600 hover:text-white">Cerrar Sesión</a>
    </div>
  </nav>
</template>
