<script setup>
  import { onMounted } from 'vue'
  import { useAuthStore } from '../stores/auth'
  import { useProductsStore } from '../stores/products'
  import { storeToRefs } from 'pinia'

  import AdminDashboard from '../components/AdminDashboard.vue'
  import UserDashboard from '../components/UserDashboard.vue'

  const authStore = useAuthStore()
  const productsStore = useProductsStore()
  const { lowStockProducts } = storeToRefs(productsStore)

  // Cargamos la información del stock al entrar al dashboard
  onMounted(() => {
    if (authStore.isAuthenticated) {
      productsStore.fetchLowStockProducts()
    }
  })
</script>

<template>
  <div class="container mx-auto px-4 py-6" v-if="authStore.isAuthenticated">
    <!-- Widget de Alertas de Stock (Visible en la parte superior) -->
    <div class="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden w-full max-w-2xl mb-8">
      <div class="bg-red-50 px-5 py-4 border-b border-red-100 flex items-center justify-between">
        <h3 class="text-lg font-bold text-red-800 flex items-center">
          <i class="pi pi-exclamation-triangle mr-2 text-red-600"></i>
          Alertas de Inventario
        </h3>
        <span class="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{{ lowStockProducts.length }} críticos</span>
      </div>

      <div class="p-0">
        <ul v-if="lowStockProducts.length > 0" class="divide-y divide-gray-100">
          <li v-for="product in lowStockProducts" :key="product.id" class="px-5 py-3 hover:bg-gray-50 flex justify-between items-center transition-colors">
            <div>
              <p class="text-sm font-bold text-gray-900">{{ product.name }}</p>
              <p class="text-xs text-gray-500">Unidad: {{ product.unit }}</p>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold" :class="product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'">Stock actual: {{ product.stock }}</span>
            </div>
          </li>
        </ul>
        <div v-else class="px-5 py-8 text-center bg-gray-50">
          <i class="pi pi-check-circle text-4xl text-emerald-400 mb-2"></i>
          <p class="text-sm text-gray-600 font-medium">Todo el inventario está en niveles óptimos.</p>
        </div>
      </div>
    </div>

    <!-- Dashboards Específicos por Rol -->
    <AdminDashboard v-if="authStore.isAdmin" />
    <UserDashboard v-else />
  </div>
</template>

<style scoped></style>
