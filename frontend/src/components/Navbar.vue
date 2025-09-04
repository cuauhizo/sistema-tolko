<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Estados reactivos para controlar la visibilidad
const mobileMenuOpen = ref(false)
const workDropdownOpen = ref(false)
const adminDropdownOpen = ref(false)

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
  adminDropdownOpen.value = false // Cerrar el otro
}

const toggleAdminDropdown = () => {
  adminDropdownOpen.value = !adminDropdownOpen.value
  workDropdownOpen.value = false // Cerrar el otro
}

const closeAllDropdowns = () => {
  workDropdownOpen.value = false
  adminDropdownOpen.value = false
}

// Función para cerrar dropdowns al hacer click fuera
const handleClickOutside = (event) => {
  if (navbarRef.value && !navbarRef.value.contains(event.target)) {
    closeAllDropdowns()
    mobileMenuOpen.value = false
  }
}

// Función para cerrar dropdowns con la tecla Escape
const handleEscapeKey = (event) => {
  if (event.key === 'Escape') {
    closeAllDropdowns()
    mobileMenuOpen.value = false
  }
}

// Agregar y remover event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscapeKey)
})

// Cerrar dropdowns cuando cambie la ruta
watch(() => route.path, () => {
  closeAllDropdowns()
  mobileMenuOpen.value = false
})
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm" ref="navbarRef">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">
        <i class="bi bi-box-seam me-2"></i>Sistema Tolko
      </RouterLink>
      
      <button
        class="navbar-toggler"
        type="button"
        @click="toggleMobileMenu"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="navbar-collapse" :class="{ 'show': mobileMenuOpen }">
        <ul v-if="authStore.isAuthenticated" class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/" @click="closeAllDropdowns">Inicio</RouterLink>
          </li>

          <!-- Dropdown Mi Trabajo -->
          <li class="nav-item dropdown" :class="{ 'show': workDropdownOpen }">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              @click.prevent="toggleWorkDropdown"
            >
              Mi Trabajo
            </a>
            <ul class="dropdown-menu" :class="{ 'show': workDropdownOpen }">
              <li>
                <RouterLink 
                  class="dropdown-item" 
                  to="/my-tasks"
                  @click="closeAllDropdowns"
                >
                  Mis Tareas
                </RouterLink>
              </li>
              <li>
                <RouterLink 
                  class="dropdown-item" 
                  to="/my-work-orders"
                  @click="closeAllDropdowns"
                >
                  Mis Órdenes
                </RouterLink>
              </li>
            </ul>
          </li>

          <!-- Dropdown Admin -->
          <li v-if="authStore.isAdmin" class="nav-item dropdown" :class="{ 'show': adminDropdownOpen }">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              @click.prevent="toggleAdminDropdown"
            >
              Gestión (Admin)
            </a>
            <ul class="dropdown-menu" :class="{ 'show': adminDropdownOpen }">
              <li>
                <RouterLink class="dropdown-item" to="/categories" @click="closeAllDropdowns">
                  Categorías
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" to="/products" @click="closeAllDropdowns">
                  Productos
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" to="/users" @click="closeAllDropdowns">
                  Usuarios
                </RouterLink>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <RouterLink class="dropdown-item" to="/tasks" @click="closeAllDropdowns">
                  Asignar Tareas
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" to="/work-orders" @click="closeAllDropdowns">
                  Órdenes de Trabajo
                </RouterLink>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <RouterLink class="dropdown-item" to="/inventory/movements" @click="closeAllDropdowns">
                  Movimientos de Inventario
                </RouterLink>
              </li>
            </ul>
          </li>
        </ul>

        <ul v-if="authStore.isAuthenticated" class="navbar-nav ms-auto d-flex align-items-center">
          <li class="nav-item me-3">
            <span class="navbar-text">
              <i class="bi bi-person-circle me-1"></i>
              Hola, {{ authStore.username }}
            </span>
          </li>
          <li class="nav-item">
            <button @click="handleLogout" class="btn btn-outline-light btn-sm">
              <i class="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<!-- <style scoped>
.dropdown-item.router-link-active {
  background-color: #0d6efd;
  color: white;
}

.nav-link.router-link-active {
  font-weight: bold;
  color: white !important;
}

/* Navbar collapse */
.navbar-collapse {
  display: none;
}

.navbar-collapse.show {
  display: block;
}

/* Dropdown styles */
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  display: none;
  min-width: 10rem;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  font-size: 1rem;
  color: #212529;
  text-align: left;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0,0,0,.15);
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,.175);
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.25rem 1rem;
  clear: both;
  font-weight: 400;
  color: #212529;
  text-align: inherit;
  text-decoration: none;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
  transition: all 0.15s ease-in-out;
}

.dropdown-item:hover,
.dropdown-item:focus {
  color: #1e2125;
  background-color: #e9ecef;
  text-decoration: none;
}

.dropdown-divider {
  height: 0;
  margin: 0.5rem 0;
  overflow: hidden;
  border-top: 1px solid #e9ecef;
}

.dropdown-toggle::after {
  display: inline-block;
  margin-left: 0.255em;
  vertical-align: 0.255em;
  content: "";
  border-top: 0.3em solid;
  border-right: 0.3em solid transparent;
  border-bottom: 0;
  border-left: 0.3em solid transparent;
}

/* Responsive design */
@media (min-width: 992px) {
  .navbar-collapse {
    display: flex !important;
  }
  
  .navbar-nav.ms-auto {
    flex-direction: row !important;
    align-items: center !important;
  }
}

@media (max-width: 991.98px) {
  .navbar-nav.ms-auto {
    flex-direction: column !important;
    align-items: flex-start !important;
  }
  
  .navbar-nav.ms-auto .nav-item {
    margin-bottom: 0.5rem;
  }
  
  .dropdown-menu {
    position: static;
    display: none;
    width: 100%;
    margin-top: 0;
    border: 0;
    box-shadow: none;
    background-color: rgba(255,255,255,0.1);
  }
  
  .dropdown-item {
    color: rgba(255,255,255,0.75);
  }
  
  .dropdown-item:hover {
    color: white;
    background-color: rgba(255,255,255,0.1);
  }
}
</style> -->