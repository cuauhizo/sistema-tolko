<script setup>
import { onMounted } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { useAuthStore } from '../stores/auth'
import { RouterLink } from 'vue-router' // Asegúrate de importar RouterLink

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()

onMounted(() => {
  dashboardStore.fetchStats()
})

// Función para formatear el valor del inventario como moneda (MXN para México)
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value)
}
</script>

<template>
  <div class="container my-4">
    <h1 class="mb-4">Dashboard</h1>
    <h4 class="text-muted mb-4">Bienvenido, {{ authStore.username }}</h4>

    <div v-if="dashboardStore.isLoading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else-if="dashboardStore.error" class="alert alert-danger">
      {{ dashboardStore.error }}
    </div>
    <div v-else class="row g-4">
      <div class="col-md-6 col-lg-3">
        <div class="card text-white bg-primary shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-box-seam me-2"></i>Total de Productos</h5>
            <p class="card-text display-4">{{ dashboardStore.stats.totalProducts }}</p>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="card text-white bg-success shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-cash-stack me-2"></i>Valor del Inventario</h5>
            <p class="card-text display-4">
              {{ formatCurrency(dashboardStore.stats.inventoryValue) }}
            </p>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="card text-white bg-warning shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-exclamation-triangle me-2"></i>Bajo Stock (&lt;=10)
            </h5>
            <p class="card-text display-4">{{ dashboardStore.stats.lowStockProducts }}</p>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="card text-white bg-info shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-people-fill me-2"></i>Usuarios Registrados</h5>
            <p class="card-text display-4">{{ dashboardStore.stats.totalUsers }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-5">
      <h2 class="mb-3">Accesos Rápidos</h2>

      <div class="row g-4">
        <div v-if="authStore.isAdmin" class="col-md-6 col-lg-4">
          <RouterLink to="/categories" class="card-link-wrapper">
            <div class="card text-center shadow-sm h-100">
              <div class="card-body d-flex flex-column justify-content-center align-items-center">
                <i class="bi bi-tags-fill display-3 text-info mb-3"></i>
                <h5 class="card-title text-info">Gestionar Categorías</h5>
                <p class="card-text text-muted flex-grow-1">
                  Crear, editar y organizar las categorías de los productos.
                </p>
                <span class="btn btn-outline-info mt-auto">Ir a Categorías</span>
              </div>
            </div>
          </RouterLink>
        </div>

        <div class="col-md-6 col-lg-4">
          <RouterLink to="/products" class="card-link-wrapper">
            <div class="card text-center shadow-sm h-100">
              <div class="card-body d-flex flex-column justify-content-center align-items-center">
                <i class="bi bi-box-seam display-3 text-primary mb-3"></i>
                <h5 class="card-title text-primary">Gestionar Productos</h5>
                <p class="card-text text-muted flex-grow-1">
                  Ver, agregar, editar y eliminar productos del inventario.
                </p>
                <span class="btn btn-outline-primary mt-auto">Ir a Productos</span>
              </div>
            </div>
          </RouterLink>
        </div>

        <div v-if="authStore.isAdmin" class="col-md-6 col-lg-4">
          <RouterLink to="/users" class="card-link-wrapper">
            <div class="card text-center shadow-sm h-100">
              <div class="card-body d-flex flex-column justify-content-center align-items-center">
                <i class="bi bi-people-fill display-3 text-secondary mb-3"></i>
                <h5 class="card-title text-secondary">Administrar Usuarios</h5>
                <p class="card-text text-muted flex-grow-1">
                  Gestionar las cuentas y los roles de los usuarios del sistema.
                </p>
                <span class="btn btn-outline-secondary mt-auto">Ir a Usuarios</span>
              </div>
            </div>
          </RouterLink>
        </div>

        <div v-if="authStore.isAdmin" class="col-md-6 col-lg-4">
          <RouterLink to="/tasks" class="card-link-wrapper">
            <div class="card text-center shadow-sm h-100">
              <div class="card-body d-flex flex-column justify-content-center align-items-center">
                <i class="bi bi-card-checklist display-3 text-dark mb-3"></i>
                <h5 class="card-title text-dark">Gestionar Tareas</h5>
                <p class="card-text text-muted flex-grow-1">
                  Asignar, editar y eliminar tareas de todos los usuarios.
                </p>
                <span class="btn btn-outline-dark mt-auto">Ir a Tareas</span>
              </div>
            </div>
          </RouterLink>
        </div>

        <div class="col-md-6 col-lg-4">
          <RouterLink to="/my-tasks" class="card-link-wrapper">
            <div class="card text-center shadow-sm h-100">
              <div class="card-body d-flex flex-column justify-content-center align-items-center">
                <i class="bi bi-check2-square display-3 text-success mb-3"></i>
                <h5 class="card-title text-success">Mis Tareas</h5>
                <p class="card-text text-muted flex-grow-1">
                  Ver y actualizar el estado de tus tareas asignadas.
                </p>
                <span class="btn btn-outline-success mt-auto">Ver Checklist</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
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
  text-decoration: none; /* Quita el subrayado del enlace */
  color: inherit; /* Hereda el color del texto */
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
  padding-bottom: 1.5rem; /* Ajuste para el botón en la parte inferior */
}
</style>
