<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import { Modal } from 'bootstrap';

// --- Props y Emits ---
// Este componente recibe datos a través de "props" y comunica eventos al padre con "emits".
const props = defineProps({
  productToEdit: {
    type: Object,
    default: null,
  },
  // Recibe la lista de categorías del componente padre (ProductsView).
  categories: {
    type: Array,
    required: true,
  },
});
const emit = defineEmits(['submit']);

// --- Refs para el DOM y la instancia de Bootstrap ---
// Se usan para controlar el modal directamente con JavaScript.
const modalElement = ref(null);
const modalInstance = ref(null);
const veeForm = ref(null);
const formKey = ref(0);

// --- Estado del Componente ---
// Variables reactivas para el contenido del formulario.
const product = ref({});
const modalTitle = ref('Nuevo Producto');

// --- Esquema de Validación con Yup ---
// Define las reglas que deben cumplir los campos del formulario.
const schema = yup.object({
  name: yup.string().required('El nombre es obligatorio').trim(),
  category_id: yup.number().nullable(),
  description: yup.string().nullable(),
  stock: yup.number().required('El stock es obligatorio').min(0, 'El stock no puede ser negativo').typeError('El stock debe ser un número'),
  price: yup.number().required('El precio es obligatorio').min(0, 'El precio no puede ser negativo').typeError('El precio debe ser un número'),
  unit: yup.string().required('La unidad es obligatoria'),
});

// --- Funciones del Componente ---

// Resetea el formulario a su estado inicial para crear un nuevo producto.
const resetForm = () => {
  product.value = { name: '', description: '', stock: undefined, price: undefined, unit: 'piezas', category_id: null };
  modalTitle.value = 'Nuevo Producto';
};

// Se ejecuta cuando el formulario se envía y la validación es exitosa.
const handleSubmit = (values) => {
  const finalProduct = { id: product.value.id, ...values };
  // Emite los datos al componente padre para que él los procese.
  emit('submit', finalProduct);
};

// Limpia los mensajes de error de VeeValidate.
const cleanupValidation = () => {
  if (veeForm.value) {
    veeForm.value.resetForm();
  }
};

// Métodos para ser llamados por el componente padre.
const openModal = () => modalInstance.value?.show();
const closeModal = () => modalInstance.value?.hide();

// Expone los métodos para que el padre (ProductsView) pueda usarlos.
defineExpose({ openModal, closeModal });

// --- Watchers y Lifecycle Hooks ---

// Observa si cambia el producto a editar.
watch(() => props.productToEdit, (newProduct) => {
  if (newProduct) {
    product.value = { ...newProduct };
    modalTitle.value = 'Editar Producto';
  } else {
    resetForm();
  }
  // Cambia la key para forzar al componente <Form> a reiniciarse y tomar los nuevos valores.
  formKey.value += 1;
}, { immediate: true });

// Se ejecuta una vez que el componente está montado en el DOM.
onMounted(() => {
  // Crea la instancia del modal de Bootstrap y la guarda.
  if (modalElement.value) {
    modalInstance.value = new Modal(modalElement.value);
    // Añade un "oyente" para limpiar la validación cuando el modal se cierre.
    modalElement.value.addEventListener('hidden.bs.modal', cleanupValidation);
  }
});

// Se ejecuta justo antes de que el componente se destruya.
onUnmounted(() => {
  // Limpia el "oyente" para evitar fugas de memoria.
  if (modalElement.value) {
    modalElement.value.removeEventListener('hidden.bs.modal', cleanupValidation);
  }
});
</script>

<template>
  <div ref="modalElement" class="modal fade" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="productModalLabel">{{ modalTitle }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>

        <Form ref="veeForm" :key="formKey" @submit="handleSubmit" :validation-schema="schema" :initial-values="product" v-slot="{ errors }">
          <div class="modal-body">
            <div class="row">
              <div class="col-md-8">
                <div class="mb-3">
                  <label for="name" class="form-label">Nombre del Producto</label>
                  <Field type="text" class="form-control" :class="{'is-invalid': errors.name}" id="name" name="name" />
                  <ErrorMessage name="name" class="invalid-feedback" />
                </div>
              </div>
              <div class="col-md-4">
                <div class="mb-3">
                  <label for="category" class="form-label">Categoría</label>
                  <Field as="select" class="form-select" id="category" name="category_id">
                    <option :value="null">Sin categoría</option>
                    <option v-for="category in props.categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </Field>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label for="description" class="form-label">Descripción</label>
              <Field as="textarea" class="form-control" id="description" name="description" rows="3" />
            </div>

            <div class="row">
              <div class="col-md-4 mb-3">
                <label for="stock" class="form-label">Stock</label>
                <Field type="number" class="form-control" :class="{'is-invalid': errors.stock}" id="stock" name="stock" />
                <ErrorMessage name="stock" class="invalid-feedback" />
              </div>
              <div class="col-md-4 mb-3">
                <label for="unit" class="form-label">Unidad</label>
                <Field as="select" class="form-select" :class="{'is-invalid': errors.unit}" id="unit" name="unit">
                  <option value="piezas">Piezas</option>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="metros">Metros (m)</option>
                  <option value="litros">Litros (l)</option>
                  <option value="cajas">Cajas</option>
                </Field>
                <ErrorMessage name="unit" class="invalid-feedback" />
              </div>
              <div class="col-md-4 mb-3">
                <label for="price" class="form-label">Precio</label>
                <Field type="number" class="form-control" :class="{'is-invalid': errors.price}" id="price" name="price" step="0.01" />
                <ErrorMessage name="price" class="invalid-feedback" />
              </div>
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