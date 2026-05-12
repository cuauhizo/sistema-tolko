<script setup>
import { ref, watch, computed } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'

// --- Props y Emits ---
const props = defineProps({
  userToEdit: {
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
const user = ref({})
const modalTitle = ref('Nuevo Usuario')
const isEditMode = ref(false)
const showPassword = ref(false) // El "ojito" para la contraseña

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// --- Esquema de Validación Dinámico ---
const schema = computed(() => {
  return yup.object({
    username: yup.string().required('El nombre es obligatorio').trim(),
    email: yup
      .string()
      .required('El email es obligatorio')
      .email('El email no tiene un formato válido')
      .trim(),
    password: yup.string().when([], {
      is: () => !isEditMode.value,
      then: (schema) => schema.required('La contraseña es obligatoria').min(6, 'Mínimo 6 caracteres'),
      otherwise: (schema) => schema.min(6, 'Mínimo 6 caracteres').nullable().transform((value) => value || null),
    }),
    role_id: yup.number().required('El rol es obligatorio').typeError('Debe seleccionar un rol'),
  })
})

// --- Funciones del Componente ---
const resetForm = () => {
  user.value = { username: '', email: '', password: '', role_id: 2 } 
  modalTitle.value = 'Nuevo Usuario'
  isEditMode.value = false
  showPassword.value = false
}

const handleSubmit = (values) => {
  if (isEditMode.value && !values.password) {
    delete values.password
  }
  const finalUser = { id: user.value.id, ...values }
  emit('submit', finalUser)
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
watch(
  () => props.userToEdit,
  (newUser) => {
    if (newUser) {
      user.value = { ...newUser, password: '' } 
      modalTitle.value = 'Editar Usuario'
      isEditMode.value = true
    } else {
      resetForm()
    }
    showPassword.value = false
    formKey.value += 1 
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center overflow-x-hidden overflow-y-auto px-4">
    
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>

    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg z-50 transform transition-all flex flex-col max-h-[90vh]">
      
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
            <i :class="isEditMode ? 'pi pi-user-edit' : 'pi pi-user-plus'" class="text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900">{{ modalTitle }}</h3>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 ml-auto inline-flex items-center transition-colors">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <Form
        ref="veeForm"
        :key="formKey"
        @submit="handleSubmit"
        :validation-schema="schema"
        :initial-values="user"
        v-slot="{ errors }"
        class="flex flex-col overflow-hidden"
      >
        <div class="px-6 py-5 overflow-y-auto flex-grow space-y-4">
          
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i class="pi pi-user"></i>
              </span>
              <Field
                type="text"
                id="username"
                name="username"
                class="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                :class="errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'"
                placeholder="Ej. juanperez"
              />
            </div>
            <ErrorMessage name="username" class="text-red-500 text-xs mt-1 block font-medium" />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i class="pi pi-envelope"></i>
              </span>
              <Field
                type="email"
                id="email"
                name="email"
                class="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                :class="errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'"
                placeholder="juan@ejemplo.com"
              />
            </div>
            <ErrorMessage name="email" class="text-red-500 text-xs mt-1 block font-medium" />
          </div>

          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Rol del Sistema</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i class="pi pi-id-card"></i>
              </span>
              <Field
                as="select"
                id="role"
                name="role_id"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                :class="errors.role_id ? 'border-red-500 bg-red-50' : 'border-gray-300'"
              >
                <option value="1">Administrador</option>
                <option value="2">Usuario Estándar</option>
              </Field>
            </div>
            <ErrorMessage name="role_id" class="text-red-500 text-xs mt-1 block font-medium" />
          </div>

          <div class="pt-2">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i class="pi pi-lock"></i>
              </span>
              <Field
                :type="showPassword ? 'text' : 'password'"
                id="password"
                name="password"
                class="block w-full pl-10 pr-12 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                :class="errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'"
                placeholder="••••••••"
              />
              <button 
                type="button"
                @click="togglePasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 focus:outline-none transition-colors"
                tabindex="-1"
              >
                <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-lg"></i>
              </button>
            </div>
            <ErrorMessage name="password" class="text-red-500 text-xs mt-1 block font-medium" />
            
            <div v-if="isEditMode" class="mt-2 flex items-start text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
              <i class="pi pi-info-circle mr-1.5 mt-0.5"></i>
              <span>Deja la contraseña en blanco si no deseas cambiarla. Solo llénala si quieres asignarle una nueva a este usuario.</span>
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