import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import 'primeicons/primeicons.css'
import './assets/main.css';

import App from './App.vue'
import router from './router'


const app = createApp(App)

app.use(createPinia())
app.use(Toast, {
  transition: 'Vue-Toastification__bounce',
  maxToasts: 5,
  newestOnTop: true,
})
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false || 'none',
    },
  },
})

app.mount('#app')