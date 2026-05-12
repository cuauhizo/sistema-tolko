<script setup>
  import { ref, onMounted } from 'vue'
  import { useTasksStore } from '../stores/tasks'
  import { formatStatus, formatTaskId } from '../utils/formatters'

  // Importaciones de PrimeVue
  import DataView from 'primevue/dataview'
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
  const updatingState = ref({ taskId: null, status: null })

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

  const handleStatusChange = async (task, newStatus) => {
    // Prevenir clics si ya hay una actualización en curso
    if (updatingState.value.taskId) return
    // No hacer nada si se hace clic en el estado actual
    if (task.status === newStatus) return

    updatingState.value = { taskId: task.id, status: newStatus }
    try {
      await tasksStore.updateTaskStatus(task.id, newStatus)
    } finally {
      updatingState.value = { taskId: null, status: null }
    }
  }
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center mb-6">
      <i class="pi pi-check-square text-3xl text-emerald-600 mr-3"></i>
      <h1 class="text-2xl font-bold text-gray-800">Mis Tareas Pendientes</h1>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataView :value="tasksStore.myTasks" :layout="layout" :paginator="true" :rows="9" class="border-none">
        <template #header>
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4 p-2 bg-white">
            <SelectButton v-model="layout" :options="options" :allowEmpty="false" class="shadow-sm">
              <template #option="{ option }">
                <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-th-large']" class="text-gray-600" />
              </template>
            </SelectButton>

            <div class="w-full sm:w-auto">
              <Dropdown v-model="statusFilter" :options="statusOptions" optionLabel="name" placeholder="Filtrar por estado" class="w-full sm:w-64 shadow-sm border-gray-300" @change="onFilterChange" />
            </div>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-10 text-gray-500 flex flex-col items-center">
            <i class="pi pi-inbox text-5xl text-gray-300 mb-3"></i>
            <p>No se encontraron tareas con estos filtros.</p>
          </div>
        </template>

        <template #loading>
          <div class="text-center py-10 text-blue-600 font-medium">
            <i class="pi pi-spin pi-spinner mr-2"></i>
            Cargando tus tareas...
          </div>
        </template>

        <template #list="slotProps">
          <div class="flex flex-col gap-4 p-4">
            <div v-for="(item, index) in slotProps.items" :key="index" class="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 hover:shadow-md transition-shadow">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{{ formatTaskId(item.id) }}</span>
                    <h5 class="text-lg font-bold text-gray-900">{{ item.title }}</h5>
                  </div>
                  <p class="text-gray-600 text-sm mt-2 mb-4 max-w-3xl">{{ item.description }}</p>
                </div>
                <Tag :value="formatStatus(item.status)" :severity="getSeverityForStatus(item.status)" class="uppercase text-[10px] font-bold self-start"></Tag>
              </div>

              <div class="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mt-2">
                <fieldset :disabled="updatingState.taskId === item.id" class="inline-flex rounded-md shadow-sm w-full sm:w-auto">
                  <button
                    type="button"
                    @click="handleStatusChange(item, 'pendiente')"
                    class="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-medium border rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500 transition-colors"
                    :class="item.status === 'pendiente' ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'">
                    Pendiente
                    <i v-if="updatingState.taskId === item.id && updatingState.status === 'pendiente'" class="pi pi-spin pi-spinner ml-2"></i>
                  </button>
                  <button
                    type="button"
                    @click="handleStatusChange(item, 'en_progreso')"
                    class="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-medium border-t border-b border-gray-300 focus:z-10 focus:ring-2 focus:ring-blue-500 transition-colors"
                    :class="item.status === 'en_progreso' ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'">
                    En Progreso
                    <i v-if="updatingState.taskId === item.id && updatingState.status === 'en_progreso'" class="pi pi-spin pi-spinner ml-2"></i>
                  </button>
                  <button
                    type="button"
                    @click="handleStatusChange(item, 'completada')"
                    class="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-medium border rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-500 transition-colors"
                    :class="item.status === 'completada' ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'">
                    Completada
                    <i v-if="updatingState.taskId === item.id && updatingState.status === 'completada'" class="pi pi-spin pi-spinner ml-2"></i>
                  </button>
                </fieldset>

                <div class="text-xs text-gray-500 flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 lg:mt-0 bg-gray-50 p-2 rounded-md border border-gray-100">
                  <span>
                    <i class="pi pi-user mr-1 text-gray-400"></i>
                    De:
                    <strong>{{ item.assigned_by }}</strong>
                  </span>
                  <span class="hidden sm:inline text-gray-300">|</span>
                  <span>
                    <i class="pi pi-calendar mr-1 text-gray-400"></i>
                    Entrega:
                    <strong>{{ new Date(item.due_date).toLocaleDateString() }}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #grid="slotProps">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            <div v-for="(item, index) in slotProps.items" :key="index" class="bg-white rounded-xl border border-gray-200 flex flex-col h-full hover:shadow-lg transition-shadow overflow-hidden">
              <div class="px-5 py-3 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
                <span class="text-xs font-bold text-gray-500">{{ formatTaskId(item.id) }}</span>
                <Tag :value="formatStatus(item.status)" :severity="getSeverityForStatus(item.status)" class="uppercase text-[10px] font-bold"></Tag>
              </div>

              <div class="p-5 flex-grow flex flex-col">
                <h5 class="text-lg font-bold text-gray-900 mb-2 leading-tight">{{ item.title }}</h5>
                <p class="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">{{ item.description }}</p>

                <fieldset :disabled="updatingState.taskId === item.id" class="flex rounded-md shadow-sm w-full mt-auto">
                  <button
                    type="button"
                    @click="handleStatusChange(item, 'pendiente')"
                    class="flex-1 px-2 py-2 text-xs font-medium border rounded-l-md focus:z-10 focus:ring-1 focus:ring-blue-500 transition-colors"
                    :class="item.status === 'pendiente' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'">
                    <span class="truncate">Pendiente</span>
                  </button>
                  <button
                    type="button"
                    @click="handleStatusChange(item, 'en_progreso')"
                    class="flex-1 px-2 py-2 text-xs font-medium border-t border-b border-gray-300 focus:z-10 focus:ring-1 focus:ring-blue-500 transition-colors"
                    :class="item.status === 'en_progreso' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 hover:bg-gray-50'">
                    <span class="truncate">En Progreso</span>
                  </button>
                  <button
                    type="button"
                    @click="handleStatusChange(item, 'completada')"
                    class="flex-1 px-2 py-2 text-xs font-medium border rounded-r-md focus:z-10 focus:ring-1 focus:ring-blue-500 transition-colors"
                    :class="item.status === 'completada' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'">
                    <span class="truncate">Completada</span>
                  </button>
                </fieldset>
              </div>

              <div class="px-5 py-3 border-t border-gray-100 bg-gray-50 flex flex-col gap-1 text-xs text-gray-500">
                <span class="truncate">
                  <i class="pi pi-user mr-1 text-gray-400"></i>
                  Asignada por:
                  <strong>{{ item.assigned_by }}</strong>
                </span>
                <span>
                  <i class="pi pi-calendar mr-1 text-gray-400"></i>
                  Límite:
                  <strong>{{ new Date(item.due_date).toLocaleDateString() }}</strong>
                </span>
              </div>
            </div>
          </div>
        </template>
      </DataView>
    </div>
  </div>
</template>
