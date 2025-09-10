<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import { Modal } from 'bootstrap'

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

// --- Refs para el DOM y la instancia de Bootstrap ---
const modalElement = ref(null)
const modalInstance = ref(null)
const veeForm = ref(null)
const formKey = ref(0)

// --- Estado del Componente ---
const user = ref({})
const modalTitle = ref('Nuevo Usuario')
const isEditMode = ref(false)

// --- Esquema de Validación Dinámico ---
// Usamos 'computed' para que las reglas de validación cambien según si estamos editando o creando.
const schema = computed(() => {
  return yup.object({
    username: yup.string().required('El nombre es obligatorio').trim(),
    email: yup
      .string()
      .required('El email es obligatorio')
      .email('El email no tiene un formato válido')
      .trim(),
    // La validación de la contraseña es condicional
    password: yup.string().when([], {
      is: () => !isEditMode.value, // Si NO estamos en modo edición (es nuevo)
      then: (schema) =>
        schema.required('La contraseña es obligatoria').min(6, 'Mínimo 6 caracteres'),
      otherwise: (schema) =>
        schema
          .min(6, 'Mínimo 6 caracteres')
          .nullable()
          .transform((value) => value || null), // Si estamos editando, es opcional
    }),
    role_id: yup.number().required('El rol es obligatorio').typeError('Debe seleccionar un rol'),
  })
})

// --- Funciones del Componente ---
const resetForm = () => {
  user.value = { username: '', email: '', password: '', role_id: 2 } // User por defecto
  modalTitle.value = 'Nuevo Usuario'
  isEditMode.value = false
}

const handleSubmit = (values) => {
  // Si estamos editando y la contraseña está vacía, no la enviamos al backend.
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

const openModal = () => modalInstance.value?.show()
const closeModal = () => modalInstance.value?.hide()

defineExpose({ openModal, closeModal })

// --- Watchers y Lifecycle Hooks ---
watch(
  () => props.userToEdit,
  (newUser) => {
    if (newUser) {
      user.value = { ...newUser, password: '' } // No precargamos la contraseña por seguridad
      modalTitle.value = 'Editar Usuario'
      isEditMode.value = true
    } else {
      resetForm()
    }
    formKey.value += 1 // Forzar reinicio del formulario
  },
  { immediate: true },
)

onMounted(() => {
  if (modalElement.value) {
    modalInstance.value = new Modal(modalElement.value)
    modalElement.value.addEventListener('hidden.bs.modal', cleanupValidation)
  }
})

onUnmounted(() => {
  if (modalElement.value) {
    modalElement.value.removeEventListener('hidden.bs.modal', cleanupValidation)
  }
})
</script>

<template>
  <div
    ref="modalElement"
    class="modal fade"
    id="userModal"
    tabindex="-1"
    aria-labelledby="userModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="userModalLabel">{{ modalTitle }}</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Cerrar"
          ></button>
        </div>
        <Form
          ref="veeForm"
          :key="formKey"
          @submit="handleSubmit"
          :validation-schema="schema"
          :initial-values="user"
          v-slot="{ errors }"
        >
          <div class="modal-body">
            <div class="mb-3">
              <label for="username" class="form-label">Nombre de Usuario</label>
              <Field
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.username }"
                id="username"
                name="username"
              />
              <ErrorMessage name="username" class="invalid-feedback" />
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Correo Electrónico</label>
              <Field
                type="email"
                class="form-control"
                :class="{ 'is-invalid': errors.email }"
                id="email"
                name="email"
              />
              <ErrorMessage name="email" class="invalid-feedback" />
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <Field
                type="password"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
                id="password"
                name="password"
              />
              <ErrorMessage name="password" class="invalid-feedback" />
              <small v-if="isEditMode" class="form-text text-muted"
                >Dejar en blanco para no cambiar la contraseña.</small
              >
            </div>
            <div class="mb-3">
              <label for="role" class="form-label">Rol</label>
              <Field
                as="select"
                class="form-select"
                :class="{ 'is-invalid': errors.role_id }"
                id="role"
                name="role_id"
              >
                <option value="1">Admin</option>
                <option value="2">User</option>
              </Field>
              <ErrorMessage name="role_id" class="invalid-feedback" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              <span
                v-if="isSaving"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              <span>{{ isSaving ? 'Guardando...' : 'Guardar' }}</span>
            </button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>
