<script setup>
import { ref, watch, onMounted } from 'vue'
import { useUsersStore } from '../stores/users'

const props = defineProps({
  taskToEdit: {
    type: Object,
    default: null,
  },
})

const usersStore = useUsersStore()
const task = ref({})
const modalTitle = ref('Asignar Nueva Tarea')
const isEditMode = ref(false)

onMounted(() => {
  usersStore.fetchUsers()
})

watch(
  () => props.taskToEdit,
  (newTask) => {
    if (newTask) {
      // --- ESTA ES LA PARTE CORREGIDA ---
      const formattedTask = { ...newTask };
      if (formattedTask.due_date) {
        // Convierte la fecha al formato YYYY-MM-DD que el input[type=date] entiende
        formattedTask.due_date = new Date(formattedTask.due_date).toISOString().split('T')[0];
      }

      task.value = formattedTask;
      modalTitle.value = 'Editar Tarea';
      isEditMode.value = true;
    } else {
      resetForm();
    }
  },
)

const emit = defineEmits(['submit'])

const handleSubmit = () => {
  emit('submit', { ...task.value })
}
const resetForm = () => {
  task.value = { title: '', description: '', due_date: '', assigned_to_id: null }
  modalTitle.value = 'Asignar Nueva Tarea'
  isEditMode.value = false
}

defineExpose({ resetForm })
</script>

<template>
  <div class="modal fade" id="taskModal" tabindex="-1" aria-labelledby="taskModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="taskModalLabel">{{ modalTitle }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="mb-3">
              <label for="title" class="form-label">Título de la Tarea</label>
              <input type="text" class="form-control" id="title" v-model="task.title" required />
            </div>
            <div class="mb-3">
              <label for="description" class="form-label">Descripción y Comentarios</label>
              <textarea class="form-control" id="description" v-model="task.description" rows="4"></textarea>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="assigned_to_id" class="form-label">Asignar a</label>
                <select class="form-select" id="assigned_to_id" v-model="task.assigned_to_id" required>
                  <option :value="null" disabled>Selecciona un usuario</option>
                  <option v-for="user in usersStore.users" :key="user.id" :value="user.id">
                    {{ user.username }}
                  </option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label for="due_date" class="form-label">Fecha de Entrega</label>
                <input type="date" class="form-control" id="due_date" v-model="task.due_date" />
              </div>
            </div>
            <div v-if="isEditMode" class="mb-3">
              <label for="status" class="form-label">Estado</label>
              <select class="form-select" id="status" v-model="task.status">
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completada</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Guardar Tarea</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
