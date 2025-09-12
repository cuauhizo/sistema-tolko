<script setup>
  import { ref, onMounted } from 'vue'
  import { useWorkOrdersStore } from '../stores/workOrders'
  import DataView from 'primevue/dataview'
  import SelectButton from 'primevue/selectbutton'
  import Dropdown from 'primevue/dropdown'
  import Tag from 'primevue/tag'
  import { formatStatus, formatWorkOrderId } from '../utils/formatters'

  const workOrdersStore = useWorkOrdersStore()
  const layout = ref('list')
  const options = ref(['list', 'grid'])
  const statusFilter = ref()
  const statusOptions = ref([
    { name: 'Todas', code: '' },
    { name: 'Pendientes', code: 'pendiente' },
    { name: 'En progreso', code: 'en_progreso' },
    { name: 'Por aprobar', code: 'por_aprobar' },
    { name: 'Completada', code: 'completada' },
    { name: 'Canceladas', code: 'cancelada' }, // <-- Incluimos las canceladas
  ])
  const updatingState = ref({ orderId: null, status: null })

  onMounted(() => {
    workOrdersStore.fetchMyWorkOrders()
  })

  const onFilterChange = event => {
    workOrdersStore.fetchMyWorkOrders(event.value.code)
  }

  const handleStatusChange = async (order, newStatus) => {
    // Prevenir clics si ya hay una actualización en curso para cualquier orden
    if (updatingState.value.orderId) return

    // Guardamos qué orden y qué botón específico se está actualizando
    updatingState.value = { orderId: order.id, status: newStatus }

    try {
      await workOrdersStore.updateWorkOrderStatus(order.id, newStatus)
    } finally {
      // Limpiamos el estado para reactivar los botones
      updatingState.value = { orderId: null, status: null }
    }
  }

  const getSeverityForStatus = status => {
    const statusMap = {
      pendiente: 'warn',
      en_progreso: 'info',
      por_aprobar: 'secondary',
      completada: 'success',
      cancelada: 'danger',
    }
    return statusMap[status] || 'contrast'
  }
</script>

<template>
  <div class="container mt-4">
    <h1 class="mb-4">Mis Órdenes de Trabajo</h1>

    <!-- <div v-if="workOrdersStore.myWorkOrders.length === 0" class="text-center p-5">
      <h4 class="h2">¡Todo en orden!</h4>
      <p>No tienes órdenes de trabajo asignadas por el momento.</p>
    </div> -->
    <!-- <div v-else> -->
    <DataView :value="workOrdersStore.myWorkOrders" :layout="layout" :paginator="true" :rows="9">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <SelectButton v-model="layout" :options="options" :allowEmpty="false">
            <template #option="{ option }">
              <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
            </template>
          </SelectButton>
          <div class="d-flex align-items-center">
            <Dropdown v-model="statusFilter" :options="statusOptions" optionLabel="name" placeholder="Filtrar por estado" @change="onFilterChange" />
          </div>
        </div>
      </template>
      <template #empty>
        <p class="text-center my-3">No se encontraron datos.</p>
      </template>
      <template #loading>Cargando datos ordenes de trabajo...</template>

      <template #list="slotProps">
        <div class="list-group">
          <div v-for="item in slotProps.items" :key="item.id" class="list-group-item">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">{{ formatWorkOrderId(item.id) }} - {{ item.title }} ({{ item.client_name }})</h5>
              <Tag :value="formatStatus(item.status)" :severity="getSeverityForStatus(item.status)"></Tag>
            </div>
            <p class="my-3">{{ item.description }}</p>
            <div class="d-flex flex-wrap gap-3 w-100 justify-content-between align-items-center">
              <fieldset :disabled="item.status === 'completada' || item.status === 'cancelada' || updatingState.orderId === item.id">
                <div class="btn-group btn-group-sm" role="group">
                  <button type="button" class="btn" :class="item.status === 'pendiente' ? 'btn-warning' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'pendiente')">
                    <span>Pendiente</span>
                    <span v-if="updatingState.orderId === item.id && updatingState.status === 'pendiente'" class="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                  </button>
                  <button type="button" class="btn" :class="item.status === 'en_progreso' ? 'btn-info' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'en_progreso')">
                    <span>En Progreso</span>
                    <span v-if="updatingState.orderId === item.id && updatingState.status === 'en_progreso'" class="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                  </button>
                  <button type="button" class="btn" :class="item.status === 'por_aprobar' ? 'btn-dark' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'por_aprobar')">
                    <span>Enviar a Revisión</span>
                    <span v-if="updatingState.orderId === item.id && updatingState.status === 'por_aprobar'" class="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                  </button>
                </div>
              </fieldset>
              <small class="text-muted">
                <strong>Creada por:</strong>
                {{ item.created_by }} |
                <strong>Fecha Límite:</strong>
                {{ new Date(item.end_date).toLocaleDateString() }}
              </small>
            </div>
          </div>
        </div>
      </template>

      <template #grid="slotProps">
        <div class="row g-3">
          <div v-for="item in slotProps.items" :key="item.id" class="col-12 col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between">
                <span>{{ formatWorkOrderId(item.id) }}</span>
                <div>
                  <Tag :value="formatStatus(item.status)" :severity="getSeverityForStatus(item.status)"></Tag>
                </div>
              </div>
              <div class="card-body d-flex flex-column">
                <h5 class="card-title mb-2 text-muted">{{ item.title }}</h5>
                <h6 class="card-subtitle mb-2 text-muted">{{ item.client_name }}</h6>
                <p class="card-text flex-grow-1">{{ item.description }}</p>
                <fieldset :disabled="item.status === 'completada' || item.status === 'cancelada' || updatingState.orderId === item.id">
                  <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn" :class="item.status === 'pendiente' ? 'btn-warning' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'pendiente')">
                      <span>Pendiente</span>
                      <span v-if="updatingState.orderId === item.id && updatingState.status === 'pendiente'" class="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                    </button>
                    <button type="button" class="btn" :class="item.status === 'en_progreso' ? 'btn-info' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'en_progreso')">
                      <span>En Progreso</span>
                      <span v-if="updatingState.orderId === item.id && updatingState.status === 'en_progreso'" class="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                    </button>
                    <button type="button" class="btn" :class="item.status === 'por_aprobar' ? 'btn-dark' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'por_aprobar')">
                      <span>Enviar a Revisión</span>
                      <span v-if="updatingState.orderId === item.id && updatingState.status === 'por_aprobar'" class="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                    </button>
                  </div>
                </fieldset>
              </div>
              <div class="card-footer text-muted">
                <small class="text-muted">
                  <strong>Creada por:</strong>
                  {{ item.created_by }} |
                  <strong>Fecha Límite:</strong>
                  {{ new Date(item.end_date).toLocaleDateString() }}
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
