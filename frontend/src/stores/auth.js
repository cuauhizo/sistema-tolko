import { defineStore } from 'pinia';
import apiClient from '../api/axios'; // Crearemos este archivo a continuación

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null // Podrías guardar aquí info del usuario si la API la devuelve
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(email, password) {
      try {
        const { data } = await apiClient.post('/auth/signin', { email, password });
        this.token = data.token;
        localStorage.setItem('token', data.token);
        // Para que el token se use en futuras peticiones
        apiClient.defaults.headers.common['x-access-token'] = data.token;
      } catch (error) {
        // Limpiar en caso de error
        localStorage.removeItem('token');
        this.token = null;
        throw error; // Lanzamos el error para que el componente lo capture
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common['x-access-token'];
    }
  },
});