<script setup>
import { ref, watch, onMounted } from 'vue'
import { useUsersStore } from '../stores/users'
import { useProductsStore } from '../stores/products'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import MultiSelect from 'primevue/multiselect'

// --- Props y Emits ---
const props = defineProps({
  orderToEdit: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['submit'])

// --- Refs y Estado ---
const veeForm = ref(null)
const formKey = ref(0)
const isOpen = ref(false) // Control nativo del modal

// --- Stores ---
const usersStore = useUsersStore()
const productsStore = useProductsStore()

// --- Estado del Componente ---
const order = ref({})
const modalTitle = ref('Nueva Orden de Trabajo')
const productSearch = ref(null)
const isEditMode = ref(false)

// --- Esquema de Validación con Yup ---
const schema = yup.object({
  title: yup.string().required('El título es obligatorio').trim(),
  client_name: yup.string().required('El cliente es obligatorio').trim(),
  assigned_to_ids: yup.array().min(1, 'Debe asignar al menos un usuario').required('Debe asignar un usuario.'),
  description: yup.string().required('La descripción es obligatoria').trim(),
  start_date: yup.date().nullable().required('La fecha de inicio es obligatoria').typeError('Debe ser una fecha válida'),
  end_date: yup.date().nullable().required('La fecha de finalización es obligatoria').typeError('Debe ser una fecha válida'),
  status: yup.string().when('isEditMode', {
    is: true,
    then: schema => schema.required('El estado es obligatorio'),
    otherwise: schema => schema.notRequired(),
  }),
})

// --- Funciones del Componente ---
const resetForm = () => {
  order.value = {
    title: '',
    client_name: '',
    description: '',
    assigned_to_ids: [],
    start_date: null,
    end_date: null,
    status: 'pendiente',
    products: [],
  }
  modalTitle.value = 'Nueva Orden de Trabajo'
  isEditMode.value = false
  productSearch.value = null
}

const handleSubmit = values => {
  const finalOrder = {
    ...values,
    id: order.value.id,
    products: order.value.products,
  }
  emit('submit', finalOrder)
}

const getProductStock = productId => {
  const product = productsStore.products.find(p => p.id === productId)
  return product ? product.stock : 0
}

const cleanupValidation = () => {
  if (veeForm.value) {
    veeForm.value.resetForm()
  }
}

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
  cleanupValidation()
}

defineExpose({ openModal, closeModal, resetForm })

// --- Watchers ---
watch(
  () => props.orderToEdit,
  newOrder => {
    if (newOrder) {
      const formattedOrder = { ...newOrder }
      if (formattedOrder.start_date) {
        formattedOrder.start_date = new Date(formattedOrder.start_date).toISOString().split('T')[0]
      }
      if (formattedOrder.end_date) {
        formattedOrder.end_date = new Date(formattedOrder.end_date).toISOString().split('T')[0]
      }
      order.value = formattedOrder
      modalTitle.value = 'Editar Orden de Trabajo'
      isEditMode.value = true
    } else {
      resetForm()
    }
    formKey.value += 1
  },
  { immediate: true },
)

onMounted(() => {
  usersStore.fetchUsers()
  productsStore.fetchProducts()
})

// --- Lógica para añadir/quitar productos ---
const addProductToOrder = () => {
  if (!productSearch.value) return
  const product = productsStore.products.find(p => p.id === productSearch.value)
  const alreadyAdded = order.value.products.some(p => p.product_id === product.id)

  if (product && !alreadyAdded) {
    order.value.products.push({
      product_id: product.id,
      name: product.name,
      quantity_used: 1,
    })
  }
  productSearch.value = null
}

