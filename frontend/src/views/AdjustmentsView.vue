<script setup>
import { onMounted } from 'vue';
import { useProductsStore } from '../stores/products';
import { useInventoryStore } from '../stores/inventory'; // Crearemos la acción en el siguiente paso
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import { useToastStore } from '../stores/toast';

const productsStore = useProductsStore();
const inventoryStore = useInventoryStore();
const notificationStore = useToastStore();

onMounted(() => {
  productsStore.fetchProducts(); // Cargar la lista de productos para el selector
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
  <div class="container my-4">
    <h1>Ajustes Manuales de Inventario</h1>
    <p class="text-muted">
      Utilice este formulario para registrar entradas (compras, devoluciones) o salidas (pérdidas, productos dañados) de
      stock.
    </p>

    <div class="card p-4 mt-4">
      <Form @submit="handleAdjustment" :validation-schema="schema" v-slot="{ errors }">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="product_id" class="form-label">Producto</label>
            <Field as="select" name="product_id" id="product_id" class="form-select"
              :class="{ 'is-invalid': errors.product_id }">
              <option :value="undefined" disabled>-- Seleccione un producto --</option>
              <option v-for="product in productsStore.products" :key="product.id" :value="product.id">
                {{ product.name }} (Stock actual: {{ product.stock }})
              </option>
            </Field>
            <ErrorMessage name="product_id" class="invalid-feedback" />
          </div>

          <div class="col-md-3 mb-3">
            <label for="adjustment_type" class="form-label">Tipo de Ajuste</label>
            <Field as="select" name="adjustment_type" id="adjustment_type" class="form-select"
              :class="{ 'is-invalid': errors.adjustment_type }">
              <option value="entrada">Entrada (+)</option>
              <option value="salida">Salida (-)</option>
            </Field>
            <ErrorMessage name="adjustment_type" class="invalid-feedback" />
          </div>

          <div class="col-md-3 mb-3">
            <label for="quantity" class="form-label">Cantidad</label>
            <Field type="number" name="quantity" id="quantity" class="form-control"
              :class="{ 'is-invalid': errors.quantity }" />
            <ErrorMessage name="quantity" class="invalid-feedback" />
          </div>
        </div>

        <div class="mb-3">
          <label for="reason" class="form-label">Motivo del Ajuste</label>
          <Field as="textarea" name="reason" id="reason" class="form-control" rows="3"
            :class="{ 'is-invalid': errors.reason }" />
          <ErrorMessage name="reason" class="invalid-feedback" />
        </div>

        <button type="submit" class="btn btn-primary">
          Confirmar Ajuste
        </button>
      </Form>
    </div>
  </div>
</template>