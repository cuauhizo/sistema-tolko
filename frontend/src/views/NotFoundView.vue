<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
    
    <div class="flex flex-col items-center justify-center w-full max-w-2xl text-center">
      
      <div class="lottie-animation w-full max-w-xs md:max-w-md mb-8 flex items-center justify-center">
        <div class="w-40 h-40 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
          <i class="pi pi-compass text-blue-500" style="font-size: 5rem;"></i>
        </div>
      </div>
      
      <div class="error-content">
        <h1 class="text-7xl md:text-9xl font-extrabold text-blue-600 mb-2 tracking-tighter drop-shadow-sm">
          404
        </h1>
        <p class="text-xl md:text-2xl text-gray-600 font-medium mb-8">
          ¡Oops! La página que buscas no existe.
        </p>
        
        <RouterLink 
          to="/" 
          class="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-all hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <i class="pi pi-home mr-2"></i>
          Volver al Inicio
        </RouterLink>
      </div>
      
    </div>
  </section>
</template>