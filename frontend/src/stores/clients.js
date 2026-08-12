import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import { useToastStore } from './toast'

export const useClientsStore = defineStore('clients', {
  state: () => ({
    clients: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchClients() {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await apiClient.get('/clients')
        this.clients = data
      } catch (error) {
        this.error = 'No se pudieron cargar los clientes.'
        console.error('Error al obtener clientes:', error)
      } finally {
        this.isLoading = false
      }
    },

    async addClient(clientData) {
      const notifications = useToastStore()
      try {
        await apiClient.post('/clients', clientData)
        notifications.showSuccess('¡Cliente agregado exitosamente!')
        await this.fetchClients()
      } catch (error) {
        notifications.showError(error.response?.data?.message || 'No se pudo agregar el cliente.')
        throw error
      }
    },

    async updateClient(clientId, clientData) {
      const notifications = useToastStore()
      try {
        await apiClient.put(`/clients/${clientId}`, clientData)
        notifications.showSuccess('¡Cliente actualizado correctamente!')
        await this.fetchClients()
      } catch (error) {
        notifications.showError(error.response?.data?.message || 'No se pudo actualizar el cliente.')
        throw error
      }
    },

    async deleteClient(clientId) {
      const notifications = useToastStore()
      try {
        await apiClient.delete(`/clients/${clientId}`)
        notifications.showSuccess('Cliente eliminado del sistema.')
        await this.fetchClients()
      } catch (error) {
        notifications.showError('No se pudo eliminar el cliente.')
        throw error
      }
    },
  },
})
