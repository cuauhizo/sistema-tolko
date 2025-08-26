<script setup>
import { ref, watch } from 'vue'

// 1. Define las props que el componente puede recibir
const props = defineProps({
  productToEdit: {
    type: Object,
    default: null,
  },
})

const product = ref({})
const modalTitle = ref('Agregar Nuevo Producto')

// 2. Observa cambios en la prop 'productToEdit'
watch(
  () => props.productToEdit,
  (newProduct) => {
    if (newProduct) {
      // Si se pasa un producto para editar, llena el formulario con sus datos
      product.value = { ...newProduct }
      modalTitle.value = 'Editar Producto'
    } else {
      // Si no, resetea el formulario para modo "Agregar"
      resetForm()
    }
  },
)

const emit = defineEmits(['submit'])

const handleSubmit = () => {
  emit('submit', { ...product.value })
}

const resetForm = () => {
  product.value = { name: '', description: '', stock: 0, price: 0, unit: 'piezas' }
  modalTitle.value = 'Agregar Nuevo Producto'
}

defineExpose({
  resetForm,
})
</script>

<template>
  <div
    class="modal fade"
    id="productModal"
    tabindex="-1"
    aria-labelledby="productModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="productModalLabel">{{ modalTitle }}</h5>
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
              <label for="name" class="form-label">Nombre del Producto</label>
              <input type="text" class="form-control" id="name" v-model="product.name" required />
            </div>
            <div class="mb-3">
              <label for="description" class="form-label">Descripción</label>
              <textarea
                class="form-control"
                id="description"
                v-model="product.description"
                rows="3"
              ></textarea>
            </div>
            <div class="row">
              <div class="col-md-4 mb-3">
                <label for="stock" class="form-label">Stock</label>
                <input
                  type="number"
                  class="form-control"
                  id="stock"
                  v-model.number="product.stock"
                  required
                  min="0"
                />
              </div>
              <div class="col-md-4 mb-3">
                <label for="price" class="form-label">Precio</label>
                <input
                  type="number"
                  class="form-control"
                  id="price"
                  v-model.number="product.price"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div class="col-md-4 mb-3">
                <label for="unit" class="form-label">Unidad</label>
                <select class="form-select" id="unit" v-model="product.unit">
                  <option value="piezas">Piezas</option>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="metros">Metros (m)</option>
                  <option value="litros">Litros (l)</option>
                  <option value="cajas">Cajas</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
