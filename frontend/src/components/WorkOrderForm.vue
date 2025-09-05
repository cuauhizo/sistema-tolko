<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useUsersStore } from '../stores/users';
import { useProductsStore } from '../stores/products';
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import { Modal } from 'bootstrap';

// --- Props y Emits ---
const props = defineProps({
  orderToEdit: {
    type: Object,
    default: null,
  },
});
const emit = defineEmits(['submit']);

// --- Refs para el DOM y la instancia de Bootstrap ---
const modalElement = ref(null);
const modalInstance = ref(null);
const veeForm = ref(null);
const formKey = ref(0);

// --- Stores ---
const usersStore = useUsersStore();
const productsStore = useProductsStore();

// --- Estado del Componente ---
const order = ref({});
const modalTitle = ref('Nueva Orden de Trabajo');
const productSearch = ref(null);
const isEditMode = ref(false);

// --- Esquema de Validación con Yup ---
const schema = yup.object({
  title: yup.string().required('El título es obligatorio').trim(),
  client_name: yup.string().required('El cliente es obligatorio').trim(),
  assigned_to_id: yup.number().required('Debe asignar un usuario').typeError('Debe seleccionar un usuario'),
  description: yup.string().required('La descripcion es obligatorio').trim(),
  start_date: yup.date().nullable().required('La fecha de inicio es obligatoria').typeError('Debe ser una fecha válida'),
  end_date: yup.date().nullable().required('La fecha de finalización es obligatoria').typeError('Debe ser una fecha válida'),
  status: yup.string().when('isEditMode', {
    is: true,
    then: schema => schema.required('El estado es obligatorio'),
    otherwise: schema => schema.notRequired(),
  }),
  // No validamos los productos aquí, ya que se manejan por separado.
});

// --- Funciones del Componente ---
const resetForm = () => {
  order.value = {
    title: '', client_name: '', description: '',
    assigned_to_id: null, start_date: null, end_date: null,
    status: 'pendiente', products: [],
  };
  modalTitle.value = 'Nueva Orden de Trabajo';
  isEditMode.value = false;
};

// Se ejecuta al enviar un formulario válido.
const handleSubmit = (values) => {
  // Unimos los valores del formulario con la lista de productos que manejamos manualmente.
  const finalOrder = {
    ...values,
    id: order.value.id,
    products: order.value.products,
  };
  emit('submit', finalOrder);
};

// Limpia los errores de VeeValidate cuando el modal se cierra.
const cleanupValidation = () => {
  if (veeForm.value) {
    veeForm.value.resetForm();
  }
};

const openModal = () => modalInstance.value?.show();
const closeModal = () => modalInstance.value?.hide();

defineExpose({ openModal, closeModal });

// --- Watchers y Lifecycle Hooks ---
watch(() => props.orderToEdit, (newOrder) => {
  if (newOrder) {
    const formattedOrder = { ...newOrder };
    if (formattedOrder.start_date) {
      formattedOrder.start_date = new Date(formattedOrder.start_date).toISOString().split('T')[0];
    }
    if (formattedOrder.end_date) {
      formattedOrder.end_date = new Date(formattedOrder.end_date).toISOString().split('T')[0];
    }
    order.value = formattedOrder;
    modalTitle.value = 'Editar Orden de Trabajo';
    isEditMode.value = true;
  } else {
    resetForm();
  }
  formKey.value += 1; // Forzar reinicio del formulario.
}, { immediate: true });

