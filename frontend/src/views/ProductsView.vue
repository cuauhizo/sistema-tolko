<script setup>
// --- Importaciones ---
import { onMounted, ref } from 'vue'
import { useProductsStore } from '../stores/products'
import { useCategoriesStore } from '../stores/categories'
import ProductForm from '../components/ProductForm.vue'

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
const categoriesStore = useCategoriesStore()

// Refs para controlar los datos y los modales
const productToEdit = ref(null)
const productToDelete = ref(null)
const productFormRef = ref(null) 
const isSaving = ref(false)

// NUEVO: Control nativo del modal de borrado en Vue
const showDeleteModal = ref(false)

// Ref para los filtros de la DataTable
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// --- Ciclo de Vida (Lifecycle) ---
onMounted(() => {
  productsStore.fetchProducts()
  categoriesStore.fetchCategories()
})

// --- Métodos para Manejar Acciones ---

// Abre el modal del formulario, ya sea para crear o editar
const openProductModal = (product = null) => {
  productToEdit.value = product 
  if (productFormRef.value) {
    productFormRef.value.openModal()
  }
}

// Abre el modal de confirmación de borrado
const openDeleteModal = (product) => {
  productToDelete.value = product
  showDeleteModal.value = true // Mostrar el modal Tailwind
}

// Se ejecuta cuando el formulario emite el evento 'submit'
const handleFormSubmit = async (productData) => {
  isSaving.value = true 
  try {
    if (productData.id) {
      await productsStore.updateProduct(productData.id, productData)
    } else {
      await productsStore.addProduct(productData)
    }
    productFormRef.value.closeModal() 
  } finally {
    isSaving.value = false 
  }
}

// Confirma y ejecuta la eliminación del producto
const confirmDeleteProduct = async () => {
  if (productToDelete.value) {
    await productsStore.deleteProduct(productToDelete.value.id)
  }
  showDeleteModal.value = false
  productToDelete.value = null
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Inventario de Productos</h1>
      <button 
        class="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" 
        @click="openProductModal(null)"
      >
        <i class="pi pi-plus mr-2"></i>
        Nuevo Producto
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
        class="border-none"
      >
        <template #header>
          <div class="flex justify-end p-2">
            <IconField>
              <InputIcon><i class="pi pi-search text-gray-400" /></InputIcon>
              <InputText v-model="filters.global.value" placeholder="Buscar..." class="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </IconField>
          </div>
        </template>
        <template #empty>
          <div class="text-center py-4 text-gray-500">No se encontraron productos.</div>
        </template>
        <template #loading>
          <div class="text-center py-4 text-gray-500"><i class="pi pi-spin pi-spinner mr-2"></i> Cargando datos de productos...</div>
        </template>

        <Column field="name" header="Nombre" :sortable="true" style="min-width: 12rem"></Column>
        
        <Column field="category_name" header="Categoría" :sortable="true">
          <template #body="{ data }">
            <span v-if="data.category_name" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ data.category_name }}
            </span>
            <span v-else class="text-gray-400 italic text-sm">N/A</span>
          </template>
        </Column>
        
        <Column field="stock" header="Stock" :sortable="true">
          <template #body="{ data }">
            <span :class="data.stock <= 10 ? 'text-red-600 font-bold' : 'text-gray-700'">
              {{ data.stock }}
            </span>
          </template>
        </Column>
        
        <Column field="unit" header="Unidades" :sortable="true"></Column>
        
        <Column field="price" header="Precio" :sortable="true">
          <template #body="{ data }">
            <span class="font-medium text-gray-900">
              {{ new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(data.price) }}
            </span>
          </template>
        </Column>

        <Column header="Acciones" :exportable="false" style="width: 10rem">
          <template #body="{ data }">
            <div class="flex space-x-2">
              <Button
                icon="pi pi-pencil"
                class="p-button-rounded p-button-warning p-button-outlined p-button-sm"
                @click.stop="openProductModal(data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-danger p-button-outlined p-button-sm"
                @click.stop="openDeleteModal(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <ProductForm
      ref="productFormRef"
      :product-to-edit="productToEdit"
      :categories="categoriesStore.categories"
      :is-saving="isSaving"
      @submit="handleFormSubmit"
    />

    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="showDeleteModal = false"></div>
      
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 z-50 transform transition-all">
        
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
          <button @click="showDeleteModal = false" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 ml-auto inline-flex items-center transition-colors">
            <i class="pi pi-times"></i>
          </button>
        </div>
        
        <div class="px-6 py-4">
          <div class="flex items-start">
            <i class="pi pi-exclamation-triangle text-red-500 text-2xl mr-3 mt-1"></i>
            <div>
              <p class="text-gray-600 mb-2" v-if="productToDelete">
                ¿Estás seguro de que deseas eliminar el producto: 
                <strong class="text-gray-900">{{ productToDelete.name }}</strong>?
              </p>
              <p class="text-sm font-medium text-red-500">Esta acción no se puede deshacer.</p>
            </div>
          </div>
        </div>
        
        <div class="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl space-x-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Cancelar
          </button>
          <button @click="confirmDeleteProduct" class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center">
            <i class="pi pi-trash mr-2"></i> Sí, Eliminar
          </button>
        </div>

      </div>
    </div>

  </div>
</template>