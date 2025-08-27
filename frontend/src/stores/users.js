import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import { useNotificationStore } from './notifications'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchUsers() {
      this.isLoading = true
      this.error = null
      try {
        // Hacemos la petición al endpoint protegido del backend
        const { data } = await apiClient.get('/users')
        this.users = data
      } catch (error) {
        this.error =
          'No se pudieron cargar los usuarios. Es posible que no tengas permisos de administrador.'
        console.error('Error al obtener usuarios:', error)
      } finally {
        this.isLoading = false
      }
    },

    // Aquí agregaremos las acciones para crear, actualizar y eliminar usuarios más adelante
    async addUser(userData) {
      const notifications = useNotificationStore()
      this.isLoading = true
      this.error = null
      try {
        const { data } = await apiClient.post('/users', userData)
        // Para obtener el nombre del rol, necesitamos hacer una pequeña trampa o ajustar el backend
        const newUser = { ...data, role: data.role_id === 1 ? 'admin' : 'user' }
        this.users.push(newUser)
        notifications.showSuccess('¡Usuario agregado exitosamente!')
      } catch (error) {
        notifications.showError('No se pudo agregar el usuario.')
        this.error = 'No se pudo agregar el usuario.'
        console.error('Error al agregar usuario:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateUser(userId, userData) {
      const notifications = useNotificationStore()
      this.error = null
      this.isLoading = true
      try {
        const { data } = await apiClient.put(`/users/${userId}`, userData)

        // Para obtener el nombre del rol actualizado, hacemos la misma conversión que al agregar
        const updatedUser = { ...data, role: data.role_id === 1 ? 'admin' : 'user' }

        const index = this.users.findIndex((u) => u.id === userId)
        if (index !== -1) {
          this.users[index] = updatedUser
        }
        notifications.showSuccess('¡Usuario actualizado correctamente!')
      } catch (error) {
        notifications.showError('No se pudo actualizar el usuario.')
        this.error = 'No se pudo actualizar el usuario.'
        console.error('Error al actualizar usuario:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteUser(userId) {
      const notifications = useNotificationStore()
      this.error = null
      try {
        await apiClient.delete(`/users/${userId}`)
        // Filtramos la lista para remover el usuario eliminado de la vista
        this.users = this.users.filter((u) => u.id !== userId)
        notifications.showSuccess('Usuario eliminado.')
      } catch (error) {
        notifications.showError('No se pudo eliminar el usuario.')
        this.error = 'No se pudo eliminar el usuario.'
        console.error('Error al eliminar usuario:', error)
        throw error
      }
    },
  },
})
