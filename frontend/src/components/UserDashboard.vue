<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'
  import { useUserDashboardStore } from '../stores/userDashboard'
  import { useAuthStore } from '../stores/auth'
  import { RouterLink } from 'vue-router'

  // NUEVO: Importamos tu componente de Skeleton personalizado
  import SkeletonLoader from '../components/SkeletonLoader.vue'

  const userDashboardStore = useUserDashboardStore()
  const authStore = useAuthStore()
  const pollInterval = ref(null)

  onMounted(() => {
    if (authStore.isAuthenticated) {
      userDashboardStore.fetchUserStats()
      pollInterval.value = setInterval(() => {
        userDashboardStore.fetchUserStats()
      }, 60000)
    }
  })

  onUnmounted(() => {
    if (pollInterval.value) {
      clearInterval(pollInterval.value)
    }
  })
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- ========================================== -->
    <!-- ESTADO DE CARGA (TUS SKELETONS)            -->
    <!-- ========================================== -->
    <div v-if="userDashboardStore.isLoading">
      <!-- Skeletons para las Tarjetas Superiores (KPIs) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div v-for="i in 2" :key="'kpi-' + i" class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex justify-between items-start">
          <div class="w-full">
            <SkeletonLoader width="40%" height="1rem" class="mb-3" />
            <SkeletonLoader width="25%" height="2.5rem" />
          </div>
          <SkeletonLoader width="48px" height="48px" radius="12px" />
        </div>
      </div>

      <!-- Skeletons para los Accesos Rápidos -->
      <div class="mt-8">
        <SkeletonLoader width="200px" height="2rem" class="mb-6" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="i in 2" :key="'acc-' + i" class="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm">
            <SkeletonLoader width="64px" height="64px" radius="50%" class="mb-4" />
            <SkeletonLoader width="50%" height="1.5rem" class="mb-3" />
            <SkeletonLoader width="80%" height="1rem" class="mb-2" />
            <SkeletonLoader width="60%" height="1rem" class="mb-6" />
            <SkeletonLoader width="120px" height="40px" radius="6px" class="mt-auto" />
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- CONTENIDO REAL (TU CÓDIGO ORIGINAL)        -->
    <!-- ========================================== -->
    <div v-else key="dashboard-loaded-content">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div class="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-sm text-white p-6 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-emerald-100 text-sm font-medium mb-1">Mis Tareas Activas</p>
              <h3 class="text-4xl font-bold">{{ userDashboardStore.stats.activeTasks || 0 }}</h3>
            </div>
            <div class="bg-white/20 p-3 rounded-lg">
              <i class="pi pi-check-square !text-2xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-sm text-white p-6 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-amber-100 text-sm font-medium mb-1">Mis Órdenes Activas</p>
              <h3 class="text-4xl font-bold">{{ userDashboardStore.stats.activeWorkOrders || 0 }}</h3>
            </div>
            <div class="bg-white/20 p-3 rounded-lg">
              <i class="pi pi-briefcase !text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Accesos Rápidos</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RouterLink to="/my-tasks" class="group bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-check-square !text-3xl text-emerald-500"></i>
            </div>
            <h5 class="text-lg font-bold text-gray-800 mb-2">Ver Mis Tareas</h5>
            <p class="text-sm text-gray-500 flex-grow mb-6">Revisa y actualiza el estado de tus tareas asignadas.</p>
            <span class="mt-auto px-4 py-2 border border-emerald-500 text-emerald-600 font-medium rounded-md group-hover:bg-emerald-500 group-hover:text-white transition-colors w-full sm:w-auto">Ir a Tareas</span>
          </RouterLink>

          <RouterLink to="/my-work-orders" class="group bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-briefcase !text-3xl text-amber-500"></i>
            </div>
            <h5 class="text-lg font-bold text-gray-800 mb-2">Mis Órdenes de Trabajo</h5>
            <p class="text-sm text-gray-500 flex-grow mb-6">Revisa y actualiza el estado de tus órdenes de trabajo asignadas.</p>
            <span class="mt-auto px-4 py-2 border border-amber-500 text-amber-600 font-medium rounded-md group-hover:bg-amber-500 group-hover:text-white transition-colors w-full sm:w-auto">Ir a Mis Órdenes</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
