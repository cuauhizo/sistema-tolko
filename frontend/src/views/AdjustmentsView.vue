<script setup>
  import { ref, onMounted } from 'vue'
  import { useInventoryStore } from '../stores/inventory'
  import { useProductsStore } from '../stores/products'

  import Select from 'primevue/select'

  const inventoryStore = useInventoryStore()
  const productsStore = useProductsStore()

  const formData = ref({
    product_id: '',
    movement_type: '',
    quantity: 1,
    reason: '',
    motivo_merma: '',
  })

  const isSubmitting = ref(false)
  const successMessage = ref('')
  const errorMessage = ref('')

  const motivosMerma = ref([
    {
      label: 'Operación y Producción',
      items: [
        { label: 'Error de impresión / Pruebas', value: 'Error de impresión / Pruebas' },
        { label: 'Mala manipulación / Corte', value: 'Mala manipulación / Corte' },
        { label: 'Derrame de material', value: 'Derrame de material' },
      ],
    },
    {
      label: 'Calidad',
      items: [
        { label: 'Defecto de fábrica (Proveedor)', value: 'Defecto de fábrica (Proveedor)' },
        { label: 'Caducidad de material', value: 'Caducidad de material' },
      ],
    },
    {
      label: 'Almacén',
      items: [
        { label: 'Error de conteo (Ajuste a favor/contra)', value: 'Error de conteo (Ajuste)' },
        { label: 'Pérdida / Extravío', value: 'Pérdida / Extravío' },
      ],
    },
    {
      label: 'Excepciones',
      items: [{ label: 'Otro (Especificar en notas)', value: 'Otro' }],
    },
  ])

  onMounted(() => {
    productsStore.fetchProducts()
  })

  const submitAdjustment = async () => {
    isSubmitting.value = true
    successMessage.value = ''
    errorMessage.value = ''

    try {
      const payload = { ...formData.value }

      if (payload.movement_type === 'MERMA') {
        payload.reason = payload.motivo_merma ? `${payload.motivo_merma} ${payload.reason ? ' - ' + payload.reason : ''}` : payload.reason
      }

      await inventoryStore.registerMovement(payload)
      successMessage.value = '¡Movimiento registrado con éxito y stock actualizado!'

      formData.value = { product_id: '', movement_type: '', quantity: 1, reason: '', motivo_merma: '' }

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
        <div class="flex-shrink-0"><span class="text-green-500 font-bold">✓</span></div>
        <div class="ml-3">
          <p class="text-sm text-green-700">{{ successMessage }}</p>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md shadow-sm">
      <div class="flex">
        <div class="flex-shrink-0"><span class="text-red-500 font-bold">⚠</span></div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Formulario -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
      <div class="p-6 sm:p-8">
        <form @submit.prevent="submitAdjustment">
          <!-- Fila 1: Producto y Tipo -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label for="product" class="block text-sm font-medium text-gray-700 mb-1">
                Producto
                <span class="text-red-500">*</span>
              </label>
              <!-- Selector de Productos (CORREGIDO) -->
              <Select
                v-model="formData.product_id"
                :options="productsStore.products"
                optionLabel="name"
                optionValue="id"
                :filterFields="['name', 'sku']"
                filter
                filterPlaceholder="Buscar producto por nombre o SKU..."
                placeholder="Seleccione un producto..."
                class="w-full border shadow-sm rounded-md mt-1">
                <template #option="slotProps">
                  <div class="flex items-center justify-between w-full">
                    <span>{{ slotProps.option.name }}</span>
                    <span class="text-xs ml-4" :class="slotProps.option.stock <= 0 ? 'text-red-500 font-bold' : 'text-gray-500'">(Disp: {{ slotProps.option.stock }} {{ slotProps.option.unit }})</span>
                  </div>
                </template>
              </Select>
            </div>

            <div>
              <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimiento
                <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.movement_type"
                @change="formData.motivo_merma = ''"
                id="type"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border shadow-sm"
                required>
                <option value="" disabled>Seleccione el tipo...</option>
                <option value="ENTRADA">Entrada (Compra/Reabastecimiento)</option>
                <option value="SALIDA">Salida (Consumo manual)</option>
                <option value="MERMA">Merma (Daño/Caducidad)</option>
                <option value="AJUSTE">Ajuste de Inventario</option>
              </select>
            </div>
          </div>

          <!-- Fila 2: Cantidad y (Catálogo Condicional) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
                <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                v-model="formData.quantity"
                id="quantity"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                min="0.01"
                required />
            </div>

            <div v-if="formData.movement_type === 'MERMA'">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Motivo de la Merma
                <span class="text-red-500">*</span>
              </label>
              <Select
                v-model="formData.motivo_merma"
                :options="motivosMerma"
                optionLabel="label"
                optionValue="value"
                optionGroupLabel="label"
                optionGroupChildren="items"
                placeholder="Seleccione un motivo..."
                class="w-full border shadow-sm rounded-md mt-1">
                <template #optiongroup="slotProps">
                  <div class="flex items-center font-bold text-gray-800 bg-gray-50 px-2 py-1">
                    {{ slotProps.option.label }}
                  </div>
                </template>
              </Select>
            </div>
          </div>

          <!-- Motivo / Notas General -->
          <div class="mb-6">
            <label for="reason" class="block text-sm font-medium text-gray-700 mb-1">
              {{ formData.movement_type === 'MERMA' ? 'Notas Adicionales (Opcional)' : 'Motivo / Notas' }}
            </label>
            <textarea
              v-model="formData.reason"
              id="reason"
              rows="2"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              :placeholder="formData.movement_type === 'ENTRADA' ? 'Ej. Factura #1234...' : 'Escribe los detalles aquí...'"></textarea>
          </div>

          <!-- Botón de Envío -->
          <div class="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              :disabled="isSubmitting || !formData.product_id || !formData.movement_type || (formData.movement_type === 'MERMA' && !formData.motivo_merma)"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200">
              <i v-if="isSubmitting" class="pi pi-spin pi-spinner mr-2"></i>
              {{ isSubmitting ? 'Guardando...' : 'Registrar Movimiento' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
