<script setup>
import { ref, onMounted } from 'vue';
import { useWorkOrdersStore } from '../stores/workOrders';
import DataView from 'primevue/dataview';
import SelectButton from 'primevue/selectbutton';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import { formatStatus, formatWorkOrderId } from '../utils/formatters';

const workOrdersStore = useWorkOrdersStore();
const layout = ref('list');
const options = ref(['list', 'grid']);
const statusFilter = ref();
const statusOptions = ref([
  { name: 'Todas', code: '' },
  { name: 'Pendientes', code: 'pendiente' },
  { name: 'En Progreso', code: 'en_progreso' },
  { name: 'Por Aprobar', code: 'por_aprobar' },
  { name: 'Completada', code: 'completada' },
  { name: 'Canceladas', code: 'cancelada' }, // <-- Incluimos las canceladas
]);

onMounted(() => {
  workOrdersStore.fetchMyWorkOrders();
});

const onFilterChange = (event) => {
  workOrdersStore.fetchMyWorkOrders(event.value.code);
};

const handleStatusChange = (order, newStatus) => {
  if (order.status !== newStatus) {
    workOrdersStore.updateWorkOrderStatus(order.id, newStatus);
  }
};

const getSeverityForStatus = (status) => {
  const statusMap = {
    pendiente: 'warn',
    en_progreso: 'info',
    por_aprobar: 'secondary',
    completada: 'success',
    cancelada: 'danger',
  };
  return statusMap[status] || 'contrast';
};
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
            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              optionLabel="name"
              placeholder="Filtrar por estado"
              @change="onFilterChange"
            />
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
              <div class="btn-group btn-group-sm" role="group">
                <button type="button" class="btn" :class="item.status === 'pendiente' ? 'btn-warning' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'pendiente')">Pendiente</button>
                <button type="button" class="btn" :class="item.status === 'en_progreso' ? 'btn-info' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'en_progreso')">En Progreso</button>
                <button type="button" class="btn" :class="item.status === 'por_aprobar' ? 'btn-primary' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'por_aprobar')">Enviar a Revisión</button>
              </div>
              <small class="text-muted">
                <strong>Creada por:</strong> {{ item.created_by }} | 
                <strong>Fecha Límite:</strong> {{ new Date(item.end_date).toLocaleDateString() }}
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
                <span>{{ formatWorkOrderId(item.id) }} - {{ item.title }}</span>
                <div>
                  <Tag :value="formatStatus(item.status)" :severity="getSeverityForStatus(item.status)"></Tag>
                </div>
              </div>
              <div class="card-body d-flex flex-column">
                <h6 class="card-subtitle mb-2 text-muted">{{ item.client_name }}</h6>
                <p class="card-text flex-grow-1">{{ item.description }}</p>
                <div class="btn-group btn-group-sm mt-auto" role="group">
                  <button type="button" class="btn" :class="item.status === 'pendiente' ? 'btn-warning' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'pendiente')">Pendiente</button>
                  <button type="button" class="btn" :class="item.status === 'en_progreso' ? 'btn-info' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'en_progreso')">En Progreso</button>
                  <button type="button" class="btn" :class="item.status === 'por_aprobar' ? 'btn-primary' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'por_aprobar')">Enviar a Revisión</button>
                </div>
              </div>
              <div class="card-footer text-muted">
                Fecha Límite: {{ new Date(item.end_date).toLocaleDateString() }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </DataView>
    <!-- </div> -->
  </div>
</template>