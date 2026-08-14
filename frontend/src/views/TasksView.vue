<script setup>
  import { onMounted, ref, computed } from 'vue'
  import { useTasksStore } from '../stores/tasks'
  import TaskForm from '../components/TaskForm.vue'
  import { formatStatus, formatTaskId } from '@/utils/formatters'

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
  const isSaving = ref(false)

  // NUEVO: Control nativo del modal de borrado
  const showDeleteModal = ref(false)

  // Esta propiedad toma las órdenes del store y les añade el campo 'folio'
  const formattedTasks = computed(() => {
    return tasksStore.tasks.map(task => ({
      ...task,
      folio: formatTaskId(task.id),
    }))
  })

  // Ref para los filtros de la DataTable
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  // --- Ciclo de Vida (Lifecycle) ---
  onMounted(() => {
    tasksStore.fetchTasks()
  })

  // --- Métodos para Manejar Acciones ---

  // Abre el modal del formulario, ya sea para crear o editar
  const openTaskModal = (task = null) => {
    taskToEdit.value = task
    if (taskFormRef.value) {
      taskFormRef.value.openModal()
    }
  }

  // Abre el modal de confirmación de borrado
  const openDeleteModal = task => {
    taskToDelete.value = task
    showDeleteModal.value = true
  }

  const handleFormSubmit = async taskData => {
    isSaving.value = true
    try {
      if (taskData.id) {
        await tasksStore.updateTask(taskData.id, taskData)
      } else {
        await tasksStore.addTask(taskData)
      }
      taskFormRef.value.closeModal()
    } finally {
      isSaving.value = false
    }
  }

  // Confirma y ejecuta la eliminación de la tarea
  const confirmDeleteTask = async () => {
    if (taskToDelete.value) {
      await tasksStore.deleteTask(taskToDelete.value.id)
    }
    showDeleteModal.value = false
    taskToDelete.value = null
  }

  // Función para dar color al estado de la tarea
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
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Gestión de Tareas</h1>
      <button class="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" @click="openTaskModal(null)">
        <i class="pi pi-plus mr-2"></i>
        Nueva Tarea
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable
        :value="formattedTasks"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
        v-model:filters="filters"
        :globalFilterFields="['folio', 'title', 'assigned_to', 'assigned_by', 'due_date', 'status']"
        size="small"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        :loading="tasksStore.isLoading"
        class="border-none">
        <template #header>
          <div class="flex justify-end p-2">
            <IconField>
              <InputIcon><i class="pi pi-search text-gray-400" /></InputIcon>
              <InputText v-model="filters.global.value" placeholder="Buscar tarea..." class="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </IconField>
          </div>
        </template>
        <template #empty>
          <div class="text-center py-4 text-gray-500">No se encontraron tareas.</div>
        </template>
        <template #loading>
          <div class="text-center py-4 text-gray-500">
            <i class="pi pi-spin pi-spinner mr-2"></i>
            Cargando datos de tareas...
          </div>
        </template>

        <Column field="folio" header="Folio" :sortable="true" style="width: 8rem">
          <template #body="{ data }">
            <span class="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{{ data.folio }}</span>
          </template>
        </Column>

        <Column field="title" header="Tarea" :sortable="true" style="min-width: 14rem"></Column>

        <Column field="assigned_to" header="Asignada a" :sortable="true">
          <template #body="{ data }">
            <span class="text-blue-600 font-medium">
              <i class="pi pi-user mr-1 text-xs"></i>
              {{ data.assigned_to }}
            </span>
          </template>
        </Column>

        <Column field="assigned_by" header="Asignada por" :sortable="true">
          <template #body="{ data }">
            <span class="text-gray-600">{{ data.assigned_by }}</span>
          </template>
        </Column>

        <Column field="due_date" header="Fecha de Entrega" :sortable="true">
          <template #body="{ data }">
            <span :class="new Date(data.due_date) < new Date() && data.status !== 'completada' ? 'text-red-600 font-bold' : 'text-gray-600'">
              <i class="pi pi-calendar text-[10px] mr-1"></i>
              {{ new Date(data.due_date).toLocaleDateString() }}
            </span>
          </template>
        </Column>

        <Column field="status" header="Estado" :sortable="true">
          <template #body="{ data }">
            <Tag :value="formatStatus(data.status)" :severity="getSeverityForStatus(data.status)" class="uppercase text-[10px] font-bold shadow-sm"></Tag>
          </template>
        </Column>

        <Column header="Acciones" style="width: 10rem" :exportable="false">
          <template #body="{ data }">
            <div class="flex space-x-2">
              <Button icon="pi pi-pencil" class="p-button-rounded p-button-warning p-button-outlined p-button-sm" @click="openTaskModal(data)" />
              <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-outlined p-button-sm" @click="openDeleteModal(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <TaskForm ref="taskFormRef" :task-to-edit="taskToEdit" :is-saving="isSaving" @submit="handleFormSubmit" />

    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="showDeleteModal = false"></div>

      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 z-50 transform transition-all">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
          <button @click="showDeleteModal = false" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 ml-auto inline-flex items-center transition-colors">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="px-6 py-4">
          <div class="flex items-start">
            <i class="pi pi-exclamation-triangle text-red-500 text-2xl mr-3 mt-1"></i>
            <div>
              <p class="text-gray-600 mb-2" v-if="taskToDelete">
                ¿Estás seguro de que deseas eliminar la tarea:
                <strong class="text-gray-900">{{ taskToDelete.title }}</strong>
                ?
              </p>
              <p class="text-sm font-medium text-red-500">Esta acción no se puede deshacer.</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl space-x-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Cancelar
          </button>
          <button
            @click="confirmDeleteTask"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center">
            <i class="pi pi-trash mr-2"></i>
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
