import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
  }),

  getters: {
    isAuthenticated: state => !!state.token,
    isAdmin: state => {
      if (!state.token) return false
      try {
        const decodedToken = jwtDecode(state.token)
        return decodedToken.role_id === 1
      } catch (error) {
        console.error('Error decodificando el token:', error)
        return false
      }
    },
    username: state => {
      if (!state.token) return null
      try {
        const decodedToken = jwtDecode(state.token)
        return decodedToken.username
      } catch (error) {
        console.error('Error decodificando el token:', error)
        return null
      }
    },
    userEmail: state => {
      if (!state.token) return null
      try {
        const decodedToken = jwtDecode(state.token)
        return decodedToken.email // Extrae el email del token
      } catch (error) {
        return null
      }
    },
    memberSince: state => {
      if (!state.token) return null
      try {
        const decodedToken = jwtDecode(state.token)
        // Retornamos la fecha formateada (ej. "enero de 2024")
        const date = new Date(decodedToken.createdAt)
        return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })
      } catch (error) {
        return 'N/A'
      }
    },
    // --- NUEVO GETTER AÑADIDO PARA WEBSOCKETS ---
    userId: state => {
      if (!state.token) return null
      try {
        const decodedToken = jwtDecode(state.token)
        return decodedToken.id // Asumiendo que el payload de tu JWT guarda el ID como 'id'
      } catch (error) {
        console.error('Error decodificando el token:', error)
        return null
      }
    },
  },

  actions: {
    async login(email, password) {
      try {
        const { data } = await apiClient.post('/auth/signin', { email, password })
        this.token = data.token
        localStorage.setItem('token', data.token)
        apiClient.defaults.headers.common['x-access-token'] = data.token
      } catch (error) {
        localStorage.removeItem('token')
        this.token = null
        throw error
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
