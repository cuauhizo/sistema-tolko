import { defineStore } from 'pinia'
import apiClient from '../api/axios'

export const useUserDashboardStore = defineStore('userDashboard', {
  state: () => ({
    stats: {
      activeTasks: 0,
      activeWorkOrders: 0,
    },
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchUserStats() {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await apiClient.get('/user-dashboard')
        this.stats = data
      } catch (error) {
        this.error = 'No se pudieron cargar tus estadísticas.'
      } finally {
        this.isLoading = false
      }
    },
  },
})
