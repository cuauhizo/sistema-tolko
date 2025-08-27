<script setup>
import { ref } from 'vue'
import { useUsersStore } from '../stores/users'

defineProps({
  users: {
    type: Array,
    required: true,
  },
})

const usersStore = useUsersStore()
const userToDelete = ref(null) // Variable para guardar el usuario a eliminar
const emit = defineEmits(['edit-user'])

const setUserToDelete = (user) => {
  userToDelete.value = user
}

const handleEditClick = (user) => {
  emit('edit-user', user)
}

const confirmDelete = () => {
  if (userToDelete.value) {
    usersStore.deleteUser(userToDelete.value.id)
  }
}
</script>

<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover align-middle">
      <thead class="table-dark">
        <tr>
          <th>Nombre de Usuario</th>
          <th>Correo Electrónico</th>
          <th>Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>
            <span
              class="badge"
              :class="{ 'bg-success': user.role === 'admin', 'bg-info': user.role === 'user' }"
            >
              {{ user.role }}
            </span>
          </td>
          <td>
            <button
              class="btn btn-sm btn-warning me-2"
              data-bs-toggle="modal"
              data-bs-target="#userModal"
              @click="handleEditClick(user)"
            >
              Editar
            </button>
            <button
              class="btn btn-sm btn-danger"
              data-bs-toggle="modal"
              data-bs-target="#deleteUserModal"
              @click="setUserToDelete(user)"
            >
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
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
