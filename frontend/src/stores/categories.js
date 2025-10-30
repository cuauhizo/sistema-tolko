import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import { useToastStore } from './toast'

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    // El estado es un array simple. La DataTable u otros componentes se encargarán de la presentación.
    categories: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    // obtenerCategorias
    async fetchCategories() {
      this.isLoading = true
      this.error = null
      try {
        // Pedimos todas las categorías con un límite alto
        const response = await apiClient.get('/categories?limit=1000')
        // Guardamos directamente el array que viene en el campo 'data' de la respuesta
        this.categories = response.data.data
      } catch (error) {
        this.error = 'No se pudieron cargar las categorías.'
        console.error('Error al obtener categorías:', error)
      } finally {
        this.isLoading = false
      }
    },

    // añadirCategoria
    async addCategory(categoryData) {
      const notifications = useToastStore()
      try {
        await apiClient.post('/categories', categoryData)
        notifications.showSuccess('¡Categoría creada exitosamente!')
        await this.fetchCategories() // Recarga la lista completa
      } catch (error) {
        notifications.showError(error.response?.data?.message || 'No se pudo crear la categoría.')
      }
    },

    // actualizarCategoria
    async updateCategory(categoryId, categoryData) {
      const notifications = useToastStore()
      try {
        await apiClient.put(`/categories/${categoryId}`, categoryData)
        notifications.showSuccess('¡Categoría actualizada correctamente!')
        await this.fetchCategories() // Recarga la lista completa
      } catch (error) {
        notifications.showError(error.response?.data?.message || 'No se pudo actualizar la categoría.')
      }
    },

    // eliminarCategoria
    async deleteCategory(categoryId) {
      const notifications = useToastStore()
      try {
        await apiClient.delete(`/categories/${categoryId}`)
        notifications.showSuccess('Categoría eliminada.')
        await this.fetchCategories() // Recarga la lista completa
      } catch (error) {
        notifications.showError('No se pudo eliminar la categoría.')
      }
    },
  },
})
