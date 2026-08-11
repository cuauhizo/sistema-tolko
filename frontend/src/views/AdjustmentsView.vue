<script setup>
  import { ref, onMounted } from 'vue'
  import { useInventoryStore } from '../stores/inventory'
  import { useProductsStore } from '../stores/products'

  const inventoryStore = useInventoryStore()
  const productsStore = useProductsStore()

  // Estado del formulario
  const formData = ref({
    product_id: '',
    movement_type: '',
    quantity: 1,
    reason: '',
  })

  const isSubmitting = ref(false)
  const successMessage = ref('')
  const errorMessage = ref('')

  // Cargar productos al montar el componente
  onMounted(() => {
    productsStore.fetchProducts()
  })

  const submitAdjustment = async () => {
    isSubmitting.value = true
    successMessage.value = ''
    errorMessage.value = ''

    try {
      // Usamos registerMovement como lo nombramos en inventory.js
      await inventoryStore.registerMovement(formData.value)
      successMessage.value = '¡Movimiento registrado con éxito y stock actualizado!'

      // Limpiar el formulario
      formData.value = { product_id: '', movement_type: '', quantity: 1, reason: '' }

      // Actualizar la lista de productos para reflejar el nuevo stock
      await productsStore.fetchProducts()
    } catch (error) {
      errorMessage.value = 'Ocurrió un error al registrar el movimiento. Verifica los datos.'
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Registrar Movimiento de Inventario</h2>

    <!-- Alertas de Éxito o Error -->
    <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md shadow-sm">
      <div class="flex">
        <div class="flex-shrink-0">
          <span class="text-green-500 font-bold">✓</span>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">{{ successMessage }}</p>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md shadow-sm">
      <div class="flex">
        <div class="flex-shrink-0">
          <span class="text-red-500 font-bold">⚠</span>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Formulario (Tarjeta) -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
      <div class="p-6 sm:p-8">
        <form @submit.prevent="submitAdjustment">
          <!-- Selección de Producto -->
          <div class="mb-5">
            <label for="product" class="block text-sm font-medium text-gray-700 mb-1">
              Producto
              <span class="text-red-500">*</span>
            </label>
            <select v-model="formData.product_id" id="product" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border shadow-sm" required>
              <option value="" disabled>Seleccione un producto...</option>
              <option v-for="product in productsStore.products" :key="product.id" :value="product.id">{{ product.name }} (Stock actual: {{ product.stock }} {{ product.unit }})</option>
            </select>
          </div>

          <!-- Tipo de Movimiento -->
          <div class="mb-5">
            <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Movimiento
              <span class="text-red-500">*</span>
            </label>
            <select v-model="formData.movement_type" id="type" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border shadow-sm" required>
              <option value="" disabled>Seleccione el tipo...</option>
              <option value="ENTRADA">Entrada (Compra/Reabastecimiento)</option>
              <option value="SALIDA">Salida (Consumo manual)</option>
              <option value="MERMA">Merma (Daño/Caducidad)</option>
              <option value="AJUSTE">Ajuste de Inventario</option>
            </select>
          </div>

          <!-- Cantidad -->
          <div class="mb-5">
            <label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">
              Cantidad
              <span class="text-red-500">*</span>
            </label>
            <input type="number" v-model="formData.quantity" id="quantity" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" min="1" required />
          </div>

          <!-- Motivo -->
          <div class="mb-6">
            <label for="reason" class="block text-sm font-medium text-gray-700 mb-1">Motivo / Notas</label>
            <textarea
              v-model="formData.reason"
              id="reason"
              rows="3"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej. Lote caducado, compra según factura #123..."></textarea>
          </div>

          <!-- Botón de Envío -->
          <div class="flex justify-end pt-2 border-t border-gray-100">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200">
              <!-- SVG animado de Tailwind para el loading -->
              <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSubmitting ? 'Guardando...' : 'Registrar Movimiento' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
