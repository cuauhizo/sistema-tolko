<script setup>
import { onMounted, ref } from 'vue'
import { useTasksStore } from '../stores/tasks'
import TaskForm from '../components/TaskForm.vue'
import { Modal } from 'bootstrap'
import { formatStatus } from '@/utils/formatters'

// Importaciones de PrimeVue
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Tag from 'primevue/tag'
import { FilterMatchMode } from '@primevue/core/api'

// --- Estado del Componente ---
const tasksStore = useTasksStore()

// Refs para controlar los datos y los modales
const taskToEdit = ref(null)
const taskToDelete = ref(null)
const taskFormRef = ref(null)
const deleteModalInstance = ref(null)

// Ref para los filtros de la DataTable
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// --- Ciclo de Vida (Lifecycle) ---
onMounted(() => {
  tasksStore.fetchTasks()

    // Inicializar la instancia del modal de borrado para controlarlo con JS
  const deleteModalEl = document.getElementById('deleteTaskModal')
  if (deleteModalEl) {
    deleteModalInstance.value = new Modal(deleteModalEl)
  }

})

// --- Métodos para Manejar Acciones ---

// Abre el modal del formulario, ya sea para crear o editar
const openTaskModal = (task = null) => {
  taskToEdit.value = task // Si `task` es null, es para crear. Si no, para editar.
  if (taskFormRef.value) {
    taskFormRef.value.openModal()
  }
}

// Abre el modal de confirmación de borrado
const openDeleteModal = (task) => {
  taskToDelete.value = task
  if (deleteModalInstance.value) {
    deleteModalInstance.value.show()
  }
}

const handleFormSubmit = async (taskData) => {
  if (taskData.id) {
    // Si tiene ID, es una actualización
    await tasksStore.updateTask(taskData.id, taskData)
  } else {
    // Si no, es una creación
    await tasksStore.addTask(taskData)
  }
  if (taskFormRef.value) {
    taskFormRef.value.closeModal()
  }
}

// Confirma y ejecuta la eliminación del producto
const confirmDeleteTask = async () => {
  if (taskToDelete.value) {
    await tasksStore.deleteTask(taskToDelete.value.id)
  }
  // Cierra el modal de confirmación después de borrar
  if (deleteModalInstance.value) {
    deleteModalInstance.value.hide()
  }
}

// Función para dar color al estado de la tarea
const getSeverityForStatus = (status) => {
  switch (status) {
    case 'pendiente':
      return 'warn'
    case 'en_progreso':
      return 'info'
    case 'completada':
      return 'success'
    default:
      return 'secondary'
  }
}
</script>

<template>
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1>Gestión de Tareas</h1>
      <button class="btn btn-success" @click="openTaskModal(null)"
      >
      <i class="pi pi-plus me-2"></i>
        Nueva Tarea
      </button>
    </div>
    <DataTable
      :value="tasksStore.tasks"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      :globalFilterFields="['title', 'assigned_to', 'assigned_by', 'due_date', 'status']"
      v-model:filters="filters"
      size="small"
      stripedRows
      showGridlines
      responsiveLayout="scroll"
      :loading="tasksStore.isLoading"
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
      <template #empty> No se encontraron tareas. </template>
      <template #loading> Cargando datos de tareas... </template>

      <Column field="title" header="Tarea" :sortable="true"></Column>
      <Column field="assigned_to" header="Asignada a" :sortable="true"></Column>
      <Column field="assigned_by" header="Asignada por" :sortable="true"></Column>
      <Column field="due_date" header="Fecha de Entrega" :sortable="true">
        <template #body="{ data }">
          {{ new Date(data.due_date).toLocaleDateString() }}
        </template>
      </Column>
      <Column field="status" header="Estado" :sortable="true">
        <template #body="{ data }">
          <Tag :value="formatStatus(data.status)" :severity="getSeverityForStatus(data.status)"></Tag>
        </template>
      </Column>
      <Column header="Acciones" :exportable="false">
        <template #body="{ data }">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-warning me-2"
            @click="openTaskModal(data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger"
            @click="openDeleteModal(data)"
          />
        </template>
      </Column>
    </DataTable>
    <TaskForm ref="taskFormRef" :task-to-edit="taskToEdit" @submit="handleFormSubmit" />
  </div>
  <div
    class="modal fade"
    id="deleteTaskModal"
    tabindex="-1"
    aria-labelledby="deleteTaskModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="deleteTaskModalLabel">Confirmar Eliminación</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Cerrar"
          ></button>
        </div>
        <div class="modal-body">
          ¿Estás seguro de que deseas eliminar la tarea "<strong>{{ taskToDelete?.title }}</strong
          >"?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button
            type="button"
            class="btn btn-danger"
            data-bs-dismiss="modal"
            @click="confirmDeleteTask"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
