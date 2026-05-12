<script setup>
import { ref, watch, onMounted } from 'vue'
import { useUsersStore } from '../stores/users'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'

// --- Props y Emits ---
const props = defineProps({
  taskToEdit: {
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
const isOpen = ref(false) // Nuestro control nativo del modal

const usersStore = useUsersStore()
const task = ref({})
const modalTitle = ref('Asignar Nueva Tarea')
const isEditMode = ref(false)

// --- Esquema de Validación con Yup ---
const schema = yup.object({
  title: yup.string().required('El nombre es obligatorio').trim(),
  description: yup.string().required('La descripcion es obligatorio').trim(),
  due_date: yup.date().nullable().required('La fecha es obligatoria').typeError('Debe ser una fecha válida'),
  assigned_to_id: yup.number().required('Seleccionar un usuario es obligatorio').typeError('Debe seleccionar un usuario'),
  status: yup.string().when('isEditMode', { 
    is: true,
    then: schema => schema.required('El estado es obligatorio'),
    otherwise: schema => schema.notRequired(),
  }),
})

// --- Funciones del Componente ---
const resetForm = () => {
  task.value = { title: '', description: '', due_date: null, assigned_to_id: null, status: 'pendiente' }
  modalTitle.value = 'Asignar Nueva Tarea'
  isEditMode.value = false
}

const handleSubmit = (values) => {
  const finalTask = { id: task.value.id, ...values }
  emit('submit', finalTask)
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

defineExpose({ openModal, closeModal })

// --- Watchers ---
watch(() => props.taskToEdit, (newTask) => {
  if (newTask) {
    const formattedTask = { ...newTask }
    if (formattedTask.due_date) {
      formattedTask.due_date = new Date(formattedTask.due_date).toISOString().split('T')[0]
    }
    task.value = formattedTask
    modalTitle.value = 'Editar Tarea'
    isEditMode.value = true
  } else {
    resetForm()
  }
  formKey.value += 1 
}, { immediate: true })

onMounted(() => {
  usersStore.fetchUsers()
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-6">
    
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>

    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl z-50 transform transition-all flex flex-col max-h-[90vh]">
      
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
        <h3 class="text-xl font-bold text-gray-900">{{ modalTitle }}</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 ml-auto inline-flex items-center transition-colors">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <Form ref="veeForm" :key="formKey" @submit="handleSubmit" :validation-schema="schema" :initial-values="task" v-slot="{ errors }" class="flex flex-col overflow-hidden">
        
        <div class="px-6 py-5 overflow-y-auto flex-grow">
          
          <div class="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
            <div :class="isEditMode ? 'md:col-span-8' : 'md:col-span-12'">
              <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Título de la Tarea</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="pi pi-check-square"></i>
                </span>
                <Field 
                  type="text" 
                  id="title" 
                  name="title" 
                  class="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  :class="errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'"
                  placeholder="Ej. Revisar inventario de herramientas"
                />
              </div>
              <ErrorMessage name="title" class="text-red-500 text-xs mt-1 block font-medium" />
            </div>

            <div v-if="isEditMode" class="md:col-span-4">
              <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <Field 
                as="select" 
                id="status" 
                name="status"
                class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                :class="errors.status ? 'border-red-500 bg-red-50' : 'border-gray-300'"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completada</option>
              </Field>
              <ErrorMessage name="status" class="text-red-500 text-xs mt-1 block font-medium" />
            </div>
          </div>

          <div class="mb-5">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Descripción y Comentarios</label>
            <Field 
              as="textarea" 
              id="description" 
              name="description" 
              rows="4"
              class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              :class="errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'"
              placeholder="Detalla los pasos o requerimientos para cumplir esta tarea..."
            />
            <ErrorMessage name="description" class="text-red-500 text-xs mt-1 block font-medium" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
            <div>
              <label for="assigned_to_id" class="block text-sm font-medium text-gray-700 mb-1">Asignar a</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="pi pi-user"></i>
                </span>
                <Field 
                  as="select" 
                  id="assigned_to_id" 
                  name="assigned_to_id"
                  class="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                  :class="errors.assigned_to_id ? 'border-red-500 bg-red-50' : 'border-gray-300'"
                >
                  <option :value="null" disabled>Selecciona un usuario</option>
                  <option v-for="user in usersStore.users" :key="user.id" :value="user.id">
                    {{ user.username }}
                  </option>
                </Field>
              </div>
              <ErrorMessage name="assigned_to_id" class="text-red-500 text-xs mt-1 block font-medium" />
            </div>

            <div>
              <label for="due_date" class="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="pi pi-calendar"></i>
                </span>
                <Field 
                  type="date" 
                  id="due_date" 
                  name="due_date" 
                  class="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  :class="errors.due_date ? 'border-red-500 bg-red-50' : 'border-gray-300'"
                />
              </div>
              <ErrorMessage name="due_date" class="text-red-500 text-xs mt-1 block font-medium" />
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