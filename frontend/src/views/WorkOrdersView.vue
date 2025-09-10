<script setup>
import { onMounted, ref, computed } from 'vue'
import { useWorkOrdersStore } from '../stores/workOrders'
import WorkOrderForm from '../components/WorkOrderForm.vue'
import { Modal } from 'bootstrap'
import { formatStatus, formatWorkOrderId } from '@/utils/formatters'

// Importaciones de PrimeVue
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { FilterMatchMode } from '@primevue/core/api'

// --- Estado del Componente ---
const workOrdersStore = useWorkOrdersStore()

// Refs para controlar los datos y los modales
const orderToEdit = ref(null)
const orderToDelete = ref(null)
const orderFormRef = ref(null)
const deleteModalInstance = ref(null)
const isSaving = ref(false)

// --- 1. CREAR LA PROPIEDAD COMPUTADA ---
// Esta propiedad toma las órdenes del store y les añade el campo 'folio'
const formattedWorkOrders = computed(() => {
  return workOrdersStore.workOrders.map((order) => ({
    ...order,
    folio: formatWorkOrderId(order.id),
  }))
})

// Ref para los filtros de la DataTable
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// --- Ciclo de Vida (Lifecycle) ---
onMounted(() => {
  workOrdersStore.fetchWorkOrders()
  const deleteModalEl = document.getElementById('deleteWorkOrderModal')
  if (deleteModalEl) {
    deleteModalInstance.value = new Modal(deleteModalEl)
  }
})

// --- Métodos para Manejar Acciones ---

// Abre el modal para crear una NUEVA orden.
const openModalForNew = () => {
  orderToEdit.value = null // Limpiamos los datos de edición.
  orderFormRef.value?.openModal()
}

// Abre el modal para EDITAR una orden existente.
const openModalForEdit = async (order) => {
  // 1. Pide al store que busque los datos completos de la orden.
  await workOrdersStore.fetchWorkOrderById(order.id)
  // 2. Una vez cargados, pasa el objeto completo (currentOrder) al formulario.
  orderToEdit.value = workOrdersStore.currentOrder
  // 3. Abre el modal.
  orderFormRef.value?.openModal()
}

// Abre el modal de confirmación de borrado.
const openDeleteModal = (order) => {
  orderToDelete.value = order
  deleteModalInstance.value?.show()
}

// Abre el modal del formulario, ya sea para crear (order = null) o editar.
const openOrderModal = (order = null) => {
  orderToEdit.value = order
  if (orderFormRef.value) {
    orderFormRef.value.openModal()
  }
}

// Se ejecuta cuando el formulario emite 'submit'.
const handleFormSubmit = async (orderData) => {
  isSaving.value = true
  try {
    if (orderData.id) {
      await workOrdersStore.updateWorkOrder(orderData.id, orderData)
    } else {
      await workOrdersStore.addWorkOrder(orderData)
    }
    orderFormRef.value?.closeModal()
  } finally {
    isSaving.value = false
  }
}

// Confirma y ejecuta la eliminación.
const confirmDeleteOrder = async () => {
  if (orderToDelete.value) {
    await workOrdersStore.deleteWorkOrder(orderToDelete.value.id)
  }
  deleteModalInstance.value?.hide()
}

// Devuelve un color para el tag de estado.
const getSeverityForStatus = (status) => {
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
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1>Gestión de Órdenes de Trabajo</h1>
      <button class="btn btn-success" @click="openModalForNew">
        <i class="pi pi-plus me-2"></i>
        Nueva Orden de Trabajo
      </button>
    </div>
    <!-- :value="workOrdersStore.workOrders" -->
    <DataTable
      :value="formattedWorkOrders"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      v-model:filters="filters"
      :globalFilterFields="['folio', 'title', 'client_name', 'assigned_to', 'status']"
      :loading="workOrdersStore.isLoading"
      size="small"
      stripedRows
      showGridlines
      responsiveLayout="scroll"
    >
      <template #header>
        <div class="d-flex justify-content-end">
          <IconField>
            <InputIcon><i class="pi pi-search" /></InputIcon>
            <InputText v-model="filters.global.value" placeholder="Buscar..." />
          </IconField>
        </div>
      </template>
      <template #empty>No se encontraron órdenes de trabajo.</template>
      <template #loading>Cargando datos...</template>

      <Column field="folio" header="Folio" :sortable="true" style="width: 8rem">
        <template #body="{ data }">
          <strong>{{ data.folio }}</strong>
        </template>
      </Column>
      <Column field="title" header="Título" :sortable="true"></Column>
      <Column field="client_name" header="Cliente" :sortable="true"></Column>
      <Column field="assigned_to" header="Asignada a" :sortable="true"></Column>
      <Column field="end_date" header="Fecha Límite" :sortable="true">
        <template #body="{ data }">
          {{ new Date(data.end_date).toLocaleDateString() }}
        </template>
      </Column>
      <Column field="status" header="Estado" :sortable="true">
        <template #body="{ data }">
          <Tag :value="formatStatus(data.status)" :severity="getSeverityForStatus(data.status)"></Tag>
        </template>
      </Column>
      <Column header="Acciones" style="width: 11rem">
        <template #body="{ data }">
          <RouterLink :to="{ name: 'work-order-detail', params: { id: data.id } }">
            <Button icon="pi pi-eye" class="p-button-rounded p-button-info me-2" />
          </RouterLink>
          <Button icon="pi pi-pencil" class="p-button-rounded p-button-warning me-2" @click="openModalForEdit(data)" />
          <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="openDeleteModal(data)" />
        </template>
      </Column>
    </DataTable>

    <WorkOrderForm ref="orderFormRef" :order-to-edit="orderToEdit" :is-saving="isSaving" @submit="handleFormSubmit" />

    <div class="modal fade" id="deleteWorkOrderModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Eliminación</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p v-if="orderToDelete">
              ¿Estás seguro de que deseas eliminar la orden:
              <strong>{{ orderToDelete.title }}</strong
              >?
            </p>
            <p class="text-danger">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" @click="confirmDeleteOrder">Sí, Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
