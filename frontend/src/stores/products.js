import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import { useToastStore } from './toast'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    lowStockProducts: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    // obtener productos con bajo stock
    async fetchLowStockProducts() {
      try {
        const response = await apiClient.get('/products/low-stock')
        this.lowStockProducts = response.data
      } catch (error) {
        console.error('Error al obtener alertas de stock:', error)
      }
    },

    // obtenerProductos original
    async fetchProducts() {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiClient.get('/products?limit=10000')
        this.products = response.data
      } catch (error) {
        this.error = 'No se pudieron cargar los productos.'
        console.error('Error al obtener productos:', error)
      } finally {
        this.isLoading = false
      }
    },

    async addProduct(productData) {
      const notifications = useToastStore()
      try {
        await apiClient.post('/products', productData)
        notifications.showSuccess('¡Producto agregado exitosamente!')
        await this.fetchProducts()
      } catch (error) {
        notifications.showError('No se pudo agregar el producto.')
      }
    },

    async updateProduct(productId, productData) {
      const notifications = useToastStore()
      try {
        await apiClient.put(`/products/${productId}`, productData)
        notifications.showSuccess('¡Producto actualizado correctamente!')
        await this.fetchProducts()
      } catch (error) {
        notifications.showError('No se pudo actualizar el producto.')
      }
    },

    async deleteProduct(productId) {
      const notifications = useToastStore()
      try {
        await apiClient.delete(`/products/${productId}`)
        notifications.showSuccess('Producto eliminado.')
        await this.fetchProducts()
      } catch (error) {
        notifications.showError('No se pudo eliminar el producto.')
      }
    },
  },
})
