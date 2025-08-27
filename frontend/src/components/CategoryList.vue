<script setup>
defineProps({
  categories: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['edit-category', 'delete-category'])

const handleEditClick = (category) => {
  emit('edit-category', category)
}

const handleDeleteClick = (category) => {
  emit('delete-category', category)
}
</script>

<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover align-middle">
      <thead class="table-dark">
        <tr>
          <th>Nombre de la Categoría</th>
          <th class="text-end">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="categories.length === 0">
          <td colspan="2" class="text-center">No hay categorías para mostrar.</td>
        </tr>
        <tr v-for="category in categories" :key="category.id">
          <td>{{ category.name }}</td>
          <td class="text-end">
            <button
              class="btn btn-sm btn-warning me-2"
              @click="handleEditClick(category)"
              data-bs-toggle="modal"
              data-bs-target="#categoryModal"
            >
              Editar
            </button>
            <button
              class="btn btn-sm btn-danger"
              @click="handleDeleteClick(category)"
              data-bs-toggle="modal"
              data-bs-target="#deleteCategoryModal"
            >
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-responsive {
  margin-top: 1.5rem;
}
</style>
