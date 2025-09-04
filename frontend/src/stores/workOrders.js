import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import { useNotificationStore } from './notifications'

export const useWorkOrdersStore = defineStore('workOrders', {
  state: () => ({
    workOrders: [],
    myWorkOrders: [],
    currentOrder: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchWorkOrders() {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await apiClient.get('/workorders')
        this.workOrders = data
      } catch (error) {
        this.error = 'No se pudieron cargar las órdenes de trabajo.'
        console.error('Error al obtener órdenes de trabajo:', error)
      } finally {
        this.isLoading = false
      }
    },

    async addWorkOrder(orderData) {
      const notifications = useNotificationStore()
      try {
        await apiClient.post('/workorders', orderData)
        notifications.showSuccess('¡Orden de trabajo creada exitosamente!')
        await this.fetchWorkOrders() // Recargar la lista
      } catch (error) {
        notifications.showError(error.response?.data?.message || 'No se pudo crear la orden.')
      }
    },

    async updateWorkOrder(orderId, orderData) {
      const notifications = useNotificationStore()
      try {
        await apiClient.put(`/workorders/${orderId}`, orderData)
        notifications.showSuccess('¡Orden de trabajo actualizada!')
        await this.fetchWorkOrders()
      } catch (error) {
        notifications.showError(error.response?.data?.message || 'No se pudo actualizar la orden.')
      }
    },

    async deleteWorkOrder(orderId) {
      const notifications = useNotificationStore()
      try {
        await apiClient.delete(`/workorders/${orderId}`)
        notifications.showSuccess('Orden de trabajo eliminada.')
        await this.fetchWorkOrders() // Recargar la lista
      } catch (error) {
        notifications.showError('No se pudo eliminar la orden.')
      }
    },

    async fetchWorkOrderById(orderId) {
      this.isLoading = true
      this.currentOrder = null
      this.error = null
      try {
        const { data } = await apiClient.get(`/workorders/${orderId}`)
        this.currentOrder = data
      } catch (error) {
        this.error = 'No se pudo cargar la orden de trabajo.'
        console.error('Error al obtener la orden:', error)
      } finally {
        this.isLoading = false
      }
    },

    // --- ACCIONES PARA EL USUARIO ---
    async fetchMyWorkOrders() {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await apiClient.get('/workorders/myorders');
        this.myWorkOrders = data;
      } catch (error) {
        this.error = 'No se pudieron cargar tus órdenes de trabajo.';
      } finally {
        this.isLoading = false;
      }
    },

    async updateWorkOrderStatus(orderId, status) {
      const notifications = useNotificationStore(); // Asumiendo que tienes este store
      try {
        await apiClient.patch(`/workorders/${orderId}/status`, { status });
        
        const order = this.myWorkOrders.find((o) => o.id === orderId);
        if (order) {
          order.status = status;
        }
        notifications.showSuccess('¡Estado de la orden actualizado!');
      } catch (error) {
        notifications.showError('No se pudo actualizar el estado.');
      }
    },
  },
})