onMounted(() => {
  usersStore.fetchUsers();
  productsStore.fetchProducts();

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

// --- Lógica para añadir/quitar productos ---
const addProductToOrder = () => {
  if (!productSearch.value) return;
  const product = productsStore.products.find((p) => p.id === productSearch.value);
  const alreadyAdded = order.value.products.some((p) => p.product_id === product.id);

  if (product && !alreadyAdded) {
    order.value.products.push({
      product_id: product.id,
      name: product.name,
      quantity_used: 1,
    });
  }
  productSearch.value = null;
};

const removeProduct = (productId) => {
  order.value.products = order.value.products.filter((p) => p.product_id !== productId);
};
</script>

<template>
  <div ref="modalElement" class="modal fade" id="workOrderModal" tabindex="-1" aria-labelledby="workOrderModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="workOrderModalLabel">{{ modalTitle }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <Form ref="veeForm" :key="formKey" @submit="handleSubmit" :validation-schema="schema" :initial-values="order" v-slot="{ errors }">
          <div class="modal-body">
            <div class="row">
              <div class="mb-3" :class="isEditMode ? 'col-md-4' : 'col-md-6'">
                <label for="title" class="form-label">Título de la Orden</label>
                <Field type="text" class="form-control" :class="{'is-invalid': errors.title}" id="title" name="title" />
                <ErrorMessage name="title" class="invalid-feedback" />
              </div>
              <div class="mb-3" :class="isEditMode ? 'col-md-4' : 'col-md-6'">
                <label for="client_name" class="form-label">Nombre del Cliente</label>
                <Field type="text" class="form-control" :class="{'is-invalid': errors.client_name}" id="client_name" name="client_name" />
                <ErrorMessage name="client_name" class="invalid-feedback" />
              </div>
              <div v-if="isEditMode" class="mb-3 col-md-4">
              <label for="status" class="form-label">Estado de la Orden</label>
              <Field as="select" class="form-select" :class="{'is-invalid': errors.status}" id="status" name="status">
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </Field>
              <ErrorMessage name="status" class="invalid-feedback" />
            </div>
            </div>

            <div class="row">
              <div class="col-md-4 mb-3">
                <label for="assigned_to_id" class="form-label">Asignar a</label>
                <Field as="select" class="form-select" :class="{'is-invalid': errors.assigned_to_id}" id="assigned_to_id" name="assigned_to_id">
                  <option :value="undefined" disabled>Selecciona un usuario</option>
                  <option v-for="user in usersStore.users" :key="user.id" :value="user.id">{{ user.username }}</option>
                </Field>
                <ErrorMessage name="assigned_to_id" class="invalid-feedback" />
              </div>
              <div class="col-md-4 mb-3">
                <label for="start_date" class="form-label">Fecha de Inicio</label>
                <Field type="date" class="form-control" :class="{'is-invalid': errors.start_date}" id="start_date" name="start_date" />
                <ErrorMessage name="start_date" class="invalid-feedback" />
              </div>
              <div class="col-md-4 mb-3">
                <label for="end_date" class="form-label">Fecha de Finalización</label>
                <Field type="date" class="form-control" :class="{'is-invalid': errors.end_date}" id="end_date" name="end_date" />
                <ErrorMessage name="end_date" class="invalid-feedback" />
              </div>
            </div>
            
            <div class="mb-3">
              <label for="description" class="form-label">Descripción</label>
              <Field as="textarea" class="form-control" :class="{'is-invalid': errors.description}" id="description" name="description" rows="3" />
              <ErrorMessage name="description" class="invalid-feedback" />
            </div>

            <hr class="my-4" />

            <h5>Materiales / Productos a Utilizar</h5>
            <div class="row align-items-end">
              <div class="col-md-8 mb-3">
                <label for="productSearch" class="form-label">Añadir Producto</label>
                <select class="form-select" id="productSearch" v-model="productSearch">
                  <option :value="null" disabled>Busca un producto...</option>
                  <option v-for="product in productsStore.products" :key="product.id" :value="product.id">
                    {{ product.name }} (Stock: {{ product.stock }})
                  </option>
                </select>
              </div>
              <div class="col-md-4 mb-3">
                <button type="button" class="btn btn-secondary w-100" @click="addProductToOrder">
                  <i class="pi pi-plus me-2"></i>Añadir a la Orden
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-sm table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Producto</th>
                    <th style="width: 150px">Cantidad a Usar</th>
                    <th style="width: 100px">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="order.products.length === 0">
                    <td colspan="3" class="text-center text-muted">
                      Aún no se han añadido productos.
                    </td>
                  </tr>
                  <tr v-for="item in order.products" :key="item.product_id">
                    <td>{{ item.name }}</td>
                    <td>
                      <input
                        type="number"
                        class="form-control form-control-sm"
                        v-model.number="item.quantity_used"
                        min="1"
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        @click="removeProduct(item.product_id)"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar Orden</button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>