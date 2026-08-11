import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import { useToastStore } from './toast'

export const useSuppliersStore = defineStore('suppliers', {
  state: () => ({
    suppliers: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchSuppliers() {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await apiClient.get('/suppliers')
        this.suppliers = data
      } catch (error) {
        this.error = 'No se pudieron cargar los proveedores.'
        console.error('Error al obtener proveedores:', error)
      } finally {
        this.isLoading = false
      }
    },

    async addSupplier(supplierData) {
      const notifications = useToastStore()
      try {
        await apiClient.post('/suppliers', supplierData)
        notifications.showSuccess('¡Proveedor agregado exitosamente!')
        await this.fetchSuppliers()
      } catch (error) {
        notifications.showError('No se pudo agregar el proveedor.')
        throw error
      }
    },

    async updateSupplier(supplierId, supplierData) {
      const notifications = useToastStore()
      try {
        await apiClient.put(`/suppliers/${supplierId}`, supplierData)
        notifications.showSuccess('¡Proveedor actualizado correctamente!')
        await this.fetchSuppliers()
      } catch (error) {
        notifications.showError('No se pudo actualizar el proveedor.')
        throw error
      }
    },

    async deleteSupplier(supplierId) {
      const notifications = useToastStore()
      try {
        await apiClient.delete(`/suppliers/${supplierId}`)
        notifications.showSuccess('Proveedor eliminado.')
        await this.fetchSuppliers()
      } catch (error) {
        notifications.showError('No se pudo eliminar el proveedor.')
        throw error
      }
    },
  },
})
