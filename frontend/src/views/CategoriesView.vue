<script setup>
import { onMounted, ref } from 'vue'
import { useCategoriesStore } from '../stores/categories'
import CategoryForm from '../components/CategoryForm.vue'
import { Modal } from 'bootstrap'

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
const categoryFormRef = ref(null) // Ref para el componente del formulario de producto
const deleteModalInstance = ref(null) // Ref para la instancia JS del modal de borrado
const isSaving = ref(false)

// Ref para los filtros de la DataTable
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// --- Ciclo de Vida (Lifecycle) ---
onMounted(() => {
  categoriesStore.fetchCategories()

  // Inicializar la instancia del modal de borrado para controlarlo con JS
  const deleteModalEl = document.getElementById('deleteCategoryModal')
  if (deleteModalEl) {
    deleteModalInstance.value = new Modal(deleteModalEl)
  }
})

// --- Métodos para Manejar Acciones ---

// Abre el modal del formulario, ya sea para crear o editar
const openCategoryModal = (category = null) => {
  categoryToEdit.value = category // Si `category` es null, es para crear. Si no, para editar.
  if (categoryFormRef.value) {
    categoryFormRef.value.openModal()
  }
}

// Abre el modal de confirmación de borrado
const openDeleteModal = (category) => {
  categoryToDelete.value = category
  if (deleteModalInstance.value) {
    deleteModalInstance.value.show()
  }
}

const handleFormSubmit = async (categoryData) => {
  isSaving.value = true
  try {
    if (categoryData.id) {
      // Si tiene ID, es una actualización
      await categoriesStore.updateCategory(categoryData.id, categoryData)
    } else {
      // Si no, es una creación
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
  if (deleteModalInstance.value) {
    deleteModalInstance.value.hide()
  }
}
</script>

<template>
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1>Gestionar Categorías</h1>
      <button class="btn btn-success" @click="openCategoryModal(null)">
        <i class="pi pi-plus me-2"></i>
        Nueva Categoría
      </button>
    </div>
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
      <template #empty> No se encontraron categorías. </template>
      <template #loading> Cargando datos de categorías... </template>

      <Column
        field="name"
        header="Nombre Categoría"
        :sortable="true"
        style="min-width: 14rem"
      ></Column>

      <Column header="Acciones" style="width: 10rem" :exportable="false">
        <template #body="{ data }">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-warning me-2"
            @click="openCategoryModal(data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger"
            @click="openDeleteModal(data)"
          />
        </template>
      </Column>
    </DataTable>
    <CategoryForm
      ref="categoryFormRef"
      :category-to-edit="categoryToEdit"
      :is-saving="isSaving"
      @submit="handleFormSubmit"
    />
  </div>
  <div
    class="modal fade"
    id="deleteCategoryModal"
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
          <p v-if="categoryToDelete">
            ¿Estás seguro de que deseas eliminar la categoría:
            <strong>{{ categoryToDelete.name }}</strong> ?
          </p>
          <p class="text-danger">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button
            type="button"
            class="btn btn-danger"
            data-bs-dismiss="modal"
            @click="confirmDeleteCategory"
          >
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
