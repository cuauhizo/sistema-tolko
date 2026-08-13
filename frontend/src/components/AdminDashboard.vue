<script setup>
  import { onMounted, onUnmounted, ref, computed } from 'vue'
  import { useDashboardStore } from '../stores/dashboard'
  import { useAuthStore } from '../stores/auth'
  import { useProductsStore } from '../stores/products'
  import { storeToRefs } from 'pinia'
  import { RouterLink } from 'vue-router'
  import SkeletonLoader from '../components/SkeletonLoader.vue'

  // Importamos el componente Chart de PrimeVue
  import Chart from 'primevue/chart'

  const dashboardStore = useDashboardStore()
  const authStore = useAuthStore()
  const productsStore = useProductsStore()
  const pollInterval = ref(null)
  const { lowStockProducts } = storeToRefs(productsStore)

  onMounted(() => {
    if (authStore.isAuthenticated) {
      dashboardStore.fetchStats()
      pollInterval.value = setInterval(() => {
        dashboardStore.fetchStats()
      }, 60000)
    }
  })

  // Cargamos la información del stock al entrar al dashboard
  onMounted(() => {
    if (authStore.isAuthenticated) {
      productsStore.fetchLowStockProducts()
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
  const ordersChartData = computed(() => {
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

  const inventoryChartData = computed(() => {
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
    <div v-if="dashboardStore.isLoading">
      <!-- Esqueletos para las 5 tarjetas de KPIs (Total Productos, Stock, etc.) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <div v-for="i in 5" :key="i" class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex justify-between items-start">
          <div class="w-full">
            <SkeletonLoader width="60%" height="1rem" class="mb-3" />
            <SkeletonLoader width="40%" height="2.5rem" />
          </div>
          <SkeletonLoader width="40px" height="40px" radius="8px" />
        </div>
      </div>

      <!-- Esqueletos para los Gráficos y Alertas (AHORA SON 3 COLUMNAS) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <!-- Gráfico de Barras -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex justify-between items-center mb-4">
            <SkeletonLoader width="40%" height="1.5rem" />
            <SkeletonLoader width="25%" height="1.5rem" radius="6px" />
          </div>
          <SkeletonLoader width="100%" height="200px" radius="8px" />
        </div>

        <!-- Gráfico de Dona -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <SkeletonLoader width="50%" height="1.5rem" class="mx-auto mb-4" />
          <div class="flex justify-center items-center h-56">
            <SkeletonLoader width="200px" height="200px" radius="50%" />
          </div>
        </div>

        <!-- NUEVO: Esqueleto de Alertas de Stock -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
          <div class="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <SkeletonLoader width="50%" height="1.5rem" />
            <SkeletonLoader width="20%" height="1.5rem" radius="9999px" />
          </div>
          <div class="p-0">
            <div v-for="i in 3" :key="'alert-skel-' + i" class="px-5 py-3 border-b border-gray-50 flex justify-between items-center">
              <div class="w-1/2">
                <SkeletonLoader width="80%" height="1rem" class="mb-1" />
                <SkeletonLoader width="40%" height="0.75rem" />
              </div>
              <SkeletonLoader width="25%" height="1.5rem" radius="6px" />
            </div>
          </div>
        </div>
      </div>

      <!-- Esqueletos para Accesos Rápidos (Admin) -->
      <div class="mb-8">
        <SkeletonLoader width="200px" height="1.5rem" class="mb-4" />
        <!-- Título -->
        <div class="flex flex-wrap gap-3">
          <SkeletonLoader width="378px" height="208px" radius="8px" />
          <SkeletonLoader width="378px" height="208px" radius="8px" />
          <SkeletonLoader width="378px" height="208px" radius="8px" />
          <SkeletonLoader width="378px" height="208px" radius="8px" />
        </div>
      </div>
    </div>

    <div v-else-if="dashboardStore.error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
      <div class="flex items-center">
        <i class="pi pi-exclamation-triangle text-red-500 mr-3 !text-xl"></i>
        <p class="text-red-700">{{ dashboardStore.error }}</p>
      </div>
    </div>

    <div v-else key="dashboard-loaded-content">
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

      <!-- SECCIÓN: Gráficos de Rendimiento -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <!-- 1. Gráfico de Órdenes de Trabajo -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <div class="flex justify-between items-center mb-4 shrink-0">
            <h3 class="text-lg font-bold text-gray-800">Flujo de Órdenes</h3>
            <span class="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">Mes Actual</span>
          </div>
          <div class="flex-grow relative min-h-[16rem]">
            <Chart v-if="dashboardStore.stats" type="bar" :data="ordersChartData" :options="ordersChartOptions" class="absolute inset-0 h-full w-full" />
          </div>
        </div>

        <!-- 2. Gráfico de Salud del Inventario -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <h3 class="text-lg font-bold text-gray-800 mb-4 text-center shrink-0">Salud del Inventario</h3>
          <div class="flex-grow relative flex justify-center items-center min-h-[16rem]">
            <Chart v-if="dashboardStore.stats" type="doughnut" :data="inventoryChartData" :options="inventoryChartOptions" class="absolute inset-0 h-full w-full" />
            <!-- Texto central en la dona -->
            <div class="absolute flex flex-col items-center justify-center pointer-events-none">
              <span class="text-3xl font-bold text-gray-800">{{ dashboardStore.stats.totalProducts }}</span>
              <span class="text-xs text-gray-500">Items</span>
            </div>
          </div>
        </div>

        <!-- 3. Widget de Alertas de Stock (Homologado y Limitado) -->
        <div class="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden flex flex-col h-full">
          <!-- Cabecera pegada a los bordes -->
          <div class="bg-red-50 px-5 py-4 border-b border-red-100 flex items-center justify-between shrink-0">
            <h3 class="text-lg font-bold text-red-800 flex items-center">
              <i class="pi pi-exclamation-triangle mr-2 text-red-600"></i>
              Alertas de Stock
            </h3>
            <span class="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{{ lowStockProducts.length }} críticos</span>
          </div>

          <!-- Lista con scroll interno y límite de 5 items (.slice) -->
          <div class="flex-grow overflow-y-auto bg-white">
            <ul v-if="lowStockProducts.length > 0" class="divide-y divide-gray-100">
              <li v-for="product in lowStockProducts.slice(0, 5)" :key="product.id" class="px-5 py-3 hover:bg-gray-50 flex justify-between items-center transition-colors">
                <div class="overflow-hidden pr-2">
                  <p class="text-sm font-bold text-gray-900 truncate" :title="product.name">{{ product.name }}</p>
                  <p class="text-xs text-gray-500">Unidad: {{ product.unit }}</p>
                </div>
                <div class="text-right shrink-0">
                  <span class="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold" :class="product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'">Disp: {{ product.stock }}</span>
                </div>
              </li>
            </ul>

            <!-- Estado ideal: No hay alertas -->
            <div v-else class="px-5 py-8 h-full flex flex-col justify-center items-center text-center bg-gray-50">
              <i class="pi pi-check-circle text-4xl text-emerald-400 mb-2"></i>
              <p class="text-sm text-gray-600 font-medium">Todo el inventario está en niveles óptimos.</p>
            </div>
          </div>

          <!-- Footer para ver más (Solo si hay más de 5) -->
          <div v-if="lowStockProducts.length > 5" class="bg-gray-50 border-t border-gray-100 p-3 text-center shrink-0">
            <RouterLink to="/products" class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center">
              Ver los {{ lowStockProducts.length - 5 }} restantes
              <i class="pi pi-arrow-right text-xs ml-1"></i>
            </RouterLink>
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
        </div>
      </div>
    </div>
  </div>
</template>
