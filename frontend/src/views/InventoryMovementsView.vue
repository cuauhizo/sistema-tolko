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
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div class="flex items-center">
        <i class="pi pi-history text-3xl text-slate-600 mr-3"></i>
        <h1 class="text-2xl font-bold text-gray-800">Historial de Movimientos</h1>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable
        :value="inventoryStore.movements"
        :paginator="true"
        :rows="10"
        v-model:filters="filters"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        :globalFilterFields="['product_name', 'reason', 'work_order_title']"
        :loading="inventoryStore.isLoading"
        size="small"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        class="border-none"
      >
        <template #header>
          <div class="flex justify-end p-2">
            <IconField>
              <InputIcon><i class="pi pi-search text-gray-400" /></InputIcon>
              <InputText v-model="filters.global.value" placeholder="Buscar movimiento..." class="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </IconField>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4 text-gray-500">No se encontraron movimientos de inventario.</div>
        </template>
        <template #loading>
          <div class="text-center py-4 text-gray-500"><i class="pi pi-spin pi-spinner mr-2"></i> Cargando historial...</div>
        </template>

        <Column field="created_at" header="Fecha y Hora" :sortable="true" style="min-width: 12rem">
          <template #body="{ data }">
            <span class="text-gray-600">
              <i class="pi pi-calendar text-[10px] mr-1"></i>
              {{ formatDate(data.created_at) }}
            </span>
          </template>
        </Column>
        
        <Column field="product_name" header="Producto" :sortable="true" style="min-width: 14rem">
          <template #body="{ data }">
            <span class="font-medium text-gray-900">{{ data.product_name }}</span>
          </template>
        </Column>
        
        <Column field="quantity_change" header="Cambio" :sortable="true">
          <template #body="{ data }">
            <span 
              class="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-bold border"
              :class="data.quantity_change > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'"
            >
              <i class="pi mr-1 !text-[10px]" :class="data.quantity_change > 0 ? 'pi-arrow-up' : 'pi-arrow-down'"></i>
              {{ data.quantity_change > 0 ? '+' : '' }}{{ data.quantity_change }}
            </span>
          </template>
        </Column>
        
        <Column field="reason" header="Motivo / Origen" :sortable="true">
          <template #body="{ data }">
            <span class="text-gray-600">{{ data.reason }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>