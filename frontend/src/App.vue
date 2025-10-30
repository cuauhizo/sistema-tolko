<script setup>
import { watch, ref } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import { useAuthStore } from './stores/auth'
import { useNotificationStore } from './stores/notifications'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const pollingIntervalId = ref(null)

watch(() => authStore.isAuthenticated, (isAuth) => {

  if (isAuth) {
    // Si el usuario INICIÓ SESIÓN:
    notificationStore.fetchUnreadNotifications();

    // Inicia el polling para buscar cada 60 segundos
    pollingIntervalId.value = setInterval(() => {
      notificationStore.fetchUnreadNotifications();
    }, 60000); // 60000ms = 1 minuto (el tiempo que tenías)

  } else {
    // Si el usuario CERRÓ SESIÓN:
    if (pollingIntervalId.value) {
      clearInterval(pollingIntervalId.value);
      pollingIntervalId.value = null;
    }
  }
}, {
  immediate: true // Esto hace que el 'watch' se ejecute una vez al cargar la app
});
</script>

<template>
  <Navbar v-if="authStore.isAuthenticated" />

  <main>
    <RouterView />
  </main>
  <Toast />
</template>

<style>
/* Puedes agregar estilos globales aquí si lo deseas */
body {
  background-color: #f8f9fa;
}
</style>
