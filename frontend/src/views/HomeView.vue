<script setup>
  import { useAuthStore } from '../stores/auth'
  import AdminDashboard from '../components/AdminDashboard.vue'
  import UserDashboard from '../components/UserDashboard.vue'

  const authStore = useAuthStore()
</script>

<template>
  <div class="container mx-auto px-4 py-6" v-if="authStore.isAuthenticated">
    <!-- Dashboards Específicos por Rol -->
    <AdminDashboard v-if="authStore.isAdmin" />
    <UserDashboard v-else />
  </div>
</template>

<style scoped></style>
