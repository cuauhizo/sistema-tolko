<script setup>
import { onMounted, ref } from 'vue'
import { useCategoriesStore } from '../stores/categories'
import CategoryList from '../components/CategoryList.vue'
import CategoryForm from '../components/CategoryForm.vue'

const categoriesStore = useCategoriesStore()
const categoryToEdit = ref(null)
const categoryToDelete = ref(null)

onMounted(() => {
  categoriesStore.fetchCategories()
})

const prepareNewCategory = () => {
  categoryToEdit.value = null
}

const handleEdit = (category) => {
  categoryToEdit.value = category
}

const handleDelete = (category) => {
  console.log('Eliminar categoría:', category)
  categoryToDelete.value = category
}

const handleFormSubmit = async (categoryData) => {
  if (categoryData.id) {
    await categoriesStore.updateCategory(categoryData.id, categoryData)
  } else {
    await categoriesStore.addCategory(categoryData)
  }
}

const confirmDelete = async () => {
  if (categoryToDelete.value) {
    // Aquí llamaremos a la acción de la store, que crearemos en el siguiente paso
    await categoriesStore.deleteCategory(categoryToDelete.value.id)
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

    <div v-if="categoriesStore.isLoading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else-if="categoriesStore.error" class="alert alert-danger">
      {{ categoriesStore.error }}
    </div>
    <CategoryList
      v-else
      :categories="categoriesStore.categories"
      @edit-category="handleEdit"
      @delete-category="handleDelete"
    />

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
          <p>¿Estás seguro de que deseas eliminar esta categoría?</p>
          <p class="text-danger">Esta acción no se puede deshacer.</p>
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
