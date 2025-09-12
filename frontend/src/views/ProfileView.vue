<script setup>
  import { ref } from 'vue'
  import { useAuthStore } from '../stores/auth'
  import { useUsersStore } from '../stores/users'
  import { Form, Field, ErrorMessage } from 'vee-validate'
  import * as yup from 'yup'

  const authStore = useAuthStore()
  const usersStore = useUsersStore()
  const formRef = ref(null)

  const schema = yup.object({
    currentPassword: yup.string().required('La contraseña actual es obligatoria.'),
    newPassword: yup.string().required('La nueva contraseña es obligatoria.').min(6, 'Debe tener al menos 6 caracteres.'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword'), null], 'Las contraseñas no coinciden.')
      .required('Debes confirmar la nueva contraseña.'),
  })

  const handleSubmit = async values => {
    await usersStore.changePassword(values)
    formRef.value.resetForm() // Limpia el formulario después de un envío exitoso
  }
</script>

<template>
  <div class="container my-4">
    <h1>Mi Perfil</h1>
    <p class="text-muted">Bienvenido, {{ authStore.username }}</p>

    <div class="row mt-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">Cambiar Contraseña</div>
          <div class="card-body">
            <Form @submit="handleSubmit" :validation-schema="schema" ref="formRef" v-slot="{ errors }">
              <div class="mb-3">
                <label for="currentPassword" class="form-label">Contraseña Actual</label>
                <Field type="password" name="currentPassword" id="currentPassword" class="form-control" :class="{ 'is-invalid': errors.currentPassword }" />
                <ErrorMessage name="currentPassword" class="invalid-feedback" />
              </div>
              <div class="mb-3">
                <label for="newPassword" class="form-label">Nueva Contraseña</label>
                <Field type="password" name="newPassword" id="newPassword" class="form-control" :class="{ 'is-invalid': errors.newPassword }" />
                <ErrorMessage name="newPassword" class="invalid-feedback" />
              </div>
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirmar Nueva Contraseña</label>
                <Field type="password" name="confirmPassword" id="confirmPassword" class="form-control" :class="{ 'is-invalid': errors.confirmPassword }" />
                <ErrorMessage name="confirmPassword" class="invalid-feedback" />
              </div>
              <button type="submit" class="btn btn-primary">Actualizar Contraseña</button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
