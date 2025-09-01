<script setup>
import { onMounted, ref } from 'vue'
import { useWorkOrdersStore } from '../stores/workOrders'
import { storeToRefs } from 'pinia'
import WorkOrderForm from '../components/WorkOrderForm.vue'
import * as bootstrap from 'bootstrap'

// Importaciones de PrimeVue
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { FilterMatchMode } from '@primevue/core/api'

const workOrdersStore = useWorkOrdersStore()
const { currentOrder } = storeToRefs(workOrdersStore)
const orderToEdit = ref(null)
const orderToDelete = ref(null)

onMounted(() => {
  workOrdersStore.fetchWorkOrders()
})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const prepareNewOrder = () => {
  orderToEdit.value = null
}

const prepareEditOrder = async (order) => {
  // 1. Pide al store que busque los datos completos de la orden
  await workOrdersStore.fetchWorkOrderById(order.id)
  // 2. Una vez cargados, pasa el objeto completo (currentOrder) al formulario
  orderToEdit.value = currentOrder.value
}

const handleDeleteOrder = (order) => {
  orderToDelete.value = order
}

const confirmDeleteOrder = async () => {
  if (orderToDelete.value) {
    // 1. Espera a que la acción del store termine
    await workOrdersStore.deleteWorkOrder(orderToDelete.value.id)

    // 2. Cierra el modal manualmente solo si la eliminación fue exitosa
    const modalElement = document.getElementById('deleteWorkOrderModal')
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement)
      if (modalInstance) {
        modalInstance.hide()
      }
    }
  }
}

const handleFormSubmit = async (orderData) => {
  if (orderData.id) {
    await workOrdersStore.updateWorkOrder(orderData.id, orderData)
  } else {
    await workOrdersStore.addWorkOrder(orderData)
  }
}

const getSeverityForStatus = (status) => {
  const statusMap = {
    pendiente: 'warn',
    en_progreso: 'info',
    completada: 'success',
    cancelada: 'danger',
  }
  return statusMap[status] || 'secondary'
}
</script>

<template>
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1>Gestión de Órdenes de Trabajo</h1>
      <button
        class="btn btn-success"
        data-bs-toggle="modal"
        data-bs-target="#workOrderModal"
        @click="prepareNewOrder"
      >
        <i class="pi pi-plus me-2"></i>
        Nueva Orden de Trabajo
      </button>
    </div>

    <DataTable
      :value="workOrdersStore.workOrders"
      :paginator="true"
      :rows="10"
      v-model:filters="filters"
      :globalFilterFields="['title', 'client_name', 'assigned_to', 'status']"
      :loading="workOrdersStore.isLoading"
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
          <Tag :value="data.status" :severity="getSeverityForStatus(data.status)" />
        </template>
      </Column>
      <Column header="Acciones" style="width: 11rem">
        <template #body="{ data }">
          <RouterLink :to="{ name: 'work-order-detail', params: { id: data.id } }">
            <Button icon="pi pi-eye" class="p-button-rounded p-button-info me-2" />
          </RouterLink>
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-warning me-2"
            data-bs-toggle="modal"
            data-bs-target="#workOrderModal"
            @click="prepareEditOrder(data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger"
            @click="handleDeleteOrder(data)"
            data-bs-toggle="modal"
            data-bs-target="#deleteWorkOrderModal"
          />
        </template>
      </Column>
    </DataTable>

    <WorkOrderForm :order-to-edit="orderToEdit" @submit="handleFormSubmit" />

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
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-danger"
              data-bs-dismiss="modal"
              @click="confirmDeleteOrder"
            >
              Sí, Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
