<script setup>
import { onMounted } from 'vue'
import { useUserDashboardStore } from '../stores/userDashboard'
import { useAuthStore } from '../stores/auth'
import { RouterLink } from 'vue-router'

const userDashboardStore = useUserDashboardStore()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    userDashboardStore.fetchUserStats()
    // Opcional: Refrescar las notificaciones cada cierto tiempo.
    setInterval(() => userDashboardStore.fetchUserStats(), 60000) // Cada minuto
  }
})
</script>

<template>
  <div>
    <div class="row g-4">
      <div class="col-md-6">
        <div class="card text-white bg-success shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-card-checklist me-2"></i>
              Mis Tareas Activas
            </h5>
            <p class="card-text display-5 text-end">{{ userDashboardStore.stats.activeTasks }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card text-white bg-warning shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-person-workspace me-2"></i>
              Mis Órdenes Activas
            </h5>
            <p class="card-text display-5 text-end">{{ userDashboardStore.stats.activeWorkOrders }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-5">
      <h2 class="mb-3">Accesos Rápidos</h2>
      <div class="row g-4">
        <div class="col-md-6 col-lg-4">
          <RouterLink to="/my-tasks" class="card-link-wrapper">
            <div class="card text-center shadow-sm h-100">
              <div class="card-body d-flex flex-column justify-content-center align-items-center">
                <i class="bi bi-check2-square display-3 text-success mb-3"></i>
                <h5 class="card-title text-success">Ver Mis Tareas</h5>
                <p class="card-text text-muted flex-grow-1">Revisa y actualiza el estado de tus tareas asignadas.</p>
                <span class="btn btn-outline-success mt-auto">Ir a Tareas</span>
              </div>
            </div>
          </RouterLink>
        </div>
        <div class="col-md-6 col-lg-4">
          <RouterLink to="/my-work-orders" class="card-link-wrapper">
            <div class="card text-center shadow-sm h-100">
              <div class="card-body d-flex flex-column justify-content-center align-items-center">
                <i class="bi bi-person-workspace display-3 text-warning mb-3"></i>
                <h5 class="card-title text-warning">Mis Órdenes de Trabajo</h5>
                <p class="card-text text-muted flex-grow-1">Revisa y actualiza el estado de tus órdenes de trabajo
                  asignadas.</p>
                <span class="btn btn-outline-warning mt-auto">Ir a Mis Órdenes</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Puedes copiar los estilos de HomeView.vue para .card-link-wrapper si es necesario */
.card-link-wrapper {
  text-decoration: none;
  color: inherit;
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
</style>
