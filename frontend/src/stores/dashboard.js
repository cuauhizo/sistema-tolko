import { defineStore } from 'pinia'
import apiClient from '../api/axios'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: {
      totalProducts: 0,
      lowStockProducts: 0,
      inventoryValue: 0,
      totalUsers: 0,
    },
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchStats() {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await apiClient.get('/dashboard')
        this.stats = data
      } catch (error) {
        this.error = 'No se pudieron cargar las estadísticas.'
        console.error('Error al obtener las estadísticas del dashboard:', error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
