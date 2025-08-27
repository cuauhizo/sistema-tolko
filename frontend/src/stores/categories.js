import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import { useNotificationStore } from './notifications'

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchCategories() {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await apiClient.get('/categories')
        this.categories = data
      } catch (error) {
        const notifications = useNotificationStore()
        this.error = 'No se pudieron cargar las categorías.'
        notifications.showError(this.error)
        console.error('Error al obtener categorías:', error)
      } finally {
        this.isLoading = false
      }
    },

    async addCategory(categoryData) {
      const notifications = useNotificationStore()
      try {
        const { data } = await apiClient.post('/categories', categoryData)
        this.categories.push(data)
        this.categories.sort((a, b) => a.name.localeCompare(b.name)) // Mantiene la lista ordenada
        notifications.showSuccess('¡Categoría creada exitosamente!')
      } catch (error) {
        notifications.showError(error.response?.data?.message || 'No se pudo crear la categoría.')
        throw error
      }
    },

    async updateCategory(categoryId, categoryData) {
      const notifications = useNotificationStore()
      try {
        const { data } = await apiClient.put(`/categories/${categoryId}`, categoryData)
        const index = this.categories.findIndex((c) => c.id === categoryId)
        if (index !== -1) {
          this.categories[index] = data
        }
        notifications.showSuccess('¡Categoría actualizada correctamente!')
      } catch (error) {
        notifications.showError(
          error.response?.data?.message || 'No se pudo actualizar la categoría.',
        )
        throw error
      }
    },

    async deleteCategory(categoryId) {
      const notifications = useNotificationStore()
      try {
        await apiClient.delete(`/categories/${categoryId}`)
        // Filtramos la categoría eliminada de nuestra lista local para actualizar la UI
        this.categories = this.categories.filter((c) => c.id !== categoryId)
        notifications.showSuccess('Categoría eliminada correctamente.')
      } catch (error) {
        notifications.showError(
          error.response?.data?.message || 'No se pudo eliminar la categoría.',
        )
        throw error
      }
    },
  },
})
