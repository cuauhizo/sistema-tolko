<script setup>
import { onMounted } from 'vue'
import { useTasksStore } from '../stores/tasks'
import Tag from 'primevue/tag' // Usaremos el componente Tag de PrimeVue para el estado

const tasksStore = useTasksStore()

onMounted(() => {
  // Usamos la acción que trae solo las tareas del usuario actual
  tasksStore.fetchMyTasks()
})

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

const handleStatusChange = (task, newStatus) => {
  // Solo actualizamos si el estado es diferente
  if (task.status !== newStatus) {
    tasksStore.updateTaskStatus(task.id, newStatus)
  }
}
</script>

<template>
  <div class="container mt-4">
    <h1 class="mb-4">Mis Tareas Pendientes</h1>

    <div v-if="tasksStore.isLoading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else-if="tasksStore.error" class="alert alert-danger">
      {{ tasksStore.error }}
    </div>
    <div v-else-if="tasksStore.myTasks.length === 0" class="text-center p-5 bg-light rounded">
      <h4>¡Felicidades!</h4>
      <p>No tienes tareas pendientes por el momento.</p>
    </div>

    <div v-else class="list-group">
      <div
        v-for="task in tasksStore.myTasks"
        :key="task.id"
        class="list-group-item list-group-item-action flex-column align-items-start mb-3 border rounded shadow-sm"
      >
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">{{ task.title }}</h5>
          <small>
            <Tag :value="task.status" :severity="getSeverityForStatus(task.status)" />
          </small>
        </div>
        <p class="mb-1">{{ task.description }}</p>
        <div class="d-flex w-100 justify-content-between mt-2">
          <small class="text-muted"
            ><strong>Asignada por</strong>: {{ task.assigned_by }} | <strong>Fecha de entrega</strong>:
            {{ new Date(task.due_date).toLocaleDateString() }}</small
          >

          <div class="btn-group btn-group-sm" role="group">
            <button
              type="button"
              class="btn"
              :class="task.status === 'pendiente' ? 'btn-warning' : 'btn-outline-secondary'"
              @click="handleStatusChange(task, 'pendiente')"
            >
              Pendiente
            </button>
            <button
              type="button"
              class="btn"
              :class="task.status === 'en_progreso' ? 'btn-info' : 'btn-outline-secondary'"
              @click="handleStatusChange(task, 'en_progreso')"
            >
              En Progreso
            </button>
            <button
              type="button"
              class="btn"
              :class="task.status === 'completada' ? 'btn-success' : 'btn-outline-secondary'"
              @click="handleStatusChange(task, 'completada')"
            >
              Completada
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
