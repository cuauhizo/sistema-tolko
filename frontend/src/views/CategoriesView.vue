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

const categoriesStore = useCategoriesStore()
const categoryToEdit = ref(null)
const categoryToDelete = ref(null)

onMounted(() => {
  // categoriesStore.fetchAllCategoryForDataTable()
  categoriesStore.fetchCategories()
})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const prepareNewCategory = () => {
  categoryToEdit.value = null
}

const prepareEditCategory = (category) => {
  categoryToEdit.value = category
}

const handleDeleteCategory = (category) => {
  categoryToDelete.value = category
}

const confirmDeleteCategory = () => {
  if (categoryToDelete.value) {
    categoriesStore.deleteCategory(categoryToDelete.value.id)
  }
}

const handleFormSubmit = async (categoryData) => {
  if (categoryData.id) {
    // Si tiene ID, es una actualización
    await categoriesStore.updateCategory(categoryData.id, categoryData)
  } else {
    // Si no, es una creación
    await categoriesStore.addCategory(categoryData)
  }
}
</script>

<template>
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1>Gestionar Categorías</h1>
      <button
        class="btn btn-success"
        data-bs-toggle="modal"
        data-bs-target="#categoryModal"
        @click="prepareNewCategory"
      >
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
      <template #empty> No se encontraron productos. </template>
      <template #loading> Cargando datos de productos... </template>

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
            data-bs-toggle="modal"
            data-bs-target="#categoryModal"
            @click="prepareEditCategory(data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger"
            @click="handleDeleteCategory(data)"
            data-bs-toggle="modal"
            data-bs-target="#deleteCategoryModal"
          />
        </template>
      </Column>
    </DataTable>
    <CategoryForm :category-to-edit="categoryToEdit" @submit="handleFormSubmit" />
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
