<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
      <a class="navbar-brand" href="#">Sistema Tolko</a>
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
          <li v-if="authStore.isAdmin" class="nav-item">
            <RouterLink class="nav-link" to="/categories">Categorías</RouterLink>
          </li>
          <li v-if="authStore.isAdmin" class="nav-item">
            <RouterLink class="nav-link" to="/products">Productos</RouterLink>
          </li>
          <li v-if="authStore.isAdmin" class="nav-item">
            <RouterLink class="nav-link" to="/users">Usuarios</RouterLink>
          </li>
          <li v-if="authStore.isAdmin" class="nav-item">
            <RouterLink class="nav-link" to="/work-orders">Órdenes de Trabajo</RouterLink>
          </li>
          <li v-if="authStore.isAdmin" class="nav-item">
            <RouterLink class="nav-link" to="/tasks">Tareas</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/my-tasks">Mis Tareas</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/my-work-orders">Mis Órdenes</RouterLink>
          </li>
          <li v-if="authStore.isAdmin" class="nav-item">
            <RouterLink class="nav-link" to="/inventory/movements"
              >Movimientos de Inventario</RouterLink>
          </li>
        </ul>
        <ul
          v-if="authStore.isAuthenticated"
          class="navbar-nav ms-auto d-flex align-items-center flex-row"
        >
          <li class="nav-item me-2">
            <span class="navbar-text"> Hola, {{ authStore.username }} </span>
          </li>
          <li class="nav-item">
            <button @click="handleLogout" class="btn btn-outline-light">Cerrar Sesión</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.router-link-active {
  font-weight: bold;
}
</style>
