<script setup>
import { onMounted, ref } from 'vue'
import { useCategoriesStore } from '../stores/categories'
import CategoryForm from '../components/CategoryForm.vue'

// Importaciones de PrimeVue
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { FilterMatchMode } from '@primevue/core/api'

// --- Estado del Componente ---
const categoriesStore = useCategoriesStore()

// Refs para controlar los datos y los modales
const categoryToEdit = ref(null)
const categoryToDelete = ref(null)
const categoryFormRef = ref(null) 
const isSaving = ref(false)

// NUEVO: Control nativo del modal de borrado en Vue (sin Bootstrap)
const showDeleteModal = ref(false)

// Ref para los filtros de la DataTable
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// --- Ciclo de Vida (Lifecycle) ---
onMounted(() => {
  categoriesStore.fetchCategories()
})

// --- Métodos para Manejar Acciones ---

// Abre el modal del formulario, ya sea para crear o editar
const openCategoryModal = (category = null) => {
  categoryToEdit.value = category 
  if (categoryFormRef.value) {
    categoryFormRef.value.openModal()
  }
}

// Abre el modal de confirmación de borrado
const openDeleteModal = (category) => {
  categoryToDelete.value = category
  showDeleteModal.value = true // Mostrar el modal Tailwind
}

const handleFormSubmit = async (categoryData) => {
  isSaving.value = true
  try {
    if (categoryData.id) {
      await categoriesStore.updateCategory(categoryData.id, categoryData)
    } else {
      await categoriesStore.addCategory(categoryData)
    }
    categoryFormRef.value.closeModal()
  } finally {
    isSaving.value = false
  }
}

// Confirma y ejecuta la eliminación del producto
const confirmDeleteCategory = async () => {
  if (categoryToDelete.value) {
    await categoriesStore.deleteCategory(categoryToDelete.value.id)
  }
  // Cierra el modal de confirmación después de borrar
  showDeleteModal.value = false
  categoryToDelete.value = null
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Gestionar Categorías</h1>
      <button 
        class="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" 
        @click="openCategoryModal(null)"
      >
        <i class="pi pi-plus mr-2"></i>
        Nueva Categoría
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable
        :value="categoriesStore.categories"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        :globalFilterFields="['name']"
        v-model:filters="filters"
        size="small"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        :loading="categoriesStore.isLoading"
        class="border-none"
      >
        <template #header>
          <div class="flex justify-end p-2">
            <IconField>
              <InputIcon>
                <i class="pi pi-search text-gray-400" />
              </InputIcon>
              <InputText v-model="filters.global.value" placeholder="Buscar..." class="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </IconField>
          </div>
        </template>
        <template #empty> 
          <div class="text-center py-4 text-gray-500">No se encontraron categorías.</div>
        </template>
        <template #loading> 
          <div class="text-center py-4 text-gray-500"><i class="pi pi-spin pi-spinner mr-2"></i> Cargando categorías...</div>
        </template>

        <Column
          field="name"
          header="Nombre Categoría"
          :sortable="true"
          style="min-width: 14rem"
        ></Column>

        <Column header="Acciones" style="width: 10rem" :exportable="false">
          <template #body="{ data }">
            <div class="flex space-x-2">
              <Button
                icon="pi pi-pencil"
                class="p-button-rounded p-button-warning p-button-outlined p-button-sm"
                @click="openCategoryModal(data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-danger p-button-outlined p-button-sm"
                @click="openDeleteModal(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <CategoryForm
      ref="categoryFormRef"
      :category-to-edit="categoryToEdit"
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
              <p class="text-gray-600 mb-2" v-if="categoryToDelete">
                ¿Estás seguro de que deseas eliminar la categoría: 
                <strong class="text-gray-900">{{ categoryToDelete.name }}</strong>?
              </p>
              <p class="text-sm font-medium text-red-500">Esta acción no se puede deshacer.</p>
            </div>
          </div>
        </div>
        
        <div class="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl space-x-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Cancelar
          </button>
          <button @click="confirmDeleteCategory" class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center">
            <i class="pi pi-trash mr-2"></i> Sí, Eliminar
          </button>
        </div>

      </div>
    </div>

  </div>
</template>