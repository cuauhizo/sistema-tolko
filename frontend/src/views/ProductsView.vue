<script setup>
import { onMounted, ref } from 'vue'
import { useProductsStore } from '../stores/products'
import ProductForm from '../components/ProductForm.vue'

// Importaciones de PrimeVue
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { FilterMatchMode } from '@primevue/core/api'

const productsStore = useProductsStore()
const productToEdit = ref(null)
const productToDelete = ref(null)

onMounted(() => {
  productsStore.fetchProducts()
})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const prepareNewProduct = () => {
  productToEdit.value = null
}

const prepareEditProduct = (product) => {
  productToEdit.value = product
}

const handleDeleteProduct = (product) => {
  productToDelete.value = product
}

const confirmDeleteProduct = () => {
  if (productToDelete.value) {
    productsStore.deleteProduct(productToDelete.value.id)
  }
}

const handleFormSubmit = async (productData) => {
  if (productData.id) {
    // Si tiene ID, es una actualización
    await productsStore.updateProduct(productData.id, productData)
  } else {
    // Si no, es una creación
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
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters.global.value" placeholder="Buscar..." />
          </IconField>
        </div>
      </template>
      <template #empty> No se encontraron productos. </template>
      <template #loading> Cargando datos de productos... </template>

      <Column field="name" header="Nombre" :sortable="true" style="min-width: 14rem"></Column>
      <Column field="category_name" header="Categoría" :sortable="true" style="min-width: 10rem">
        <template #body="{ data }">
          <span v-if="data.category_name" class="badge bg-secondary">{{ data.category_name }}</span>
          <span v-else class="text-muted">N/A</span>
        </template>
      </Column>
      <Column field="stock" header="Stock" :sortable="true" style="width: 8rem"></Column>
      <Column field="unit" header="Unidades" :sortable="true" style="width: 8rem"></Column>
      <Column field="price" header="Precio" :sortable="true" style="width: 10rem">
        <template #body="{ data }">
          {{
            new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
              data.price,
            )
          }}
        </template>
      </Column>

      <Column header="Acciones" style="width: 10rem" :exportable="false">
        <template #body="{ data }">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-warning me-2"
            data-bs-toggle="modal"
            data-bs-target="#productModal"
            @click="prepareEditProduct(data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger"
            @click="handleDeleteProduct(data)"
            data-bs-toggle="modal"
            data-bs-target="#deleteProductModal"
          />
        </template>
      </Column>
    </DataTable>
    <ProductForm :product-to-edit="productToEdit" @submit="handleFormSubmit" />
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
          <p class="text-danger">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button
            type="button"
            class="btn btn-danger"
            @click="confirmDeleteProduct"
            data-bs-dismiss="modal"
          >
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
