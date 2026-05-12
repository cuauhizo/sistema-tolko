<script setup>
import { ref, watch } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';

// --- Props y Emits ---
const props = defineProps({
  productToEdit: {
    type: Object,
    default: null,
  },
  categories: {
    type: Array,
    required: true,
  },
  isSaving: { 
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['submit']);

// --- Refs y Estado ---
const veeForm = ref(null);
const formKey = ref(0);
const isOpen = ref(false); // Nuestro control nativo del modal
const product = ref({});
const modalTitle = ref('Nuevo Producto');

// --- Esquema de Validación con Yup ---
const schema = yup.object({
  name: yup.string().required('El nombre es obligatorio').trim(),
  category_id: yup.number().nullable(),
  description: yup.string().nullable(),
  stock: yup.number().required('El stock es obligatorio').min(0, 'El stock no puede ser negativo').typeError('El stock debe ser un número'),
  price: yup.number().required('El precio es obligatorio').min(0, 'El precio no puede ser negativo').typeError('El precio debe ser un número'),
  unit: yup.string().required('La unidad es obligatoria'),
});

// --- Funciones del Componente ---
const resetForm = () => {
  product.value = { name: '', description: '', stock: undefined, price: undefined, unit: 'piezas', category_id: null };
  modalTitle.value = 'Nuevo Producto';
};

const handleSubmit = (values) => {
  const finalProduct = { id: product.value.id, ...values };
  emit('submit', finalProduct);
};

const cleanupValidation = () => {
  if (veeForm.value) {
    veeForm.value.resetForm();
  }
};

const openModal = () => {
  isOpen.value = true;
};

const closeModal = () => {
  isOpen.value = false;
  cleanupValidation();
};

defineExpose({ openModal, closeModal });

// --- Watchers ---
watch(() => props.productToEdit, (newProduct) => {
  if (newProduct) {
    product.value = { ...newProduct };
    modalTitle.value = 'Editar Producto';
  } else {
    resetForm();
  }
  formKey.value += 1;
}, { immediate: true });
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center overflow-x-hidden overflow-y-auto px-4">
    
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>

    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl z-50 transform transition-all flex flex-col max-h-[90vh]">
      
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
        <h3 class="text-xl font-bold text-gray-900">{{ modalTitle }}</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 ml-auto inline-flex items-center transition-colors">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <Form 
        ref="veeForm" 
        :key="formKey" 
        @submit="handleSubmit" 
        :validation-schema="schema" 
        :initial-values="product" 
        v-slot="{ errors }"
        class="flex flex-col overflow-hidden"
      >
        <div class="px-6 py-5 overflow-y-auto flex-grow">
          
          <div class="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
            <div class="md:col-span-8">
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="pi pi-box"></i>
                </span>
                <Field 
                  type="text" 
                  id="name" 
                  name="name" 
                  class="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  :class="errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'"
                  placeholder="Ej. Taladro Inalámbrico"
                />
              </div>
              <ErrorMessage name="name" class="text-red-500 text-xs mt-1 block font-medium" />
            </div>

            <div class="md:col-span-4">
              <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="pi pi-tags"></i>
                </span>
                <Field 
                  as="select" 
                  id="category" 
                  name="category_id"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                >
                  <option :value="null">Sin categoría</option>
                  <option v-for="category in props.categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </Field>
              </div>
            </div>
          </div>

          <div class="mb-5">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <Field 
              as="textarea" 
              id="description" 
              name="description" 
              rows="3"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="Detalles adicionales del producto..."
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div class="md:col-span-4">
              <label for="stock" class="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="pi pi-hashtag"></i>
                </span>
                <Field 
                  type="number" 
                  id="stock" 
                  name="stock" 
                  class="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  :class="errors.stock ? 'border-red-500 bg-red-50' : 'border-gray-300'"
                />
              </div>
              <ErrorMessage name="stock" class="text-red-500 text-xs mt-1 block font-medium" />
            </div>

            <div class="md:col-span-4">
              <label for="unit" class="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="pi pi-list"></i>
                </span>
                <Field 
                  as="select" 
                  id="unit" 
                  name="unit"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                  :class="errors.unit ? 'border-red-500 bg-red-50' : 'border-gray-300'"
                >
                  <option value="piezas">Piezas</option>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="metros">Metros (m)</option>
                  <option value="litros">Litros (l)</option>
                  <option value="cajas">Cajas</option>
                </Field>
              </div>
              <ErrorMessage name="unit" class="text-red-500 text-xs mt-1 block font-medium" />
            </div>

            <div class="md:col-span-4">
              <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="pi pi-dollar"></i>
                </span>
                <Field 
                  type="number" 
                  id="price" 
                  name="price" 
                  step="0.01"
                  class="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  :class="errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'"
                />
              </div>
              <ErrorMessage name="price" class="text-red-500 text-xs mt-1 block font-medium" />
            </div>
          </div>
          
        </div>

        <div class="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0 space-x-3 rounded-b-xl">
          <button type="button" @click="closeModal" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Cancelar
          </button>
          <button type="submit" :disabled="isSaving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed">
            <i v-if="isSaving" class="pi pi-spin pi-spinner mr-2"></i>
            <i v-else class="pi pi-save mr-2"></i>
            <span>{{ isSaving ? 'Guardando...' : 'Guardar' }}</span>
          </button>
        </div>
      </Form>
      
    </div>
  </div>
</template>