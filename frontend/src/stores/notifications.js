import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useNotificationStore = defineStore('notification', {
  actions: {
    showSuccess(message) {
      toast.success(message)
    },
    showError(message) {
      toast.error(message || 'Ocurrió un error inesperado.')
    },
    showInfo(message) {
      toast.info(message)
    },
  },
})
