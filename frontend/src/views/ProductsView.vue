<script setup>
// --- Importaciones ---
import { onMounted, ref } from 'vue'
import { useProductsStore } from '../stores/products'
import { useCategoriesStore } from '../stores/categories' // Necesario para el formulario
import ProductForm from '../components/ProductForm.vue'
import { Modal } from 'bootstrap'

// Importaciones de PrimeVue para la tabla
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { FilterMatchMode } from '@primevue/core/api'

// --- Estado del Componente ---
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore() // Se necesita para pasar las categorías al formulario

// Refs para controlar los datos y los modales
const productToEdit = ref(null)
const productToDelete = ref(null)
const productFormRef = ref(null) // Ref para el componente del formulario de producto
const deleteModalInstance = ref(null) // Ref para la instancia JS del modal de borrado
const isSaving = ref(false)

// Ref para los filtros de la DataTable
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// --- Ciclo de Vida (Lifecycle) ---
onMounted(() => {
  // Cargar datos iniciales al montar el componente
  productsStore.fetchProducts()
  categoriesStore.fetchCategories()

  // Inicializar la instancia del modal de borrado para controlarlo con JS
  const deleteModalEl = document.getElementById('deleteProductModal')
  if (deleteModalEl) {
    deleteModalInstance.value = new Modal(deleteModalEl)
  }
})

// --- Métodos para Manejar Acciones ---

// Abre el modal del formulario, ya sea para crear o editar
const openProductModal = (product = null) => {
  productToEdit.value = product // Si `product` es null, es para crear. Si no, para editar.
  if (productFormRef.value) {
    productFormRef.value.openModal()
  }
}

// Abre el modal de confirmación de borrado
const openDeleteModal = (product) => {
  productToDelete.value = product
  if (deleteModalInstance.value) {
    deleteModalInstance.value.show()
  }
}

// Se ejecuta cuando el formulario emite el evento 'submit'
const handleFormSubmit = async (productData) => {
  isSaving.value = true // Activar estado de carga
  try {
    if (productData.id) {
      await productsStore.updateProduct(productData.id, productData)
    } else {
      await productsStore.addProduct(productData)
    }
    productFormRef.value.closeModal() // Cierra el modal solo si tiene éxito
  } finally {
    isSaving.value = false // Desactivar estado de carga
  }
}

// Confirma y ejecuta la eliminación del producto
const confirmDeleteProduct = async () => {
  if (productToDelete.value) {
    await productsStore.deleteProduct(productToDelete.value.id)
  }
  // Cierra el modal de confirmación después de borrar
  if (deleteModalInstance.value) {
    deleteModalInstance.value.hide()
  }
}
</script>

<template>
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1>Inventario de Productos</h1>
      <button class="btn btn-success" @click="openProductModal(null)">
        <i class="pi pi-plus me-2"></i>
        Nuevo Producto
      </button>
    </div>

    <DataTable
      :value="productsStore.products"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      :globalFilterFields="['name', 'description', 'category_name']"
      v-model:filters="filters"
      size="small"
      stripedRows
      showGridlines
      responsiveLayout="scroll"
      :loading="productsStore.isLoading"
    >
      <template #header>
        <div class="d-flex justify-content-end">
          <IconField>
            <InputIcon><i class="pi pi-search" /></InputIcon>
            <InputText v-model="filters.global.value" placeholder="Buscar..." />
          </IconField>
        </div>
      </template>
      <template #empty>No se encontraron productos.</template>
      <template #loading>Cargando datos de productos...</template>

      <Column field="name" header="Nombre" :sortable="true"></Column>
      <Column field="category_name" header="Categoría" :sortable="true">
        <template #body="{ data }">
          <span v-if="data.category_name" class="badge bg-secondary">{{ data.category_name }}</span>
          <span v-else class="text-muted">N/A</span>
        </template>
      </Column>
      <Column field="stock" header="Stock" :sortable="true"></Column>
      <Column field="unit" header="Unidades" :sortable="true"></Column>
      <Column field="price" header="Precio" :sortable="true">
        <template #body="{ data }">
          {{
            new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
              data.price,
            )
          }}
        </template>
      </Column>
      <Column header="Acciones" :exportable="false" style="width: 8rem">
        <template #body="{ data }">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-warning me-2"
            @click.stop="openProductModal(data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger"
            @click.stop="openDeleteModal(data)"
          />
        </template>
      </Column>
    </DataTable>

    <ProductForm
      ref="productFormRef"
      :product-to-edit="productToEdit"
      :categories="categoriesStore.categories"
      :is-saving="isSaving"
      @submit="handleFormSubmit"
    />
  </div>

  <div
    class="modal fade"
    id="deleteProductModal"
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
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-danger" @click="confirmDeleteProduct">
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
