<script setup>
  import { onMounted, ref } from 'vue'
  import { useSuppliersStore } from '../stores/suppliers'

  // Importaciones de PrimeVue
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import Button from 'primevue/button'
  import InputText from 'primevue/inputtext'
  import IconField from 'primevue/iconfield'
  import InputIcon from 'primevue/inputicon'
  import { FilterMatchMode } from '@primevue/core/api'

  // --- Estado del Componente ---
  const suppliersStore = useSuppliersStore()

  // Modales y Formularios
  const showFormModal = ref(false)
  const showDeleteModal = ref(false)
  const isSaving = ref(false)
  const isEditing = ref(false)

  const currentId = ref(null)
  const itemToDelete = ref(null)

  // Agregamos contact_phone al estado
  const formData = ref({ name: '', giro: '', contact_name: '', contact_phone: '', contact_email: '', phone: '', email: '', address: '' })

  // Filtros para la DataTable
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  onMounted(() => {
    suppliersStore.fetchSuppliers()
  })

  // --- Funciones del Formulario ---
  const openCreateModal = () => {
    isEditing.value = false
    currentId.value = null
    formData.value = { name: '', giro: '', contact_name: '', contact_phone: '', contact_email: '', phone: '', email: '', address: '' }
    showFormModal.value = true
  }

  const openEditModal = supplier => {
    isEditing.value = true
    currentId.value = supplier.id
    formData.value = { ...supplier }
    showFormModal.value = true
  }

  const handleFormSubmit = async () => {
    isSaving.value = true
    try {
      if (isEditing.value) {
        await suppliersStore.updateSupplier(currentId.value, formData.value)
      } else {
        await suppliersStore.addSupplier(formData.value)
      }
      showFormModal.value = false
    } finally {
      isSaving.value = false
    }
  }

  // --- Funciones de Eliminación ---
  const openDeleteModal = supplier => {
    itemToDelete.value = supplier
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (itemToDelete.value) {
      await suppliersStore.deleteSupplier(itemToDelete.value.id)
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
        <i class="pi pi-truck !text-3xl text-slate-600 mr-3"></i>
        <h1 class="text-2xl font-bold text-gray-800">Gestionar Proveedores</h1>
      </div>
      <button class="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" @click="openCreateModal">
        <i class="pi pi-plus mr-2"></i>
        Nuevo Proveedor
      </button>
    </div>

    <!-- Tabla PrimeVue -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- NUEVO: Agregamos paginatorTemplate y currentPageReportTemplate -->
      <DataTable
        :value="suppliersStore.suppliers"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
        :globalFilterFields="['name', 'giro', 'contact_name', 'contact_email']"
        v-model:filters="filters"
        size="small"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        :loading="suppliersStore.isLoading"
        class="border-none">
        <template #header>
          <div class="flex justify-end p-2">
            <IconField>
              <InputIcon><i class="pi pi-search text-gray-400" /></InputIcon>
              <InputText v-model="filters.global.value" placeholder="Buscar proveedor..." class="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </IconField>
          </div>
        </template>

        <template #empty><div class="text-center py-4 text-gray-500">No se encontraron proveedores.</div></template>
        <template #loading>
          <div class="text-center py-4 text-gray-500">
            <i class="pi pi-spin pi-spinner mr-2"></i>
            Cargando proveedores...
          </div>
        </template>

        <!-- Columnas -->
        <Column field="name" header="Proveedor / Giro" :sortable="true" style="min-width: 14rem">
          <template #body="{ data }">
            <div class="font-bold text-gray-900">{{ data.name }}</div>
            <div class="text-sm text-gray-500" v-if="data.giro">{{ data.giro }}</div>
          </template>
        </Column>

        <Column field="email" header="Contacto" :sortable="true" style="min-width: 16rem">
          <template #body="{ data }">
            <div class="text-gray-600 flex items-center mt-2" v-if="data.phone" title="Teléfono de la Empresa">
              <i class="pi pi-phone mr-1"></i>
              {{ data.phone }}
            </div>
            <div class="text-gray-600 flex items-center mt-2" v-if="data.email" title="Correo de la Empresa">
              <i class="pi pi-envelope mr-1"></i>
              {{ data.email }}
            </div>
          </template>
        </Column>

        <Column field="contact_name" header="Vendedor / Contacto Directo" :sortable="true" style="min-width: 16rem">
          <template #body="{ data }">
            <div class="font-semibold text-gray-800 mb-1 flex items-center" v-if="data.contact_name">
              <i class="pi pi-user mr-2 text-blue-500"></i>
              {{ data.contact_name }}
            </div>
            <!-- Mostrar Celular / WhatsApp del vendedor -->
            <div class="text-sm text-gray-600 flex items-center mb-1" v-if="data.contact_phone">
              <i class="pi pi-whatsapp mr-2 text-green-500"></i>
              {{ data.contact_phone }}
            </div>
            <div class="text-sm text-gray-600 flex items-center" v-if="data.contact_email">
              <i class="pi pi-envelope mr-2 text-gray-400"></i>
              {{ data.contact_email }}
            </div>
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

    <!-- MODAL FORMULARIO -->
    <div v-if="showFormModal" class="fixed inset-0 z-[60] flex items-center justify-center overflow-x-hidden overflow-y-auto px-4">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="showFormModal = false"></div>
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl z-50 transform transition-all flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h3 class="text-xl font-bold text-gray-900">{{ isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h3>
          <button @click="showFormModal = false" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 ml-auto inline-flex items-center transition-colors"><i class="pi pi-times"></i></button>
        </div>

        <form @submit.prevent="handleFormSubmit" class="flex flex-col overflow-hidden">
          <div class="px-6 py-5 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Empresa / Comercial
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-building"></i></span>
                <input type="text" v-model="formData.name" required class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Giro (Ej. Lonas, Tintas)</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-briefcase"></i></span>
                <input type="text" v-model="formData.giro" class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono de la Empresa</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-phone"></i></span>
                <input
                  type="tel"
                  v-model="formData.phone"
                  @input="formData.phone = $event.target.value.replace(/[^0-9]/g, '')"
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  maxlength="15" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico Empresa</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-envelope"></i></span>
                <input type="email" v-model="formData.email" class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Dirección Física</label>
              <div class="relative">
                <span class="absolute top-3 left-0 pl-3 flex items-start text-gray-400"><i class="pi pi-map-marker"></i></span>
                <textarea v-model="formData.address" rows="2" class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
              </div>
            </div>

            <!-- SECCIÓN CONTACTO DIRECTO -->
            <div class="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
              <h4 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Datos del Vendedor / Contacto</h4>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Vendedor</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-user"></i></span>
                <input type="text" v-model="formData.contact_name" class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ej. Juan Pérez" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Celular Directo</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-whatsapp"></i></span>
                <input
                  type="tel"
                  v-model="formData.contact_phone"
                  @input="formData.contact_phone = $event.target.value.replace(/[^0-9]/g, '')"
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  maxlength="15" />
              </div>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico Directo</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i class="pi pi-envelope"></i></span>
                <input type="email" v-model="formData.contact_email" class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
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
    <!-- (El código del modal de eliminación permanece intacto) -->
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
                ¿Estás seguro de que deseas eliminar el proveedor:
                <strong class="text-gray-900">{{ itemToDelete.name }}</strong>
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
