import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
    isLoading: false,
  }),

  getters: {
    isAuthenticated: state => !!state.token,

    // Mantenemos isAdmin para compatibilidad de algunas vistas
    isAdmin: state => {
      if (!state.token) return false
      try {
        const decodedToken = jwtDecode(state.token)
        return ['superadmin', 'administracion'].includes(decodedToken.role)
      } catch (error) {
        return false
      }
    },

    userRole: state => {
      if (!state.token) return null
      try {
        const decodedToken = jwtDecode(state.token)
        return decodedToken.role
      } catch (error) {
        return null
      }
    },

    // Extrae el arreglo de permisos del token
    userPermissions: state => {
      if (!state.token) return []
      try {
        const decodedToken = jwtDecode(state.token)
        return decodedToken.permissions || []
      } catch (error) {
        return []
      }
    },

    // Función dinámica para verificar permisos específicos
    hasPermission: state => {
      return requiredPermission => {
        if (!state.token) return false
        try {
          const decodedToken = jwtDecode(state.token)
          // El superadmin tiene acceso a todo automáticamente
          if (decodedToken.role === 'superadmin') return true

          const permissions = decodedToken.permissions || []
          return permissions.includes(requiredPermission)
        } catch (error) {
          return false
        }
      }
    },

    // Mantenemos el hasRole anterior por si lo sigues usando en alguna vista
    hasRole: state => {
      return rolesPermitidos => {
        if (!state.token) return false
        try {
          const decodedToken = jwtDecode(state.token)
          return rolesPermitidos.includes(decodedToken.role)
        } catch (error) {
          return false
        }
      }
    },

    username: state => {
      if (!state.token) return null
      try {
        const decodedToken = jwtDecode(state.token)
        return decodedToken.username
      } catch (error) {
        return null
      }
    },
    userEmail: state => {
      if (!state.token) return null
      try {
        const decodedToken = jwtDecode(state.token)
        return decodedToken.email
      } catch (error) {
        return null
      }
    },
    memberSince: state => {
      if (!state.token) return null
      try {
        const decodedToken = jwtDecode(state.token)
        const date = new Date(decodedToken.createdAt)
        return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })
      } catch (error) {
        return 'N/A'
      }
    },
    userId: state => {
      if (!state.token) return null
      try {
        const decodedToken = jwtDecode(state.token)
        return decodedToken.id
      } catch (error) {
        return null
      }
    },
  },
  actions: {
    async login(email, password) {
      this.isLoading = true
      try {
        const { data } = await apiClient.post('/auth/signin', { email, password })
        this.token = data.token
        localStorage.setItem('token', data.token)
        apiClient.defaults.headers.common['x-access-token'] = data.token
      } catch (error) {
        localStorage.removeItem('token')
        this.token = null
        throw error
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      delete apiClient.defaults.headers.common['x-access-token']
    },
  },
})
