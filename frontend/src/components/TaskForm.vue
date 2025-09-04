<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useUsersStore } from '../stores/users'

import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import { Modal } from 'bootstrap';

// --- Props y Emits ---
const props = defineProps({
  taskToEdit: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['submit'])

// --- Refs para el DOM y la instancia de Bootstrap ---
const modalElement = ref(null);
const modalInstance = ref(null);
const veeForm = ref(null);
const formKey = ref(0);

// --- Estado del Componente ---
const usersStore = useUsersStore()
const task = ref({})
const modalTitle = ref('Asignar Nueva Tarea')
const isEditMode = ref(false)

// --- Esquema de Validación con Yup ---
// Define las reglas que deben cumplir los campos del formulario.
const schema = yup.object({
  title: yup.string().required('El nombre es obligatorio').trim(),
  description: yup.string().required('La descripcion es obligatorio').trim(),
  due_date: yup.date().nullable().required('La fecha es obligatoria').typeError('Debe ser una fecha válida'),
  assigned_to_id: yup.number().required('Seleccionar un usuario es obligatorio').typeError('Debe seleccionar un usuario'),
  status: yup.string().when('isEditMode', { // El campo 'status' solo se valida en modo edición.
    is: true,
    then: schema => schema.required('El estado es obligatorio'),
    otherwise: schema => schema.notRequired(),
  }),

});

// --- Funciones del Componente ---
// Resetea el formulario a su estado inicial para crear un nuevo producto.
const resetForm = () => {
  task.value = { title: '', description: '', due_date: null, assigned_to_id: null, status: 'pendiente' }
  modalTitle.value = 'Asignar Nueva Tarea'
  isEditMode.value = false
}

const handleSubmit = (values) => {
  // Si estamos editando y la contraseña está vacía, no la enviamos al backend.
  if (isEditMode.value && !values.password) {
    delete values.password;
  }
  const finalTask = { id: task.value.id, ...values };
  emit('submit', finalTask);
};

const cleanupValidation = () => {
  if (veeForm.value) {
    veeForm.value.resetForm();
  }
};

const openModal = () => modalInstance.value?.show();
const closeModal = () => modalInstance.value?.hide();

defineExpose({ openModal, closeModal });

// --- Watchers y Lifecycle Hooks ---
watch(() => props.taskToEdit, (newTask) => {
  if (newTask) {
      // --- ESTA ES LA PARTE CORREGIDA ---
      const formattedTask = { ...newTask };
      if (formattedTask.due_date) {
        // Convierte la fecha al formato YYYY-MM-DD que el Field[type=date] entiende
        formattedTask.due_date = new Date(formattedTask.due_date).toISOString().split('T')[0];
      }

      task.value = formattedTask;
      modalTitle.value = 'Editar Tarea';
      isEditMode.value = true;
    } else {
      resetForm();
    }
  formKey.value += 1; // Forzar reinicio del formulario
}, { immediate: true });

onMounted(() => {
  usersStore.fetchUsers()

  if (modalElement.value) {
    modalInstance.value = new Modal(modalElement.value);
    modalElement.value.addEventListener('hidden.bs.modal', cleanupValidation);
  }
});

onUnmounted(() => {
  if (modalElement.value) {
    modalElement.value.removeEventListener('hidden.bs.modal', cleanupValidation);
  }
});
</script>

<template>
  <div ref="modalElement" class="modal fade" id="taskModal" tabindex="-1" aria-labelledby="taskModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="taskModalLabel">{{ modalTitle }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <Form ref="veeForm" :key="formKey" @submit="handleSubmit" :validation-schema="schema" :initial-values="task" v-slot="{ errors }">
          <div class="modal-body">
            <div class="mb-3">
              <label for="title" class="form-label">Título de la Tarea</label>
              <Field type="text" class="form-control" :class="{'is-invalid': errors.title}" id="title" name="title" />
              <ErrorMessage name="title" class="invalid-feedback" />
            </div>
            <div class="mb-3">
              <label for="description" class="form-label">Descripción y Comentarios</label>
              <Field as="textarea" class="form-control" :class="{'is-invalid': errors.description}" id="description" name="description" rows="4"/>
              <ErrorMessage name="description" class="invalid-feedback" />
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="assigned_to_id" class="form-label">Asignar a</label>
                <Field as="select" class="form-select" :class="{'is-invalid': errors.assigned_to_id}" id="assigned_to_id" name="assigned_to_id">
                  <option :value="null" disabled>Selecciona un usuario</option>
                  <option v-for="user in usersStore.users" :key="user.id" :value="user.id">
                    {{ user.username }}
                  </option>
                </Field>
                <ErrorMessage name="assigned_to_id" class="invalid-feedback" />
              </div>
              <div class="col-md-6 mb-3">
                <label for="due_date" class="form-label">Fecha de Entrega</label>
                <Field type="date" class="form-control" :class="{'is-invalid': errors.due_date}" id="due_date" name="due_date" />
                <ErrorMessage name="due_date" class="invalid-feedback" />
              </div>
            </div>
            <div v-if="isEditMode" class="mb-3">
              <label for="status" class="form-label">Estado</label>
              <Field as="select" class="form-select" :class="{'is-invalid': errors.status}" id="status" name="status">
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completada</option>
              </Field>
              <ErrorMessage name="status" class="invalid-feedback" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar</button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>