const removeProduct = productId => {
  order.value.products = order.value.products.filter(p => p.product_id !== productId)
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-6">
    
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>

    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl z-50 transform transition-all flex flex-col max-h-[95vh]">
      
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
        <h3 class="text-xl font-bold text-gray-900">{{ modalTitle }}</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 ml-auto inline-flex items-center transition-colors">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <Form ref="veeForm" :key="formKey" @submit="handleSubmit" :validation-schema="schema" :initial-values="order" v-slot="{ errors }" class="flex flex-col overflow-hidden">
        
        <div class="px-6 py-5 overflow-y-auto flex-grow">
          
          <div class="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
            <div :class="isEditMode ? 'md:col-span-4' : 'md:col-span-6'">
              <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Título de la Orden</label>
              <Field type="text" class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" :class="errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'" id="title" name="title" />
              <ErrorMessage name="title" class="text-red-500 text-xs mt-1 block" />
            </div>

            <div :class="isEditMode ? 'md:col-span-4' : 'md:col-span-6'">
              <label for="client_name" class="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-building"></i></span>
                <Field type="text" class="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" :class="errors.client_name ? 'border-red-500 bg-red-50' : 'border-gray-300'" id="client_name" name="client_name" />
              </div>
              <ErrorMessage name="client_name" class="text-red-500 text-xs mt-1 block" />
            </div>

            <div v-if="isEditMode" class="md:col-span-4">
              <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <Field as="select" class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white" :class="errors.status ? 'border-red-500 bg-red-50' : 'border-gray-300'" id="status" name="status">
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="por_aprobar">Pendiente de Aprobación</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </Field>
              <ErrorMessage name="status" class="text-red-500 text-xs mt-1 block" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
            <div class="md:col-span-4">
              <label for="assigned_to_ids" class="block text-sm font-medium text-gray-700 mb-1">Asignar a</label>
              <Field name="assigned_to_ids" v-slot="{ field }">
                <MultiSelect
                  :modelValue="field.value"
                  @update:modelValue="field.onChange($event)"
                  :options="usersStore.users"
                  optionLabel="username"
                  optionValue="id"
                  :maxSelectedLabels="3"
                  placeholder="Selecciona usuarios"
                  class="w-full border shadow-sm rounded-md"
                  :class="errors.assigned_to_ids ? 'border-red-500' : 'border-gray-300'"
                  display="chip" 
                />
              </Field>
              <ErrorMessage name="assigned_to_ids" class="text-red-500 text-xs mt-1 block" />
            </div>

            <div class="md:col-span-4">
              <label for="start_date" class="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-calendar-plus"></i></span>
                <Field type="date" class="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" :class="errors.start_date ? 'border-red-500 bg-red-50' : 'border-gray-300'" id="start_date" name="start_date" />
              </div>
              <ErrorMessage name="start_date" class="text-red-500 text-xs mt-1 block" />
            </div>

            <div class="md:col-span-4">
              <label for="end_date" class="block text-sm font-medium text-gray-700 mb-1">Fecha de Finalización</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-calendar-times"></i></span>
                <Field type="date" class="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" :class="errors.end_date ? 'border-red-500 bg-red-50' : 'border-gray-300'" id="end_date" name="end_date" />
              </div>
              <ErrorMessage name="end_date" class="text-red-500 text-xs mt-1 block" />
            </div>
          </div>

          <div class="mb-8">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Descripción de la Tarea</label>
            <Field as="textarea" rows="3" class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" :class="errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'" id="description" name="description" placeholder="Escribe los detalles del trabajo a realizar..." />
            <ErrorMessage name="description" class="text-red-500 text-xs mt-1 block" />
          </div>

          <hr class="border-gray-200 mb-6" />

          <div>
            <h5 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <i class="pi pi-box mr-2 text-blue-600"></i> Materiales / Productos a Utilizar
            </h5>
            
            <div class="flex flex-col sm:flex-row gap-3 mb-4 items-end">
              <div class="flex-grow">
                <label for="productSearch" class="block text-sm font-medium text-gray-700 mb-1">Buscar Producto</label>
                <select class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white" id="productSearch" v-model="productSearch">
                  <option :value="null" disabled>Selecciona un producto del inventario...</option>
                  <option v-for="product in productsStore.products" :key="product.id" :value="product.id">
                    {{ product.name }} (Disponible: {{ product.stock }})
                  </option>
                </select>
              </div>
              <button type="button" @click="addProductToOrder" class="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-md border border-gray-300 transition-colors flex items-center justify-center">
                <i class="pi pi-plus mr-2"></i> Añadir
              </button>
            </div>

            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Cantidad</th>
                    <th scope="col" class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Acción</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-if="order.products.length === 0">
                    <td colspan="3" class="px-4 py-6 text-center text-sm text-gray-500 italic">No se han añadido materiales a esta orden.</td>
                  </tr>
                  <tr v-for="item in order.products" :key="item.product_id" class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm text-gray-900">
                      <div class="font-medium">{{ item.name }}</div>
                      <div v-if="item.quantity_used > getProductStock(item.product_id)" class="text-xs text-red-500 flex items-center mt-1">
                        <i class="pi pi-exclamation-triangle mr-1"></i> Stock insuficiente (Disp: {{ getProductStock(item.product_id) }})
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <input
                        type="number"
                        v-model.number="item.quantity_used"
                        min="1"
                        class="block w-full px-2 py-1 text-sm border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        :class="item.quantity_used > getProductStock(item.product_id) ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300'" 
                      />
                    </td>
                    <td class="px-4 py-3 text-center">
                      <button type="button" @click="removeProduct(item.product_id)" class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors" title="Quitar">
                        <i class="pi pi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
          </div>
        </div>

        <div class="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0 space-x-3 rounded-b-xl">
          <button type="button" @click="closeModal" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Cancelar
          </button>
          <button type="submit" :disabled="isSaving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed">
            <i v-if="isSaving" class="pi pi-spin pi-spinner mr-2"></i>
            <i v-else class="pi pi-save mr-2"></i>
            <span>{{ isSaving ? 'Guardando...' : 'Guardar' }}</span>
          </button>
        </div>
      </Form>
      
    </div>
  </div>
</template>