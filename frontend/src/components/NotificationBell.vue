<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '../stores/notifications'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const notificationStore = useNotificationStore()
const { notifications, unreadCount } = storeToRefs(notificationStore)
const router = useRouter()

// Variables para controlar el menú desplegable
const isOpen = ref(false)
const bellRef = ref(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

// Cierra el menú si el usuario hace clic afuera de la campanita
const closeDropdown = (e) => {
  if (bellRef.value && !bellRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

const handleNotificationClick = async notification => {
  // Marca la notificación como leída.
  await notificationStore.markAsRead(notification.id)
  
  // Cerramos el menú al hacer clic
  isOpen.value = false 
  
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
  <li class="relative flex items-center mr-2" ref="bellRef">
    <button 
      @click.prevent="toggleDropdown" 
      class="relative p-2 text-white hover:text-blue-200 focus:outline-none transition-colors rounded-md hover:bg-blue-500"
    >
      <i class="pi pi-bell text-xl"></i>
      
      <span v-if="unreadCount > 0"
        class="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-blue-600">
        {{ unreadCount }}
      </span>
    </button>

    <div v-show="isOpen"
      class="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-md shadow-xl py-1 z-50 ring-1 ring-black ring-opacity-5">
      
      <div v-if="notifications.length === 0" class="px-4 py-4 text-sm text-gray-500 text-center">
        No tienes notificaciones nuevas.
      </div>
      
      <a v-for="notification in notifications" :key="notification.id"
        href="#" 
        @click.prevent="handleNotificationClick(notification)"
        class="block px-4 py-3 text-sm border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors cursor-pointer whitespace-normal">
        
        <div class="flex flex-col" :class="{ 'font-bold text-gray-900': !notification.is_read, 'text-gray-600': notification.is_read }">
          <span>{{ notification.message }}</span>
          <span class="text-xs text-gray-400 mt-1 font-normal">
            <i class="pi pi-clock text-[10px] mr-1"></i>
            {{ formatDate(notification.created_at) }}
          </span>
        </div>
      </a>
    </div>
  </li>
</template>