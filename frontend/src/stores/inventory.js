import { defineStore } from 'pinia'
import apiClient from '../api/axios' // Tu instancia configurada
import { useToastStore } from './toast' // Tu gestor de notificaciones

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    movements: [],
    isLoading: false, // Manteniendo tu nomenclatura original
    error: null,
  }),
  actions: {
    async fetchMovements() {
      this.isLoading = true
      this.error = null
      try {
        // Asegúrate de que esta ruta coincida con la que definiste en backend/routes/inventory.routes.js
        const { data } = await apiClient.get('/inventory/movements')
        this.movements = data
      } catch (error) {
        this.error = 'No se pudo cargar el historial de movimientos.'
        console.error('Error al obtener movimientos:', error)
      } finally {
        this.isLoading = false
      }
    },

    // Renombramos conceptualmente (o puedes dejar makeAdjustment) para abarcar Entradas, Salidas y Mermas
    async registerMovement(movementData) {
      const notifications = useToastStore()
      this.isLoading = true
      try {
        // Apuntamos al endpoint que conectamos al controlador con transacciones
        await apiClient.post('/inventory/movements', movementData)

        notifications.showSuccess('¡Movimiento de inventario registrado con éxito!')

        // RECARGAMOS el Kardex automáticamente para reflejar el nuevo registro
        await this.fetchMovements()
      } catch (error) {
        // El error ya es manejado por el interceptor de Axios
        notifications.showError('Fallo al registrar el movimiento. Verifica los datos.')
        console.error('Fallo al realizar el movimiento:', error)
        throw error // Lanzamos el error para que el componente (AdjustmentsView) detenga el spinner de carga
      } finally {
        this.isLoading = false
      }
    },
  },
})
