import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/toast'

const apiClient = axios.create({
  // baseURL: 'http://localhost:4000/api',
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Añadimos el token a las peticiones si ya existe en el localStorage
const token = localStorage.getItem('token')
if (token) {
  apiClient.defaults.headers.common['x-access-token'] = token
}

// --- INTERCEPTOR DE RESPUESTAS MEJORADO ---
apiClient.interceptors.response.use(
  response => response, // Si la respuesta es exitosa, la dejamos pasar
  error => {
    // Si la respuesta es un error, lo manejamos aquí
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()

    // Verificamos si el error es un 401 (No autorizado)
    if (error.response && error.response.status === 401) {
      // Si es 401, significa que el token es inválido o expiró
      notificationStore.showError('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.')

      // Llamamos a la acción de logout del store
      authStore.logout()

      // Redirigimos al login
      window.location.href = '/login'
    } else {
      // Para cualquier otro error (500, 404, etc.), mostramos un mensaje genérico
      const message = error.response?.data?.message || 'Ocurrió un error en el servidor.'
      notificationStore.showError(message)
    }

    return Promise.reject(error)
  },
)

export default apiClient
