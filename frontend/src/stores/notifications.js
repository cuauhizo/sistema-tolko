import { defineStore } from 'pinia'
import apiClient from '../api/axios'
// NUEVO: Importamos nuestro propio store de Toast en lugar de vue-toastification
import { useToastStore } from './toast'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    isLoading: false,
  }),

  getters: {
    // Un getter para saber rápidamente cuántas notificaciones no leídas hay.
    unreadCount: state => {
      return state.notifications.filter(n => !n.is_read).length
    },
  },

  actions: {
    // Acción para ir a buscar las notificaciones no leídas a la API.
    async fetchUnreadNotifications() {
      this.isLoading = true
      const toastStore = useToastStore() // <-- Lo instanciamos dentro de la acción

      try {
        const { data } = await apiClient.get('/notifications')
        this.notifications = data
      } catch (error) {
        console.error('Error al cargar las notificaciones:', error)
        toastStore.showError('No se pudieron cargar las notificaciones.') // <-- Usamos showError
      } finally {
        this.isLoading = false
      }
    },

    // Acción para marcar una notificación específica como leída.
    async markAsRead(notificationId) {
      const toastStore = useToastStore() // <-- Lo instanciamos dentro de la acción

      try {
        // Actualiza el estado localmente para una respuesta instantánea en la UI.
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification && !notification.is_read) {
          notification.is_read = true
          // Llama a la API para actualizar el estado en la base de datos en segundo plano.
          await apiClient.post(`/notifications/${notificationId}/read`)
        }
      } catch (error) {
        console.error('Error al marcar la notificación como leída:', error)
        toastStore.showError('Error al actualizar la notificación.') // <-- Usamos showError
      }
    },
  },
})
