<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  userToEdit: {
    type: Object,
    default: null
  },
  // Pasaremos los roles desde la vista para llenar el select
  roles: {
    type: Array,
    default: () => []
  }
});

const user = ref({});
const modalTitle = ref('Agregar Nuevo Usuario');
const isEditMode = ref(false);

watch(() => props.userToEdit, (newUser) => {
  if (newUser) {
    user.value = { ...newUser, password: '' }; // No precargamos la contraseña por seguridad
    modalTitle.value = 'Editar Usuario';
    isEditMode.value = true;
  } else {
    resetForm();
  }
});

const emit = defineEmits(['submit']);

const handleSubmit = () => {
  emit('submit', { ...user.value });
};

const resetForm = () => {
  user.value = { username: '', email: '', password: '', role_id: 2 };
  modalTitle.value = 'Agregar Nuevo Usuario';
  isEditMode.value = false;
};

defineExpose({ resetForm });
</script>

<template>
  <div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="userModalLabel">{{ modalTitle }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="mb-3">
              <label for="username" class="form-label">Nombre de Usuario</label>
              <input type="text" class="form-control" id="username" v-model="user.username" required />
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Correo Electrónico</label>
              <input type="email" class="form-control" id="email" v-model="user.email" required />
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <input type="password" class="form-control" id="password" v-model="user.password" :required="!isEditMode" />
              <small v-if="isEditMode" class="form-text text-muted">Dejar en blanco para no cambiar la contraseña.</small>
            </div>
            <div class="mb-3">
              <label for="role" class="form-label">Rol</label>
              <select class="form-select" id="role" v-model="user.role_id">
                <option :value="1">Admin</option>
                <option :value="2">User</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>