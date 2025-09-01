import { defineStore } from 'pinia'
import apiClient from '../api/axios'

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    movements: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchMovements() {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await apiClient.get('/inventory/movements')
        this.movements = data
      } catch (error) {
        this.error = 'No se pudo cargar el historial de movimientos.'
        console.error('Error al obtener movimientos:', error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
