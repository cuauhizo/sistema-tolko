<script setup>
import { ref, watch, onMounted } from 'vue'
import { useUsersStore } from '../stores/users'
import { useProductsStore } from '../stores/products'

// --- Props y Emits ---
const props = defineProps({
  orderToEdit: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['submit'])

// --- Stores ---
const usersStore = useUsersStore()
const productsStore = useProductsStore()

// --- Estado del Componente ---
const order = ref({
  title: '',
  client_name: '',
  assigned_to_id: null,
  start_date: '',
  end_date: '',
  products: [], // Array para los productos seleccionados
})
const modalTitle = ref('Nueva Orden de Trabajo')
const productSearch = ref(null) // Para el selector de productos

// --- Carga de Datos ---
onMounted(() => {
  usersStore.fetchUsers()
  productsStore.fetchProducts()
})

// --- Lógica del Formulario ---
watch(
  () => props.orderToEdit,
  (newOrder) => {
    if (newOrder) {
      modalTitle.value = 'Editar Orden de Trabajo'
      order.value = { ...newOrder }
      // Asegúrate de que las fechas estén en el formato YYYY-MM-DD para el input
      if (order.value.start_date) {
        order.value.start_date = new Date(order.value.start_date).toISOString().split('T')[0]
      }
      if (order.value.end_date) {
        order.value.end_date = new Date(order.value.end_date).toISOString().split('T')[0]
      }
    } else {
      resetForm()
    }
  },
)

const addProductToOrder = () => {
  if (!productSearch.value) return

  const product = productsStore.products.find((p) => p.id === productSearch.value)
  const alreadyAdded = order.value.products.some((p) => p.product_id === product.id)

  if (product && !alreadyAdded) {
    order.value.products.push({
      product_id: product.id,
      name: product.name,
      quantity_used: 1, // Cantidad por defecto
    })
  }
  productSearch.value = null // Limpiar el selector
}

const removeProduct = (productId) => {
  order.value.products = order.value.products.filter((p) => p.product_id !== productId)
}

const handleSubmit = () => {
  emit('submit', { ...order.value })
}

const resetForm = () => {
  modalTitle.value = 'Nueva Orden de Trabajo'
  order.value = {
    title: '',
    client_name: '',
    assigned_to_id: null,
    start_date: '',
    end_date: '',
    status: 'pendiente',
    products: [],
  }
}

defineExpose({ resetForm })
</script>

<template>
  <div
    class="modal fade"
    id="workOrderModal"
    tabindex="-1"
    aria-labelledby="workOrderModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="workOrderModalLabel">{{ modalTitle }}</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Cerrar"
          ></button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="row">
              <div class="mb-3" :class="order.id ? 'col-md-4' : 'col-md-6'">
                <label for="title" class="form-label">Título de la Orden</label>
                <input type="text" class="form-control" id="title" v-model="order.title" required />
              </div>
              <div class="mb-3" :class="order.id ? 'col-md-4' : 'col-md-6'">
                <label for="client_name" class="form-label">Nombre del Cliente</label>
                <input
                  type="text"
                  class="form-control"
                  id="client_name"
                  v-model="order.client_name"
                />
              </div>
              <div class="mb-3" :class="order.id ? 'col-md-4' : ''">
                <div v-if="order.id" class="mb-3">
                  <label for="status" class="form-label">Estado de la Orden</label>
                  <select class="form-select" id="status" v-model="order.status">
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-4 mb-3">
                <label for="assigned_to_id" class="form-label">Asignar a</label>
                <select
                  class="form-select"
                  id="assigned_to_id"
                  v-model="order.assigned_to_id"
                  required
                >
                  <option :value="null" disabled>Selecciona un usuario</option>
                  <option v-for="user in usersStore.users" :key="user.id" :value="user.id">
                    {{ user.username }}
                  </option>
                </select>
              </div>
              <div class="col-md-4 mb-3">
                <label for="start_date" class="form-label">Fecha de Inicio</label>
                <input
                  type="date"
                  class="form-control"
                  id="start_date"
                  v-model="order.start_date"
                />
              </div>
              <div class="col-md-4 mb-3">
                <label for="end_date" class="form-label">Fecha de Finalización</label>
                <input type="date" class="form-control" id="end_date" v-model="order.end_date" />
              </div>
            </div>
            <div class="mb-3">
              <label for="description" class="form-label">Descripción</label>
              <textarea
                class="form-control"
                id="description"
                v-model="order.description"
                rows="3"
              ></textarea>
            </div>

            <hr class="my-4" />

            <h5>Materiales / Productos a Utilizar</h5>
            <div class="row align-items-end">
              <div class="col-md-8 mb-3">
                <label for="productSearch" class="form-label">Añadir Producto</label>
                <select class="form-select" id="productSearch" v-model="productSearch">
                  <option :value="null" disabled>Busca un producto...</option>
                  <option
                    v-for="product in productsStore.products"
                    :key="product.id"
                    :value="product.id"
                  >
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
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">
              Guardar Orden
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
