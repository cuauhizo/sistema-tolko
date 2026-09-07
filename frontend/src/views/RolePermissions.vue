<script setup>
  import { ref, computed, onMounted } from 'vue'
  import apiClient from '../api/axios' // Ajusta la ruta de tu axios si es diferente
  import Select from 'primevue/select'

  // --- ESTADO ---
  const roles = ref([])
  const selectedRoleId = ref(null)
  const allPermissions = ref([])
  const rolePermissions = ref([]) // Array con los IDs de los permisos asignados
  const isLoading = ref(false)
  const isSaving = ref(false)

  // --- COMPUTADOS ---
  // Agrupa los permisos por su columna 'module' para mostrarlos en tarjetas separadas
  const groupedPermissions = computed(() => {
    const groups = {}
    allPermissions.value.forEach(perm => {
      if (!groups[perm.module]) {
        groups[perm.module] = []
      }
      groups[perm.module].push(perm)
    })
    return groups
  })

  // --- FUNCIONES ---
  // 1. Cargar catálogo de roles y todos los permisos disponibles
  const fetchData = async () => {
    isLoading.value = true
    try {
      // Estas rutas las crearemos en el backend en el siguiente paso
      const [rolesRes, permRes] = await Promise.all([apiClient.get('/roles'), apiClient.get('/roles/permissions')])
      roles.value = rolesRes.data
      allPermissions.value = permRes.data
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 2. Cargar los permisos cuando se selecciona un rol diferente
  const loadRolePermissions = async () => {
    if (!selectedRoleId.value) {
      rolePermissions.value = []
      return
    }

    isLoading.value = true
    try {
      const { data } = await apiClient.get(`/roles/${selectedRoleId.value}/permissions`)
      // Extraemos solo los IDs de los permisos para marcar los checkboxes
      rolePermissions.value = data.map(p => p.permission_id)
    } catch (error) {
      console.error('Error al cargar permisos del rol:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 3. NUEVO: Seleccionar/Deseleccionar todos los permisos de un módulo
  const toggleModulePermissions = (moduleName, perms) => {
    // Si es superadmin, no hacemos nada
    if (selectedRoleId.value === 1) return

    // Obtenemos los IDs de los permisos de este módulo
    const modulePermIds = perms.map(p => p.id)

    // Verificamos si TODOS los permisos de este módulo ya están seleccionados
    const allSelected = modulePermIds.every(id => rolePermissions.value.includes(id))

    if (allSelected) {
      // Si ya están todos, se los quitamos (deseleccionar)
      rolePermissions.value = rolePermissions.value.filter(id => !modulePermIds.includes(id))
    } else {
      // Si falta alguno, agregamos los que falten
      const newPermissions = modulePermIds.filter(id => !rolePermissions.value.includes(id))
      rolePermissions.value = [...rolePermissions.value, ...newPermissions]
    }
  }

  // 4. Guardar la nueva configuración
  const savePermissions = async () => {
    if (!selectedRoleId.value) return

    isSaving.value = true
    try {
      await apiClient.post(`/roles/${selectedRoleId.value}/permissions`, {
        permissions: rolePermissions.value,
      })
      // Aquí podrías agregar una notificación de éxito (ej. toast)
      alert('Permisos actualizados correctamente. Los usuarios con este rol deberán iniciar sesión nuevamente para ver los cambios.')
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('Ocurrió un error al guardar los permisos.')
    } finally {
      isSaving.value = false
    }
  }

  onMounted(() => {
    fetchData()
  })
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Encabezado -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800 flex items-center">
        <i class="pi pi-shield !text-3xl mr-3 text-blue-600"></i>
        Gestión de Permisos (ACL)
      </h1>
      <p class="text-gray-500 mt-1 text-sm sm:text-base">Configura exactamente qué módulos y acciones puede realizar cada perfil dentro del sistema.</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Barra superior: Selección de Rol -->
      <div class="bg-gray-50 px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="w-full sm:w-1/3">
          <label for="roleSelect" class="block text-sm font-bold text-gray-700 mb-2">Selecciona un Perfil:</label>
          <Select id="roleSelect" v-model="selectedRoleId" :options="roles" optionLabel="name" optionValue="id" placeholder="Elegir perfil..." class="w-full border-gray-300 shadow-sm" @change="loadRolePermissions" />
        </div>

        <div v-if="selectedRoleId" class="flex items-center text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <i class="pi pi-info-circle mr-2"></i>
          Modificando matriz de acceso para este perfil
        </div>
      </div>

      <!-- Pantalla de Carga -->
      <div v-if="isLoading" class="p-12 flex flex-col items-center justify-center text-gray-400">
        <i class="pi pi-spin pi-spinner text-4xl mb-3"></i>
        <p>Cargando matriz de permisos...</p>
      </div>

      <!-- Matriz de Permisos (Solo visible si hay un rol seleccionado) -->
      <div v-else-if="selectedRoleId" class="p-6 bg-white">
        <!-- Grid responsivo para los Módulos -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <!-- Iterar sobre los grupos de permisos (Módulos) -->
          <div v-for="(perms, moduleName) in groupedPermissions" :key="moduleName" class="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 class="font-bold text-gray-800 uppercase text-sm tracking-wider flex items-center">
                <i class="pi pi-folder mr-2 text-gray-400"></i>
                {{ moduleName }}
              </h3>
              <!-- Botón Toggle Todo -->
              <button type="button" @click="toggleModulePermissions(moduleName, perms)" :disabled="selectedRoleId === 1" class="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed">(Todos)</button>
            </div>

            <div class="p-4 space-y-3">
              <!-- Lista de Checkboxes -->
              <label v-for="perm in perms" :key="perm.id" class="flex items-start cursor-pointer group">
                <div class="flex items-center h-5">
                  <input type="checkbox" :value="perm.id" v-model="rolePermissions" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" :disabled="selectedRoleId === 1" />
                  <!-- Nota: Deshabilitamos edición para el SuperAdmin (ID 1) para que no se quite permisos a sí mismo por error -->
                </div>
                <div class="ml-3 text-sm flex flex-col">
                  <span class="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{{ perm.description }}</span>
                  <span class="text-xs text-gray-400 font-mono mt-0.5">{{ perm.name }}</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Botón Guardar -->
        <div class="mt-8 pt-5 border-t border-gray-100 flex justify-end">
          <button
            @click="savePermissions"
            :disabled="isSaving || selectedRoleId === 1"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
            <i v-if="isSaving" class="pi pi-spin pi-spinner mr-2"></i>
            <i v-else class="pi pi-save mr-2"></i>
            {{ isSaving ? 'Guardando...' : 'Guardar Permisos' }}
          </button>
        </div>
      </div>

      <!-- Estado Vacío -->
      <div v-else class="p-16 flex flex-col items-center justify-center text-center text-gray-500">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="pi pi-users text-2xl text-gray-400"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-1">Ningún perfil seleccionado</h3>
        <p>Selecciona un perfil en la parte superior para visualizar y editar sus permisos de acceso.</p>
      </div>
    </div>
  </div>
</template>
