<script setup>
  import { onMounted } from 'vue'
  import { useNotificationStore } from '../stores/notifications'
  import { storeToRefs } from 'pinia'
  import { useRouter } from 'vue-router'

  const notificationStore = useNotificationStore()
  const { notifications, unreadCount } = storeToRefs(notificationStore)
  const router = useRouter()

  onMounted(() => {
    // Carga las notificaciones cuando el componente se monta.
    notificationStore.fetchUnreadNotifications()
    // Opcional: Refrescar las notificaciones cada cierto tiempo.
    setInterval(() => notificationStore.fetchUnreadNotifications(), 60000) // Cada minuto
  })

  const handleNotificationClick = async notification => {
    // Marca la notificación como leída.
    await notificationStore.markAsRead(notification.id)
    // Redirige al usuario al enlace de la notificación si existe.
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const formatDate = dateString => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('es-MX', options)
  }
</script>

<template>
  <li class="nav-item me-2 dropdown">
    <a class="nav-link py-0 pt-1" href="#" id="notificationDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
      <i class="pi pi-bell" style="width: 16px; height: 16px"></i>
      <span v-if="unreadCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        {{ unreadCount }}
        <span class="visually-hidden">notificaciones sin leer</span>
      </span>
    </a>
    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown" style="width: 350px; max-height: 400px; overflow-y: auto">
      <li v-if="notifications.length === 0">
        <span class="dropdown-item text-muted">No tienes notificaciones nuevas.</span>
      </li>
      <li v-for="notification in notifications" :key="notification.id">
        <a class="dropdown-item" href="#" @click.prevent="handleNotificationClick(notification)">
          <div class="d-flex flex-column p-1" :class="{ 'fw-bold': !notification.is_read }">
            <span>{{ notification.message }}</span>
            <small class="text-muted mt-1">{{ formatDate(notification.created_at) }}</small>
          </div>
        </a>
      </li>
    </ul>
  </li>
</template>

<style scoped>
  .dropdown-item {
    white-space: normal; /* Permite que el texto de la notificación ocupe varias líneas */
    cursor: pointer;
  }
  .dropdown-item:hover {
    background-color: #f8f9fa;
  }
</style>
