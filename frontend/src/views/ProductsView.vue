<script setup>
import { ref, onMounted } from 'vue';
import ProductList from '../components/ProductList.vue';
import ProductForm from '../components/ProductForm.vue';
import axios from 'axios'; // ¡Necesitarás instalar axios! npm install axios

const products = ref([]);
const API_URL = 'http://localhost:3000/api/products'; // URL de tu backend

const fetchProducts = async () => {
  try {
    const response = await axios.get(API_URL);
    products.value = response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

onMounted(fetchProducts); // Carga los productos cuando el componente se monta

const handleProductAdded = (newProduct) => {
  products.value.push(newProduct);
};
</script>

<template>
  <div class="container mt-4">
    <h1>Sistema de Inventario</h1>
    <ProductForm @product-added="handleProductAdded" />
    <ProductList :products="products" />
  </div>
</template>