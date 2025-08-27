import { defineStore } from 'pinia'
import apiClient from '../api/axios' // Crearemos este archivo a continuación
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null, // Podrías guardar aquí info del usuario si la API la devuelve
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    // --- AÑADE ESTE GETTER ---
    isAdmin: (state) => {
      if (!state.token) return false
      try {
        const decodedToken = jwtDecode(state.token)
        // Asumiendo que guardas el rol en el token. Si no, necesitarías otra llamada a la API
        // Por ahora, asumiremos que el rol '1' es admin
        return decodedToken.role_id === 1
      } catch (error) {
        console.error('Error decodificando el token:', error)
        return false
      }
    },
    username: (state) => {
      if (!state.token) return null
      try {
        const decodedToken = jwtDecode(state.token)
        return decodedToken.username // Devuelve el username del token
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
        // Para que el token se use en futuras peticiones
        apiClient.defaults.headers.common['x-access-token'] = data.token
      } catch (error) {
        // Limpiar en caso de error
        localStorage.removeItem('token')
        this.token = null
        throw error // Lanzamos el error para que el componente lo capture
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
