<script setup>
import { onMounted } from 'vue';
import { useWorkOrdersStore } from '../stores/workOrders';
import DataView from 'primevue/dataview';
import Tag from 'primevue/tag';

const workOrdersStore = useWorkOrdersStore();

onMounted(() => {
  workOrdersStore.fetchMyWorkOrders();
});

const handleStatusChange = (order, newStatus) => {
  if (order.status !== newStatus) {
    workOrdersStore.updateWorkOrderStatus(order.id, newStatus);
  }
};

const getSeverityForStatus = (status) => {
  const statusMap = {
    pendiente: 'warn', en_progreso: 'info', completada: 'success', cancelada: 'danger',
  };
  return statusMap[status] || 'secondary';
};
</script>

<template>
  <div class="container mt-4">
    <h1 class="mb-4">Mis Órdenes de Trabajo</h1>

    <div v-if="workOrdersStore.myWorkOrders.length === 0" class="text-center p-5">
      <h4 class="h2">¡Todo en orden!</h4>
      <p>No tienes órdenes de trabajo asignadas por el momento.</p>
    </div>

    <DataView v-else :value="workOrdersStore.myWorkOrders" layout="list">
      <template #list="slotProps">
        <div class="list-group">
          <div v-for="item in slotProps.items" :key="item.id" class="list-group-item">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">{{ item.title }} - ({{ item.client_name }})</h5>
              <Tag :value="item.status" :severity="getSeverityForStatus(item.status)"></Tag>
            </div>
            <p class="my-3">{{ item.description }}</p>
            <div class="d-flex flex-wrap gap-3 w-100 justify-content-between align-items-center">
              <small class="text-muted">
                <strong>Creada por:</strong> {{ item.created_by }} | 
                <strong>Fecha Límite:</strong> {{ new Date(item.end_date).toLocaleDateString() }}
              </small>
              <div class="btn-group btn-group-sm" role="group">
                <button type="button" class="btn" :class="item.status === 'en_progreso' ? 'btn-info' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'en_progreso')">
                  En Progreso
                </button>
                <button type="button" class="btn" :class="item.status === 'completada' ? 'btn-success' : 'btn-outline-secondary'" @click="handleStatusChange(item, 'completada')">
                  Completada
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DataView>
  </div>
</template>