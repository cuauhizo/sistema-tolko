<script setup>
  import { ref, onMounted } from 'vue'
  import { useTasksStore } from '../stores/tasks'
  import { formatStatus, formatTaskId } from '../utils/formatters'

  // Importaciones de PrimeVue
  import DataView from 'primevue/dataview'
  // import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions'
  import Dropdown from 'primevue/dropdown'
  import Tag from 'primevue/tag'
  import SelectButton from 'primevue/selectbutton'

  const tasksStore = useTasksStore()
  const layout = ref('list')
  const options = ref(['list', 'grid'])
  const statusFilter = ref()
  const statusOptions = ref([
    { name: 'Todas', code: '' },
    { name: 'Pendientes', code: 'pendiente' },
    { name: 'En progreso', code: 'en_progreso' },
    { name: 'Completadas', code: 'completada' },
  ])

  onMounted(() => {
    tasksStore.fetchMyTasks()
  })

  const onFilterChange = event => {
    tasksStore.fetchMyTasks(event.value.code)
  }

  const getSeverityForStatus = status => {
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

    <!-- <div v-if="tasksStore.myTasks.length === 0" class="text-center p-5">
      <h4 class="h2">¡Felicidades!</h4>
      <p>No tienes tareas pendientes por el momento.</p>
    </div> -->
    <!-- <div v-else> -->
    <DataView :value="tasksStore.myTasks" :layout="layout" :paginator="true" :rows="9">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <SelectButton v-model="layout" :options="options" :allowEmpty="false">
            <template #option="{ option }">
              <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
            </template>
          </SelectButton>
          <div class="d-flex align-items-center">
            <Dropdown v-model="statusFilter" :options="statusOptions" optionLabel="name" placeholder="Filtrar por estado" class="me-2" @change="onFilterChange" />
          </div>
        </div>
      </template>
      <template #empty>
        <p class="text-center my-3">No se encontraron datos.</p>
      </template>
      <template #loading>Cargando datos tareas...</template>

      <template #list="slotProps">
        <div class="row g-3 mb-3">
          <div class="col-12">
            <div class="list-group">
              <div v-for="(item, index) in slotProps.items" :key="index" class="list-group-item" :class="{ cuauhizo: index !== 0 }">
                <div class="d-flex w-100 justify-content-between">
                  <h5 class="mb-1">{{ formatTaskId(item.id) }} - {{ item.title }}</h5>
                  <Tag :value="formatStatus(item.status)" :severity="getSeverityForStatus(item.status)"></Tag>
                </div>
                <div class="my-3">
                  <p class="mb-1">{{ item.description }}</p>
                </div>
                <div class="d-flex flex-wrap gap-3 w-100 justify-content-between">
                  <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn" :class="item.status === 'pendiente' ? 'btn-warning' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'pendiente')">Pendiente</button>
                    <button type="button" class="btn" :class="item.status === 'en_progreso' ? 'btn-info' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'en_progreso')">En Progreso</button>
                    <button type="button" class="btn" :class="item.status === 'completada' ? 'btn-success' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'completada')">Completada</button>
                  </div>
                  <small class="text-muted">
                    <strong>Asignada por</strong>
                    : {{ item.assigned_by }} |
                    <strong>Fecha de entrega</strong>
                    : {{ new Date(item.due_date).toLocaleDateString() }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #grid="slotProps">
        <div class="row g-3 mb-3">
          <div v-for="(item, index) in slotProps.items" :key="index" class="col-12 col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between">
                <span>{{ formatTaskId(item.id) }}</span>
                <Tag :value="formatStatus(item.status)" :severity="getSeverityForStatus(item.status)"></Tag>
              </div>
              <div class="card-body">
                <h5 class="card-title">{{ item.title }}</h5>
                <p class="card-text">{{ item.description }}</p>
                <div class="btn-group btn-group-sm" role="group">
                  <button type="button" class="btn" :class="item.status === 'pendiente' ? 'btn-warning' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'pendiente')">Pendiente</button>
                  <button type="button" class="btn" :class="item.status === 'en_progreso' ? 'btn-info' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'en_progreso')">En Progreso</button>
                  <button type="button" class="btn" :class="item.status === 'completada' ? 'btn-success' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'completada')">Completada</button>
                </div>
              </div>
              <div class="card-footer text-muted">
                <small class="text-muted">
                  <strong>Asignada por</strong>
                  : {{ item.assigned_by }} |
                  <strong>Fecha de entrega</strong>
                  : {{ new Date(item.due_date).toLocaleDateString() }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DataView>
    <!-- </div> -->
  </div>
</template>
