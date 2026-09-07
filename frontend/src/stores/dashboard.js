import { defineStore } from 'pinia'
import apiClient from '../api/axios'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: {
      totalProducts: 0,
      lowStockProducts: 0,
      inventoryValue: 0,
      totalUsers: 0,
      activeWorkOrders: 0,
    },
    isLoading: true,
    error: null,
  }),

  actions: {
    // Agregamos el parámetro isSilent por defecto en false
    async fetchStats(isSilent = false) {
      // Solo encendemos el loading (y los esqueletos) si NO es silencioso
      if (!isSilent) {
        this.isLoading = true
      }
      this.error = null

      try {
        const { data } = await apiClient.get('/dashboard')
        this.stats = data
      } catch (error) {
        this.error = 'Error al cargar los datos del dashboard'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    }
  }
})
