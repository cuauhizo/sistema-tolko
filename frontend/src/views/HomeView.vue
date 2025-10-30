<script setup>
import { useAuthStore } from '../stores/auth'
import AdminDashboard from '../components/AdminDashboard.vue' // <-- Renombraremos el contenido
import UserDashboard from '../components/UserDashboard.vue' // <-- El nuevo componente

const authStore = useAuthStore()
</script>

<template>
  <div class="container my-4" v-if="authStore.isAuthenticated">
    <h1 class="mb-4">Dashboard</h1>
    <h4 class="text-muted mb-4">Bienvenido, {{ authStore.username }}</h4>

    <AdminDashboard v-if="authStore.isAdmin" />
    <UserDashboard v-else />
  </div>
</template>

<style scoped>
/* Estilos para las tarjetas de estadísticas */
.card {
  border: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

/* Estilos para las tarjetas de acceso rápido */
.card-link-wrapper {
  text-decoration: none;
  /* Quita el subrayado del enlace */
  color: inherit;
  /* Hereda el color del texto */
}

.card-link-wrapper .card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
}

.card-link-wrapper .card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-body.d-flex {
  padding-bottom: 1.5rem;
  /* Ajuste para el botón en la parte inferior */
}
</style>
