<script setup>
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useInventoryStore } from '../stores/inventory'

  // Importaciones de PrimeVue
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import InputText from 'primevue/inputtext'
  import IconField from 'primevue/iconfield'
  import InputIcon from 'primevue/inputicon'
  import { FilterMatchMode } from '@primevue/core/api'

  const router = useRouter()
  const inventoryStore = useInventoryStore()

  onMounted(() => {
    inventoryStore.fetchMovements()
  })

  // Añadimos los nuevos campos al filtro global
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  const formatDate = value => {
    if (!value) return 'N/A'
    return new Date(value).toLocaleString()
  }

  // Función para asignar colores de Tailwind según el tipo de movimiento
  const getBadgeClass = type => {
    switch (type) {
      case 'ENTRADA':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'SALIDA':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'MERMA':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'AJUSTE':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div class="flex items-center">
        <i class="pi pi-history !text-3xl text-slate-600 mr-3"></i>
        <h1 class="text-2xl font-bold text-gray-800">Historial de Movimientos</h1>
      </div>

      <!-- Botón para ir a registrar un movimiento manual -->
      <button @click="router.push('/inventory/adjustments')" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center">
        <i class="pi pi-plus-circle mr-2"></i>
        Registrar Movimiento
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable
        :value="inventoryStore.movements"
        :paginator="true"
        :rows="10"
        v-model:filters="filters"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
        :globalFilterFields="['product_name', 'reason', 'work_order_title', 'user_name', 'movement_type']"
        :loading="inventoryStore.isLoading"
        size="small"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        class="border-none">
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
          <div class="text-center py-4 text-gray-500">
            <i class="pi pi-spin pi-spinner mr-2"></i>
            Cargando historial...
          </div>
        </template>

        <!-- Columna Fecha y Usuario combinados para ahorrar espacio -->
        <Column field="created_at" header="Fecha / Usuario" :sortable="true" style="min-width: 12rem">
          <template #body="{ data }">
            <div class="text-gray-900 font-medium">
              <i class="pi pi-calendar text-[10px] mr-1 text-gray-500"></i>
              {{ formatDate(data.created_at) }}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              <i class="pi pi-user text-[10px] mr-1"></i>
              {{ data.user_name || 'Sistema' }}
            </div>
          </template>
        </Column>

        <!-- Columna Producto -->
        <Column field="product_name" header="Producto" :sortable="true" style="min-width: 12rem">
          <template #body="{ data }">
            <span class="font-medium text-gray-900">{{ data.product_name }}</span>
            <div v-if="data.unit" class="text-xs text-gray-500 mt-0.5">Unidad: {{ data.unit }}</div>
          </template>
        </Column>

        <!-- NUEVA Columna: Tipo de Movimiento -->
        <Column field="movement_type" header="Tipo" :sortable="true" style="min-width: 8rem">
          <template #body="{ data }">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border" :class="getBadgeClass(data.movement_type)">
              {{ data.movement_type }}
            </span>
          </template>
        </Column>

        <!-- Columna Cambio (Cantidad) -->
        <Column field="quantity_change" header="Cantidad" :sortable="true" style="min-width: 8rem">
          <template #body="{ data }">
            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-bold border" :class="data.quantity_change > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'">
              <i class="pi mr-1 !text-[10px]" :class="data.quantity_change > 0 ? 'pi-arrow-up' : 'pi-arrow-down'"></i>
              {{ data.quantity_change > 0 ? '+' : '' }}{{ data.quantity_change }}
            </span>
          </template>
        </Column>

        <!-- Columna Motivo y Orden de Trabajo combinados -->
        <Column field="reason" header="Motivo / Referencia" :sortable="true" style="min-width: 14rem">
          <template #body="{ data }">
            <div class="text-gray-600 text-sm">{{ data.reason || 'Sin especificar' }}</div>
            <div v-if="data.work_order_title" class="text-xs font-bold text-blue-600 mt-1 flex items-center">
              <i class="pi pi-briefcase mr-1"></i>
              OT: {{ data.work_order_title }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
