<script setup>
  import { watch, onUnmounted } from 'vue'
  import { RouterView } from 'vue-router'
  import Navbar from './components/Navbar.vue'
  import Toast from 'primevue/toast'
  import { useToast } from 'primevue/usetoast'
  import { useAuthStore } from './stores/auth'
  import { useNotificationStore } from './stores/notifications'
  import { io } from 'socket.io-client'
  import { setGlobalToast } from './stores/toast'

  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()
  const toast = useToast()
  setGlobalToast(toast)

  // Variable para guardar la instancia del socket
  let socket = null

  watch(
    () => authStore.isAuthenticated,
    isAuth => {
      if (isAuth) {
        // 1. Cargamos las notificaciones iniciales (las que ocurrieron mientras estaba offline)
        notificationStore.fetchUnreadNotifications()

        // 2. Conectamos al servidor de WebSockets
        // Ajusta la URL si tu API corre en un puerto distinto a 4000
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
        socket = io(backendUrl)

        // 3. Nos registramos en el servidor una vez conectados
        socket.on('connect', () => {
          console.log('Conectado al servidor de WebSockets', socket.id)

          socket.emit('register', {
            id: authStore.userId,
            isAdmin: authStore.isAdmin,
          })
        })

        // 4. Escuchamos las notificaciones entrantes
        socket.on('new-notification', data => {
          console.log('¡Notificación en tiempo real!', data)

          // Mostramos un Toast en la esquina de la pantalla
          toast.add({
            severity: 'info',
            summary: 'Nueva Notificación',
            detail: data.message, // El mensaje que enviamos desde tasks.controller.js
            life: 5000, // Desaparece en 5 segundos
          })

          // Actualizamos la campanita silenciosamente
          notificationStore.fetchUnreadNotifications()
        })

        socket.on('disconnect', () => {
          console.log('Desconectado del servidor de WebSockets')
        })
      } else {
        // Si el usuario CERRÓ SESIÓN, matamos el túnel del websocket
        if (socket) {
          socket.disconnect()
          socket = null
        }
      }
    },
    {
      immediate: true,
    },
  )

  // Limpieza de seguridad si el componente raíz se destruye
  onUnmounted(() => {
    if (socket) {
      socket.disconnect()
    }
  })
</script>

<template>
  <Navbar v-if="authStore.isAuthenticated" />

  <main class="min-h-screen bg-gray-50">
    <RouterView />
  </main>

  <Toast />
</template>

<style>
  /* Si tenías estilos globales, los puedes mantener aquí */
</style>
