<script setup>
import { onMounted, ref } from 'vue'
import { useProductsStore } from '../stores/products'
import ProductList from '../components/ProductList.vue'
import ProductForm from '../components/ProductForm.vue'

const productsStore = useProductsStore()
const productToEdit = ref(null) // <-- 1. Estado para guardar el producto a editar

onMounted(() => {
  productsStore.fetchProducts()
})

// 2. Función para preparar el modo "Agregar"
const prepareNewProduct = () => {
  productToEdit.value = null // Limpiamos la variable para asegurar modo "Agregar"
}

// 3. Función para preparar el modo "Editar"
const prepareEditProduct = (product) => {
  productToEdit.value = product // Guardamos el producto que viene del evento de ProductList
}

// 4. Función unificada para manejar el envío del formulario
const handleFormSubmit = async (productData) => {
  if (productData.id) {
    // Si el producto tiene ID, es una actualización
    await productsStore.updateProduct(productData.id, productData)
  } else {
    // Si no tiene ID, es una creación
    await productsStore.addProduct(productData)
  }
}
</script>

<template>
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1>Inventario de Productos</h1>
      <button
        class="btn btn-success"
        data-bs-toggle="modal"
        data-bs-target="#productModal"
        @click="prepareNewProduct"
      >
        Agregar Producto
      </button>
    </div>

    <div v-if="productsStore.isLoading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <div v-else-if="productsStore.error" class="alert alert-danger">
      {{ productsStore.error }}
    </div>

    <ProductList v-else :products="productsStore.products" @edit-product="prepareEditProduct" />

    <ProductForm :product-to-edit="productToEdit" @submit="handleFormSubmit" />
  </div>
</template>
