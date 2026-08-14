<script setup>
  import { onMounted, ref, computed } from 'vue'
  import { useWorkOrdersStore } from '../stores/workOrders'
  import WorkOrderForm from '../components/WorkOrderForm.vue'
  import { formatStatus, formatWorkOrderId } from '@/utils/formatters'

  // Importaciones de PrimeVue
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import Button from 'primevue/button'
  import Tag from 'primevue/tag'
  import InputText from 'primevue/inputtext'
  import IconField from 'primevue/iconfield'
  import InputIcon from 'primevue/inputicon'
  import Skeleton from 'primevue/skeleton'
  import { FilterMatchMode } from '@primevue/core/api'

  const workOrdersStore = useWorkOrdersStore()

  const orderToEdit = ref(null)
  const orderToDelete = ref(null)
  const orderFormRef = ref(null)
  const isSaving = ref(false)
  const showDeleteModal = ref(false)

  const dt = ref()

  const formattedWorkOrders = computed(() => {
    return workOrdersStore.workOrders.map(order => ({
      ...order,
      folio: formatWorkOrderId(order.id),
    }))
  })

  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  onMounted(() => {
    workOrdersStore.fetchWorkOrders()
  })

  const exportCSV = () => {
    dt.value.exportCSV()
  }

  const openModalForNew = () => {
    orderToEdit.value = null
    if (orderFormRef.value) {
      orderFormRef.value.resetForm()
    }
    orderFormRef.value?.openModal()
  }

  const openModalForEdit = async order => {
    await workOrdersStore.fetchWorkOrderById(order.id)
    orderToEdit.value = workOrdersStore.currentOrder
    orderFormRef.value?.openModal()
  }

  const openDeleteModal = order => {
    orderToDelete.value = order
    showDeleteModal.value = true
  }

  const handleFormSubmit = async orderData => {
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

  const confirmDeleteOrder = async () => {
    if (orderToDelete.value) {
      await workOrdersStore.deleteWorkOrder(orderToDelete.value.id)
    }
    showDeleteModal.value = false
    orderToDelete.value = null
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
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Órdenes de Trabajo</h1>
      <button class="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" @click="openModalForNew">
        <i class="pi pi-plus mr-2"></i>
        Nueva Orden
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable
        ref="dt"
        :value="formattedWorkOrders"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
        v-model:filters="filters"
        :globalFilterFields="['folio', 'title', 'client_name', 'assigned_to', 'status']"
        :loading="workOrdersStore.isLoading"
        size="small"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        class="border-none">
        <template #header>
          <div class="flex flex-col sm:flex-row justify-end items-center gap-3 p-2">
            <!-- <Button icon="pi pi-file-excel" label="Exportar Excel" class="p-button-success p-button-sm w-full sm:w-auto" @click="exportCSV" /> -->
            <IconField>
              <InputIcon><i class="pi pi-search text-gray-400" /></InputIcon>
              <InputText v-model="filters.global.value" placeholder="Buscar orden..." class="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64" />
            </IconField>
          </div>
        </template>

        <!-- Estado Vacío (Empty State) Premium -->
        <template #empty>
          <div class="flex flex-col items-center justify-center py-16 px-4">
            <div class="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4">
              <i class="pi pi-inbox text-3xl text-gray-400"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-1">Aún no hay órdenes de trabajo</h3>
            <p class="text-sm text-gray-500 mb-5 text-center max-w-sm">Tu bandeja está vacía. Comienza creando tu primera orden para empezar a llevar el control de tu producción.</p>
            <button @click="openModalForNew" class="text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 font-medium px-4 py-2 rounded-lg transition-colors flex items-center">
              <i class="pi pi-plus mr-2 text-sm"></i>
              Crear mi primera orden
            </button>
          </div>
        </template>

        <!-- Skeleton Loaders -->
        <template #loading>
          <div class="p-4 border-t border-gray-100">
            <div v-for="i in 5" :key="i" class="flex space-x-4 mb-4 w-full">
              <Skeleton width="10%" height="2rem" />
              <Skeleton width="25%" height="2rem" />
              <Skeleton width="20%" height="2rem" />
              <Skeleton width="20%" height="2rem" />
              <Skeleton width="15%" height="2rem" />
              <Skeleton width="10%" height="2rem" />
            </div>
          </div>
        </template>

        <Column field="folio" header="Folio" :sortable="true" style="width: 8rem">
          <template #body="{ data }">
            <span class="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{{ data.folio }}</span>
          </template>
        </Column>
        <Column field="title" header="Título" :sortable="true" style="min-width: 14rem"></Column>
        <Column field="client_name" header="Cliente" :sortable="true"></Column>
        <Column field="assigned_to" header="Asignada a" :sortable="true">
          <template #body="{ data }">
            <span class="text-gray-600 truncate block max-w-[150px]" :title="data.assigned_to">{{ data.assigned_to }}</span>
          </template>
        </Column>
        <Column field="end_date" header="Fecha Límite" :sortable="true">
          <template #body="{ data }">
            <span class="text-gray-600">
              <i class="pi pi-calendar text-[10px] mr-1"></i>
              {{ new Date(data.end_date).toLocaleDateString() }}
            </span>
          </template>
        </Column>
        <Column field="status" header="Estado" :sortable="true">
          <template #body="{ data }">
            <Tag :value="formatStatus(data.status)" :severity="getSeverityForStatus(data.status)" class="uppercase text-[10px] font-bold px-2 py-1"></Tag>
          </template>
        </Column>

        <Column header="Acciones" style="width: 12rem" :exportable="false">
          <template #body="{ data }">
            <div class="flex space-x-2">
              <RouterLink :to="{ name: 'work-order-detail', params: { id: data.id } }">
                <Button icon="pi pi-eye" class="p-button-rounded p-button-info p-button-outlined p-button-sm" />
              </RouterLink>
              <Button icon="pi pi-pencil" class="p-button-rounded p-button-warning p-button-outlined p-button-sm" @click="openModalForEdit(data)" />
              <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-outlined p-button-sm" @click="openDeleteModal(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <WorkOrderForm ref="orderFormRef" :order-to-edit="orderToEdit" :is-saving="isSaving" @submit="handleFormSubmit" />

    <!-- Modal de confirmación de borrado intacto -->
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
              <p class="text-gray-600 mb-2" v-if="orderToDelete">
                ¿Estás seguro de que deseas eliminar la orden:
                <strong class="text-gray-900">{{ orderToDelete.title }}</strong>
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
            @click="confirmDeleteOrder"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center">
            <i class="pi pi-trash mr-2"></i>
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
