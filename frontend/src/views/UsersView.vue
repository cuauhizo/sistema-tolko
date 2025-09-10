<script setup>
import { onMounted, ref } from 'vue'
import { useUsersStore } from '../stores/users'
import UserForm from '../components/UserForm.vue'
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
const usersStore = useUsersStore()

// Refs para controlar los datos y los modales
const userToEdit = ref(null)
const userToDelete = ref(null)
const userFormRef = ref(null)
const deleteModalInstance = ref(null)
const isSaving = ref(false)

// Ref para los filtros de la DataTable
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// --- Ciclo de Vida (Lifecycle) ---
onMounted(() => {
  usersStore.fetchUsers()

  // Inicializar la instancia del modal de borrado para controlarlo con JS
  const deleteModalEl = document.getElementById('deleteUserModal')
  if (deleteModalEl) {
    deleteModalInstance.value = new Modal(deleteModalEl)
  }
})

// --- Métodos para Manejar Acciones ---

// Abre el modal del formulario, ya sea para crear o editar
const openUserModal = (user = null) => {
  userToEdit.value = user // Si `user` es null, es para crear. Si no, para editar.
  if (userFormRef.value) {
    userFormRef.value.openModal()
  }
}

// Abre el modal de confirmación de borrado
const openDeleteModal = (user) => {
  userToDelete.value = user
  if (deleteModalInstance.value) {
    deleteModalInstance.value.show()
  }
}

const handleFormSubmit = async (userData) => {
  isSaving.value = true
  try {
    if (userData.id) {
      // Si tiene ID, es una actualización
      await usersStore.updateUser(userData.id, userData)
    } else {
      // Si no, es una creación
      await usersStore.addUser(userData)
    }
    userFormRef.value.closeModal()
  } finally {
    isSaving.value = false
  }
}

// Confirma y ejecuta la eliminación del producto
const confirmDeleteUser = async () => {
  if (userToDelete.value) {
    await usersStore.deleteUser(userToDelete.value.id)
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
      <h1>Administración de Usuarios</h1>
      <button class="btn btn-success" @click="openUserModal(null)">
        <i class="pi pi-plus me-2"></i>
        Nuevo Usuario
      </button>
    </div>
    <DataTable
      :value="usersStore.users"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      :globalFilterFields="['username', 'email', 'role']"
      v-model:filters="filters"
      size="small"
      stripedRows
      showGridlines
      responsiveLayout="scroll"
      :loading="usersStore.isLoading"
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
      <template #empty> No se encontraron usuarios. </template>
      <template #loading> Cargando datos de usuarios... </template>

      <Column
        field="username"
        header="Nombre de Usuario"
        :sortable="true"
        style="min-width: 14rem"
      ></Column>
      <Column
        field="email"
        header="Correo Electrónico"
        :sortable="true"
        style="min-width: 14rem"
      ></Column>
      <Column field="role" header="Rol" :sortable="true" style="min-width: 10rem">
        <template #body="{ data }">
          <span
            class="badge"
            :class="{ 'bg-success': data.role === 'admin', 'bg-info': data.role === 'user' }"
          >
            {{ data.role }}
          </span>
        </template>
      </Column>
      <Column header="Acciones" style="width: 10rem" :exportable="false">
        <template #body="{ data }">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-warning me-2"
            @click="openUserModal(data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger"
            @click="openDeleteModal(data)"
          />
        </template>
      </Column>
    </DataTable>
    <UserForm
      ref="userFormRef"
      :user-to-edit="userToEdit"
      :is-saving="isSaving"
      @submit="handleFormSubmit"
    />
  </div>
  <div
    class="modal fade"
    id="deleteUserModal"
    tabindex="-1"
    aria-labelledby="deleteUserModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="deleteUserModalLabel">Confirmar Eliminación</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Cerrar"
          ></button>
        </div>
        <div class="modal-body">
          <p v-if="userToDelete">
            ¿Estás seguro de que deseas eliminar al usuario:
            <strong>{{ userToDelete.username }}</strong
            >?
          </p>
          <p class="text-danger">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button
            type="button"
            class="btn btn-danger"
            data-bs-dismiss="modal"
            @click="confirmDeleteUser"
          >
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
