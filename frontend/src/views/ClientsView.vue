<script setup>
  import { onMounted, ref } from 'vue'
  import { useClientsStore } from '../stores/clients'

  // Importaciones de PrimeVue
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import Button from 'primevue/button'
  import InputText from 'primevue/inputtext'
  import IconField from 'primevue/iconfield'
  import InputIcon from 'primevue/inputicon'
  import { FilterMatchMode } from '@primevue/core/api'

  // --- Estado del Componente ---
  const clientsStore = useClientsStore()

  // Modales y Formularios
  const showFormModal = ref(false)
  const showDeleteModal = ref(false)
  const isSaving = ref(false)
  const isEditing = ref(false)

  const currentId = ref(null)
  const itemToDelete = ref(null)
  const formData = ref({ name: '', company: '', email: '', phone: '', address: '' })

  // Filtros para la DataTable
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  onMounted(() => {
    clientsStore.fetchClients()
  })

  // --- Funciones del Formulario ---
  const openCreateModal = () => {
    isEditing.value = false
    currentId.value = null
    formData.value = { name: '', company: '', email: '', phone: '', address: '' }
    showFormModal.value = true
  }

  const openEditModal = client => {
    isEditing.value = true
    currentId.value = client.id
    formData.value = { ...client }
    showFormModal.value = true
  }

  const handleFormSubmit = async () => {
    isSaving.value = true
    try {
      if (isEditing.value) {
        await clientsStore.updateClient(currentId.value, formData.value)
      } else {
        await clientsStore.addClient(formData.value)
      }
      showFormModal.value = false
    } finally {
      isSaving.value = false
    }
  }

  // --- Funciones de Eliminación ---
  const openDeleteModal = client => {
    itemToDelete.value = client
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (itemToDelete.value) {
      await clientsStore.deleteClient(itemToDelete.value.id)
    }
    showDeleteModal.value = false
    itemToDelete.value = null
  }
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Encabezado -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div class="flex items-center">
        <i class="pi pi-users !text-3xl text-slate-600 mr-3"></i>
        <h1 class="text-2xl font-bold text-gray-800">Directorio de Clientes</h1>
      </div>
      <button class="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" @click="openCreateModal">
        <i class="pi pi-plus mr-2"></i>
        Nuevo Cliente
      </button>
    </div>

    <!-- Tabla PrimeVue -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable
        :value="clientsStore.clients"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
        :globalFilterFields="['name', 'company', 'email', 'phone']"
        v-model:filters="filters"
        size="small"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        :loading="clientsStore.isLoading"
        class="border-none">
        <template #header>
          <div class="flex justify-end p-2">
            <IconField>
              <InputIcon><i class="pi pi-search text-gray-400" /></InputIcon>
              <InputText v-model="filters.global.value" placeholder="Buscar cliente..." class="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </IconField>
          </div>
        </template>

        <template #empty><div class="text-center py-4 text-gray-500">No se encontraron clientes.</div></template>
        <template #loading>
          <div class="text-center py-4 text-gray-500">
            <i class="pi pi-spin pi-spinner mr-2"></i>
            Cargando clientes...
          </div>
        </template>

        <!-- Columnas -->
        <Column field="name" header="Cliente / Empresa" :sortable="true" style="min-width: 14rem">
          <template #body="{ data }">
            <div class="font-bold text-gray-900">{{ data.name }}</div>
            <div class="text-sm text-blue-600 font-medium flex items-center" v-if="data.company">
              <i class="pi pi-building text-[10px] mr-1"></i>
              {{ data.company }}
            </div>
          </template>
        </Column>

        <Column field="email" header="Contacto" :sortable="true" style="min-width: 14rem">
          <template #body="{ data }">
            <div class="text-sm text-gray-900 flex items-center" v-if="data.email">
              <i class="pi pi-envelope mr-2 text-gray-400"></i>
              {{ data.email }}
            </div>
            <div class="text-sm text-gray-600 flex items-center mt-1" v-if="data.phone">
              <i class="pi pi-whatsapp mr-2 text-green-500"></i>
              {{ data.phone }}
            </div>
          </template>
        </Column>

        <Column field="address" header="Dirección" style="min-width: 10rem">
          <template #body="{ data }">
            <div class="text-sm text-gray-600 truncate max-w-xs">{{ data.address || '—' }}</div>
          </template>
        </Column>

        <Column header="Acciones" style="width: 10rem" :exportable="false">
          <template #body="{ data }">
            <div class="flex space-x-2">
              <Button icon="pi pi-pencil" class="p-button-rounded p-button-warning p-button-outlined p-button-sm" @click="openEditModal(data)" />
              <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-outlined p-button-sm" @click="openDeleteModal(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- MODAL FORMULARIO (Estilo Tailwind con Íconos y Validación) -->
    <div v-if="showFormModal" class="fixed inset-0 z-[60] flex items-center justify-center overflow-x-hidden overflow-y-auto px-4">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="showFormModal = false"></div>
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl z-50 transform transition-all flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h3 class="text-xl font-bold text-gray-900">{{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
          <button @click="showFormModal = false" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 ml-auto inline-flex items-center transition-colors"><i class="pi pi-times"></i></button>
        </div>

        <form @submit.prevent="handleFormSubmit" class="flex flex-col overflow-hidden">
          <div class="px-6 py-5 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-user"></i></span>
                <input type="text" v-model="formData.name" required class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Empresa (Opcional)</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-building"></i></span>
                <input type="text" v-model="formData.company" class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-envelope"></i></span>
                <input type="email" v-model="formData.email" class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-whatsapp"></i></span>
                <input
                  type="tel"
                  v-model="formData.phone"
                  @input="formData.phone = $event.target.value.replace(/[^0-9]/g, '')"
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  maxlength="15" />
              </div>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Dirección / Notas</label>
              <div class="relative">
                <span class="absolute top-3 left-0 pl-3 flex items-start text-gray-400"><i class="pi pi-map-marker"></i></span>
                <textarea v-model="formData.address" rows="2" class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0 space-x-3 rounded-b-xl">
            <button
              type="button"
              @click="showFormModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center disabled:opacity-70">
              <i v-if="isSaving" class="pi pi-spin pi-spinner mr-2"></i>
              <i v-else class="pi pi-save mr-2"></i>
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL CONFIRMAR ELIMINACIÓN -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="showDeleteModal = false"></div>
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 z-50 transform transition-all">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
          <button @click="showDeleteModal = false" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 ml-auto inline-flex items-center transition-colors"><i class="pi pi-times"></i></button>
        </div>
        <div class="px-6 py-4">
          <div class="flex items-start">
            <i class="pi pi-exclamation-triangle text-red-500 text-2xl mr-3 mt-1"></i>
            <div>
              <p class="text-gray-600 mb-2" v-if="itemToDelete">
                ¿Estás seguro de eliminar el cliente:
                <strong class="text-gray-900">{{ itemToDelete.name }}</strong>
                ?
              </p>
              <p class="text-sm font-medium text-red-500">Sus órdenes de trabajo históricas no se verán afectadas.</p>
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
            @click="confirmDelete"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center">
            <i class="pi pi-trash mr-2"></i>
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
