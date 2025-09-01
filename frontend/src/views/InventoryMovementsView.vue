<script setup>
import { onMounted, ref } from 'vue'
import { useInventoryStore } from '../stores/inventory'

// Importaciones de PrimeVue
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { FilterMatchMode } from '@primevue/core/api'

const inventoryStore = useInventoryStore()

onMounted(() => {
  inventoryStore.fetchMovements()
})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const formatDate = (value) => {
  return new Date(value).toLocaleString()
}
</script>

<template>
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1>Historial de Movimientos de Inventario</h1>
    </div>

    <DataTable
      :value="inventoryStore.movements"
      :paginator="true"
      :rows="15"
      v-model:filters="filters"
      :globalFilterFields="['product_name', 'reason', 'work_order_title']"
      :loading="inventoryStore.isLoading"
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

      <template #empty>No se encontraron movimientos.</template>
      <template #loading>Cargando datos...</template>

      <Column field="created_at" header="Fecha" :sortable="true">
        <template #body="{ data }">
          {{ formatDate(data.created_at) }}
        </template>
      </Column>
      <Column field="product_name" header="Producto" :sortable="true"></Column>
      <Column field="quantity_change" header="Cambio" :sortable="true">
        <template #body="{ data }">
          <span :class="data.quantity_change > 0 ? 'text-success' : 'text-danger'">
            <strong>{{ data.quantity_change > 0 ? '+' : '' }}{{ data.quantity_change }}</strong>
          </span>
        </template>
      </Column>
      <Column field="reason" header="Motivo" :sortable="true"></Column>
    </DataTable>
  </div>
</template>
