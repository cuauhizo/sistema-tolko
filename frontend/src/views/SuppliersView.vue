<script setup>
  import { ref, onMounted } from 'vue'
  import { useSuppliersStore } from '../stores/suppliers'
  import { storeToRefs } from 'pinia'

  const suppliersStore = useSuppliersStore()
  const { suppliers, isLoading } = storeToRefs(suppliersStore)

  // Estado del formulario
  const isEditing = ref(false)
  const showForm = ref(false)
  const currentId = ref(null)
  const formData = ref({
    name: '',
    contact_email: '',
    phone: '',
    address: '',
  })

  onMounted(() => {
    suppliersStore.fetchSuppliers()
  })

  const openCreateForm = () => {
    isEditing.value = false
    currentId.value = null
    formData.value = { name: '', contact_email: '', phone: '', address: '' }
    showForm.value = true
  }

  const openEditForm = supplier => {
    isEditing.value = true
    currentId.value = supplier.id
    formData.value = { ...supplier }
    showForm.value = true
  }

  const cancelForm = () => {
    showForm.value = false
  }

  const saveSupplier = async () => {
    if (isEditing.value) {
      await suppliersStore.updateSupplier(currentId.value, formData.value)
    } else {
      await suppliersStore.addSupplier(formData.value)
    }
    showForm.value = false
  }

  const deleteSupplier = async id => {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      await suppliersStore.deleteSupplier(id)
    }
  }
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Directorio de Proveedores</h1>
      <button v-if="!showForm" @click="openCreateForm" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors">
        <i class="pi pi-plus mr-2"></i>
        Nuevo Proveedor
      </button>
    </div>

    <!-- Formulario (Se muestra al hacer clic en Nuevo o Editar) -->
    <div v-if="showForm" class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 mb-8 p-6">
      <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor' }}</h2>
      <form @submit.prevent="saveSupplier" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Nombre Comercial
            <span class="text-red-500">*</span>
          </label>
          <input type="text" v-model="formData.name" required class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 border" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input type="email" v-model="formData.contact_email" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 border" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input type="text" v-model="formData.phone" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 border" />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <textarea v-model="formData.address" rows="2" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 border"></textarea>
        </div>

        <div class="md:col-span-2 flex justify-end gap-3 mt-4">
          <button type="button" @click="cancelForm" class="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md shadow-sm transition-colors">Cancelar</button>
          <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors">Guardar Proveedor</button>
        </div>
      </form>
    </div>

    <!-- Lista de Proveedores -->
    <div v-if="isLoading" class="flex justify-center py-10">
      <i class="pi pi-spin pi-spinner text-blue-600 text-3xl"></i>
    </div>

    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="suppliers.length === 0">
            <td colspan="3" class="px-6 py-8 text-center text-gray-500 italic">No hay proveedores registrados aún.</td>
          </tr>
          <tr v-for="supplier in suppliers" :key="supplier.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="font-medium text-gray-900">{{ supplier.name }}</div>
              <div class="text-sm text-gray-500">{{ supplier.address || 'Sin dirección' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 flex items-center">
                <i class="pi pi-envelope mr-2 text-gray-400"></i>
                {{ supplier.contact_email || 'N/A' }}
              </div>
              <div class="text-sm text-gray-500 flex items-center mt-1">
                <i class="pi pi-phone mr-2 text-gray-400"></i>
                {{ supplier.phone || 'N/A' }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="openEditForm(supplier)" class="text-blue-600 hover:text-blue-900 mr-4"><i class="pi pi-pencil"></i></button>
              <button @click="deleteSupplier(supplier.id)" class="text-red-600 hover:text-red-900"><i class="pi pi-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
