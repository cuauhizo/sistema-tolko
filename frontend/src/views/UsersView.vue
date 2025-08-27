<script setup>
import { onMounted, ref } from 'vue'
import { useUsersStore } from '../stores/users'
import UserList from '../components/UserList.vue'
import UserForm from '../components/UserForm.vue'

const usersStore = useUsersStore()
const formComponent = ref(null)
const userToEdit = ref(null) // <-- 1. Estado para el usuario a editar

onMounted(() => {
  usersStore.fetchUsers()
})

// 2. Prepara el modal para agregar un nuevo usuario
const prepareNewUser = () => {
  userToEdit.value = null
}

// 3. Prepara el modal para editar un usuario existente
const prepareEditUser = (user) => {
  userToEdit.value = user
}

// 4. Lógica unificada para el envío del formulario
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

    <div v-if="usersStore.isLoading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <UserList v-else :users="usersStore.users" @edit-user="prepareEditUser" />

    <UserForm ref="formComponent" :user-to-edit="userToEdit" @submit="handleFormSubmit" />
  </div>
</template>
