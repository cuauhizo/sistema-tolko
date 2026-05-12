<script setup>
import { ref, watch } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'

// --- Props y Emits ---
const props = defineProps({
  categoryToEdit: {
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
const isOpen = ref(false) // <-- ¡Nuestra nueva forma de controlar el modal!
const category = ref({})
const modalTitle = ref('Nueva Categoría')

// --- Esquema de Validación con Yup ---
const schema = yup.object({
  name: yup.string().required('El nombre de la categoría es obligatorio').trim(),
})

// --- Funciones del Componente ---
const resetForm = () => {
  category.value = { name: '' }
  modalTitle.value = 'Nueva Categoría'
}

const handleSubmit = (values) => {
  const finalCategory = { id: category.value.id, ...values }
  emit('submit', finalCategory)
}

const cleanupValidation = () => {
  if (veeForm.value) {
    veeForm.value.resetForm()
  }
}

// Estos métodos son los que llama el padre (CategoriesView.vue) a través de "ref"
const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
  cleanupValidation()
}

defineExpose({ openModal, closeModal })

// --- Watchers ---
watch(
  () => props.categoryToEdit,
  (newCategory) => {
    if (newCategory) {
      category.value = { ...newCategory }
      modalTitle.value = 'Editar Categoría'
    } else {
      resetForm()
    }
    formKey.value += 1
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center overflow-x-hidden overflow-y-auto">
    
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>

    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 z-50 transform transition-all">
      
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-bold text-gray-900">{{ modalTitle }}</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 ml-auto inline-flex items-center transition-colors">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <Form
        ref="veeForm"
        :key="formKey"
        @submit="handleSubmit"
        :validation-schema="schema"
        :initial-values="category"
        v-slot="{ errors }"
      >
        <div class="px-6 py-5">
          <div class="mb-2">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Categoría</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i class="pi pi-tag"></i>
              </span>
              <Field
                type="text"
                id="name"
                name="name"
                class="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                :class="errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'"
                placeholder="Ej. Electrónica"
              />
            </div>
            <ErrorMessage name="name" class="text-red-500 text-xs mt-1 block font-medium" />
          </div>
        </div>

        <div class="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl space-x-3">
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