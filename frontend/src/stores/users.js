import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import { useNotificationStore } from './toast'

export const useUsersStore = defineStore('users', {
  state: () => ({
    // El estado es un array simple. La DataTable se encarga del resto.
    users: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    // ÚNICA FUNCIÓN PARA OBTENER LOS USUARIOS PARA LA DATATABLE
    async fetchUsers() {
      this.isLoading = true
      this.error = null
      try {
        // Pedimos todos los usuarios con un límite alto
        const response = await apiClient.get('/users?limit=10000')
        // Guardamos directamente el array que viene en 'data'
        this.users = response.data.data
      } catch (error) {
        this.error = 'No se pudieron cargar los usuarios.'
        console.error('Error al obtener usuarios:', error)
      } finally {
        this.isLoading = false
      }
    },

    // LAS ACCIONES CRUD AHORA RECARGAN LA LISTA PARA MANTENER LA CONSISTENCIA
    async addUser(userData) {
      const notifications = useNotificationStore()
      try {
        await apiClient.post('/users', userData)
        notifications.showSuccess('¡Usuario agregado exitosamente!')
        await this.fetchUsers() // Recarga la lista completa
      } catch (error) {
        notifications.showError(error.response?.data?.message || 'No se pudo agregar el usuario.')
      }
    },

    async updateUser(userId, userData) {
      const notifications = useNotificationStore()
      try {
        await apiClient.put(`/users/${userId}`, userData)
        notifications.showSuccess('¡Usuario actualizado correctamente!')
        await this.fetchUsers() // Recarga la lista completa
      } catch (error) {
        notifications.showError(error.response?.data?.message || 'No se pudo actualizar el usuario.')
      }
    },

    async deleteUser(userId) {
      const notifications = useNotificationStore()
      try {
        await apiClient.delete(`/users/${userId}`)
        notifications.showSuccess('Usuario eliminado.')
        await this.fetchUsers() // Recarga la lista completa
      } catch (error) {
        notifications.showError('No se pudo eliminar el usuario.')
      }
    },

    async changePassword(passwordData) {
      const notifications = useNotificationStore()
      try {
        await apiClient.post('/users/change-password', passwordData)
        notifications.showSuccess('¡Contraseña actualizada correctamente!')
      } catch (error) {
        // El error ya lo maneja el interceptor, pero puedes dejar el log si quieres
        console.error('Error al cambiar la contraseña:', error)
      }
    },
  },
})
