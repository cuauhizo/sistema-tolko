import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import { useToastStore } from './toast'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    myTasks: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    // Para la vista del Admin: trae todas las tareas de todos los usuarios
    async fetchTasks() {
      this.isLoading = true
      this.error = null
      try {
        // const { data } = await apiClient.get('/tasks')
        // this.tasks = data
        const response = await apiClient.get('/tasks?limit=10000')
        this.tasks = response.data.data
      } catch (error) {
        this.error = 'No se pudieron cargar las tareas.'
        comsole.error('Error al obtener tareas:', error)
        useToastStore().showError(this.error)
      } finally {
        this.isLoading = false
      }
    },

    // Para el Admin: crea y asigna una nueva tarea
    async addTask(taskData) {
      const notifications = useToastStore()
      try {
        await apiClient.post('/tasks', taskData)
        notifications.showSuccess('¡Tarea asignada correctamente!')
        await this.fetchTasks() // Recarga la lista para ver la nueva tarea
      } catch (error) {
        notifications.showError(error.response?.data?.message || 'No se pudo asignar la tarea.')
      }
    },

    // Para el Admin: actualiza una tarea existente
    async updateTask(taskId, taskData) {
      const notifications = useToastStore()
      try {
        await apiClient.put(`/tasks/${taskId}`, taskData)
        notifications.showSuccess('¡Tarea actualizada correctamente!')
        await this.fetchTasks() // Recarga la lista para ver los cambios
      } catch (error) {
        notifications.showError(error.response?.data?.message || 'No se pudo actualizar la tarea.')
      }
    },

    // Para el Admin: elimina una tarea
    async deleteTask(taskId) {
      const notifications = useToastStore()
      try {
        await apiClient.delete(`/tasks/${taskId}`)
        notifications.showSuccess('Tarea eliminada.')
        // Filtra la tarea eliminada de la lista local para una actualización instantánea
        // this.tasks = this.tasks.filter((t) => t.id !== taskId)
        this.fetchTasks()
      } catch (error) {
        notifications.showError('No se pudo eliminar la tarea.')
      }
    },

    // Para la vista del Usuario: trae solo las tareas del usuario logueado
    async fetchMyTasks(statusFilter = '') {
      // Acepta un filtro opcional
      this.isLoading = true
      this.error = null
      try {
        // Añade el filtro a la URL si existe
        const url = statusFilter ? `/tasks/mytasks?status=${statusFilter}` : '/tasks/mytasks'
        const { data } = await apiClient.get(url)
        this.myTasks = data
      } catch (error) {
        this.error = 'No se pudieron cargar tus tareas.'
        useToastStore().showError(this.error)
      } finally {
        this.isLoading = false
      }
    },

    // Para el Usuario: actualiza el estado de una tarea
    async updateTaskStatus(taskId, status) {
      const notifications = useToastStore()
      try {
        await apiClient.patch(`/tasks/${taskId}/status`, { status })
        notifications.showSuccess('¡Estado de la tarea actualizado!')
        // Actualiza la tarea localmente para una respuesta instantánea en la UI
        const task = this.myTasks.find(t => t.id === taskId)
        if (task) {
          task.status = status
        }
      } catch (error) {
        notifications.showError('No se pudo actualizar el estado de la tarea.')
      }
    },
  },
})
