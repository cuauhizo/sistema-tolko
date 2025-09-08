<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkOrdersStore } from '../stores/workOrders'
import { storeToRefs } from 'pinia'
import { generateWorkOrderPDF } from '../utils/pdfGenerator'
import { formatStatus, formatWorkOrderId } from '@/utils/formatters';

const route = useRoute()
const workOrdersStore = useWorkOrdersStore()
const { currentOrder, isLoading, error } = storeToRefs(workOrdersStore)

onMounted(() => {
  workOrdersStore.fetchWorkOrderById(route.params.id)
})

const handleExportPDF = () => {
  generateWorkOrderPDF(currentOrder.value)
}
</script>

<template>
  <div class="container my-4">
    <div v-if="isLoading" class="text-center mt-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    <div v-else-if="currentOrder">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p class="h5 text-muted">{{ formatWorkOrderId(currentOrder.id) }}</p>
          <h1 class="mb-0">{{ currentOrder.title }}</h1>
          <p class="text-muted">
            Cliente: <strong>{{ currentOrder.client_name || 'N/A' }}</strong>
          </p>
        </div>
        <div>
          <button class="btn btn-danger me-2" @click="handleExportPDF">
            <i class="bi bi-file-earmark-pdf me-2"></i>Exportar a PDF
          </button>
          <span class="badge p-2"
                :class="{
                  'bg-warning text-dark': currentOrder.status === 'pendiente',
                  'bg-info': currentOrder.status === 'en_progreso',
                  'bg-success': currentOrder.status === 'completada',
                  'bg-dark': currentOrder.status === 'cancelada',
                  }">{{ formatStatus(currentOrder.status) }}
          </span>
          <!-- pendiente: 'warn',
            en_progreso: 'info',
            completada: 'success',
            cancelada: 'danger', -->
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4"><strong>Asignada a:</strong> {{ currentOrder.assigned_to }}</div>
            <div class="col-md-4">
              <strong>Fecha de Inicio:</strong>
              {{ new Date(currentOrder.start_date).toLocaleDateString() }}
            </div>
            <div class="col-md-4">
              <strong>Fecha Límite:</strong>
              {{ new Date(currentOrder.end_date).toLocaleDateString() }}
            </div>
          </div>
          <hr />
          <p><strong>Descripción:</strong></p>
          <p>{{ currentOrder.description || 'Sin descripción.' }}</p>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h5>Materiales Utilizados</h5>
        </div>
        <div class="card-body">
          <ul class="list-group list-group-flush">
            <li v-if="currentOrder.products.length === 0" class="list-group-item text-muted">
              No se asignaron productos a esta orden.
            </li>
            <li
              v-for="product in currentOrder.products"
              :key="product.product_id"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              {{ product.name }}
              <span class="badge bg-secondary rounded-pill"
                >Cantidad: {{ product.quantity_used }}</span
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
