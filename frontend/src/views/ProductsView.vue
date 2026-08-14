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
  import SkeletonLoader from '../components/SkeletonLoader.vue'
  import { FilterMatchMode } from '@primevue/core/api'

  // --- Estado del Componente ---
  const productsStore = useProductsStore()
  const categoriesStore = useCategoriesStore()

  // Refs para controlar los datos y los modales
  const productToEdit = ref(null)
  const productToDelete = ref(null)
  const productFormRef = ref(null)
  const isSaving = ref(false)
  const showDeleteModal = ref(false)

  // Referencia a la DataTable para poder exportar
  const dt = ref()

  // Ref para los filtros de la DataTable
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  // --- Ciclo de Vida (Lifecycle) ---
  onMounted(() => {
    productsStore.fetchProducts()
    categoriesStore.fetchCategories()
  })

  // Función para calcular el estado visual del stock
  const getStockStatus = (stock, minStock) => {
    const current = parseFloat(stock) || 0
    const min = parseFloat(minStock) || 0

    if (current <= 0) {
      return { label: 'Agotado', class: 'bg-red-100 text-red-800 border-red-200', icon: 'pi-times-circle' }
    } else if (current <= min) {
      return { label: 'Stock Bajo', class: 'bg-orange-100 text-orange-800 border-orange-200', icon: 'pi-exclamation-triangle' }
    } else {
      return { label: 'Óptimo', class: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: 'pi-check-circle' }
    }
  }

  // Función para exportar a CSV/Excel
  const exportCSV = () => {
    dt.value.exportCSV()
  }

  // --- Métodos para Manejar Acciones ---
  const openProductModal = (product = null) => {
    productToEdit.value = product
    if (productFormRef.value) {
      productFormRef.value.openModal()
    }
  }

  const openDeleteModal = product => {
    productToDelete.value = product
    showDeleteModal.value = true
  }

  const handleFormSubmit = async productData => {
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
        @click="openProductModal(null)">
        <i class="pi pi-plus mr-2"></i>
        Nuevo Producto
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable
        ref="dt"
        :value="productsStore.products"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
        :globalFilterFields="['name', 'sku', 'description', 'category_name']"
        v-model:filters="filters"
        size="small"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        :loading="productsStore.isLoading"
        class="border-none">
        <template #header>
          <div class="flex flex-col sm:flex-row justify-end items-center gap-3 p-2">
            <!-- <Button icon="pi pi-file-excel" label="Exportar Excel" class="p-button-success p-button-sm w-full sm:w-auto" @click="exportCSV" /> -->
            <IconField>
              <InputIcon><i class="pi pi-search text-gray-400" /></InputIcon>
              <InputText v-model="filters.global.value" placeholder="Buscar por nombre, SKU o categoría..." class="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64" />
            </IconField>
          </div>
        </template>

        <!-- NUEVO: Estado Vacío (Empty State) Premium -->
        <template #empty>
          <div class="flex flex-col items-center justify-center py-16 px-4">
            <div class="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4">
              <i class="pi pi-box text-3xl text-gray-400"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-1">Aún no hay productos</h3>
            <p class="text-sm text-gray-500 mb-5 text-center max-w-sm">Tu inventario está vacío. Comienza agregando tu primer producto o material para llevar el control.</p>
            <button @click="openProductModal(null)" class="text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 font-medium px-4 py-2 rounded-lg transition-colors flex items-center">
              <i class="pi pi-plus mr-2 text-sm"></i>
              Agregar mi primer producto
            </button>
          </div>
        </template>

        <!-- NUEVO: Skeleton Loaders Personalizados -->
        <template #loading>
          <div class="p-4 border-t border-gray-100">
            <div v-for="i in 5" :key="i" class="flex space-x-4 mb-4 w-full">
              <SkeletonLoader width="25%" height="2rem" />
              <SkeletonLoader width="15%" height="2rem" />
              <SkeletonLoader width="20%" height="2rem" />
              <SkeletonLoader width="15%" height="2rem" />
              <SkeletonLoader width="10%" height="2rem" />
            </div>
          </div>
        </template>

        <Column field="name" header="Producto" :sortable="true" style="min-width: 16rem">
          <template #body="{ data }">
            <div class="font-bold text-gray-900">{{ data.name }}</div>
            <div v-if="data.sku" class="text-xs text-gray-500 flex items-center mt-0.5">
              <i class="pi pi-barcode mr-1 text-[10px]"></i>
              {{ data.sku }}
            </div>
          </template>
        </Column>

        <Column field="category_name" header="Categoría" :sortable="true" style="min-width: 10rem">
          <template #body="{ data }">
            <span v-if="data.category_name" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              {{ data.category_name }}
            </span>
            <span v-else class="text-gray-400 italic text-sm">Sin categoría</span>
          </template>
        </Column>

        <Column field="stock" header="Nivel de Stock" :sortable="true" style="min-width: 10rem">
          <template #body="{ data }">
            <div class="flex flex-col gap-1.5">
              <div class="font-bold text-gray-900 text-sm">
                {{ data.stock }}
                <span class="text-gray-500 font-normal text-xs">{{ data.unit }}</span>
              </div>
              <span :class="['inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border w-max', getStockStatus(data.stock, data.min_stock).class]">
                <i :class="['pi text-[10px] mr-1', getStockStatus(data.stock, data.min_stock).icon]"></i>
                {{ getStockStatus(data.stock, data.min_stock).label }}
              </span>
            </div>
          </template>
        </Column>

        <Column field="price" header="Precio Unitario" :sortable="true" style="min-width: 10rem">
          <template #body="{ data }">
            <span class="font-medium text-gray-900">
              {{ new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(data.price) }}
            </span>
          </template>
        </Column>

        <Column header="Acciones" :exportable="false" style="width: 8rem">
          <template #body="{ data }">
            <div class="flex space-x-2">
              <Button icon="pi pi-pencil" class="p-button-rounded p-button-warning p-button-outlined p-button-sm" @click.stop="openProductModal(data)" title="Editar" />
              <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-outlined p-button-sm" @click.stop="openDeleteModal(data)" title="Eliminar" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <ProductForm ref="productFormRef" :product-to-edit="productToEdit" :categories="categoriesStore.categories" :is-saving="isSaving" @submit="handleFormSubmit" />

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
                <strong class="text-gray-900">{{ productToDelete.name }}</strong>
                ?
              </p>
              <p class="text-sm font-medium text-red-500">Esta acción no se puede deshacer.</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl space-x-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Cancelar
          </button>
          <button
            @click="confirmDeleteProduct"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center">
            <i class="pi pi-trash mr-2"></i>
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
