import { defineStore } from 'pinia'

// Variable global para guardar la instancia del Toast de PrimeVue
let globalToast = null

// Función que usaremos para inyectar el Toast desde App.vue
export const setGlobalToast = toastInstance => {
  globalToast = toastInstance
}

export const useToastStore = defineStore('notification', {
  actions: {
    showSuccess(message) {
      if (globalToast) {
        globalToast.add({ severity: 'success', summary: 'Éxito', detail: message, life: 3000 })
      }
    },
    showError(message) {
      if (globalToast) {
        globalToast.add({ severity: 'error', summary: 'Error', detail: message || 'Ocurrió un error inesperado.', life: 5000 })
      }
    },
    showInfo(message) {
      if (globalToast) {
        globalToast.add({ severity: 'info', summary: 'Aviso', detail: message, life: 3000 })
      }
    },
  },
})
