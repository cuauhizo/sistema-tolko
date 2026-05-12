<script setup>
  import { ref } from 'vue'
  import { useAuthStore } from '../stores/auth'
  import { useUsersStore } from '../stores/users'
  import { Form, Field, ErrorMessage } from 'vee-validate'
  import * as yup from 'yup'

  const authStore = useAuthStore()
  const usersStore = useUsersStore()
  const formRef = ref(null)

  // Estados independientes para el "ojito" de cada campo
  const showCurrent = ref(false)
  const showNew = ref(false)
  const showConfirm = ref(false)

  // --- PLACEHOLDERS PARA FUTURAS INTEGRACIONES ---
  // Estas variables simulan configuraciones que podrías guardar en base de datos más adelante
  const emailNotifications = ref(true)
  const pushNotifications = ref(true)
  const darkTheme = ref(false)

  const schema = yup.object({
    currentPassword: yup.string().required('La contraseña actual es obligatoria.'),
    newPassword: yup.string().required('La nueva contraseña es obligatoria.').min(6, 'Debe tener al menos 6 caracteres.'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword'), null], 'Las contraseñas no coinciden.')
      .required('Debes confirmar la nueva contraseña.'),
  })

  const handleSubmit = async (values) => {
    await usersStore.changePassword(values)
    formRef.value.resetForm() 
    
    showCurrent.value = false
    showNew.value = false
    showConfirm.value = false
  }
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800 flex items-center">
        <i class="pi pi-user mr-3 text-blue-600"></i>
        Mi Perfil
      </h1>
      <p class="text-gray-500 mt-1 text-sm sm:text-base">
        Administra tu información personal y la seguridad de tu cuenta.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div class="lg:col-span-1 space-y-6">
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div class="relative inline-block mb-4">
            <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-blue-700 flex items-center justify-center text-white text-3xl font-bold shadow-md mx-auto uppercase">
              {{ authStore.username.charAt(0) }}
            </div>
            <button class="absolute bottom-0 right-0 bg-white border border-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-50 shadow-sm transition-colors" title="Cambiar foto de perfil">
              <i class="pi pi-camera text-sm"></i>
            </button>
          </div>
          
          <h2 class="text-xl font-bold text-gray-900">{{ authStore.username }}</h2>
          <p class="text-blue-600 font-medium text-sm mb-4">
            {{ authStore.isAdmin ? 'Administrador del Sistema' : 'Usuario Estándar' }}
          </p>

          <div class="border-t border-gray-100 pt-4 mt-2 text-left space-y-3">
            <div class="flex items-center text-sm">
              <i class="pi pi-envelope text-gray-400 w-6"></i>
              <span class="text-gray-600">correo@ejemplo.com</span>
            </div>
            <div class="flex items-center text-sm">
              <i class="pi pi-briefcase text-gray-400 w-6"></i>
              <span class="text-gray-600">Área de Operaciones</span>
            </div>
            <div class="flex items-center text-sm">
              <i class="pi pi-calendar text-gray-400 w-6"></i>
              <span class="text-gray-600">Miembro desde 2024</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-md font-bold text-gray-800 mb-4 flex items-center">
            <i class="pi pi-cog mr-2 text-gray-500"></i> Preferencias
          </h3>
          
          <div class="space-y-4">
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm text-gray-700">Notificaciones por Email</span>
              <div class="relative">
                <input type="checkbox" v-model="emailNotifications" class="sr-only">
                <div class="block w-10 h-6 rounded-full transition-colors" :class="emailNotifications ? 'bg-blue-500' : 'bg-gray-300'"></div>
                <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform" :class="emailNotifications ? 'transform translate-x-4' : ''"></div>
              </div>
            </label>
            
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm text-gray-700">Notificaciones del Sistema</span>
              <div class="relative">
                <input type="checkbox" v-model="pushNotifications" class="sr-only">
                <div class="block w-10 h-6 rounded-full transition-colors" :class="pushNotifications ? 'bg-blue-500' : 'bg-gray-300'"></div>
                <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform" :class="pushNotifications ? 'transform translate-x-4' : ''"></div>
              </div>
            </label>
          </div>
        </div>

      </div>

      <div class="lg:col-span-2">
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 flex items-center">
              <i class="pi pi-shield mr-2 text-blue-600"></i> Seguridad de la Cuenta
            </h3>
            <p class="text-sm text-gray-500 mt-1">Actualiza tu contraseña para mantener tu cuenta protegida.</p>
          </div>
          
          <div class="p-6 sm:p-8">
            <Form @submit="handleSubmit" :validation-schema="schema" ref="formRef" v-slot="{ errors, isSubmitting }">
              
              <div class="mb-5 max-w-md">
                <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                    <i class="pi pi-unlock"></i>
                  </span>
                  <Field 
                    :type="showCurrent ? 'text' : 'password'" 
                    name="currentPassword" 
                    id="currentPassword" 
                    class="block w-full pl-10 pr-12 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" 
                    :class="errors.currentPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'" 
                    placeholder="••••••••"
                  />
                  <button type="button" @click="showCurrent = !showCurrent" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 focus:outline-none transition-colors" tabindex="-1">
                    <i :class="showCurrent ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-lg"></i>
                  </button>
                </div>
                <ErrorMessage name="currentPassword" class="text-red-500 text-xs mt-1 block font-medium" />
              </div>

              <hr class="border-gray-100 my-6">

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                      <i class="pi pi-key"></i>
                    </span>
                    <Field 
                      :type="showNew ? 'text' : 'password'" 
                      name="newPassword" 
                      id="newPassword" 
                      class="block w-full pl-10 pr-12 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" 
                      :class="errors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'" 
                      placeholder="••••••••"
                    />
                    <button type="button" @click="showNew = !showNew" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 focus:outline-none transition-colors" tabindex="-1">
                      <i :class="showNew ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-lg"></i>
                    </button>
                  </div>
                  <ErrorMessage name="newPassword" class="text-red-500 text-xs mt-1 block font-medium" />
                </div>

                <div>
                  <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                      <i class="pi pi-check-circle"></i>
                    </span>
                    <Field 
                      :type="showConfirm ? 'text' : 'password'" 
                      name="confirmPassword" 
                      id="confirmPassword" 
                      class="block w-full pl-10 pr-12 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" 
                      :class="errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'" 
                      placeholder="••••••••"
                    />
                    <button type="button" @click="showConfirm = !showConfirm" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 focus:outline-none transition-colors" tabindex="-1">
                      <i :class="showConfirm ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-lg"></i>
                    </button>
                  </div>
                  <ErrorMessage name="confirmPassword" class="text-red-500 text-xs mt-1 block font-medium" />
                </div>
              </div>

              <div class="flex justify-end pt-8 mt-6 border-t border-gray-100">
                <button type="submit" :disabled="isSubmitting"
                  class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">
                  <i v-if="isSubmitting" class="pi pi-spin pi-spinner mr-2"></i>
                  <i v-else class="pi pi-save mr-2"></i>
                  {{ isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña' }}
                </button>
              </div>
            </Form>
          </div>
          
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
/* Transición suave para los "toggles" (interruptores) de preferencias */
.dot {
  transition: all 0.3s ease-in-out;
}
input:checked ~ .dot {
  transform: translateX(100%);
}
</style>