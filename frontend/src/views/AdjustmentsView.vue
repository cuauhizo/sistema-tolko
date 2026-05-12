<script setup>
import { onMounted } from 'vue';
import { useProductsStore } from '../stores/products';
import { useInventoryStore } from '../stores/inventory';
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import { useToastStore } from '../stores/toast';

const productsStore = useProductsStore();
const inventoryStore = useInventoryStore();
const notificationStore = useToastStore();

onMounted(() => {
  productsStore.fetchProducts();
});

const schema = yup.object({
  product_id: yup.number().required('Debe seleccionar un producto.'),
  adjustment_type: yup.string().required('Debe seleccionar el tipo de ajuste.'),
  quantity: yup.number().required('La cantidad es obligatoria.').min(1, 'La cantidad debe ser mayor a 0.').typeError('Debe ser un número.'),
  reason: yup.string().required('El motivo es obligatorio.').trim(),
});

const handleAdjustment = async (values, { resetForm }) => {
  const quantity_change = values.adjustment_type === 'entrada'
    ? values.quantity
    : -values.quantity;

  const adjustmentData = {
    product_id: values.product_id,
    quantity_change,
    reason: values.reason,
  };

  await inventoryStore.makeAdjustment(adjustmentData);

  // Recargar la lista de productos para ver el stock actualizado
  productsStore.fetchProducts();
  resetForm();
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 flex items-center">
        <i class="pi pi-sliders-h mr-3 text-blue-600"></i>
        Ajustes Manuales de Inventario
      </h1>
      <p class="text-gray-500 mt-2 text-sm sm:text-base">
        Utilice este formulario para registrar entradas (compras, devoluciones) o salidas (pérdidas, productos dañados) de stock.
      </p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 max-w-5xl">
      <Form @submit="handleAdjustment" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
        
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
          
          <div class="md:col-span-6">
            <label for="product_id" class="block text-sm font-medium text-gray-700 mb-1">Producto</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <i class="pi pi-box"></i>
              </span>
              <Field as="select" name="product_id" id="product_id"
                class="block w-full pl-10 pr-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-colors"
                :class="errors.product_id ? 'border-red-500 bg-red-50' : 'border-gray-300'">
                <option :value="undefined" disabled>-- Seleccione un producto --</option>
                <option v-for="product in productsStore.products" :key="product.id" :value="product.id">
                  {{ product.name }} (Stock actual: {{ product.stock }})
                </option>
              </Field>
            </div>
            <ErrorMessage name="product_id" class="text-red-500 text-xs mt-1 block font-medium" />
          </div>

          <div class="md:col-span-3">
            <label for="adjustment_type" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Ajuste</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <i class="pi pi-sort-alt"></i>
              </span>
              <Field as="select" name="adjustment_type" id="adjustment_type"
                class="block w-full pl-10 pr-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-colors"
                :class="errors.adjustment_type ? 'border-red-500 bg-red-50' : 'border-gray-300'">
                <option value="entrada">Entrada (+)</option>
                <option value="salida">Salida (-)</option>
              </Field>
            </div>
            <ErrorMessage name="adjustment_type" class="text-red-500 text-xs mt-1 block font-medium" />
          </div>

          <div class="md:col-span-3">
            <label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <i class="pi pi-hashtag"></i>
              </span>
              <Field type="number" name="quantity" id="quantity" min="1"
                class="block w-full pl-10 pr-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                :class="errors.quantity ? 'border-red-500 bg-red-50' : 'border-gray-300'" />
            </div>
            <ErrorMessage name="quantity" class="text-red-500 text-xs mt-1 block font-medium" />
          </div>
        </div>

        <div class="mb-8">
          <label for="reason" class="block text-sm font-medium text-gray-700 mb-1">Motivo del Ajuste</label>
          <Field as="textarea" name="reason" id="reason" rows="3"
            class="block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            :class="errors.reason ? 'border-red-500 bg-red-50' : 'border-gray-300'" 
            placeholder="Ej. Devolución de cliente, producto dañado en almacén, ajuste tras inventario físico..." />
          <ErrorMessage name="reason" class="text-red-500 text-xs mt-1 block font-medium" />
        </div>

        <div class="flex justify-end pt-5 border-t border-gray-100">
          <button type="submit" :disabled="isSubmitting"
            class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">
            <i v-if="isSubmitting" class="pi pi-spin pi-spinner mr-2"></i>
            <i v-else class="pi pi-check-circle mr-2"></i>
            {{ isSubmitting ? 'Procesando...' : 'Confirmar Ajuste' }}
          </button>
        </div>
      </Form>
    </div>
  </div>
</template>