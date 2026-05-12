<script setup>
  import { onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useWorkOrdersStore } from '../stores/workOrders'
  import { storeToRefs } from 'pinia'
  import { generateWorkOrderPDF } from '../utils/pdfGenerator'
  import { formatStatus, formatWorkOrderId } from '@/utils/formatters'

  const route = useRoute()
  const workOrdersStore = useWorkOrdersStore()
  const { currentOrder, isLoading, error } = storeToRefs(workOrdersStore)

  onMounted(() => {
    workOrdersStore.fetchWorkOrderById(route.params.id)
  })

  const handleExportPDF = () => {
    generateWorkOrderPDF(currentOrder.value)
  }
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <i class="pi pi-spin pi-spinner text-blue-600 text-4xl"></i>
      <span class="ml-3 text-blue-600 font-medium text-lg">Cargando detalles de la orden...</span>
    </div>

    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
      <div class="flex items-center">
        <i class="pi pi-exclamation-triangle text-red-500 mr-3 text-xl"></i>
        <p class="text-red-700">{{ error }}</p>
      </div>
    </div>

    <div v-else-if="currentOrder">
      <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
        <div>
          <p class="text-sm font-bold text-blue-600 tracking-wider uppercase mb-1">
            {{ formatWorkOrderId(currentOrder.id) }}
          </p>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ currentOrder.title }}</h1>
          <p class="text-gray-600 text-lg flex items-center">
            <i class="pi pi-building mr-2 text-gray-400"></i>
            Cliente:
            <strong class="text-gray-900 ml-1">{{ currentOrder.client_name || 'N/A' }}</strong>
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span
            class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm"
            :class="{
              'bg-yellow-50 text-yellow-700 border-yellow-200': currentOrder.status === 'pendiente',
              'bg-blue-50 text-blue-700 border-blue-200': currentOrder.status === 'en_progreso',
              'bg-gray-50 text-gray-700 border-gray-200': currentOrder.status === 'por_aprobar',
              'bg-green-50 text-green-700 border-green-200': currentOrder.status === 'completada',
              'bg-red-50 text-red-700 border-red-200': currentOrder.status === 'cancelada',
            }">
            {{ formatStatus(currentOrder.status) }}
          </span>

          <button
            class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full sm:w-auto justify-center"
            @click="handleExportPDF">
            <i class="pi pi-file-pdf mr-2"></i>
            Exportar a PDF
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p class="text-sm text-gray-500 mb-1 font-medium">Asignada a</p>
              <p class="font-bold text-gray-900 flex items-center">
                <i class="pi pi-user mr-2 text-blue-500"></i>
                {{ currentOrder.assigned_to }}
              </p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p class="text-sm text-gray-500 mb-1 font-medium">Fecha de Inicio</p>
              <p class="font-bold text-gray-900 flex items-center">
                <i class="pi pi-calendar-plus mr-2 text-emerald-500"></i>
                {{ new Date(currentOrder.start_date).toLocaleDateString() }}
              </p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p class="text-sm text-gray-500 mb-1 font-medium">Fecha Límite</p>
              <p class="font-bold text-gray-900 flex items-center">
                <i class="pi pi-calendar-times mr-2 text-red-500"></i>
                {{ new Date(currentOrder.end_date).toLocaleDateString() }}
              </p>
            </div>
          </div>

          <div class="border-t border-gray-100 pt-6">
            <h5 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
              <i class="pi pi-align-left mr-2 text-gray-400"></i>
              Descripción del Trabajo
            </h5>
            <div class="text-gray-700 whitespace-pre-line bg-blue-50/50 p-5 rounded-lg border border-blue-100/50 leading-relaxed">
              {{ currentOrder.description || 'Sin descripción.' }}
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <h5 class="text-lg font-bold text-gray-800 flex items-center">
            <i class="pi pi-box mr-2 text-blue-600"></i>
            Materiales Utilizados
          </h5>
        </div>

        <div class="p-0">
          <ul class="divide-y divide-gray-100">
            <li v-if="currentOrder.products.length === 0" class="px-6 py-8 text-center text-gray-500 italic">No se han asignado productos ni materiales a esta orden.</li>
            <li v-for="product in currentOrder.products" :key="product.product_id" class="px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-gray-50 transition-colors gap-2">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span class="font-medium text-gray-900">{{ product.name }}</span>
              </div>
              <span class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100 self-start sm:self-auto">Cantidad: {{ product.quantity_used }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
