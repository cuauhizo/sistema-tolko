import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import { useNotificationStore } from './notifications'

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
        const { data } = await apiClient.get('/products')
        this.products = data
      } catch (error) {
        this.error = 'No se pudieron cargar los productos.'
        console.error('Error fetching products:', error)
      } finally {
        this.isLoading = false
      }
    },

    // añadirProducto
    async addProduct(productData) {
      const notifications = useNotificationStore()
      this.isLoading = true
      this.error = null
      try {
        const { data } = await apiClient.post('/products', productData)
        // Agregamos el nuevo producto a la lista existente sin tener que recargar todo
        this.products.push(data)
        notifications.showSuccess('¡Producto agregado exitosamente!')
      } catch (error) {
        notifications.showError('No se pudo agregar el producto.')
        this.error = 'No se pudo agregar el producto.'
        console.error('Error adding product:', error)
        throw error // Lanzamos el error para que la vista pueda manejarlo
      } finally {
        this.isLoading = false
      }
    },

    // actualizarProducto
    async updateProduct(productId, productData) {
      const notifications = useNotificationStore()
      this.isLoading = true
      this.error = null
      try {
        const { data } = await apiClient.put(`/products/${productId}`, productData)

        // Buscamos el índice del producto actualizado en nuestro array
        const index = this.products.findIndex((p) => p.id === productId)
        if (index !== -1) {
          // Reemplazamos el objeto antiguo con el nuevo para actualizar la UI
          this.products[index] = data
        }
        notifications.showSuccess('¡Producto actualizado correctamente!')
      } catch (error) {
        notifications.showError('No se pudo actualizar el producto.')
        this.error = 'No se pudo actualizar el producto.'
        console.error('Error al actualizar producto:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // eliminarProducto
    async deleteProduct(productId) {
      const notifications = useNotificationStore()
      this.error = null
      try {
        await apiClient.delete(`/products/${productId}`)
        // Filtramos la lista para remover el producto eliminado, actualizando la UI al instante
        this.products = this.products.filter((p) => p.id !== productId)
        notifications.showSuccess('Producto eliminado.')
      } catch (error) {
        notifications.showError('No se pudo eliminar el producto.')
        this.error = 'No se pudo eliminar el producto.'
        console.error('Error al eliminar producto:', error)
        throw error
      }
    },
  },
})
