<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
// 1. Importa los componentes de VeeValidate y la librería Yup
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';

const authStore = useAuthStore();
const router = useRouter();

// Mantenemos una ref separada para los errores que vienen del servidor
const serverError = ref('');

// 2. Define el "esquema" de validación con Yup
const schema = yup.object({
  email: yup.string().required('El correo es obligatorio').email('El formato del correo no es válido'),
  password: yup.string().required('La contraseña es obligatoria').min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// 3. La función handleSubmit ahora recibe los valores del formulario validados
const handleSubmit = async (values) => {
  serverError.value = '';
  try {
    // Usamos los 'values' que nos entrega VeeValidate
    await authStore.login(values.email, values.password);
    router.push('/');
  } catch (error) {
    serverError.value = error.response?.data?.message || 'Credenciales incorrectas o error en el servidor.';
    console.error('Login failed:', error);
  }
};
</script>

<template>
  <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-4 shadow-sm" style="width: 100%; max-width: 400px;">
      <h3 class="card-title text-center mb-4">Iniciar Sesión</h3>
      
      <Form @submit="handleSubmit" :validation-schema="schema" v-slot="{ errors }">
        <div class="mb-3">
          <label for="email" class="form-label">Correo Electrónico</label>
          <Field
            type="email"
            name="email"
            id="email"
            class="form-control"
            :class="{'is-invalid': errors.email}"
            autocomplete="email"
          />
          <ErrorMessage name="email" class="invalid-feedback" />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Contraseña</label>
          <Field
            type="password"
            name="password"
            id="password"
            class="form-control"
            :class="{'is-invalid': errors.password}"
            autocomplete="current-password"
          />
          <ErrorMessage name="password" class="invalid-feedback" />
        </div>

        <div v-if="serverError" class="alert alert-danger" role="alert">
          {{ serverError }}
        </div>
        
        <button type="submit" class="btn btn-primary w-100">Ingresar</button>
      </Form>
    </div>
  </div>
</template>

<style scoped>

</style>