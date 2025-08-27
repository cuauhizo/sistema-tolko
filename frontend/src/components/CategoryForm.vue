<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  categoryToEdit: {
    type: Object,
    default: null,
  },
})

const category = ref({ name: '' })
const modalTitle = ref('Nueva Categoría')

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
  },
)

const emit = defineEmits(['submit'])

const handleSubmit = () => {
  emit('submit', { ...category.value })
}

const resetForm = () => {
  category.value = { name: '' }
  modalTitle.value = 'Nueva Categoría'
}

defineExpose({ resetForm })
</script>

<template>
  <div
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
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="mb-3">
              <label for="categoryName" class="form-label">Nombre de la Categoría</label>
              <input
                type="text"
                class="form-control"
                id="categoryName"
                v-model="category.name"
                required
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
