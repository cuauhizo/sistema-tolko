<script setup>
import { useAuthStore } from '../stores/auth'
import AdminDashboard from '../components/AdminDashboard.vue' // <-- Renombraremos el contenido
import UserDashboard from '../components/UserDashboard.vue' // <-- El nuevo componente

const authStore = useAuthStore()
</script>

<template>
  <div class="container mx-auto" v-if="authStore.isAuthenticated">
    <!-- <h1 class="mb-4">Dashboard</h1>
    <h4 class="text-muted mb-4">Bienvenido, {{ authStore.username }}</h4> -->

    <AdminDashboard v-if="authStore.isAdmin" />
    <UserDashboard v-else />
  </div>
</template>

<style scoped></style>
