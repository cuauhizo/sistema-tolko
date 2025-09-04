<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">
        <i class="bi bi-box-seam me-2"></i>Sistema Tolko
      </RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul v-if="authStore.isAuthenticated" class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">Inicio</RouterLink>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Mi Trabajo
            </a>
            <ul class="dropdown-menu">
              <li><RouterLink class="dropdown-item" to="/my-tasks">Mis Tareas</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/my-work-orders">Mis Órdenes</RouterLink></li>
            </ul>
          </li>

          <li v-if="authStore.isAdmin" class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Gestión (Admin)
            </a>
            <ul class="dropdown-menu">
              <li><RouterLink class="dropdown-item" to="/products">Productos</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/categories">Categorías</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/inventory/movements">Movimientos de Inventario</RouterLink></li>
              <li><hr class="dropdown-divider"></li>
              <li><RouterLink class="dropdown-item" to="/users">Usuarios</RouterLink></li>
              <li><hr class="dropdown-divider"></li>
              <li><RouterLink class="dropdown-item" to="/tasks">Asignar Tareas</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/work-orders">Órdenes de Trabajo</RouterLink></li>
            </ul>
          </li>
        </ul>
        
        <ul v-if="authStore.isAuthenticated" class="navbar-nav ms-auto d-flex align-items-center flex-row">
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

<style scoped>
/* Estilo para que el enlace activo se vea más prominente, incluso en dropdowns */
.dropdown-item.router-link-active {
  background-color: #0d6efd; /* Color primario de Bootstrap */
  color: white;
}
.nav-link.router-link-active {
  font-weight: bold;
  color: white !important;
}
</style>