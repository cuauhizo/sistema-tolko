<script setup>
  import { useAuthStore } from '../stores/auth'
  import AdminDashboard from '../components/AdminDashboard.vue'
  import UserDashboard from '../components/UserDashboard.vue'

  const authStore = useAuthStore()
</script>

<template>
  <div class="container mx-auto px-4 py-6" v-if="authStore.isAuthenticated">
    <!-- Dashboard Director / Administrador (Tiene el permiso más alto) -->
    <AdminDashboard v-if="authStore.hasPermission('view_admin_dash')" />

    <!-- Dashboard Coordinador (Reutilizamos el de Admin, pero adentro le ocultaremos cosas) -->
    <AdminDashboard v-else-if="authStore.hasPermission('view_coord_dash')" />

    <!-- Dashboard Operativo (Por defecto para quien no tiene permisos gerenciales) -->
    <UserDashboard v-else />
  </div>
</template>
