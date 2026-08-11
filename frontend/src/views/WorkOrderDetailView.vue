<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { useWorkOrdersStore } from '../stores/workOrders'
  import { useProductsStore } from '../stores/products'
  import { useToastStore } from '../stores/toast'
  import { generateWorkOrderPDF } from '../utils/pdfGenerator'
  import { formatStatus, formatWorkOrderId } from '@/utils/formatters'

  const route = useRoute()
  const workOrdersStore = useWorkOrdersStore()
  const productsStore = useProductsStore()
  const toast = useToastStore()

  const { currentOrder, isLoading, error } = storeToRefs(workOrdersStore)
  const { products } = storeToRefs(productsStore)

  // Estados locales para el formulario de materiales
  const selectedProduct = ref('')
  const quantityToAdd = ref(1)
  const isAddingMaterial = ref(false)
  const isChangingStatus = ref(false)

  onMounted(async () => {
    await workOrdersStore.fetchWorkOrderById(route.params.id)
    await productsStore.fetchProducts() // Cargamos el catálogo para el dropdown
  })

  const handleExportPDF = () => {
    generateWorkOrderPDF(currentOrder.value)
  }

  // Novedad: Función para cambiar el estado de la orden
  const changeStatus = async newStatus => {
    if (newStatus === 'completada') {
      const confirm = window.confirm('¿Estás seguro de completar la orden? Esto descontará automáticamente el stock de los materiales utilizados.')
      if (!confirm) return
    }

    isChangingStatus.value = true
    try {
      await workOrdersStore.updateOrderStatus(currentOrder.value.id, newStatus)
      toast.showSuccess(`Orden actualizada a ${formatStatus(newStatus)}`)
      await workOrdersStore.fetchWorkOrderById(route.params.id) // Recargar
    } catch (err) {
      toast.showError('Error al cambiar el estado')
    } finally {
      isChangingStatus.value = false
    }
  }

  // Novedad: Función para agregar material a la orden
  const handleAddMaterial = async () => {
    if (!selectedProduct.value || quantityToAdd.value < 1) return

    isAddingMaterial.value = true
    try {
      await workOrdersStore.addProductToOrder(currentOrder.value.id, {
        product_id: selectedProduct.value,
        quantity_used: quantityToAdd.value,
      })
      toast.showSuccess('Material agregado con éxito')

      // Limpiar y recargar
      selectedProduct.value = ''
      quantityToAdd.value = 1
      await workOrdersStore.fetchWorkOrderById(route.params.id)
    } catch (err) {
      toast.showError('Error al agregar el material')
    } finally {
      isAddingMaterial.value = false
    }
  }
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Estado de Carga Original -->
    <div v-if="isLoading && !currentOrder" class="flex justify-center items-center py-20">
      <i class="pi pi-spin pi-spinner text-blue-600 text-4xl"></i>
      <span class="ml-3 text-blue-600 font-medium text-lg">Cargando detalles de la orden...</span>
    </div>

    <!-- Estado de Error Original -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
      <div class="flex items-center">
        <i class="pi pi-exclamation-triangle text-red-500 mr-3 text-xl"></i>
        <p class="text-red-700">{{ error }}</p>
      </div>
    </div>

    <div v-else-if="currentOrder">
      <!-- Encabezado Original modificado para Acciones de Estado -->
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
          <!-- Píldora de estado original -->
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

          <!-- Botones de Acción según el Estado -->
          <button
            v-if="currentOrder.status === 'pendiente'"
            @click="changeStatus('en_progreso')"
            :disabled="isChangingStatus"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors w-full sm:w-auto">
            Iniciar Trabajo
          </button>

          <button
            v-if="currentOrder.status === 'en_progreso'"
            @click="changeStatus('completada')"
            :disabled="isChangingStatus"
            class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors w-full sm:w-auto">
            <i class="pi pi-check mr-1"></i>
            Completar Orden
          </button>

          <button
            class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full sm:w-auto justify-center"
            @click="handleExportPDF">
            <i class="pi pi-file-pdf mr-2"></i>
            Exportar
          </button>
        </div>
      </div>

      <!-- Tarjeta de Detalles Original -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <!-- Bloques de info original mantenidos exactos -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p class="text-sm text-gray-500 mb-1 font-medium">Asignada a</p>
              <p class="font-bold text-gray-900 flex items-center">
                <i class="pi pi-user mr-2 text-blue-500"></i>
                {{ currentOrder.assigned_to || 'Sin asignar' }}
              </p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p class="text-sm text-gray-500 mb-1 font-medium">Fecha de Inicio</p>
              <p class="font-bold text-gray-900 flex items-center">
                <i class="pi pi-calendar-plus mr-2 text-emerald-500"></i>
                {{ currentOrder.start_date ? new Date(currentOrder.start_date).toLocaleDateString() : 'N/A' }}
              </p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p class="text-sm text-gray-500 mb-1 font-medium">Fecha Límite</p>
              <p class="font-bold text-gray-900 flex items-center">
                <i class="pi pi-calendar-times mr-2 text-red-500"></i>
                {{ currentOrder.end_date ? new Date(currentOrder.end_date).toLocaleDateString() : 'N/A' }}
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

      <!-- Tarjeta de Materiales Ampliada -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h5 class="text-lg font-bold text-gray-800 flex items-center">
            <i class="pi pi-box mr-2 text-blue-600"></i>
            Materiales Utilizados
          </h5>
        </div>

        <!-- Novedad: Formulario para agregar material (Solo si no está completada/cancelada) -->
        <div v-if="['pendiente', 'en_progreso'].includes(currentOrder.status)" class="p-4 bg-white border-b border-gray-100">
          <form @submit.prevent="handleAddMaterial" class="flex flex-col sm:flex-row gap-3 items-end">
            <div class="flex-grow w-full sm:w-auto">
              <label class="block text-xs font-medium text-gray-700 mb-1">Producto</label>
              <select v-model="selectedProduct" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 border" required>
                <option value="" disabled>Seleccionar material...</option>
                <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }} (Stock: {{ product.stock }})</option>
              </select>
            </div>
            <div class="w-full sm:w-32">
              <label class="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
              <input type="number" v-model="quantityToAdd" min="1" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 border" required />
            </div>
            <button type="submit" :disabled="isAddingMaterial" class="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-md transition-colors w-full sm:w-auto h-10 flex items-center justify-center">
              <i class="pi pi-plus mr-1" v-if="!isAddingMaterial"></i>
              {{ isAddingMaterial ? 'Agregando...' : 'Agregar' }}
            </button>
          </form>
        </div>

        <!-- Lista Original -->
        <div class="p-0">
          <ul class="divide-y divide-gray-100">
            <li v-if="!currentOrder.products || currentOrder.products.length === 0" class="px-6 py-8 text-center text-gray-500 italic">No se han asignado productos ni materiales a esta orden.</li>
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
