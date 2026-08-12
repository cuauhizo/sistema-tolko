<script setup>
  import { ref, watch, onMounted } from 'vue'
  import { Form, Field, ErrorMessage } from 'vee-validate'
  import * as yup from 'yup'
  import { useSuppliersStore } from '../stores/suppliers'
  import { storeToRefs } from 'pinia'

  const props = defineProps({
    productToEdit: { type: Object, default: null },
    categories: { type: Array, required: true },
    isSaving: { type: Boolean, default: false },
  })
  const emit = defineEmits(['submit'])

  const veeForm = ref(null)
  const formKey = ref(0)
  const isOpen = ref(false)
  const product = ref({})
  const modalTitle = ref('Nuevo Producto')

  const suppliersStore = useSuppliersStore()
  const { suppliers } = storeToRefs(suppliersStore)

  onMounted(() => {
    suppliersStore.fetchSuppliers()
  })

  // Esquema de Validación actualizado con los nuevos campos
  const schema = yup.object({
    sku: yup.string().nullable(),
    name: yup.string().required('El nombre es obligatorio').trim(),
    category_id: yup.number().nullable(),
    supplier_id: yup.number().nullable(),
    description: yup.string().nullable(),
    stock: yup.number().required('El stock es obligatorio').min(0, 'No puede ser negativo').typeError('Debe ser número'),
    min_stock: yup.number().required('El stock mínimo es obligatorio').min(0, 'No puede ser negativo').typeError('Debe ser número'),
    max_stock: yup.number().nullable().typeError('Debe ser número'),
    price: yup.number().required('El precio es obligatorio').min(0, 'No puede ser negativo').typeError('Debe ser número'),
    unit: yup.string().required('La unidad es obligatoria'),
  })

  const resetForm = () => {
    product.value = {
      sku: '',
      name: '',
      description: '',
      stock: 0,
      min_stock: 0,
      max_stock: null,
      price: undefined,
      unit: 'piezas',
      category_id: null,
      supplier_id: null,
    }
    modalTitle.value = 'Nuevo Producto'
  }

  const handleSubmit = values => {
    const finalProduct = { id: product.value.id, ...values }
    emit('submit', finalProduct)
  }

  const cleanupValidation = () => {
    if (veeForm.value) veeForm.value.resetForm()
  }

  const openModal = () => (isOpen.value = true)
  const closeModal = () => {
    isOpen.value = false
    cleanupValidation()
  }

  defineExpose({ openModal, closeModal })

  watch(
    () => props.productToEdit,
    newProduct => {
      if (newProduct) {
        product.value = { ...newProduct }
        modalTitle.value = 'Editar Producto'
      } else {
        resetForm()
      }
      formKey.value += 1
    },
    { immediate: true },
  )
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center overflow-x-hidden overflow-y-auto px-4">
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>

    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl z-50 transform transition-all flex flex-col max-h-[90vh]">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
        <h3 class="text-xl font-bold text-gray-900">{{ modalTitle }}</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 ml-auto inline-flex items-center transition-colors">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <Form ref="veeForm" :key="formKey" @submit="handleSubmit" :validation-schema="schema" :initial-values="product" v-slot="{ errors }" class="flex flex-col overflow-hidden">
        <div class="px-6 py-5 overflow-y-auto flex-grow">
          <!-- Fila 1: SKU y Nombre -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
            <div class="md:col-span-4">
              <label for="sku" class="block text-sm font-medium text-gray-700 mb-1">SKU / Código</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-barcode"></i></span>
                <Field type="text" id="sku" name="sku" class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ej. LONA-13" />
              </div>
            </div>

            <div class="md:col-span-8">
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-box"></i></span>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  class="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  :class="errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'"
                  placeholder="Ej. Lona Front 13oz" />
              </div>
              <ErrorMessage name="name" class="text-red-500 text-xs mt-1 block font-medium" />
            </div>
          </div>

          <!-- Fila 2: Categoría y Proveedor -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
            <div class="md:col-span-6">
              <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-tags"></i></span>
                <Field as="select" id="category" name="category_id" class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                  <option :value="null">Sin categoría</option>
                  <option v-for="category in props.categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                </Field>
              </div>
            </div>

            <div class="md:col-span-6">
              <label for="supplier" class="block text-sm font-medium text-gray-700 mb-1">Proveedor (Opcional)</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-truck"></i></span>
                <Field as="select" id="supplier" name="supplier_id" class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                  <option :value="null">Ninguno / Producción Interna</option>
                  <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">{{ supplier.name }}</option>
                </Field>
              </div>
            </div>
          </div>

          <!-- Descripción -->
          <div class="mb-5">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <Field
              as="textarea"
              id="description"
              name="description"
              rows="2"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Detalles adicionales del producto..." />
          </div>

          <!-- Fila 3: Stock y Límites (Permite decimales) -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
            <div class="md:col-span-4">
              <label for="stock" class="block text-sm font-medium text-gray-700 mb-1">
                Stock Actual
                <span class="text-red-500">*</span>
              </label>
              <Field
                type="number"
                step="0.01"
                id="stock"
                name="stock"
                class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                :class="errors.stock ? 'border-red-500 bg-red-50' : 'border-gray-300'" />
              <ErrorMessage name="stock" class="text-red-500 text-xs mt-1 block" />
            </div>

            <div class="md:col-span-4">
              <label for="min_stock" class="block text-sm font-medium text-gray-700 mb-1">
                Stock Mínimo (Alerta)
                <span class="text-red-500">*</span>
              </label>
              <Field
                type="number"
                step="0.01"
                id="min_stock"
                name="min_stock"
                class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                :class="errors.min_stock ? 'border-red-500 bg-red-50' : 'border-gray-300'" />
              <ErrorMessage name="min_stock" class="text-red-500 text-xs mt-1 block" />
            </div>

            <div class="md:col-span-4">
              <label for="max_stock" class="block text-sm font-medium text-gray-700 mb-1">Stock Máximo</label>
              <Field type="number" step="0.01" id="max_stock" name="max_stock" class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Opcional" />
            </div>
          </div>

          <!-- Fila 4: Unidad y Precio -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div class="md:col-span-6">
              <label for="unit" class="block text-sm font-medium text-gray-700 mb-1">
                Unidad de Medida
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-list"></i></span>
                <Field
                  as="select"
                  id="unit"
                  name="unit"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                  :class="errors.unit ? 'border-red-500 bg-red-50' : 'border-gray-300'">
                  <option value="piezas">Piezas</option>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="metros">Metros (m)</option>
                  <option value="litros">Litros (l)</option>
                  <option value="cajas">Cajas</option>
                </Field>
              </div>
            </div>

            <div class="md:col-span-6">
              <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
                Precio Unitario
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-dollar"></i></span>
                <Field
                  type="number"
                  step="0.01"
                  id="price"
                  name="price"
                  class="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  :class="errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'" />
              </div>
              <ErrorMessage name="price" class="text-red-500 text-xs mt-1 block" />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0 space-x-3 rounded-b-xl">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSaving"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed">
            <i v-if="isSaving" class="pi pi-spin pi-spinner mr-2"></i>
            <i v-else class="pi pi-save mr-2"></i>
            <span>{{ isSaving ? 'Guardando...' : 'Guardar' }}</span>
          </button>
        </div>
      </Form>
    </div>
  </div>
</template>
