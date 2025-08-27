<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
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
