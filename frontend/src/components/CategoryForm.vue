<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import { Modal } from 'bootstrap'

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

// --- Refs para el DOM y la instancia de Bootstrap ---
const modalElement = ref(null)
const modalInstance = ref(null)
const veeForm = ref(null)
const formKey = ref(0)

// --- Estado del Componente ---
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
  // Emite los datos al componente padre para que él los procese.
  emit('submit', finalCategory)
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

// Observa si se pasa una categoría para editar
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

// Se ejecuta una vez que el componente está montado en el DOM.
onMounted(() => {
  // Crea la instancia del modal de Bootstrap y la guarda.
  if (modalElement.value) {
    modalInstance.value = new Modal(modalElement.value)
    // Añade un "oyente" para limpiar la validación cuando el modal se cierre.
    modalElement.value.addEventListener('hidden.bs.modal', cleanupValidation)
  }
})

// Se ejecuta justo antes de que el componente se destruya.
onUnmounted(() => {
  // Limpia el "oyente" para evitar fugas de memoria.
  if (modalElement.value) {
    modalElement.value.removeEventListener('hidden.bs.modal', cleanupValidation)
  }
})
</script>

<template>
  <div
    ref="modalElement"
    class="modal fade"
    id="categoryModal"
    tabindex="-1"
    aria-labelledby="categoryModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="categoryModalLabel">{{ modalTitle }}</h5>
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
          :initial-values="category"
          v-slot="{ errors }"
        >
          <div class="modal-body">
            <div class="mb-3">
              <label for="name" class="form-label">Nombre de la Categoría</label>
              <Field
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.name }"
                id="name"
                name="name"
              />
              <ErrorMessage name="name" class="invalid-feedback" />
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
