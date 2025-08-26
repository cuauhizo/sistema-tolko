<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

const handleSubmit = async () => {
  errorMessage.value = '';
  try {
    await authStore.login(email.value, password.value);
    router.push('/'); // Redirige al home después de un login exitoso
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo.';
    console.error('Login failed:', error);
  }
};
</script>

<template>
  <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-4 shadow-sm" style="width: 100%; max-width: 400px;">
      <h3 class="card-title text-center mb-4">Iniciar Sesión</h3>
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="email" class="form-label">Correo Electrónico</label>
          <input
            type="email"
            class="form-control"
            id="email"
            v-model="email"
            required
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Contraseña</label>
          <input
            type="password"
            class="form-control"
            id="password"
            v-model="password"
            required
          />
        </div>
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>
        <button type="submit" class="btn btn-primary w-100">Ingresar</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.container {
  background-color: #f8f9fa;
}
</style>