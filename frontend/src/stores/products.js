import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import { useNotificationStore } from './toast'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    // obtenerProductos
    async fetchProducts() {
      this.isLoading = true
      this.error = null
      try {
        // Pedimos todos los productos con un límite alto
        const response = await apiClient.get('/products?limit=10000')
        // Guardamos directamente el array de datos
        this.products = response.data.data
      } catch (error) {
        this.error = 'No se pudieron cargar los productos.'
        console.error('Error al obtener productos:', error)
      } finally {
        this.isLoading = false
      }
    },

    // añadirProducto
    async addProduct(productData) {
      const notifications = useNotificationStore()
      try {
        await apiClient.post('/products', productData)
        notifications.showSuccess('¡Producto agregado exitosamente!')
        await this.fetchProducts() // Recarga la lista
      } catch (error) {
        notifications.showError('No se pudo agregar el producto.')
      }
    },

    // actualizarProducto
    async updateProduct(productId, productData) {
      const notifications = useNotificationStore()
      try {
        await apiClient.put(`/products/${productId}`, productData)
        notifications.showSuccess('¡Producto actualizado correctamente!')
        await this.fetchProducts() // Recarga la lista
      } catch (error) {
        notifications.showError('No se pudo actualizar el producto.')
      }
    },

    // eliminarProducto
    async deleteProduct(productId) {
      const notifications = useNotificationStore()
      try {
        await apiClient.delete(`/products/${productId}`)
        notifications.showSuccess('Producto eliminado.')
        await this.fetchProducts() // Recarga la lista
      } catch (error) {
        notifications.showError('No se pudo eliminar el producto.')
      }
    },
  },
})
