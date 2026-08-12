<script setup>
  import { onMounted, onUnmounted, ref, computed } from 'vue'
  import { useDashboardStore } from '../stores/dashboard'
  import { useAuthStore } from '../stores/auth'
  import { RouterLink } from 'vue-router'

  // Importamos el componente Chart de PrimeVue
  import Chart from 'primevue/chart'

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

  const formatCurrency = value => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value || 0)
  }

  // --- CONFIGURACIÓN DE GRÁFICOS (Datos de ejemplo para estructurar) ---
  // Nota: Más adelante conectaremos esto a tu backend para que sean datos 100% reales

  // 1. Gráfico de Órdenes (Barras)
  const ordersChartData = computed(() => {
    // Si la información aún no carga, mostramos ceros
    const statusData = dashboardStore.stats?.ordersByStatus || {
      pendiente: 0,
      en_progreso: 0,
      por_aprobar: 0,
      completada: 0,
    }

    return {
      labels: ['Pendientes', 'En Progreso', 'Por Aprobar', 'Completadas'],
      datasets: [
        {
          label: 'Órdenes de Trabajo',
          // ¡Aquí inyectamos los datos reales desde tu Base de Datos!
          data: [statusData.pendiente, statusData.en_progreso, statusData.por_aprobar, statusData.completada],
          backgroundColor: [
            'rgba(245, 158, 11, 0.8)', // Ambar
            'rgba(59, 130, 246, 0.8)', // Azul
            'rgba(100, 116, 139, 0.8)', // Gris
            'rgba(16, 185, 129, 0.8)', // Esmeralda
          ],
          borderWidth: 0,
          borderRadius: 6,
        },
      ],
    }
  })

  const ordersChartOptions = ref({
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
    maintainAspectRatio: false,
  })

  // 2. Gráfico de Inventario (Dona)
  const inventoryChartData = computed(() => {
    // Tomamos los datos de salud del inventario del backend o usamos ceros por defecto
    const health = dashboardStore.stats?.inventoryHealth || { optimal: 0, lowStock: 0, outOfStock: 0 }

    return {
      labels: ['Óptimo', 'Stock Bajo', 'Agotado'],
      datasets: [
        {
          data: [health.optimal, health.lowStock, health.outOfStock],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], // Verde, Ambar, Rojo
          hoverBackgroundColor: ['#059669', '#d97706', '#dc2626'],
          borderWidth: 0,
        },
      ],
    }
  })

  const inventoryChartOptions = ref({
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true } },
    },
    cutout: '60%',
    maintainAspectRatio: false,
  })
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
      <!-- KPIs Superiores (Intactos) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <div class="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-sm text-white p-6 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-blue-100 text-sm font-medium mb-1">Total de Productos</p>
              <h3 class="text-3xl font-bold">{{ dashboardStore.stats.totalProducts }}</h3>
            </div>
            <div class="bg-white/20 p-2 rounded-lg"><i class="pi pi-box !text-xl"></i></div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-sm text-white p-6 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-amber-100 text-sm font-medium mb-1">Bajo Stock</p>
              <h3 class="text-3xl font-bold">{{ dashboardStore.stats.lowStockProducts }}</h3>
            </div>
            <div class="bg-white/20 p-2 rounded-lg"><i class="pi pi-exclamation-triangle !text-xl"></i></div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-sm text-white p-6 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-emerald-100 text-sm font-medium mb-1">Órdenes Activas</p>
              <h3 class="text-3xl font-bold">{{ dashboardStore.stats.activeWorkOrders }}</h3>
            </div>
            <div class="bg-white/20 p-2 rounded-lg"><i class="pi pi-briefcase !text-xl"></i></div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl shadow-sm text-white p-6 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-slate-200 text-sm font-medium mb-1">Usuarios</p>
              <h3 class="text-3xl font-bold">{{ dashboardStore.stats.totalUsers }}</h3>
            </div>
            <div class="bg-white/20 p-2 rounded-lg"><i class="pi pi-users !text-xl"></i></div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-sm text-white p-6 relative overflow-hidden sm:col-span-2 xl:col-span-1">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-300 text-sm font-medium mb-1">Valor Inventario</p>
              <h3 class="text-2xl font-bold truncate" :title="formatCurrency(dashboardStore.stats.inventoryValue)">
                {{ formatCurrency(dashboardStore.stats.inventoryValue) }}
              </h3>
            </div>
            <div class="bg-white/20 p-2 rounded-lg"><i class="pi pi-dollar !text-xl"></i></div>
          </div>
        </div>
      </div>

      <!-- NUEVA SECCIÓN: Gráficos de Rendimiento -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <!-- Gráfico de Órdenes de Trabajo -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-800">Flujo de Órdenes de Trabajo</h3>
            <span class="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">Mes Actual</span>
          </div>
          <div class="h-64">
            <Chart type="bar" :data="ordersChartData" :options="ordersChartOptions" class="h-full w-full" />
          </div>
        </div>

        <!-- Gráfico de Salud del Inventario -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4 text-center">Salud del Inventario</h3>
          <div class="h-56 relative flex justify-center items-center">
            <Chart type="doughnut" :data="inventoryChartData" :options="inventoryChartOptions" class="h-full w-full" />
            <!-- Texto central en la dona -->
            <div class="absolute flex flex-col items-center justify-center pointer-events-none">
              <span class="text-3xl font-bold text-gray-800">{{ dashboardStore.stats.totalProducts }}</span>
              <span class="text-xs text-gray-500">Items</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Accesos Rápidos (Intactos) -->
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Accesos Rápidos</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RouterLink to="/categories" class="group bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"><i class="pi pi-tags !text-3xl text-cyan-500"></i></div>
            <h5 class="text-lg font-bold text-gray-800 mb-2">Gestionar Categorías</h5>
            <span class="mt-auto px-4 py-2 border border-cyan-500 text-cyan-600 font-medium rounded-md group-hover:bg-cyan-500 group-hover:text-white transition-colors w-full">Ir a Categorías</span>
          </RouterLink>

          <RouterLink to="/products" class="group bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"><i class="pi pi-box !text-3xl text-blue-600"></i></div>
            <h5 class="text-lg font-bold text-gray-800 mb-2">Gestionar Productos</h5>
            <span class="mt-auto px-4 py-2 border border-blue-600 text-blue-600 font-medium rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors w-full">Ir a Productos</span>
          </RouterLink>

          <RouterLink to="/users" class="group bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"><i class="pi pi-users !text-3xl text-slate-500"></i></div>
            <h5 class="text-lg font-bold text-gray-800 mb-2">Administrar Usuarios</h5>
            <span class="mt-auto px-4 py-2 border border-slate-500 text-slate-600 font-medium rounded-md group-hover:bg-slate-500 group-hover:text-white transition-colors w-full">Ir a Usuarios</span>
          </RouterLink>

          <RouterLink to="/work-orders" class="group bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"><i class="pi pi-list !text-3xl text-red-500"></i></div>
            <h5 class="text-lg font-bold text-gray-800 mb-2">Gestionar Órdenes</h5>
            <span class="mt-auto px-4 py-2 border border-red-500 text-red-500 font-medium rounded-md group-hover:bg-red-500 group-hover:text-white transition-colors w-full">Ir a Órdenes</span>
          </RouterLink>
          <!-- (Puedes agregar de vuelta los otros accesos rápidos de tareas si lo deseas, los acorté para simplificar) -->
        </div>
      </div>
    </div>
  </div>
</template>
