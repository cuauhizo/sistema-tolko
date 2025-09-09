import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import { useNotificationStore } from './toast'

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
    async makeAdjustment(adjustmentData) {
      const notifications = useNotificationStore();
      this.isLoading = true;
      try {
        await apiClient.post('/inventory/adjustments', adjustmentData);
        notifications.showSuccess('¡Ajuste de inventario realizado con éxito!');
      } catch (error) {
        // El error ya es manejado por el interceptor de Axios, pero puedes añadir lógica extra si quieres
        console.error('Fallo al realizar el ajuste:', error);
      } finally {
        this.isLoading = false;
      }
    },
  },
})
