<script setup>
import { onMounted, ref } from 'vue'
import { useUsersStore } from '../stores/users'
import UserForm from '../components/UserForm.vue'

// Importaciones de PrimeVue
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { FilterMatchMode } from '@primevue/core/api'

const usersStore = useUsersStore()
const userToDelete = ref(null)
const userToEdit = ref(null)

onMounted(() => {
  // usersStore.fetchAllUsersForDataTable()
  usersStore.fetchUsers()
})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const prepareNewUser = () => {
  userToEdit.value = null
}

const prepareEditUser = (user) => {
  userToEdit.value = user
}

const handleDeleteUser = (user) => {
  userToDelete.value = user
}

const confirmDeleteUser = () => {
  if (userToDelete.value) {
    usersStore.deleteUser(userToDelete.value.id)
  }
}

const handleFormSubmit = async (userData) => {
  if (userData.id) {
    // Si tiene ID, es una actualización
    await usersStore.updateUser(userData.id, userData)
  } else {
    // Si no, es una creación
    await usersStore.addUser(userData)
  }
}
</script>

<template>
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1>Administración de Usuarios</h1>
      <button
        class="btn btn-success"
        data-bs-toggle="modal"
        data-bs-target="#userModal"
        @click="prepareNewUser"
      >
        Agregar Usuario
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
      <template #empty> No se encontraron productos. </template>
      <template #loading> Cargando datos de productos... </template>

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
            data-bs-toggle="modal"
            data-bs-target="#userModal"
            @click="prepareEditUser(data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger"
            @click="handleDeleteUser(data)"
            data-bs-toggle="modal"
            data-bs-target="#deleteUserModal"
          />
        </template>
      </Column>
    </DataTable>
    <UserForm :user-to-edit="userToEdit" @submit="handleFormSubmit" />
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
