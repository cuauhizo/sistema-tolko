<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'
  import { useDashboardStore } from '../stores/dashboard'
  import { useAuthStore } from '../stores/auth'
  import { RouterLink } from 'vue-router'

  const dashboardStore = useDashboardStore()
  const authStore = useAuthStore()
  const pollInterval = ref(null)

  onMounted(() => {
    if (authStore.isAuthenticated) {
      dashboardStore.fetchStats()
      pollInterval.value = setInterval(() => {
        dashboardStore.fetchStats()
      }, 60000)
    }
  })

  onUnmounted(() => {
    if (pollInterval.value) {
      clearInterval(pollInterval.value)
    }
  })

  // Función para formatear el valor del inventario como moneda
  const formatCurrency = value => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value || 0)
  }
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="dashboardStore.isLoading" class="flex justify-center items-center py-20">
      <i class="pi pi-spin pi-spinner text-blue-600 text-4xl"></i>
      <span class="ml-3 text-blue-600 font-medium text-lg">Cargando estadísticas...</span>
    </div>

    <div v-else-if="dashboardStore.error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
      <div class="flex items-center">
        <i class="pi pi-exclamation-triangle text-red-500 mr-3 !text-xl"></i>
        <p class="text-red-700">{{ dashboardStore.error }}</p>
      </div>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
        <div class="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-sm text-white p-6 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-blue-100 text-sm font-medium mb-1">Total de Productos</p>
              <h3 class="text-3xl font-bold">{{ dashboardStore.stats.totalProducts }}</h3>
            </div>
            <div class="bg-white/20 p-2 rounded-lg">
              <i class="pi pi-box !text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-sm text-white p-6 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-amber-100 text-sm font-medium mb-1">Bajo Stock (&lt;=10)</p>
              <h3 class="text-3xl font-bold">{{ dashboardStore.stats.lowStockProducts }}</h3>
            </div>
            <div class="bg-white/20 p-2 rounded-lg">
              <i class="pi pi-exclamation-triangle !text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-sm text-white p-6 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-emerald-100 text-sm font-medium mb-1">Órdenes Activas</p>
              <h3 class="text-3xl font-bold">{{ dashboardStore.stats.activeWorkOrders }}</h3>
            </div>
            <div class="bg-white/20 p-2 rounded-lg">
              <i class="pi pi-briefcase !text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl shadow-sm text-white p-6 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-slate-200 text-sm font-medium mb-1">Usuarios</p>
              <h3 class="text-3xl font-bold">{{ dashboardStore.stats.totalUsers }}</h3>
            </div>
            <div class="bg-white/20 p-2 rounded-lg">
              <i class="pi pi-users !text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-sm text-white p-6 relative overflow-hidden sm:col-span-2 xl:col-span-1">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-300 text-sm font-medium mb-1">Valor del Inventario</p>
              <h3 class="text-2xl font-bold truncate" :title="formatCurrency(dashboardStore.stats.inventoryValue)">
                {{ formatCurrency(dashboardStore.stats.inventoryValue) }}
              </h3>
            </div>
            <div class="bg-white/20 p-2 rounded-lg">
              <i class="pi pi-dollar !text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Accesos Rápidos</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RouterLink to="/categories" class="group bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-tags !text-3xl text-cyan-500"></i>
            </div>
            <h5 class="text-lg font-bold text-gray-800 mb-2">Gestionar Categorías</h5>
            <p class="text-sm text-gray-500 flex-grow mb-4">Crear, editar y organizar las categorías de los productos.</p>
            <span class="mt-auto px-4 py-2 border border-cyan-500 text-cyan-600 font-medium rounded-md group-hover:bg-cyan-500 group-hover:text-white transition-colors w-full">Ir a Categorías</span>
          </RouterLink>

          <RouterLink to="/products" class="group bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-box !text-3xl text-blue-600"></i>
            </div>
            <h5 class="text-lg font-bold text-gray-800 mb-2">Gestionar Productos</h5>
            <p class="text-sm text-gray-500 flex-grow mb-4">Ver, agregar, editar y eliminar productos del inventario.</p>
            <span class="mt-auto px-4 py-2 border border-blue-600 text-blue-600 font-medium rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors w-full">Ir a Productos</span>
          </RouterLink>

          <RouterLink to="/users" class="group bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-users !text-3xl text-slate-500"></i>
            </div>
            <h5 class="text-lg font-bold text-gray-800 mb-2">Administrar Usuarios</h5>
            <p class="text-sm text-gray-500 flex-grow mb-4">Gestionar las cuentas y los roles de los usuarios del sistema.</p>
            <span class="mt-auto px-4 py-2 border border-slate-500 text-slate-600 font-medium rounded-md group-hover:bg-slate-500 group-hover:text-white transition-colors w-full">Ir a Usuarios</span>
          </RouterLink>

          <RouterLink to="/work-orders" class="group bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-list !text-3xl text-red-500"></i>
            </div>
            <h5 class="text-lg font-bold text-gray-800 mb-2">Gestionar Órdenes</h5>
            <p class="text-sm text-gray-500 flex-grow mb-4">Crear, asignar y dar seguimiento a las órdenes de trabajo.</p>
            <span class="mt-auto px-4 py-2 border border-red-500 text-red-500 font-medium rounded-md group-hover:bg-red-500 group-hover:text-white transition-colors w-full">Ir a Órdenes</span>
          </RouterLink>

          <RouterLink to="/my-tasks" class="group bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-check-square !text-3xl text-emerald-500"></i>
            </div>
            <h5 class="text-lg font-bold text-gray-800 mb-2">Mis Tareas</h5>
            <p class="text-sm text-gray-500 flex-grow mb-4">Ver y actualizar el estado de tus tareas asignadas.</p>
            <span class="mt-auto px-4 py-2 border border-emerald-500 text-emerald-600 font-medium rounded-md group-hover:bg-emerald-500 group-hover:text-white transition-colors w-full">Ver Checklist</span>
          </RouterLink>

          <RouterLink to="/my-work-orders" class="group bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-briefcase !text-3xl text-amber-500"></i>
            </div>
            <h5 class="text-lg font-bold text-gray-800 mb-2">Mis Órdenes de Trabajo</h5>
            <p class="text-sm text-gray-500 flex-grow mb-4">Revisa y actualiza el estado de tus órdenes de trabajo asignadas.</p>
            <span class="mt-auto px-4 py-2 border border-amber-500 text-amber-600 font-medium rounded-md group-hover:bg-amber-500 group-hover:text-white transition-colors w-full">Ir a Mis Órdenes</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
