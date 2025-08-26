<script setup>
import { ref } from 'vue'
import { useProductsStore } from '../stores/products'

defineProps({
  products: {
    type: Array,
    required: true,
  },
})

const productsStore = useProductsStore()
const productToDelete = ref(null) // Guardará el producto que estamos por eliminar

const setProductToDelete = (product) => {
  productToDelete.value = product
}

const confirmDelete = () => {
  if (productToDelete.value) {
    productsStore.deleteProduct(productToDelete.value.id)
  }
}

// 1. Define el evento que el componente puede emitir
const emit = defineEmits(['edit-product'])

const handleEditClick = (product) => {
  // 2. Emite el evento 'edit-product' con el objeto del producto
  emit('edit-product', product)
}
</script>

<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover align-middle">
      <thead class="table-dark">
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Stock</th>
          <th>Unidad</th>
          <th>Precio</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="products.length === 0">
          <td colspan="6" class="text-center">No hay productos para mostrar.</td>
        </tr>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.name }}</td>
          <td>{{ product.description }}</td>
          <td>{{ product.stock }}</td>
          <td>{{ product.unit }}</td>
          <td>${{ product.price }}</td>
          <td>
            <button
              class="btn btn-sm btn-warning me-2"
              data-bs-toggle="modal"
              data-bs-target="#productModal"
              @click="handleEditClick(product)"
            >
              Editar
            </button>
            <button
              class="btn btn-sm btn-danger"
              data-bs-toggle="modal"
              data-bs-target="#deleteConfirmModal"
              @click="setProductToDelete(product)"
            >
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div
    class="modal fade"
    id="deleteConfirmModal"
    tabindex="-1"
    aria-labelledby="deleteModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="deleteModalLabel">Confirmar Eliminación</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Cerrar"
          ></button>
        </div>
        <div class="modal-body">
          <p v-if="productToDelete">
            ¿Estás seguro de que deseas eliminar el producto:
            <strong>{{ productToDelete.name }}</strong
            >?
          </p>
          <p>Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button
            type="button"
            class="btn btn-danger"
            data-bs-dismiss="modal"
            @click="confirmDelete"
          >
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-responsive {
  margin-top: 1.5rem;
}
</style>
