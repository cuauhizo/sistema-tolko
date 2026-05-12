<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
// Importamos VeeValidate y Yup exactamente como los tenías
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';

const authStore = useAuthStore();
const router = useRouter();

const serverError = ref('');
// Nuevo estado para controlar el "ojito"
const showPassword = ref(false); 

// Función para alternar la vista de la contraseña
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// Tu esquema original de Yup, ¡intacto!
const schema = yup.object({
  email: yup.string().required('El correo es obligatorio').email('El formato del correo no es válido'),
  password: yup.string().required('La contraseña es obligatoria').min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const handleSubmit = async (values) => {
  serverError.value = '';
  try {
    await authStore.login(values.email, values.password);
    router.push('/');
  } catch (error) {
    serverError.value = error.response?.data?.message || 'Credenciales incorrectas o error en el servidor.';
    console.error('Login failed:', error);
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
      
      <img src="@/assets/img/logo-tolko.png" alt="Tolko Logo" class="w-24 mx-auto mb-4" />
      <h3 class="text-2xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h3>
      
      <div v-if="serverError" class="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-center rounded">
        <i class="pi pi-exclamation-circle mr-2"></i>
        {{ serverError }}
      </div>
      
      <Form @submit="handleSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
        
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i class="pi pi-envelope"></i>
            </span>
            <Field
              type="email"
              name="email"
              id="email"
              class="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              :class="errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'"
              autocomplete="email"
              placeholder="ejemplo@correo.com"
            />
          </div>
          <ErrorMessage name="email" class="text-red-500 text-xs mt-1 block font-medium" />
        </div>

        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i class="pi pi-lock"></i>
            </span>
            <Field
              :type="showPassword ? 'text' : 'password'"
              name="password"
              id="password"
              class="block w-full pl-10 pr-12 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              :class="errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'"
              autocomplete="current-password"
              placeholder="••••••••"
            />
            <button 
              type="button"
              @click="togglePasswordVisibility"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 focus:outline-none transition-colors"
              tabindex="-1"
            >
              <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-lg"></i>
            </button>
          </div>
          <ErrorMessage name="password" class="text-red-500 text-xs mt-1 block font-medium" />
        </div>
        
        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <i v-if="isSubmitting" class="pi pi-spin pi-spinner mr-2"></i>
          Ingresar
        </button>
      </Form>
    </div>
  </div>
</template>